import { model, type modelID, modelDetails, getLanguageModelWithKeys, createOpenRouterClientWithKey } from "@/ai/providers";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { getApiKey } from "@/ai/providers";
import { streamText, type UIMessage, type LanguageModelResponseMetadata, type Message } from "ai";
import { appendResponseMessages } from 'ai';
import { saveChat, saveMessages, convertToDBMessages } from '@/lib/chat-store';
import { nanoid } from 'nanoid';
import { db } from '@/lib/db';
import { chats } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { trackTokenUsage, hasEnoughCredits } from '@/lib/tokenCounter';
import { getRemainingCredits, getRemainingCreditsByExternalId } from '@/lib/polar';
import { auth, checkMessageLimit } from '@/lib/auth';

import { experimental_createMCPClient as createMCPClient, MCPTransport } from 'ai';
import { Experimental_StdioMCPTransport as StdioMCPTransport } from 'ai/mcp-stdio';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { spawn } from "child_process";

// Allow streaming responses up to 60 seconds on Hobby plan
export const maxDuration = 60;

// Helper function to check if user is using their own API keys for the selected model
function checkIfUsingOwnApiKeys(selectedModel: modelID, apiKeys: Record<string, string> = {}): boolean {
  // Map model providers to their API key names
  const providerKeyMap: Record<string, string> = {
    'openai': 'OPENAI_API_KEY',
    'anthropic': 'ANTHROPIC_API_KEY',
    'groq': 'GROQ_API_KEY',
    'xai': 'XAI_API_KEY',
    'openrouter': 'OPENROUTER_API_KEY',
    'requesty': 'REQUESTY_API_KEY'
  };

  // Extract provider from model ID
  const provider = selectedModel.split('/')[0];
  const requiredApiKey = providerKeyMap[provider];

  if (!requiredApiKey) {
    return false; // Unknown provider
  }

  // Check if user has provided their own API key for this provider
  const hasApiKey = Boolean(apiKeys[requiredApiKey] && apiKeys[requiredApiKey].trim().length > 0);

  return hasApiKey;
}

interface KeyValuePair {
  key: string;
  value: string;
}

interface MCPServerConfig {
  url: string;
  type: 'sse' | 'stdio' | 'streamable-http';
  command?: string;
  args?: string[];
  env?: KeyValuePair[];
  headers?: KeyValuePair[];
}

interface WebSearchOptions {
  enabled: boolean;
  contextSize: 'low' | 'medium' | 'high';
}

interface UrlCitation {
  url: string;
  title: string;
  content?: string;
  start_index: number;
  end_index: number;
}

interface Annotation {
  type: string;
  url_citation: UrlCitation;
}

interface OpenRouterResponse extends LanguageModelResponseMetadata {
  readonly messages: Message[];
  annotations?: Annotation[];
  body?: unknown;
}

// Helper to create standardized error responses
const createErrorResponse = (
  code: string,
  message: string,
  status: number,
  details?: string
) => {
  return new Response(
    JSON.stringify({ error: { code, message, details } }),
    { status, headers: { "Content-Type": "application/json" } }
  );
};

export async function POST(req: Request) {
  const {
    messages,
    chatId,
    selectedModel,
    mcpServers: initialMcpServers = [],
    webSearch = { enabled: false, contextSize: 'medium' },
    apiKeys = {}
  }: {
    messages: UIMessage[];
    chatId?: string;
    selectedModel: modelID;
    mcpServers?: MCPServerConfig[];
    webSearch?: WebSearchOptions;
    apiKeys?: Record<string, string>;
  } = await req.json();

  let mcpServers = initialMcpServers;

  // Disable MCP servers for DeepSeek R1 and DeepSeek R1 0528
  if (
    selectedModel === "openrouter/deepseek/deepseek-r1" ||
    selectedModel === "openrouter/deepseek/deepseek-r1-0528" ||
    selectedModel === "openrouter/deepseek/deepseek-r1-0528-qwen3-8b"
    //selectedModel === "openrouter/x-ai/grok-3-beta" ||
    //selectedModel === "openrouter/x-ai/grok-3-mini-beta" ||
    //selectedModel === "openrouter/x-ai/grok-3-mini-beta-reasoning-high"
  ) {
    mcpServers = [];
  }

  // Get the authenticated session (including anonymous users)
  const session = await auth.api.getSession({ headers: req.headers });

  // If no session exists, return error
  if (!session || !session.user || !session.user.id) {
    return createErrorResponse(
      "AUTHENTICATION_REQUIRED",
      "Authentication required. Please log in.",
      401
    );
  }

  const userId = session.user.id;
  const isAnonymous = (session.user as any).isAnonymous === true;

  // Try to get the Polar customer ID from session
  const polarCustomerId: string | undefined = (session.user as any)?.polarCustomerId ||
    (session.user as any)?.metadata?.polarCustomerId;

  // Estimate ~30 tokens per message as a basic check
  const estimatedTokens = 30;

  // Check if user is using their own API keys
  const isUsingOwnApiKeys = checkIfUsingOwnApiKeys(selectedModel, apiKeys);
  console.log(`[Debug] User ${userId} - isUsingOwnApiKeys: ${isUsingOwnApiKeys}`);

  // 1. Check if user has sufficient credits (if they have a Polar account and not using own keys)
  let hasCredits = false;
  let actualCredits: number | null = null;
  console.log(`[Debug] User ${userId} - isAnonymous: ${isAnonymous}, polarCustomerId: ${polarCustomerId}`);

  // Skip credit checks entirely if user is using their own API keys
  if (isUsingOwnApiKeys) {
    console.log(`[Debug] User ${userId} is using own API keys, skipping credit checks`);
    hasCredits = true; // Allow request to proceed
  } else {
    try {
      // Check credits using both the external ID (userId) and legacy polarCustomerId
      // Pass isAnonymous flag to skip Polar checks for anonymous users
      // Pass selectedModel to check for premium model access
      hasCredits = await hasEnoughCredits(polarCustomerId, userId, estimatedTokens, isAnonymous, selectedModel);
      console.log(`[Debug] hasEnoughCredits result: ${hasCredits}`);

      // Also get the actual credit balance to check for negative balances
      if (!isAnonymous) {
        if (userId) {
          try {
            actualCredits = await getRemainingCreditsByExternalId(userId);
            console.log(`[Debug] Actual credits for user ${userId}: ${actualCredits}`);
          } catch (error) {
            console.warn('Error getting actual credits by external ID:', error);
            // Fall back to legacy method
            if (polarCustomerId) {
              try {
                actualCredits = await getRemainingCredits(polarCustomerId);
                console.log(`[Debug] Actual credits via legacy method: ${actualCredits}`);
              } catch (legacyError) {
                console.warn('Error getting actual credits by legacy method:', legacyError);
              }
            }
          }
        }
      }
    } catch (error: any) {
      // Log but continue - don't block users if credit check fails
      console.error('[CreditCheckError] Error checking credits:', error);
      // Potentially return a specific error if this failure is critical
      // For now, matches existing behavior of allowing request if check fails.
    }
  }

  // 2. Check for negative credit balance - block if user has negative credits (skip if using own API keys)
  if (!isUsingOwnApiKeys && !isAnonymous && actualCredits !== null && actualCredits < 0) {
    console.log(`[Debug] User ${userId} has negative credits (${actualCredits}), blocking request`);
    return createErrorResponse(
      "INSUFFICIENT_CREDITS",
      `Your account has a negative credit balance (${actualCredits}). Please purchase more credits to continue.`,
      402,
      `User has ${actualCredits} credits`
    );
  }

  // 3. If user has credits or is using own API keys, allow request (skip daily message limit)
  console.log(`[Debug] Credit check: !isAnonymous=${!isAnonymous}, hasCredits=${hasCredits}, actualCredits=${actualCredits}, isUsingOwnApiKeys=${isUsingOwnApiKeys}, will skip limit check: ${(!isAnonymous && hasCredits) || isUsingOwnApiKeys}`);

  if ((!isAnonymous && hasCredits) || isUsingOwnApiKeys) {
    console.log(`[Debug] User ${userId} ${isUsingOwnApiKeys ? 'using own API keys' : 'has credits'}, skipping message limit check`);
    // proceed
  } else {
    console.log(`[Debug] User ${userId} entering message limit check - isAnonymous: ${isAnonymous}`);
    // 4. Otherwise, check message limit based on authentication status
    const limitStatus = await checkMessageLimit(userId, isAnonymous);
    console.log(`[Debug] limitStatus:`, limitStatus);

    // Log message usage for anonymous users
    if (isAnonymous) {
      const used = limitStatus.limit - limitStatus.remaining;
      console.log(`[Anonymous User ${userId}] Messages used: ${used}/${limitStatus.limit}, Remaining: ${limitStatus.remaining}`);
    }

    if (limitStatus.hasReachedLimit) {
      return new Response(
        JSON.stringify({
          error: "Message limit reached",
          message: `You've reached your daily limit of ${limitStatus.limit} messages. ${isAnonymous ? "Sign in with Google to get more messages." : "Purchase credits to continue."}`,
          limit: limitStatus.limit,
          remaining: limitStatus.remaining
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  const id = chatId || nanoid();

  // Check if chat already exists for the given ID
  // If not, we'll create it in onFinish
  let isNewChat = false;
  if (chatId) {
    try {
      const existingChat = await db.query.chats.findFirst({
        where: and(
          eq(chats.id, chatId),
          eq(chats.userId, userId)
        )
      });
      isNewChat = !existingChat;
    } catch (error) {
      console.error("Error checking for existing chat:", error);
      // Continue anyway, we'll create the chat in onFinish
      isNewChat = true;
    }
  } else {
    // No ID provided, definitely new
    isNewChat = true;
  }

  // Prepare messages for the model
  const modelMessages: UIMessage[] = [...messages];

  if (
    selectedModel === "openrouter/deepseek/deepseek-r1" ||
    // selectedModel === "openrouter/x-ai/grok-3-beta" ||
    // selectedModel === "openrouter/x-ai/grok-3-mini-beta" ||
    // selectedModel === "openrouter/x-ai/grok-3-mini-beta-reasoning-high" ||
    selectedModel === "openrouter/qwen/qwq-32b"
  ) {
    const systemContent = "Please provide your reasoning within <think> tags. After closing the </think> tag, provide your final answer directly without any other special tags.";
    modelMessages.unshift({
      role: "system",
      id: nanoid(), // Ensure a unique ID for the system message
      content: systemContent, // Add top-level content
      parts: [{ type: "text", text: systemContent }]
    });
  }

  // Pre-emptively save the chat if it's new
  if (isNewChat) {
    try {
      await saveChat({
        id, // The generated or provided chatId
        userId,
        messages: [], // Start with empty messages, will be updated in onFinish
      });
      console.log(`[Chat ${id}] Pre-emptively created chat record.`);
    } catch (error) {
      console.error(`[Chat ${id}] Error pre-emptively creating chat:`, error);
      // Decide if we should bail out or continue. For now, let's continue
      // but the onFinish save might fail later if the chat wasn't created.
      // If this is critical, we could return an error:
      // return createErrorResponse("DATABASE_ERROR", "Failed to initialize chat session.", 500, error.message);
    }
  }

  // Initialize tools
  let tools = {};
  const mcpClients: any[] = [];

  // Process each MCP server configuration
  for (const mcpServer of mcpServers) {
    try {
      // Create appropriate transport based on type
      let finalTransportForClient: MCPTransport | { type: 'sse', url: string, headers?: Record<string, string> };

      if (mcpServer.type === 'sse') {
        const headers: Record<string, string> = {};
        if (mcpServer.headers && mcpServer.headers.length > 0) {
          mcpServer.headers.forEach(header => {
            if (header.key) headers[header.key] = header.value || '';
          });
        }
        finalTransportForClient = {
          type: 'sse' as const,
          url: mcpServer.url,
          headers: Object.keys(headers).length > 0 ? headers : undefined
        };
      } else if (mcpServer.type === 'streamable-http') {
        const headers: Record<string, string> = {};
        if (mcpServer.headers && mcpServer.headers.length > 0) {
          mcpServer.headers.forEach(header => {
            if (header.key) headers[header.key] = header.value || '';
          });
        }
        // Use StreamableHTTPClientTransport from @modelcontextprotocol/sdk
        const transportUrl = new URL(mcpServer.url);
        finalTransportForClient = new StreamableHTTPClientTransport(transportUrl, {
          // sessionId: nanoid(), // Optionally, provide a session ID if your server uses it
          requestInit: {
            headers: Object.keys(headers).length > 0 ? headers : undefined
          }
        });
      } else if (mcpServer.type === 'stdio') {
        if (!mcpServer.command || !mcpServer.args || mcpServer.args.length === 0) {
          console.warn("Skipping stdio MCP server due to missing command or args");
          continue;
        }
        const env: Record<string, string> = {};
        if (mcpServer.env && mcpServer.env.length > 0) {
          mcpServer.env.forEach(envVar => {
            if (envVar.key) env[envVar.key] = envVar.value || '';
          });
        }
        // Check for uvx pattern
        if (mcpServer.command === 'uvx') {
          // Ensure uv is installed, which provides uvx
          console.log("Ensuring uv (for uvx) is installed...");
          let uvInstalled = false;
          const installUvSubprocess = spawn('pip3', ['install', 'uv']);
          // Capture output for debugging
          let uvInstallStdout = '';
          let uvInstallStderr = '';
          installUvSubprocess.stdout.on('data', (data) => { uvInstallStdout += data.toString(); });
          installUvSubprocess.stderr.on('data', (data) => { uvInstallStderr += data.toString(); });

          await new Promise<void>((resolve) => {
            installUvSubprocess.on('close', (code: number) => {
              if (code !== 0) {
                console.error(`Failed to install uv using pip3: exit code ${code}`);
                console.error('pip3 stdout:', uvInstallStdout);
                console.error('pip3 stderr:', uvInstallStderr);
              } else {
                console.log("uv installed or already present.");
                if (uvInstallStdout) console.log('pip3 stdout:', uvInstallStdout);
                if (uvInstallStderr) console.log('pip3 stderr:', uvInstallStderr);
                uvInstalled = true;
              }
              resolve();
            });
            installUvSubprocess.on('error', (err) => {
              console.error("Error spawning pip3 to install uv:", err);
              resolve(); // Resolve anyway
            });
          });

          if (!uvInstalled) {
            console.warn("Skipping uvx command: Failed to ensure uv installation.");
            continue;
          }

          // Do NOT modify the command or args. Let StdioMCPTransport run uvx directly.
          console.log(`Proceeding to spawn uvx command directly.`);
        }
        // If python is passed in the command, install the python package mentioned in args after -m
        else if (mcpServer.command.includes('python3')) {
          const packageName = mcpServer.args[mcpServer.args.indexOf('-m') + 1];
          console.log("Attempting to install python package using uv:", packageName);
          // Use uv to install the package
          const subprocess = spawn('uv', ['pip', 'install', packageName]);
          subprocess.on('close', (code: number) => {
            if (code !== 0) {
              console.error(`Failed to install python package ${packageName} using uv: ${code}`);
            } else {
              console.log(`Successfully installed python package ${packageName} using uv.`);
            }
          });
          // wait for the subprocess to finish
          await new Promise<void>((resolve) => {
            subprocess.on('close', () => resolve());
            subprocess.on('error', (err) => {
              console.error(`Error spawning uv command for package ${packageName}:`, err);
              resolve(); // Resolve anyway to avoid hanging
            });
          });
        }

        // Log the final command and args before spawning for stdio
        console.log(`Spawning StdioMCPTransport with command: '${mcpServer.command}' and args:`, mcpServer.args);

        finalTransportForClient = new StdioMCPTransport({
          command: mcpServer.command!,
          args: mcpServer.args!,
          env: Object.keys(env).length > 0 ? env : undefined
        });
      } else {
        console.warn(`Skipping MCP server with unsupported transport type: ${(mcpServer as any).type}`);
        continue;
      }

      const mcpClient = await createMCPClient({ transport: finalTransportForClient });
      mcpClients.push(mcpClient);

      const mcptools = await mcpClient.tools();

      console.log(`MCP tools from ${mcpServer.type} transport:`, Object.keys(mcptools));

      // Add MCP tools to tools object
      tools = { ...tools, ...mcptools };
    } catch (error) {
      console.error("Failed to initialize MCP client:", error);
      // Continue with other servers instead of failing the entire request
      // If any MCP client is essential, we might return an error here:
      // return createErrorResponse("MCP_CLIENT_ERROR", "Failed to initialize a required external tool.", 500, error.message);
    }
  }

  // Register cleanup for all clients
  if (mcpClients.length > 0) {
    req.signal.addEventListener('abort', async () => {
      for (const client of mcpClients) {
        try {
          await client.close();
        } catch (error) {
          console.error("Error closing MCP client:", error);
        }
      }
    });
  }

  console.log("messages", messages);
  console.log("parts", messages.map(m => m.parts.map(p => p)));

  // Log web search status
  if (webSearch.enabled) {
    console.log(`[Web Search] ENABLED with context size: ${webSearch.contextSize}`);
  } else {
    console.log(`[Web Search] DISABLED`);
  }

  let modelInstance;
  let effectiveWebSearchEnabled = webSearch.enabled; // Initialize with requested value

  // Check if the selected model supports web search
  const currentModelDetails = modelDetails[selectedModel];
  if (webSearch.enabled && selectedModel.startsWith("openrouter/")) {
    if (currentModelDetails?.supportsWebSearch === true) {
      // Model supports web search, use :online variant
      const openrouterModelId = selectedModel.replace("openrouter/", "") + ":online";
      const openrouterClient = createOpenRouterClientWithKey(apiKeys?.['OPENROUTER_API_KEY']);
      // For DeepSeek R1, Grok 3 Beta, Grok 3 Mini Beta, Grok 3 Mini Beta (High Reasoning), and Qwen 32B, explicitly disable logprobs
      if (
        selectedModel === "openrouter/deepseek/deepseek-r1" ||
        selectedModel === "openrouter/deepseek/deepseek-r1-0528-qwen3-8b" ||
        selectedModel === "openrouter/x-ai/grok-3-beta" ||
        selectedModel === "openrouter/x-ai/grok-3-mini-beta" ||
        selectedModel === "openrouter/x-ai/grok-3-mini-beta-reasoning-high" ||
        selectedModel === "openrouter/qwen/qwq-32b"
      ) {
        modelInstance = openrouterClient(openrouterModelId, { logprobs: false });
      } else {
        modelInstance = openrouterClient(openrouterModelId);
      }
      console.log(`[Web Search] Enabled for ${selectedModel} using ${openrouterModelId}`);
    } else {
      // Model does not support web search, or flag is not explicitly true
      effectiveWebSearchEnabled = false;
      modelInstance = getLanguageModelWithKeys(selectedModel, apiKeys);
      console.log(`[Web Search] Requested for ${selectedModel}, but not supported or not enabled for this model. Using standard model.`);
    }
  } else {
    // Web search not enabled in request or model is not an OpenRouter model
    if (webSearch.enabled) {
      console.log(`[Web Search] Requested but ${selectedModel} is not an OpenRouter model or web search support unknown. Disabling web search for this call.`);
    }
    effectiveWebSearchEnabled = false;
    modelInstance = getLanguageModelWithKeys(selectedModel, apiKeys);
  }

  const modelOptions: { // Add type for clarity and to allow logprobs
    web_search_options?: { search_context_size: 'low' | 'medium' | 'high' };
    logprobs?: boolean;
  } = {};

  if (effectiveWebSearchEnabled) {
    modelOptions.web_search_options = {
      search_context_size: webSearch.contextSize
    };
  }

  // Always set logprobs: false for these models at the providerOptions level for streamText
  if (
    selectedModel === "openrouter/deepseek/deepseek-r1" ||
    selectedModel === "openrouter/deepseek/deepseek-r1-0528-qwen3-8b" ||
    selectedModel === "openrouter/x-ai/grok-3-beta" ||
    selectedModel === "openrouter/x-ai/grok-3-mini-beta" ||
    selectedModel === "openrouter/x-ai/grok-3-mini-beta-reasoning-high" ||
    selectedModel === "openrouter/qwen/qwq-32b"
  ) {
    modelOptions.logprobs = false;
  }

  // Construct the payload for OpenRouter
  const openRouterPayload = {
    model: modelInstance,
    system: `You are a helpful AI assistant. Today's date is ${new Date().toISOString().split('T')[0]}.

    You have access to external tools provided by connected servers. These tools can perform specific actions like running code, searching databases, or accessing external services.

    ${effectiveWebSearchEnabled ? `
    ## Web Search Enabled:
    You have web search capabilities enabled. When you use web search:
    1. Cite your sources using markdown links
    2. Use the format [domain.com](full-url) for citations
    3. Only cite reliable and relevant sources
    4. Integrate the information naturally into your responses
    ` : ''}

    ## How to Respond:
    1.  **Analyze the Request:** Understand what the user is asking.
    2.  **Use Tools When Necessary:** If an external tool provides the best way to answer (e.g., fetching specific data, performing calculations, interacting with services), select the most relevant tool(s) and use them. You can use multiple tools in sequence. Clearly indicate when you are using a tool and what it's doing.
    3.  **Use Your Own Abilities:** For requests involving brainstorming, explanation, writing, summarization, analysis, or general knowledge, rely on your own reasoning and knowledge base. You don't need to force the use of an external tool if it's not suitable or required for these tasks.
    4.  **Respond Clearly:** Provide your answer directly when using your own abilities. If using tools, explain the steps taken and present the results clearly.
    5.  **Handle Limitations:** If you cannot answer fully (due to lack of information, missing tools, or capability limits), explain the limitation clearly. Don't just say "I don't know" if you can provide partial information or explain *why* you can't answer. If relevant tools seem to be missing, you can mention that the user could potentially add them via the server configuration.

    ## Response Format:
    - Use Markdown for formatting.
    - Base your response on the results from any tools used, or on your own reasoning and knowledge.
    `,
    messages: modelMessages,
    tools,
    maxSteps: 20,
    providerOptions: {
      google: {
        thinkingConfig: {
          thinkingBudget: 2048,
        },
      },
      anthropic: {
        thinking: {
          type: 'enabled',
          budgetTokens: 12000
        },
      },
      openrouter: modelOptions
    },
    onError: (error: any) => {
      console.error(`[streamText.onError][Chat ${id}] Error during LLM stream:`, JSON.stringify(error, null, 2));
    },
    async onFinish(event: any) {
      // Minimal fix: cast event.response to OpenRouterResponse
      const response = event.response as OpenRouterResponse;
      const allMessages = appendResponseMessages({
        messages: modelMessages,
        responseMessages: response.messages as any, // Cast to any to bypass type error
      });

      // Extract citations from response messages
      const processedMessages = allMessages.map(msg => {
        if (msg.role === 'assistant' && (response.annotations?.length)) {
          const citations = response.annotations
            .filter((a: Annotation) => a.type === 'url_citation')
            .map((c: Annotation) => ({
              url: c.url_citation.url,
              title: c.url_citation.title,
              content: c.url_citation.content,
              startIndex: c.url_citation.start_index,
              endIndex: c.url_citation.end_index
            }));

          // Add citations to message parts if they exist
          if (citations.length > 0 && msg.parts) {
            msg.parts = (msg.parts as any[]).map(part => ({
              ...part,
              citations
            }));
          }
        }
        return msg;
      });

      // Update the chat with the full message history
      // Note: saveChat here acts as an upsert based on how it's likely implemented
      try {
        await saveChat({
          id,
          userId,
          messages: processedMessages as any, // Cast to any to bypass type error
        });
        console.log(`[Chat ${id}][onFinish] Successfully saved chat with all messages.`);
      } catch (dbError: any) {
        console.error(`[Chat ${id}][onFinish] DATABASE_ERROR saving chat:`, dbError);
        // This error occurs after the stream has finished.
        // We can't change the HTTP response to the client here.
        // Robust logging is key.
      }

      let dbMessages;
      try {
        dbMessages = (convertToDBMessages(processedMessages as any, id) as any[]).map(msg => ({
          ...msg,
          hasWebSearch: effectiveWebSearchEnabled, // Use effectiveWebSearchEnabled
          webSearchContextSize: webSearch.enabled ? webSearch.contextSize : undefined // Store original request if needed, or effective
        }));
      } catch (conversionError: any) {
        console.error(`[Chat ${id}][onFinish] ERROR converting messages for DB:`, conversionError);
        // If conversion fails, we cannot save messages.
        // Log and potentially skip saving messages or save raw if possible.
        return; // Exit onFinish early if messages can't be processed for DB.
      }

      try {
        await saveMessages({ messages: dbMessages });
        console.log(`[Chat ${id}][onFinish] Successfully saved individual messages.`);
      } catch (dbMessagesError: any) {
        console.error(`[Chat ${id}][onFinish] DATABASE_ERROR saving messages:`, dbMessagesError);
      }

      // Extract token usage from response - OpenRouter may provide it in different formats
      let completionTokens = 0;

      // Access response with type assertion to avoid TypeScript errors
      // The actual structure may vary by provider
      const typedResponse = response as any;

      // Try to extract tokens from different possible response structures
      if (typedResponse.usage?.completion_tokens) {
        completionTokens = typedResponse.usage.completion_tokens;
      } else if (typedResponse.usage?.output_tokens) {
        completionTokens = typedResponse.usage.output_tokens;
      } else {
        // Estimate based on last message content length if available
        const lastMessage = typedResponse.messages?.[typedResponse.messages.length - 1];
        if (lastMessage?.content) {
          // Rough estimate: 1 token ≈ 4 characters
          completionTokens = Math.ceil(lastMessage.content.length / 4);
        } else if (typeof typedResponse.content === 'string') {
          completionTokens = Math.ceil(typedResponse.content.length / 4);
        } else {
          // Default minimum to track something
          completionTokens = 1;
        }
      }

      // Existing code for tracking tokens
      let polarCustomerId: string | undefined;

      // Get from session
      try {
        const session = await auth.api.getSession({ headers: req.headers });

        // Try to get from session first
        polarCustomerId = (session?.user as any)?.polarCustomerId ||
          (session?.user as any)?.metadata?.polarCustomerId;
      } catch (error) {
        console.warn('Failed to get session for Polar customer ID:', error);
      }

      // Track token usage
      if (completionTokens > 0) {
        try {
          // Get isAnonymous status from session if available
          let isAnonymous = false;
          try {
            isAnonymous = (session?.user as any)?.isAnonymous === true;
          } catch (error) {
            console.warn('Could not determine if user is anonymous, assuming not anonymous');
          }

          // Determine if user should have credits deducted or just use daily message tracking
          // Only deduct credits if user actually has purchased credits (positive balance) AND not using own API keys
          let shouldDeductCredits = false;
          if (!isAnonymous && !isUsingOwnApiKeys && actualCredits !== null && actualCredits > 0) {
            shouldDeductCredits = true;
          }

          // Pass flags to control credit deduction vs daily message tracking
          await trackTokenUsage(userId, polarCustomerId, completionTokens, isAnonymous, shouldDeductCredits);
          console.log(`${isAnonymous ? 'Tracked' : shouldDeductCredits ? 'Reported to Polar' : 'Tracked (daily limit)'} ${completionTokens} tokens for user ${userId} [Chat ${id}]`);
        } catch (error: any) {
          console.error(`[Chat ${id}][onFinish] Failed to track token usage for user ${userId}:`, error);
          // Don't break the response flow if tracking fails
        }
      }
    }
  };

  console.log("OpenRouter API Payload:", JSON.stringify(openRouterPayload, null, 2));

  // Now call streamText as before
  // const result = streamText(openRouterPayload); // Will be moved into try-catch

  // result.consumeStream() // This is likely redundant and will be removed.
  // return result.toDataStreamResponse({ // Will be moved into try-catch

  try {
    const result = streamText(openRouterPayload);

    return result.toDataStreamResponse({
      sendReasoning: true,
      getErrorMessage: (error: any) => {
        // Log the full error object for server-side debugging
        console.error(`[API Error][Chat ${id}] Error in stream processing or before stream response:`, JSON.stringify(error, null, 2));

        let errorCode = "STREAM_ERROR";
        let errorMessage = "An error occurred while processing your request.";
        let errorDetails; // For stack traces or additional metadata

        // 1. Check for errors with responseBody (e.g., AI_APICallError from OpenRouter)
        if (error && typeof error.responseBody === 'string') {
          try {
            const parsedBody = JSON.parse(error.responseBody);
            if (parsedBody.error && typeof parsedBody.error.message === 'string') {
              errorMessage = parsedBody.error.message;
              if (parsedBody.error.code) {
                errorCode = String(parsedBody.error.code);
              }
              if (parsedBody.error.metadata) {
                errorDetails = JSON.stringify(parsedBody.error.metadata);
              }
            } else if (typeof parsedBody.message === 'string') { // Some errors might have message at top level
              errorMessage = parsedBody.message;
              if (parsedBody.code) {
                errorCode = String(parsedBody.code);
              }
            }
          } catch (e) {
            console.warn(`[API Error][Chat ${id}] Failed to parse error.responseBody, content: ${error.responseBody}`, e);
            // Fall through if responseBody is not JSON or doesn't match expected structure
          }
        }

        // 2. If errorMessage is still generic, try parsing error.message or use it directly
        if (errorMessage === "An error occurred while processing your request." && error instanceof Error && error.message) {
          try {
            // Check if error.message is a stringified JSON from our own createErrorResponse
            const parsedJsonMessage = JSON.parse(error.message);
            if (parsedJsonMessage.error && parsedJsonMessage.error.code && parsedJsonMessage.error.message) {
              errorCode = parsedJsonMessage.error.code;
              errorMessage = parsedJsonMessage.error.message;
              errorDetails = parsedJsonMessage.error.details || errorDetails; // Keep details from responseBody if any
            } else {
              // error.message was not our specific JSON format, use it directly
              errorMessage = error.message;
            }
          } catch (parseError) {
            // error.message is not JSON, use it directly
            errorMessage = error.message;
          }
        } else if (errorMessage === "An error occurred while processing your request." && typeof error === 'string') {
          errorMessage = error;
        }

        // 3. Apply specific keyword-based overrides if a more specific message wasn't found or to refine it
        const checkMessage = errorMessage || (error instanceof Error ? error.message : '');
        if (checkMessage) {
          if (checkMessage.includes("Rate limit") || checkMessage.includes("429") || errorCode === "429") {
            errorCode = "RATE_LIMIT_EXCEEDED";
            errorMessage = "Rate limit exceeded with the AI provider. Please try again later.";
          } else if (checkMessage.includes("authentication") || checkMessage.includes("401") || errorCode === "401") {
            errorCode = "AUTHENTICATION_ERROR";
            errorMessage = "Authentication failed with the AI provider.";
          } else if (checkMessage.includes("insufficient_quota") || checkMessage.includes("credit")) {
            errorCode = "INSUFFICIENT_QUOTA";
            errorMessage = "Insufficient quota or credits with the AI provider.";
          }
        }

        // 4. Set errorDetails from stack if not already set by more specific metadata
        if (!errorDetails && error instanceof Error && error.stack) {
          errorDetails = error.stack;
        }

        // Ensure errorDetails is a string if it exists
        if (errorDetails && typeof errorDetails !== 'string') {
          errorDetails = JSON.stringify(errorDetails);
        }

        return JSON.stringify({ error: { code: errorCode, message: errorMessage, details: errorDetails } });
      },
    });
  } catch (e: any) {
    console.error(`[API Route Top-Level Error][Chat ${id}] Error during streamText or toDataStreamResponse:`, JSON.stringify(e, null, 2));

    // Save user messages and update chat state on error
    try {
      // modelMessages are UIMessage[]. convertToDBMessages expects Message[].
      // Cast/map UIMessage to Message structure for compatibility.
      const compatibleMessagesForDB: Message[] = modelMessages.map(uiMsg => ({
        id: uiMsg.id,
        role: uiMsg.role,
        content: uiMsg.content,
        // name: uiMsg.name, // Add if 'name' is part of UIMessage and relevant for Message
        // tool_calls: undefined, // Explicitly undefined if not applicable
        // tool_call_id: undefined, // Explicitly undefined if not applicable
      }));

      const dbMessagesOnError = convertToDBMessages(compatibleMessagesForDB, id);

      if (dbMessagesOnError.length > 0) {
        await saveMessages({ messages: dbMessagesOnError });
        console.log(`[Chat ${id}][Error Handler] Successfully saved applicable messages to 'messages' table after an error.`);
      }

      await saveChat({
        id,
        userId,
        messages: modelMessages as any, // UIMessage[] is compatible enough for JSONB storage here
      });
      console.log(`[Chat ${id}][Error Handler] Successfully updated 'chats.messages' with current messages after an error.`);

    } catch (dbError: any) {
      console.error(`[Chat ${id}][Error Handler] DATABASE_ERROR saving messages/chat after primary error:`, dbError.message, dbError.stack);
    }

    // Construct and return a standardized error response
    let errorCode = "PIPELINE_ERROR"; // More specific than UNKNOWN_ERROR for this catch block
    let errorMessage = "An error occurred while processing your request pipeline.";
    let errorDetails;

    if (e && typeof e.responseBody === 'string') {
      try {
        const parsedBody = JSON.parse(e.responseBody);
        if (parsedBody.error && typeof parsedBody.error.message === 'string') {
          errorMessage = parsedBody.error.message;
          if (parsedBody.error.code) errorCode = String(parsedBody.error.code);
          if (parsedBody.error.metadata) errorDetails = JSON.stringify(parsedBody.error.metadata);
        }
      } catch (parseErr) { /* ignore */ }
    } else if (e instanceof Error) {
      errorMessage = e.message;
      if (!errorDetails) errorDetails = e.stack;
    } else if (typeof e === 'string') {
      errorMessage = e;
    }

    const statusCode = e.statusCode || (e.name === 'AI_APICallError' ? e.status : undefined) || 500;


    return new Response(
      JSON.stringify({ error: { code: errorCode, message: errorMessage, details: errorDetails } }),
      { status: statusCode, headers: { "Content-Type": "application/json" } }
    );
  }
}

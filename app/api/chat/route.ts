import { model, type modelID } from "@/ai/providers";
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
import { auth, checkMessageLimit } from '@/lib/auth';

import { experimental_createMCPClient as createMCPClient, MCPTransport } from 'ai';
import { Experimental_StdioMCPTransport as StdioMCPTransport } from 'ai/mcp-stdio';
import { spawn } from "child_process";

// Allow streaming responses up to 60 seconds on Hobby plan
export const maxDuration = 60;

interface KeyValuePair {
  key: string;
  value: string;
}

interface MCPServerConfig {
  url: string;
  type: 'sse' | 'stdio';
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

export async function POST(req: Request) {
  const {
    messages,
    chatId,
    selectedModel,
    mcpServers: initialMcpServers = [],
    webSearch = { enabled: false, contextSize: 'medium' }
  }: {
    messages: UIMessage[];
    chatId?: string;
    selectedModel: modelID;
    mcpServers?: MCPServerConfig[];
    webSearch?: WebSearchOptions;
  } = await req.json();

  let mcpServers = initialMcpServers;

  // Disable MCP servers for DeepSeek R1, Grok 3 Beta, Grok 3 Mini Beta, and Grok 3 Mini Beta (High Reasoning)
  if (
    selectedModel === "openrouter/deepseek/deepseek-r1" ||
    selectedModel === "openrouter/x-ai/grok-3-beta" ||
    selectedModel === "openrouter/x-ai/grok-3-mini-beta" ||
    selectedModel === "openrouter/x-ai/grok-3-mini-beta-reasoning-high"
  ) {
    mcpServers = [];
  }

  // Get the authenticated session (including anonymous users)
  const session = await auth.api.getSession({ headers: req.headers });

  // If no session exists, return error
  if (!session || !session.user || !session.user.id) {
    return new Response(
      JSON.stringify({ error: "Authentication required" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const userId = session.user.id;
  const isAnonymous = (session.user as any).isAnonymous === true;

  // Check message limit based on authentication status
  const limitStatus = await checkMessageLimit(userId, isAnonymous);

  if (limitStatus.hasReachedLimit) {
    return new Response(
      JSON.stringify({
        error: "Message limit reached",
        message: `You've reached your daily limit of ${limitStatus.limit} messages. ${isAnonymous ? "Sign in with Google to get more messages." : "Purchase credits to continue."
          }`,
        limit: limitStatus.limit,
        remaining: limitStatus.remaining
      }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  // Check if user has sufficient credits (if they have a Polar account)
  try {
    // Try to get the Polar customer ID from session
    const polarCustomerId: string | undefined = (session.user as any)?.polarCustomerId ||
      (session.user as any)?.metadata?.polarCustomerId;

    // Estimate ~30 tokens per message as a basic check
    const estimatedTokens = 30;

    // Check credits using both the external ID (userId) and legacy polarCustomerId
    // Pass isAnonymous flag to skip Polar checks for anonymous users
    const hasCredits = await hasEnoughCredits(polarCustomerId, userId, estimatedTokens, isAnonymous);

    if (!hasCredits) {
      return new Response(
        JSON.stringify({
          error: "Insufficient credits",
          message: "You've used all your AI credits. Please purchase more to continue."
        }),
        { status: 402, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    // Log but continue - don't block users if credit check fails
    console.error('Error checking credits:', error);
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
    selectedModel === "openrouter/x-ai/grok-3-beta" ||
    selectedModel === "openrouter/x-ai/grok-3-mini-beta" ||
    selectedModel === "openrouter/x-ai/grok-3-mini-beta-reasoning-high"
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
    }
  }

  // Initialize tools
  let tools = {};
  const mcpClients: any[] = [];

  // Process each MCP server configuration
  for (const mcpServer of mcpServers) {
    try {
      // Create appropriate transport based on type
      let transport: MCPTransport | { type: 'sse', url: string, headers?: Record<string, string> };

      if (mcpServer.type === 'sse') {
        // Convert headers array to object for SSE transport
        const headers: Record<string, string> = {};
        if (mcpServer.headers && mcpServer.headers.length > 0) {
          mcpServer.headers.forEach(header => {
            if (header.key) headers[header.key] = header.value || '';
          });
        }

        transport = {
          type: 'sse' as const,
          url: mcpServer.url,
          headers: Object.keys(headers).length > 0 ? headers : undefined
        };
      } else if (mcpServer.type === 'stdio') {
        // For stdio transport, we need command and args
        if (!mcpServer.command || !mcpServer.args || mcpServer.args.length === 0) {
          console.warn("Skipping stdio MCP server due to missing command or args");
          continue;
        }

        // Convert env array to object for stdio transport
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

        transport = new StdioMCPTransport({
          command: mcpServer.command,
          args: mcpServer.args,
          env: Object.keys(env).length > 0 ? env : undefined
        });
      } else {
        console.warn(`Skipping MCP server with unsupported transport type: ${mcpServer.type}`);
        continue;
      }

      const mcpClient = await createMCPClient({ transport });
      mcpClients.push(mcpClient);

      const mcptools = await mcpClient.tools();

      console.log(`MCP tools from ${mcpServer.type} transport:`, Object.keys(mcptools));

      // Add MCP tools to tools object
      tools = { ...tools, ...mcptools };
    } catch (error) {
      console.error("Failed to initialize MCP client:", error);
      // Continue with other servers instead of failing the entire request
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

  // Add web search tool if enabled
  if (webSearch.enabled) {
    const openrouterClient = createOpenRouter({ apiKey: getApiKey('OPENROUTER_API_KEY') });
    tools = {
      ...tools,
      // @ts-expect-error Property 'web_search' does not exist on 'tools' initially.
      web_search: openrouterClient.toolFactory.searchWeb({
        contextSize: webSearch.contextSize,
      }),
    };
  }

  let modelInstance;
  if (webSearch.enabled && selectedModel.startsWith("openrouter/")) {
    // Remove 'openrouter/' prefix for the OpenRouter client
    const openrouterModelId = selectedModel.replace("openrouter/", "") + ":online";
    const openrouterClient = createOpenRouter({
      apiKey: getApiKey('OPENROUTER_API_KEY'),
      headers: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://www.chatlima.com/',
        'X-Title': process.env.NEXT_PUBLIC_APP_TITLE || 'ChatLima',
      }
    });
    // For DeepSeek R1, Grok 3 Beta, Grok 3 Mini Beta, and Grok 3 Mini Beta (High Reasoning), explicitly disable logprobs if it's the selected model
    if (
      selectedModel === "openrouter/deepseek/deepseek-r1" ||
      selectedModel === "openrouter/x-ai/grok-3-beta" ||
      selectedModel === "openrouter/x-ai/grok-3-mini-beta" ||
      selectedModel === "openrouter/x-ai/grok-3-mini-beta-reasoning-high"
    ) {
      modelInstance = openrouterClient(openrouterModelId, { logprobs: false });
    } else {
      modelInstance = openrouterClient(openrouterModelId);
    }
  } else {
    modelInstance = model.languageModel(selectedModel);
  }

  const modelOptions = {
    ...(webSearch.enabled && {
      web_search_options: {
        search_context_size: webSearch.contextSize
      }
    })
  };

  // Construct the payload for OpenRouter
  const openRouterPayload = {
    model: modelInstance,
    system: `You are a helpful AI assistant. Today's date is ${new Date().toISOString().split('T')[0]}.

    You have access to external tools provided by connected servers. These tools can perform specific actions like running code, searching databases, or accessing external services.

    ${webSearch.enabled ? `
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
      console.error(JSON.stringify(error, null, 2));
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
      await saveChat({
        id,
        userId,
        messages: processedMessages as any, // Cast to any to bypass type error
      });

      const dbMessages = (convertToDBMessages(processedMessages as any, id) as any[]).map(msg => ({
        ...msg,
        hasWebSearch: webSearch.enabled,
        webSearchContextSize: webSearch.contextSize
      }));

      await saveMessages({ messages: dbMessages });

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
          completionTokens = 10;
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

          // Pass isAnonymous flag to skip Polar reporting for anonymous users
          await trackTokenUsage(userId, polarCustomerId, completionTokens, isAnonymous);
          console.log(`${isAnonymous ? 'Tracked' : 'Reported'} ${completionTokens} tokens for user ${userId}${isAnonymous ? ' (anonymous)' : ' to Polar'}`);
        } catch (error) {
          console.error('Failed to track token usage:', error);
          // Don't break the response flow if tracking fails
        }
      }
    }
  };

  console.log("OpenRouter API Payload:", JSON.stringify(openRouterPayload, null, 2));

  // Now call streamText as before
  const result = streamText(openRouterPayload);

  result.consumeStream()
  return result.toDataStreamResponse({
    sendReasoning: true,
    getErrorMessage: (error) => {
      if (error instanceof Error) {
        if (error.message.includes("Rate limit")) {
          return "Rate limit exceeded. Please try again later.";
        }
      }
      console.error(error);
      return "An error occurred.";
    },
  });
}

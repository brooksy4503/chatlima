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
import { trackTokenUsage, hasEnoughCredits, WEB_SEARCH_COST } from '@/lib/tokenCounter';
import { getRemainingCredits, getRemainingCreditsByExternalId } from '@/lib/polar';
import { auth, checkMessageLimit } from '@/lib/auth';
import type { ImageUIPart } from '@/lib/types';
import { convertToOpenRouterFormat } from '@/lib/openrouter-utils';

import { experimental_createMCPClient as createMCPClient, MCPTransport } from 'ai';
import { Experimental_StdioMCPTransport as StdioMCPTransport } from 'ai/mcp-stdio';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { spawn } from "child_process";

// Allow streaming responses up to 300 seconds on Hobby plan
export const maxDuration = 300;

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
  console.log('[DEBUG] Chat API called');

  const {
    messages,
    chatId,
    selectedModel,
    mcpServers: initialMcpServers = [],
    webSearch = { enabled: false, contextSize: 'medium' },
    apiKeys = {},
    attachments = []
  }: {
    messages: UIMessage[];
    chatId?: string;
    selectedModel: modelID;
    mcpServers?: MCPServerConfig[];
    webSearch?: WebSearchOptions;
    apiKeys?: Record<string, string>;
    attachments?: Array<{
      name: string;
      contentType: string;
      url: string;
    }>;
  } = await req.json();

  console.log('[DEBUG] Request body parsed:', {
    messagesCount: messages.length,
    chatId,
    selectedModel,
    attachmentsCount: attachments.length,
    webSearchEnabled: webSearch.enabled
  });

  if (attachments.length > 0) {
    console.log('[DEBUG] Attachments received:', attachments.map(att => ({
      name: att.name,
      contentType: att.contentType,
      urlPrefix: att.url.substring(0, 50) + '...'
    })));
  }

  let mcpServers = initialMcpServers;

  // Disable MCP servers for DeepSeek R1 models
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

  // Helper function to check if model supports vision
  function modelSupportsVision(modelId: modelID): boolean {
    const visionModels = [
      'openrouter/openai/gpt-4o',
      'openrouter/openai/gpt-4o-mini',
      'openrouter/openai/gpt-4-turbo',
      'openrouter/anthropic/claude-3-opus',
      'openrouter/anthropic/claude-3-5-sonnet',
      'openrouter/anthropic/claude-3-haiku',
      'openrouter/anthropic/claude-sonnet-4', // Claude 4 Sonnet
      'openrouter/anthropic/claude-opus-4', // Claude 4 Opus
      'requesty/anthropic/claude-sonnet-4-20250514', // Claude 4 Sonnet via Requesty
      'openrouter/google/gemini-pro-vision',
      'openrouter/google/gemini-2.0-flash-exp'
    ];

    return visionModels.some(model => modelId.includes(model.split('/').pop() || ''));
  }

  // Process attachments into message parts
  function processMessagesWithAttachments(
    messages: UIMessage[],
    attachments: Array<{ name: string; contentType: string; url: string }>
  ): UIMessage[] {
    console.log('[DEBUG] processMessagesWithAttachments called with:', {
      messagesCount: messages.length,
      attachmentsCount: attachments.length
    });

    if (attachments.length === 0) {
      console.log('[DEBUG] No attachments, returning original messages');
      return messages;
    }

    // Check if model supports vision
    const supportsVision = modelSupportsVision(selectedModel);
    console.log('[DEBUG] Model vision support check:', {
      selectedModel,
      supportsVision
    });

    if (!supportsVision) {
      console.error('[ERROR] Model does not support vision:', selectedModel);
      throw new Error(`Selected model ${selectedModel} does not support image inputs. Please choose a vision-capable model.`);
    }

    // Add attachments to the last user message
    const processedMessages = [...messages];
    const lastMessageIndex = processedMessages.length - 1;

    console.log('[DEBUG] Processing attachments for message at index:', lastMessageIndex);

    if (lastMessageIndex >= 0 && processedMessages[lastMessageIndex].role === 'user') {
      const lastMessage = processedMessages[lastMessageIndex];
      console.log('[DEBUG] Last message:', {
        role: lastMessage.role,
        content: lastMessage.content?.substring(0, 100),
        hasExistingParts: !!lastMessage.parts,
        existingPartsCount: lastMessage.parts?.length || 0
      });

      // Convert attachments to image parts
      const imageParts: ImageUIPart[] = attachments.map((attachment, index) => {
        console.log('[DEBUG] Converting attachment', index, ':', {
          name: attachment.name,
          contentType: attachment.contentType,
          urlLength: attachment.url.length,
          isValidDataUrl: attachment.url.startsWith('data:image/')
        });

        return {
          type: 'image_url' as const,
          image_url: {
            url: attachment.url,
            detail: 'auto' as const
          },
          metadata: {
            filename: attachment.name,
            mimeType: attachment.contentType,
            size: 0, // We don't have size info from the attachment
            width: 0,
            height: 0
          }
        };
      });

      console.log('[DEBUG] Created image parts:', imageParts.length);

      // Create new parts array with type assertion
      const existingParts = lastMessage.parts || [{ type: 'text', text: lastMessage.content }];
      const newParts = [...existingParts, ...imageParts] as any;

      console.log('[DEBUG] Combined parts:', {
        existingPartsCount: existingParts.length,
        newImagePartsCount: imageParts.length,
        totalPartsCount: newParts.length
      });

      processedMessages[lastMessageIndex] = {
        ...lastMessage,
        parts: newParts
      };

      console.log('[DEBUG] Updated last message with image parts');
    } else {
      console.warn('[WARN] No user message found to attach images to, or last message is not from user');
    }

    console.log('[DEBUG] Returning processed messages with attachments');
    return processedMessages;
  }

  // Process messages with attachments
  const processedMessages = processMessagesWithAttachments(messages, attachments);

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

  // Check if the model is free (ends with :free)
  const isFreeModel = selectedModel.endsWith(':free');
  console.log(`[Debug] User ${userId} - isFreeModel: ${isFreeModel}`);

  // 1. Check if user has sufficient credits (if they have a Polar account and not using own keys)
  let hasCredits = false;
  let actualCredits: number | null = null;
  console.log(`[Debug] User ${userId} - isAnonymous: ${isAnonymous}, polarCustomerId: ${polarCustomerId}`);

  // Skip credit checks entirely if user is using their own API keys or using a free model
  if (isUsingOwnApiKeys) {
    console.log(`[Debug] User ${userId} is using own API keys, skipping credit checks`);
    hasCredits = true; // Allow request to proceed
  } else if (isFreeModel) {
    console.log(`[Debug] User ${userId} is using a free model (${selectedModel}), skipping credit checks`);
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

  // 2. Check for negative credit balance - block if user has negative credits (skip if using own API keys or free model)
  if (!isUsingOwnApiKeys && !isFreeModel && !isAnonymous && actualCredits !== null && actualCredits < 0) {
    console.log(`[Debug] User ${userId} has negative credits (${actualCredits}), blocking request`);
    return createErrorResponse(
      "INSUFFICIENT_CREDITS",
      `Your account has a negative credit balance (${actualCredits}). Please purchase more credits to continue.`,
      402,
      `User has ${actualCredits} credits`
    );
  }

  // 2.5. Check Web Search credit requirement - ensure user has enough credits for web search (skip if using own API keys)

  // SECURITY FIX: Don't trust client's webSearch.enabled, determine server-side
  let serverSideWebSearchEnabled = false;

  // Only enable web search if user actually has credits AND not anonymous AND not using own keys
  if (!isUsingOwnApiKeys && !isAnonymous && actualCredits !== null && actualCredits >= WEB_SEARCH_COST) {
    // User has sufficient credits, allow them to use web search if requested
    serverSideWebSearchEnabled = webSearch.enabled;
  } else if (isUsingOwnApiKeys && webSearch.enabled) {
    // Users with own API keys can use web search if they requested it
    serverSideWebSearchEnabled = true;
  }

  // Block unpaid attempts
  if (webSearch.enabled && !serverSideWebSearchEnabled) {
    if (isAnonymous) {
      console.log(`[Security] Anonymous user ${userId} tried to use Web Search, blocking request`);
      return createErrorResponse(
        "FEATURE_RESTRICTED",
        "Web Search is only available to signed-in users with credits. Please sign in and purchase credits to use this feature.",
        403,
        "Anonymous users cannot use Web Search"
      );
    }

    if (actualCredits !== null && actualCredits < WEB_SEARCH_COST) {
      console.log(`[Security] User ${userId} tried to bypass Web Search payment (${actualCredits} < ${WEB_SEARCH_COST})`);
      return createErrorResponse(
        "INSUFFICIENT_CREDITS",
        `You need at least ${WEB_SEARCH_COST} credits to use Web Search. Your balance is ${actualCredits}.`,
        402,
        `User attempted to bypass Web Search payment with ${actualCredits} credits`
      );
    }
  }

  // Use server-determined web search status instead of client's request
  const secureWebSearch = {
    enabled: serverSideWebSearchEnabled,
    contextSize: webSearch.contextSize
  };

  // 3. If user has credits or is using own API keys or using free model, allow request (skip daily message limit)
  console.log(`[Debug] Credit check: !isAnonymous=${!isAnonymous}, hasCredits=${hasCredits}, actualCredits=${actualCredits}, isUsingOwnApiKeys=${isUsingOwnApiKeys}, isFreeModel=${isFreeModel}, will skip limit check: ${(!isAnonymous && hasCredits) || isUsingOwnApiKeys || isFreeModel}`);

  if ((!isAnonymous && hasCredits) || isUsingOwnApiKeys || isFreeModel) {
    console.log(`[Debug] User ${userId} ${isUsingOwnApiKeys ? 'using own API keys' : isFreeModel ? 'using free model' : 'has credits'}, skipping message limit check`);
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
  const modelMessages: UIMessage[] = [...processedMessages];

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
        selectedModel,
        apiKeys,
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
            headers: {
              'MCP-Protocol-Version': '2025-06-18', // Required for MCP 1.13.0+
              ...headers // Spread existing headers after protocol version
            }
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
  if (secureWebSearch.enabled) {
    console.log(`[Web Search] ENABLED with context size: ${secureWebSearch.contextSize}`);
  } else {
    console.log(`[Web Search] DISABLED`);
  }

  let modelInstance;
  let effectiveWebSearchEnabled = secureWebSearch.enabled; // Initialize with requested value

  // Add API key validation for OpenRouter models to prevent authentication errors
  if (selectedModel.startsWith("openrouter/")) {
    const openrouterApiKey = apiKeys?.['OPENROUTER_API_KEY'] || process.env.OPENROUTER_API_KEY;
    if (!openrouterApiKey) {
      console.error(`[Chat ${id}] OpenRouter API key is missing for model ${selectedModel}`);
      return createErrorResponse(
        "MISSING_API_KEY",
        "OpenRouter API key is required for this model. Please configure your API key.",
        400
      );
    }

    // Log (safely) that we have an API key
    console.log(`[Chat ${id}] OpenRouter API key available: ${openrouterApiKey.substring(0, 8)}...`);
  }

  // Check if the selected model supports web search
  const currentModelDetails = modelDetails[selectedModel];
  if (secureWebSearch.enabled && selectedModel.startsWith("openrouter/")) {
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
    if (secureWebSearch.enabled) {
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
      search_context_size: secureWebSearch.contextSize
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

  // Enhanced security logging
  if (webSearch.enabled && !serverSideWebSearchEnabled) {
    console.error(`[SECURITY ALERT] User ${userId} attempted to bypass Web Search payment:`, {
      userId,
      isAnonymous,
      actualCredits,
      isUsingOwnApiKeys,
      userAgent: req.headers.get('user-agent'),
      requestTime: new Date().toISOString(),
      sessionInfo: {
        email: session.user.email,
        name: session.user.name
      }
    });
  }

  // Construct the payload for streamText (Vercel AI SDK format)
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
    async onStop(event: any) {
      console.log(`[Chat ${id}][onStop] Stream stopped by user, saving current state...`);
      console.log(`[Chat ${id}][onStop] Event object:`, JSON.stringify(event, null, 2));

      try {
        // Try multiple ways to extract the current text content from different event structures
        let currentText = '';

        // Method 1: Direct text property
        if (event.text && typeof event.text === 'string') {
          currentText = event.text;
        }
        // Method 2: Response.text property
        else if (event.response?.text && typeof event.response.text === 'string') {
          currentText = event.response.text;
        }
        // Method 3: Try to extract from response messages
        else if (event.response?.messages && Array.isArray(event.response.messages)) {
          const lastMessage = event.response.messages[event.response.messages.length - 1];
          if (lastMessage && lastMessage.content) {
            currentText = typeof lastMessage.content === 'string' ? lastMessage.content : JSON.stringify(lastMessage.content);
          }
        }
        // Method 4: Try to extract from event messages
        else if (event.messages && Array.isArray(event.messages)) {
          const lastMessage = event.messages[event.messages.length - 1];
          if (lastMessage && lastMessage.content) {
            currentText = typeof lastMessage.content === 'string' ? lastMessage.content : JSON.stringify(lastMessage.content);
          }
        }
        // Method 5: Check for experimental properties
        else if (event.experimental_completionMessage) {
          currentText = event.experimental_completionMessage;
        }

        console.log(`[Chat ${id}][onStop] Extracted text length:`, currentText.length);
        console.log(`[Chat ${id}][onStop] Text preview:`, currentText.substring(0, 100));

        // Only proceed if we have some text content
        if (currentText.trim().length > 0) {
          // Create a response message with the current text and proper parts structure
          const assistantMessage = {
            role: 'assistant' as const,
            content: currentText,
            id: nanoid(),
            createdAt: new Date(),
            parts: [{ type: 'text', text: currentText }] // Add parts structure for consistency
          };

          // Create the full message array
          const allMessages = [...modelMessages, assistantMessage];
          console.log(`[Chat ${id}][onStop] Total messages:`, allMessages.length);

          // Save the chat with title generation (don't pass title to trigger generation)
          await saveChat({
            id,
            messages: allMessages,
            userId,
            selectedModel,
            apiKeys,
            // Don't pass title parameter to trigger generation
          });
          console.log(`[Chat ${id}][onStop] Chat saved successfully`);

          // Save individual messages using the same approach as onFinish
          const dbMessages = (convertToDBMessages(allMessages as any, id) as any[]).map(msg => ({
            ...msg,
            hasWebSearch: effectiveWebSearchEnabled && msg.role === 'assistant',
            webSearchContextSize: secureWebSearch.enabled ? secureWebSearch.contextSize : undefined
          }));

          await saveMessages({ messages: dbMessages });
          console.log(`[Chat ${id}][onStop] Messages saved successfully`);
        } else {
          console.warn(`[Chat ${id}][onStop] No text content found to save. Event may not contain expected properties.`);

          // Save at least the user messages if we have them
          if (modelMessages.length > 0) {
            await saveChat({
              id,
              messages: modelMessages,
              userId,
              selectedModel,
              apiKeys,
            });
            console.log(`[Chat ${id}][onStop] Saved user messages only (no assistant response)`);
          }
        }

        // Track token usage even when stopped - estimate based on partial content
        if (currentText.trim().length > 0) {
          try {
            // Estimate completion tokens based on the partial text we have
            const completionTokens = Math.ceil(currentText.length / 4); // Rough estimate: 1 token ≈ 4 characters

            // Get isAnonymous status from session if available
            let isAnonymous = false;
            let polarCustomerId: string | undefined;

            try {
              const session = await auth.api.getSession({ headers: req.headers });
              isAnonymous = (session?.user as any)?.isAnonymous === true;
              polarCustomerId = (session?.user as any)?.polarCustomerId ||
                (session?.user as any)?.metadata?.polarCustomerId;
            } catch (error) {
              console.warn('Could not get session info for token tracking in onStop:', error);
            }

            // Recalculate isUsingOwnApiKeys in callback scope
            const callbackIsUsingOwnApiKeys = checkIfUsingOwnApiKeys(selectedModel, apiKeys);

            // Get actual credits in callback scope
            let callbackActualCredits: number | null = null;
            if (!isAnonymous && userId) {
              try {
                callbackActualCredits = await getRemainingCreditsByExternalId(userId);
              } catch (error) {
                console.warn('Error getting actual credits in onStop callback:', error);
              }
            }

            // Check if the model is free (ends with :free)
            const isFreeModel = selectedModel.endsWith(':free');

            // Determine if user should have credits deducted
            let shouldDeductCredits = false;
            if (!isAnonymous && !callbackIsUsingOwnApiKeys && !isFreeModel && callbackActualCredits !== null && callbackActualCredits > 0) {
              shouldDeductCredits = true;
            }

            // Calculate additional cost for web search
            let additionalCost = 0;
            if (secureWebSearch.enabled && !callbackIsUsingOwnApiKeys && shouldDeductCredits) {
              additionalCost = WEB_SEARCH_COST;
            }

            // Track token usage for stopped stream
            await trackTokenUsage(userId, polarCustomerId, completionTokens, isAnonymous, shouldDeductCredits, additionalCost);
            const actualCreditsReported = shouldDeductCredits ? 1 + additionalCost : 0;
            const trackingReason = isAnonymous ? 'Tracked (stopped)' : shouldDeductCredits ? 'Reported to Polar (stopped)' : isFreeModel ? 'Tracked (free model, stopped)' : 'Tracked (daily limit, stopped)';
            console.log(`${trackingReason} ${actualCreditsReported} credits for user ${userId} [Chat ${id}]`);
          } catch (tokenError) {
            console.error(`[Chat ${id}][onStop] Error tracking token usage:`, tokenError);
          }
        }

      } catch (error) {
        console.error(`[Chat ${id}][onStop] Error saving stopped chat:`, error);
      }
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
          selectedModel,
          apiKeys,
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
          hasWebSearch: effectiveWebSearchEnabled && msg.role === 'assistant' && (response.annotations?.length || 0) > 0, // Only set true if web search was actually used
          webSearchContextSize: secureWebSearch.enabled ? secureWebSearch.contextSize : undefined // Store original request if needed, or effective
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

          // Recalculate isUsingOwnApiKeys in callback scope since it's not accessible here
          const callbackIsUsingOwnApiKeys = checkIfUsingOwnApiKeys(selectedModel, apiKeys);

          // Get actual credits in callback scope
          let callbackActualCredits: number | null = null;
          if (!isAnonymous && userId) {
            try {
              callbackActualCredits = await getRemainingCreditsByExternalId(userId);
            } catch (error) {
              console.warn('Error getting actual credits in onFinish callback:', error);
            }
          }

          // Check if the model is free (ends with :free)
          const isFreeModel = selectedModel.endsWith(':free');

          // Determine if user should have credits deducted or just use daily message tracking
          // Only deduct credits if user actually has purchased credits (positive balance) AND not using own API keys AND not using a free model
          let shouldDeductCredits = false;
          if (!isAnonymous && !callbackIsUsingOwnApiKeys && !isFreeModel && callbackActualCredits !== null && callbackActualCredits > 0) {
            shouldDeductCredits = true;
          }

          // Calculate additional cost for web search - use webSearch from outer scope (it should be accessible)
          let additionalCost = 0;
          if (secureWebSearch.enabled && !callbackIsUsingOwnApiKeys && shouldDeductCredits) {
            additionalCost = WEB_SEARCH_COST;
          }

          // Pass flags to control credit deduction vs daily message tracking, including web search surcharge
          await trackTokenUsage(userId, polarCustomerId, completionTokens, isAnonymous, shouldDeductCredits, additionalCost);
          const actualCreditsReported = shouldDeductCredits ? 1 + additionalCost : 0;
          const trackingReason = isAnonymous ? 'Tracked' : shouldDeductCredits ? 'Reported to Polar' : isFreeModel ? 'Tracked (free model)' : 'Tracked (daily limit)';
          console.log(`${trackingReason} ${actualCreditsReported} credits for user ${userId} [Chat ${id}]`);
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
    // Add some defensive validation before calling streamText
    if (!modelInstance) {
      throw new Error('Model instance is not properly configured');
    }

    // Log the model being used for debugging
    console.log(`[Chat ${id}] Using model: ${selectedModel}, effectiveWebSearchEnabled: ${effectiveWebSearchEnabled}`);

    const result = streamText(openRouterPayload);

    return result.toDataStreamResponse({
      sendReasoning: true,
      getErrorMessage: (error: any) => {
        // Log the full error object for server-side debugging
        console.error(`[API Error][Chat ${id}] Error in stream processing or before stream response:`, JSON.stringify(error, null, 2));

        // Handle AI_TypeValidationError specifically - this often occurs when OpenRouter returns
        // an error response that doesn't match the expected AI SDK schema
        if (error?.name === 'AI_TypeValidationError' || error?.constructor?.name === 'AI_TypeValidationError') {
          console.error(`[API Error][Chat ${id}] AI_TypeValidationError detected - likely OpenRouter API error response format mismatch`);

          // Try to extract meaningful error from the validation error value
          if (error?.value?.error) {
            const errorValue = error.value.error;
            if (errorValue.message) {
              // Handle specific OpenRouter error messages
              if (errorValue.message === "Internal Server Error" && errorValue.code === 500) {
                return "The AI provider is temporarily experiencing issues. Please try again in a moment.";
              }
              return `API Error: ${errorValue.message}`;
            }
            if (errorValue.code) {
              return `API Error (Code ${errorValue.code}): The AI provider returned an error response.`;
            }
          }

          // Check if this is a specific OpenRouter format issue
          if (error?.cause?.issues) {
            const issues = error.cause.issues;
            // Look for specific validation issues that suggest OpenRouter API problems
            for (const issue of issues) {
              if (issue.unionErrors) {
                for (const unionError of issue.unionErrors) {
                  if (unionError.issues) {
                    for (const innerIssue of unionError.issues) {
                      if (innerIssue.path && innerIssue.path.includes('choices')) {
                        return "The AI provider is temporarily unavailable. Please try again in a moment.";
                      }
                      if (innerIssue.path && innerIssue.path.includes('error')) {
                        return "The AI provider returned an unexpected error format. Please try again.";
                      }
                    }
                  }
                }
              }
            }
          }

          return "The AI provider returned an unexpected response format. Please try again.";
        }

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

    // Handle AI_TypeValidationError specifically at the top level too
    if (e?.name === 'AI_TypeValidationError' || e?.constructor?.name === 'AI_TypeValidationError') {
      console.error(`[Chat ${id}] Top-level AI_TypeValidationError - OpenRouter API response format issue`);

      let errorMessage = "The AI provider returned an unexpected response format. Please try again.";

      if (e?.value?.error?.message) {
        errorMessage = `API Error: ${e.value.error.message}`;
      } else if (e?.value?.error?.code) {
        errorMessage = `API Error (Code ${e.value.error.code}): The AI provider returned an error response.`;
      }

      return new Response(
        JSON.stringify({ error: { code: "TYPE_VALIDATION_ERROR", message: errorMessage, details: "OpenRouter API response validation failed" } }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

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
        selectedModel,
        apiKeys,
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

import { model, type modelID, getLanguageModelWithKeys, createOpenRouterClientWithKey } from "@/ai/providers";
import { getModelDetails } from "@/lib/models/fetch-models";
import { type ModelInfo } from "@/lib/types/models";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { getApiKey } from "@/ai/providers";
import { streamText, generateText, type UIMessage, type LanguageModelResponseMetadata, type Message } from "ai";
import { validatePresetParameters, getModelDefaults, sanitizeSystemInstruction } from "@/lib/parameter-validation";
import { appendResponseMessages } from 'ai';
import { saveChat, saveMessages, convertToDBMessages } from '@/lib/chat-store';
import { nanoid } from 'nanoid';
import { db } from '@/lib/db';
import { chats } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { trackTokenUsage, hasEnoughCredits, WEB_SEARCH_COST } from '@/lib/tokenCounter';
import { TokenTrackingService } from '@/lib/tokenTracking';
import { CostCalculationService } from '@/lib/services/costCalculation';
import { SimpleCostEstimationService } from '@/lib/services/simpleCostEstimation';
import { DirectTokenTrackingService } from '@/lib/services/directTokenTracking';
import { getRemainingCredits, getRemainingCreditsByExternalId } from '@/lib/polar';
import { createRequestCreditCache, hasEnoughCreditsWithCache } from '@/lib/services/creditCache';
import { auth } from '@/lib/auth';
import { logDiagnostic as originalLogDiagnostic, logChunk, logPerformanceMetrics, logError, logRequestBoundary } from '@/lib/utils/performantLogging';
import { DailyMessageUsageService } from '@/lib/services/dailyMessageUsageService';
import { UsageLimitsService } from '@/lib/services/usageLimits';
import { OptimizedUsageLimitsService } from '@/lib/services/optimizedUsageLimits';
import type { ImageUIPart } from '@/lib/types';
import { convertToOpenRouterFormat } from '@/lib/openrouter-utils';

import { experimental_createMCPClient as createMCPClient, MCPTransport } from 'ai';
import { Experimental_StdioMCPTransport as StdioMCPTransport } from 'ai/mcp-stdio';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { spawn } from "child_process";

// Use optimized logging - only logs in development and uses efficient patterns
const logDiagnostic = originalLogDiagnostic;

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

// Helper to extract input tokens from event (AI SDK format)
const extractInputTokensFromEvent = (event: any): number => {
  if (!event) return 0;

  console.log(`[DEBUG] Extracting input tokens from event:`, {
    hasUsage: !!event.usage,
    hasResponseUsage: !!event.response?.usage,
    usageKeys: event.usage ? Object.keys(event.usage) : [],
    responseUsageKeys: event.response?.usage ? Object.keys(event.response.usage) : [],
    eventKeys: Object.keys(event),
    usage: event.usage,
    responseUsage: event.response?.usage
  });

  // Helper to check if a value is a valid number (not NaN, null, undefined, or 0)
  const isValidToken = (value: any): boolean => {
    return typeof value === 'number' && !isNaN(value) && value > 0;
  };

  // Helper to detect Requesty models with invalid token data
  const isRequestyWithInvalidTokens = (event: any): boolean => {
    if (!event) return false;

    // Check for the specific Requesty pattern: tokens present but NaN
    const hasNaNTokens = (
      (event.usage && (
        (typeof event.usage.promptTokens === 'number' && isNaN(event.usage.promptTokens)) ||
        (typeof event.usage.completionTokens === 'number' && isNaN(event.usage.completionTokens))
      )) ||
      (event.response?.usage && (
        (typeof event.response.usage.promptTokens === 'number' && isNaN(event.response.usage.promptTokens)) ||
        (typeof event.response.usage.completionTokens === 'number' && isNaN(event.response.usage.completionTokens))
      ))
    );

    return hasNaNTokens;
  };

  // Helper function to extract tokens from a usage object
  const extractFromUsage = (usage: any, source: string): number | null => {
    if (!usage) return null;

    if (isValidToken(usage.promptTokens)) {
      console.log(`[DEBUG] Found input tokens in ${source}.promptTokens: ${usage.promptTokens}`);
      return usage.promptTokens;
    }
    if (isValidToken(usage.inputTokens)) {
      console.log(`[DEBUG] Found input tokens in ${source}.inputTokens: ${usage.inputTokens}`);
      return usage.inputTokens;
    }
    if (isValidToken(usage.prompt_tokens)) {
      console.log(`[DEBUG] Found input tokens in ${source}.prompt_tokens: ${usage.prompt_tokens}`);
      return usage.prompt_tokens;
    }
    if (isValidToken(usage.input_tokens)) {
      console.log(`[DEBUG] Found input tokens in ${source}.input_tokens: ${usage.input_tokens}`);
      return usage.input_tokens;
    }

    // Log when we find usage data but with invalid values
    if (usage.promptTokens !== undefined || usage.inputTokens !== undefined ||
      usage.prompt_tokens !== undefined || usage.input_tokens !== undefined) {
      console.log(`[DEBUG] Found usage data in ${source} but values are invalid:`, {
        promptTokens: usage.promptTokens,
        inputTokens: usage.inputTokens,
        prompt_tokens: usage.prompt_tokens,
        input_tokens: usage.input_tokens
      });
    }

    return null;
  };

  // Try event.usage first (AI SDK format)
  let tokens = extractFromUsage(event.usage, 'event.usage');
  if (tokens !== null) return tokens;

  // Try event.response.usage (common in streaming responses, especially for Requesty)
  tokens = extractFromUsage(event.response?.usage, 'event.response.usage');
  if (tokens !== null) return tokens;

  // Try root level on event
  if (isValidToken(event.promptTokens)) {
    console.log(`[DEBUG] Found input tokens in event.promptTokens: ${event.promptTokens}`);
    return event.promptTokens;
  }
  if (isValidToken(event.inputTokens)) {
    console.log(`[DEBUG] Found input tokens in event.inputTokens: ${event.inputTokens}`);
    return event.inputTokens;
  }

  // Try root level on event.response
  if (isValidToken(event.response?.promptTokens)) {
    console.log(`[DEBUG] Found input tokens in event.response.promptTokens: ${event.response.promptTokens}`);
    return event.response.promptTokens;
  }
  if (isValidToken(event.response?.inputTokens)) {
    console.log(`[DEBUG] Found input tokens in event.response.inputTokens: ${event.response.inputTokens}`);
    return event.response.inputTokens;
  }

  // Let's also check if token data is nested deeper in the response or other event properties
  if (event.response && typeof event.response === 'object') {
    console.log(`[DEBUG] Checking event.response for nested token data:`, {
      responseKeys: Object.keys(event.response),
      hasUsage: !!event.response.usage,
      hasResult: !!event.response.result,
      hasData: !!event.response.data,
      hasMetadata: !!event.response.metadata
    });

    // Check various possible nested locations
    const possiblePaths = [
      event.response.usage,
      event.response.result?.usage,
      event.response.data?.usage,
      event.response.metadata?.usage
    ];

    for (const pathUsage of possiblePaths) {
      if (pathUsage) {
        const pathTokens = extractFromUsage(pathUsage, 'event.response nested');
        if (pathTokens !== null) return pathTokens;
      }
    }
  }

  // Check if token data is in event.steps (seen in logs)
  if (event.steps && Array.isArray(event.steps)) {
    console.log(`[DEBUG] Checking event.steps for token data:`, {
      stepsCount: event.steps.length,
      firstStepKeys: event.steps[0] ? Object.keys(event.steps[0]) : []
    });

    for (let i = 0; i < event.steps.length; i++) {
      const step = event.steps[i];
      if (step && step.usage) {
        const stepTokens = extractFromUsage(step.usage, `event.steps[${i}].usage`);
        if (stepTokens !== null) return stepTokens;
      }
    }
  }

  // Check if there's a request object with usage data
  if (event.request && typeof event.request === 'object') {
    console.log(`[DEBUG] Checking event.request for token data:`, {
      requestKeys: Object.keys(event.request),
      hasUsage: !!event.request.usage
    });

    if (event.request.usage) {
      const requestTokens = extractFromUsage(event.request.usage, 'event.request.usage');
      if (requestTokens !== null) return requestTokens;
    }
  }

  // As a last resort, try to find ANY object with token-like properties
  console.log(`[DEBUG] Searching entire event object for token data as last resort`);
  const searchForTokens = (obj: any, path: string): number | null => {
    if (!obj || typeof obj !== 'object') return null;

    // Check if this object itself has token properties
    if (obj.promptTokens || obj.inputTokens || obj.prompt_tokens || obj.input_tokens) {
      const tokens = extractFromUsage(obj, path);
      if (tokens !== null) return tokens;
    }

    // Recursively search nested objects (but limit depth to avoid infinite loops)
    if (path.split('.').length < 4) {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null) {
          const found = searchForTokens(value, `${path}.${key}`);
          if (found !== null) return found;
        }
      }
    }

    return null;
  };

  const foundTokens = searchForTokens(event, 'event');
  if (foundTokens !== null) return foundTokens;

  // Special handling for Requesty models with NaN token values
  if (isRequestyWithInvalidTokens(event)) {
    console.log(`[DEBUG] Detected Requesty model with NaN token values - applying estimation fallback`);

    // Estimate input tokens based on available data
    let estimatedTokens = 0;

    // Try to get text content for estimation
    const textContent = event.text || '';
    const systemInstructionLength = 1673; // Known system instruction length

    if (textContent || event.response?.messages?.length > 0) {
      // Rough estimation: ~4 characters per token for input
      // Include system instruction + user message content
      const totalInputChars = systemInstructionLength + (textContent.length || 0);
      estimatedTokens = Math.round(totalInputChars / 4);

      console.log(`[DEBUG] Requesty fallback estimation: ${estimatedTokens} tokens (based on ${totalInputChars} chars)`);
    } else {
      // Minimum fallback if no content available
      estimatedTokens = Math.round(systemInstructionLength / 4);
      console.log(`[DEBUG] Requesty minimal fallback estimation: ${estimatedTokens} tokens`);
    }

    return estimatedTokens > 0 ? estimatedTokens : 0;
  }

  console.log(`[DEBUG] No input tokens found in event or event.response, returning 0`);
  return 0;
};

export async function POST(req: Request) {
  const requestId = nanoid();

  // Create request-scoped caches for performance optimization
  const { getRemainingCreditsByExternalId: getCachedCreditsByExternal, getRemainingCredits: getCachedCredits, cache: creditCache } = createRequestCreditCache();
  const requestStartTime = Date.now(); // Track when the request started

  // Enhanced timing tracking variables
  let firstTokenTime: number | null = null;
  let streamingStartTime: Date | null = null;
  let timeToFirstTokenMs: number | null = null;
  let tokensPerSecond: number | null = null;

  logRequestBoundary('START', requestId, {
    url: req.url,
    method: req.method,
    startTime: requestStartTime
  });

  const {
    messages,
    chatId,
    selectedModel,
    mcpServers: initialMcpServers = [],
    webSearch = { enabled: false, contextSize: 'medium' },
    apiKeys = {},
    attachments = [],
    // NEW: Add preset parameter support
    temperature,
    maxTokens,
    systemInstruction
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
    // NEW: Add preset parameter types
    temperature?: number;
    maxTokens?: number;
    systemInstruction?: string;
  } = await req.json();

  logDiagnostic('REQUEST_PARSED', `Request body parsed`, {
    requestId,
    messagesCount: messages.length,
    chatId,
    selectedModel,
    attachmentsCount: attachments.length,
    webSearchEnabled: webSearch.enabled,
    hasTemperature: temperature !== undefined,
    hasMaxTokens: maxTokens !== undefined,
    hasSystemInstruction: systemInstruction !== undefined
  });

  // Get model info for validation and defaults
  const selectedModelInfo = await getModelDetails(selectedModel);

  // NEW: Validate preset parameters
  if (temperature !== undefined || maxTokens !== undefined || systemInstruction !== undefined) {
    const validation = validatePresetParameters(selectedModelInfo, temperature, maxTokens, systemInstruction);
    if (!validation.valid) {
      console.error('[Parameter Validation] Invalid preset parameters:', validation.errors);
      return createErrorResponse(
        "INVALID_PARAMETERS",
        `Invalid preset parameters: ${validation.errors.join(', ')}`,
        400,
        validation.errors.join('; ')
      );
    }
    console.log('[Parameter Validation] Preset parameters validated successfully');
  }

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

  // ----------------------------------------------------------------------------
  // Pre-flight model validation - only check for basic model availability
  // (Full free-model-only enforcement moved after credit check)
  // ----------------------------------------------------------------------------
  // Acquire session to determine anonymous status (if not already available later)
  const earlySession = await auth.api.getSession({ headers: req.headers });
  const earlyUserId = earlySession?.user?.id || 'anonymous';
  const earlyIsAnonymous = (earlySession?.user as any)?.isAnonymous === true;

  // Compute own-keys and free-model status for later use
  const earlyIsUsingOwnApiKeys = checkIfUsingOwnApiKeys(selectedModel, apiKeys);
  const earlyIsFreeModel = selectedModel.startsWith('openrouter/') && selectedModel.endsWith(':free');
  const allowAnonOwnKeys = process.env.ALLOW_ANON_OWN_KEYS === 'true';

  // Note: Free models now still require daily limits for users without credits (security fix)

  // Process attachments into message parts
  async function processMessagesWithAttachments(
    messages: UIMessage[],
    attachments: Array<{ name: string; contentType: string; url: string }>,
    modelInfo: ModelInfo | null
  ): Promise<UIMessage[]> {
    console.log('[DEBUG] processMessagesWithAttachments called with:', {
      messagesCount: messages.length,
      attachmentsCount: attachments.length
    });

    if (attachments.length === 0) {
      console.log('[DEBUG] No attachments, returning original messages');
      return messages;
    }

    // Check if model supports vision
    const supportsVision = modelInfo?.vision === true;
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
  const processedMessages = await processMessagesWithAttachments(messages, attachments, selectedModelInfo);

  // Get the authenticated session (including anonymous users)
  logDiagnostic('AUTH_START', `Starting authentication check`, { requestId });
  const session = await auth.api.getSession({ headers: req.headers });

  // If no session exists, return error
  if (!session || !session.user || !session.user.id) {
    logDiagnostic('AUTH_FAILED', `Authentication failed - no session`, { requestId });
    return createErrorResponse(
      "AUTHENTICATION_REQUIRED",
      "Authentication required. Please log in.",
      401
    );
  }
  logDiagnostic('AUTH_SUCCESS', `Authentication successful`, {
    requestId,
    userId: session.user.id,
    isAnonymous: (session.user as any).isAnonymous === true
  });

  const userId = session.user.id;
  const isAnonymous = (session.user as any).isAnonymous === true;

  // Create OpenRouter user identifier for tracking
  const openRouterUserId = isAnonymous
    ? `chatlima_anon_${userId}`
    : `chatlima_user_${userId}`;

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
  logDiagnostic('CREDIT_CHECK_START', `Starting credit check`, {
    requestId,
    userId,
    isAnonymous,
    polarCustomerId,
    isUsingOwnApiKeys,
    isFreeModel,
    estimatedTokens
  });

  // Skip credit checks entirely if user is using their own API keys
  // SECURITY FIX: Do NOT set hasCredits=true for free models - they still need daily limits
  if (isUsingOwnApiKeys) {
    logDiagnostic('CREDIT_CHECK_SKIP', `User is using own API keys, skipping credit checks`, { requestId, userId });
    hasCredits = true; // Allow request to proceed
  } else if (isFreeModel) {
    logDiagnostic('CREDIT_CHECK_SKIP', `User is using a free model, but still checking for actual credits for limit purposes`, {
      requestId,
      userId,
      selectedModel
    });
    // DO NOT set hasCredits = true here - let the actual credit check determine this
  } else {
    try {
      // Reuse the model info we already fetched earlier (line 177) instead of calling getModelDetails again
      const modelInfo = selectedModelInfo;

      // Check credits using both the external ID (userId) and legacy polarCustomerId
      // Pass isAnonymous flag to skip Polar checks for anonymous users
      // Pass model info to check for premium model access
      // Use request-scoped credit cache to avoid redundant API calls
      hasCredits = await hasEnoughCreditsWithCache(polarCustomerId, userId, estimatedTokens, isAnonymous, modelInfo || undefined, creditCache);
      logDiagnostic('CREDIT_CHECK_RESULT', `hasEnoughCredits result`, {
        requestId,
        userId,
        hasCredits
      });

      // Also get the actual credit balance to check for negative balances
      if (!isAnonymous) {
        if (userId) {
          try {
            // Use cached credit data from the hasEnoughCredits call above - no additional API call needed!
            actualCredits = await getCachedCreditsByExternal(userId);
            logDiagnostic('CREDIT_BALANCE', `Actual credits for user (cached)`, {
              requestId,
              userId,
              actualCredits
            });
          } catch (error) {
            logDiagnostic('CREDIT_BALANCE_ERROR', `Error getting actual credits by external ID`, {
              requestId,
              userId,
              error: error instanceof Error ? error.message : String(error)
            });
            // Fall back to legacy method
            if (polarCustomerId) {
              try {
                actualCredits = await getCachedCredits(polarCustomerId);
                logDiagnostic('CREDIT_BALANCE_LEGACY', `Actual credits via legacy method (cached)`, {
                  requestId,
                  userId,
                  actualCredits
                });
              } catch (legacyError) {
                logDiagnostic('CREDIT_BALANCE_LEGACY_ERROR', `Error getting actual credits by legacy method`, {
                  requestId,
                  userId,
                  error: legacyError instanceof Error ? legacyError.message : String(legacyError)
                });
              }
            }
          }
        }
      }
    } catch (error: any) {
      // Log but continue - don't block users if credit check fails
      logDiagnostic('CREDIT_CHECK_ERROR', `Error checking credits`, {
        requestId,
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
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

  // ----------------------------------------------------------------------------
  // Free-model-only enforcement for users without credits
  // This applies to both anonymous users AND Google users without credits
  // ----------------------------------------------------------------------------
  // Use the computed values from earlier (earlyIsFreeModel and earlyIsUsingOwnApiKeys)

  // Block non-free model access for users without credits (anonymous OR Google users without credits)
  if (!isUsingOwnApiKeys && !isFreeModel && !hasCredits && !(allowAnonOwnKeys && isUsingOwnApiKeys)) {
    const userType = isAnonymous ? "Anonymous users" : "Users without credits";
    const actionRequired = isAnonymous ? "Please sign in and purchase credits" : "Please purchase credits";

    console.log(`[SECURITY] ${userType} attempted non-free model: ${selectedModel}`);
    return createErrorResponse(
      'FREE_MODEL_ONLY',
      `${userType} can only use free models. ${actionRequired} to access other models.`,
      403,
      `Free-model-only enforcement for ${isAnonymous ? 'anonymous' : 'non-credit'} user`
    );
  }

  // SECURITY FIX: Block premium model access for users without credits  
  // This prevents anonymous users and users without credits from accessing expensive models
  // NOTE: This check is now redundant with the free-model check above, but kept for clarity
  if (!isUsingOwnApiKeys && !isFreeModel && !hasCredits && selectedModelInfo?.premium) {
    const userType = isAnonymous ? "Anonymous users" : "Users without credits";
    const actionRequired = isAnonymous ? "Please sign in and purchase credits" : "Please purchase credits";

    console.log(`[SECURITY] ${userType} attempted to access premium model: ${selectedModel}`);
    return createErrorResponse(
      "PREMIUM_MODEL_RESTRICTED",
      `${userType} cannot access premium models. ${actionRequired} to use ${selectedModelInfo.name || selectedModel}.`,
      403,
      `Premium model access denied for ${isAnonymous ? 'anonymous' : 'non-credit'} user`
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

  // 3. Check usage limits (for all users, regardless of credits or API keys)
  logDiagnostic('USAGE_LIMITS_CHECK_START', `Starting usage limits check`, {
    requestId,
    userId,
    isAnonymous,
    isUsingOwnApiKeys,
    isFreeModel
  });

  // Skip usage limit checks for users with their own API keys (they pay directly to providers)
  if (!isUsingOwnApiKeys) {
    try {
      // Get current usage statistics
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Use optimized single-query usage check instead of 4+ separate queries
      const usageLimitCheck = await OptimizedUsageLimitsService.getUserUsageAndLimits(userId);

      logDiagnostic('USAGE_LIMITS_CHECK_RESULT', `Usage limits check result`, {
        requestId,
        userId,
        isOverLimit: usageLimitCheck.isOverLimit,
        exceededLimits: usageLimitCheck.exceededLimits,
        limits: {
          dailyTokens: usageLimitCheck.limits.dailyTokenLimit,
          monthlyTokens: usageLimitCheck.limits.monthlyTokenLimit,
          dailyCost: usageLimitCheck.limits.dailyCostLimit,
          monthlyCost: usageLimitCheck.limits.monthlyCostLimit,
        },
        currentUsage: {
          dailyTokens: usageLimitCheck.dailyTokens,
          monthlyTokens: usageLimitCheck.monthlyTokens,
          dailyCost: usageLimitCheck.dailyCost,
          monthlyCost: usageLimitCheck.monthlyCost,
        }
      });

      if (usageLimitCheck.isOverLimit) {
        const exceededLimitMessages = usageLimitCheck.exceededLimits.map(limit => {
          switch (limit) {
            case 'daily_tokens':
              return `Daily token limit (${usageLimitCheck.limits.dailyTokenLimit}) exceeded`;
            case 'monthly_tokens':
              return `Monthly token limit (${usageLimitCheck.limits.monthlyTokenLimit}) exceeded`;
            case 'daily_cost':
              return `Daily cost limit ($${usageLimitCheck.limits.dailyCostLimit}) exceeded`;
            case 'monthly_cost':
              return `Monthly cost limit ($${usageLimitCheck.limits.monthlyCostLimit}) exceeded`;
            default:
              return `Usage limit exceeded`;
          }
        });

        return createErrorResponse(
          "USAGE_LIMIT_EXCEEDED",
          `You have exceeded your usage limits: ${exceededLimitMessages.join(', ')}. Please contact an administrator to increase your limits.`,
          429,
          `User exceeded limits: ${usageLimitCheck.exceededLimits.join(', ')}`
        );
      }
    } catch (error) {
      console.error(`[Usage Limits Check] Error checking usage limits for user ${userId}:`, error);
      // Continue with the request if there's an error checking limits
      logDiagnostic('USAGE_LIMITS_CHECK_ERROR', `Error checking usage limits`, {
        requestId,
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  // 4. SECURITY FIX: Apply daily message limits to users without credits, even on free models
  // Only skip daily message limits for: users with credits OR users with own API keys
  console.log(`[Debug] Credit check: !isAnonymous=${!isAnonymous}, hasCredits=${hasCredits}, actualCredits=${actualCredits}, isUsingOwnApiKeys=${isUsingOwnApiKeys}, isFreeModel=${isFreeModel}`);
  console.log(`[Security] Will skip limit check: ${(!isAnonymous && hasCredits) || isUsingOwnApiKeys} (removed free model bypass)`);

  if ((!isAnonymous && hasCredits) || isUsingOwnApiKeys) {
    console.log(`[Debug] User ${userId} ${isUsingOwnApiKeys ? 'using own API keys' : 'has credits'}, skipping message limit check`);
    // proceed
  } else {
    logDiagnostic('MESSAGE_LIMIT_CHECK', `Checking daily message limits with new secure tracking (including free models)`, { userId, isAnonymous });

    // 5. NEW SECURE IMPLEMENTATION: Check daily message limit using DailyMessageUsageService
    // This cannot be bypassed by deleting messages since it tracks usage independently
    const dailyUsage = await DailyMessageUsageService.getDailyUsage(userId);
    logDiagnostic('MESSAGE_LIMIT_RESULT', `Daily message usage result`, dailyUsage);

    // Log message usage for anonymous users
    if (isAnonymous) {
      console.log(`[Anonymous User ${userId}] Messages used: ${dailyUsage.messageCount}/${dailyUsage.limit}, Remaining: ${dailyUsage.remaining}`);
    }

    if (dailyUsage.hasReachedLimit) {
      return new Response(
        JSON.stringify({
          error: "Message limit reached",
          message: `You've reached your daily limit of ${dailyUsage.limit} messages. ${isAnonymous ? "Sign in with Google to get more messages." : "Purchase credits to continue."}`,
          limit: dailyUsage.limit,
          remaining: dailyUsage.remaining,
          resetTime: "midnight UTC"
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // 6. CRITICAL SECURITY STEP: Increment usage counter BEFORE creating message
    // This prevents retrying the same message multiple times to bypass limits
    try {
      const newUsage = await DailyMessageUsageService.incrementDailyUsage(userId, isAnonymous);
      console.log(`[Security] User ${userId} daily usage incremented to ${newUsage.newCount} on ${newUsage.date}`);
    } catch (error) {
      console.error(`[Security] Failed to increment daily usage for user ${userId}:`, error);
      return new Response(
        JSON.stringify({
          error: "Usage tracking error",
          message: "Unable to track message usage. Please try again.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
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
        isAnonymous,
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
  const currentModelDetails = selectedModelInfo;
  if (secureWebSearch.enabled && selectedModel.startsWith("openrouter/")) {
    if (currentModelDetails?.supportsWebSearch === true) {
      // Model supports web search, use :online variant
      const openrouterModelId = selectedModel.replace("openrouter/", "") + ":online";
      const openrouterClient = createOpenRouterClientWithKey(apiKeys?.['OPENROUTER_API_KEY'], openRouterUserId);
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
      modelInstance = getLanguageModelWithKeys(selectedModel, apiKeys, openRouterUserId);
      console.log(`[Web Search] Requested for ${selectedModel}, but not supported or not enabled for this model. Using standard model.`);
    }
  } else {
    // Web search not enabled in request or model is not an OpenRouter model
    if (secureWebSearch.enabled) {
      console.log(`[Web Search] Requested but ${selectedModel} is not an OpenRouter model or web search support unknown. Disabling web search for this call.`);
    }
    effectiveWebSearchEnabled = false;
    modelInstance = getLanguageModelWithKeys(selectedModel, apiKeys, openRouterUserId);
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

  // Convert to appropriate format for OpenRouter and Requesty models
  const isOpenRouterModel = selectedModel.startsWith("openrouter/");
  const isRequestyModel = selectedModel.startsWith("requesty/");
  const needsFormatConversion = isOpenRouterModel || isRequestyModel;

  const formattedMessages = needsFormatConversion
    ? convertToOpenRouterFormat(modelMessages)
    : modelMessages;
  console.log(`[DEBUG] Using ${needsFormatConversion ? 'converted' : 'raw'} message format for model:`, selectedModel);
  console.log("[DEBUG] Formatted messages for model:", JSON.stringify(formattedMessages, null, 2));

  // NEW: Get default parameters and apply preset overrides
  const modelDefaults = getModelDefaults(selectedModelInfo);
  const effectiveTemperature = temperature !== undefined ? temperature : modelDefaults.temperature;
  const effectiveMaxTokens = maxTokens !== undefined ? maxTokens : modelDefaults.maxTokens;
  const effectiveSystemInstruction = systemInstruction !== undefined
    ? sanitizeSystemInstruction(systemInstruction)
    : `You are a helpful AI assistant. Today's date is ${new Date().toISOString().split('T')[0]}.

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
    `;

  console.log('[DEBUG] Effective parameters:', {
    temperature: effectiveTemperature,
    maxTokens: effectiveMaxTokens,
    systemInstructionLength: effectiveSystemInstruction.length
  });

  // Helper function to recursively remove $schema fields from any object
  // NOTE: We *must not* clone or mutate Zod schemas, because doing so strips
  // internal metadata (e.g. `_def.typeName`) that the downstream AI SDK relies
  // on for tool-calling. Attempting to copy a Zod object by iterating over
  // `Object.entries` turns it into a plain object whose internal `_def` field
  // is non-enumerable, leading to runtime errors such as
  // "Cannot read properties of undefined (reading 'typeName')" when Gemini
  // tries to inspect the schema.  Therefore we detect Zod schemas and leave
  // them untouched while still recursively removing `$schema` keys from plain
  // JSON objects.
  const removeSchemaRecursively = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;

    // Primitive values can be returned as-is.
    if (typeof obj !== 'object') return obj;

    // Leave Zod schemas untouched so we don't lose their prototype / _def.
    if ((obj as any)._def && typeof (obj as any)._def === 'object' && 'typeName' in (obj as any)._def) {
      return obj;
    }

    // Handle arrays – mutate in place.
    if (Array.isArray(obj)) {
      obj.forEach((item, idx) => {
        obj[idx] = removeSchemaRecursively(item);
      });
      return obj;
    }

    // For plain objects, delete `$schema` keys and recurse into others (in place).
    for (const key of Object.keys(obj)) {
      if (key === '$schema') {
        delete obj[key];
        continue;
      }
      obj[key] = removeSchemaRecursively((obj as any)[key]);
    }
    return obj;
  };

  // Helper function to clean tools for Google models (removes all $schema fields)
  const cleanToolsForGoogleModels = (tools: any) => {
    console.log(`[GOOGLE CLEAN] Cleaning ${Object.keys(tools).length} tools for Google models`);
    const cleanedTools = removeSchemaRecursively(tools);
    console.log(`[GOOGLE CLEAN] Cleaned tools, removed $schema fields recursively`);
    return cleanedTools;
  };

  // Determine if we need to clean tools for Google models (Vertex AI, OpenRouter, and Requesty Gemini)
  const isGoogleModel = selectedModel.includes('vertex/google/') ||
    selectedModel.includes('google/gemini') ||
    selectedModel.includes('openrouter/google/') ||
    selectedModel.includes('coding/gemini') ||
    selectedModel.includes('requesty/google/') ||
    (selectedModel.includes('vertex') && selectedModel.includes('google')) ||
    (selectedModel.toLowerCase().includes('gemini'));

  // Apply tool cleaning for Google models (they don't accept $schema fields)
  if (isGoogleModel) {
    console.log(`[GOOGLE MODEL DETECTED] ${selectedModel} - Will clean $schema from tools`);
  }

  const toolsToUse = isGoogleModel && Object.keys(tools).length > 0
    ? cleanToolsForGoogleModels(tools)
    : tools;

  const openRouterPayload = {
    model: modelInstance,
    system: effectiveSystemInstruction,
    temperature: effectiveTemperature,
    maxTokens: effectiveMaxTokens,
    messages: formattedMessages,
    tools: toolsToUse,
    maxSteps: 20,
    user: openRouterUserId, // Add user tracking for OpenRouter logs
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
      openrouter: {
        ...modelOptions,
        user: openRouterUserId, // Also pass user in provider options for OpenRouter
        extraBody: {
          user: openRouterUserId, // Try passing in extraBody as well
        },
      },
      requesty: {
        // Pass tools via extraBody for Requesty models
        // For Google Vertex AI models, use cleaned tools without $schema field
        ...(Object.keys(toolsToUse).length > 0 && {
          extraBody: {
            tools: toolsToUse
          }
        })
      }
    },
    onError: (error: any) => {
      console.error(`[streamText.onError][Chat ${id}] Error during LLM stream:`, JSON.stringify(error, null, 2));
    },
    onChunk: (chunk: any) => {
      // Track time to first token
      if (firstTokenTime === null) {
        firstTokenTime = Date.now();
        timeToFirstTokenMs = firstTokenTime - requestStartTime;

        // Set streaming start time on first chunk
        if (streamingStartTime === null) {
          streamingStartTime = new Date();
        }

        logDiagnostic('FIRST_TOKEN', `First token received`, {
          requestId,
          firstTokenTime,
          timeToFirstTokenMs,
          chunkType: chunk.type
        });
      }

      // Use optimized chunk logging (only logs first few chunks, then summarizes)
      logChunk(id, chunk, firstTokenTime, requestId);
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
          try {
            await saveChat({
              id,
              messages: allMessages,
              userId,
              selectedModel,
              apiKeys,
              isAnonymous,
              // Don't pass title parameter to trigger generation
            });
            console.log(`[Chat ${id}][onStop] Chat saved successfully`);
          } catch (chatSaveError) {
            console.error(`[Chat ${id}][onStop] Error saving chat:`, chatSaveError);
            // Continue with message saving even if chat save fails
          }

          // Save individual messages using the same approach as onFinish
          try {
            const dbMessages = (convertToDBMessages(allMessages as any, id) as any[]).map(msg => ({
              ...msg,
              hasWebSearch: effectiveWebSearchEnabled && msg.role === 'assistant',
              webSearchContextSize: secureWebSearch.enabled ? secureWebSearch.contextSize : undefined
            }));

            await saveMessages({ messages: dbMessages });
            console.log(`[Chat ${id}][onStop] Messages saved successfully`);
          } catch (messagesSaveError) {
            console.error(`[Chat ${id}][onStop] Error saving messages:`, messagesSaveError);
          }
        } else {
          console.warn(`[Chat ${id}][onStop] No text content found to save. Event may not contain expected properties.`);

          // Save at least the user messages if we have them
          if (modelMessages.length > 0) {
            try {
              await saveChat({
                id,
                messages: modelMessages,
                userId,
                selectedModel,
                apiKeys,
                isAnonymous,
              });
              console.log(`[Chat ${id}][onStop] Saved user messages only (no assistant response)`);
            } catch (userMessagesSaveError) {
              console.error(`[Chat ${id}][onStop] Error saving user messages:`, userMessagesSaveError);
            }
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
                // Use cached credit data - no additional API call needed!
                callbackActualCredits = await getCachedCreditsByExternal(userId);
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

            // Process token tracking directly for stopped stream (Vercel-compatible)
            const provider = selectedModel.split('/')[0];
            const stoppedProcessingTimeMs = Date.now() - requestStartTime;

            try {
              await DirectTokenTrackingService.processTokenUsage({
                userId,
                chatId: id,
                // messageId removed - no longer required and was causing foreign key constraint violations
                modelId: selectedModel,
                provider,
                inputTokens: 0, // Not available in onStop callback
                outputTokens: completionTokens,
                providerResponse: null, // No response available for stopped streams
                // Timing parameters (may be partial for stopped streams)
                processingTimeMs: stoppedProcessingTimeMs,
                timeToFirstTokenMs: timeToFirstTokenMs ?? undefined,
                tokensPerSecond: tokensPerSecond ?? undefined,
                streamingStartTime: streamingStartTime ?? undefined,
                // Credit tracking parameters
                polarCustomerId,
                completionTokens,
                isAnonymous,
                shouldDeductCredits,
                additionalCost
              });
            } catch (trackingError) {
              console.error(`[Chat ${id}][onStop] Failed to process direct token tracking for stopped stream:`, trackingError);
              // Don't fail the response if token tracking fails
            }

            const actualCreditsReported = shouldDeductCredits ? 1 + additionalCost : 0;
            const trackingReason = isAnonymous ? 'Queued (stopped)' : shouldDeductCredits ? 'Queued for Polar (stopped)' : isFreeModel ? 'Queued (free model, stopped)' : 'Queued (daily limit, stopped)';
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
      console.log(`[Chat ${id}][onFinish] Stream finished, processing and saving...`);

      // Track whether messages are saved successfully for background cost tracking
      let messagesSavedSuccessfully = false;

      // Declare finalAssistantMessageId at function scope to ensure it's accessible throughout
      let finalAssistantMessageId: string = nanoid(); // Default value in case it's not assigned later

      const provider = selectedModel.split('/')[0];
      console.log(`[Chat ${id}][onFinish] Event data for provider ${provider}:`, {
        eventKeys: Object.keys(event),
        hasResponse: !!event.response,
        hasUsage: !!event.usage,
        hasDuration: !!event.durationMs,
        hasTimestamp: !!event.timestamp,
        firstTokenTime,
        timeToFirstTokenMs,
        streamingStartTime,
        requestStartTime,
        provider: provider,
        // Debug: show where usage data might be
        eventUsage: event.usage,
        responseUsage: event.response?.usage,
        eventUsageKeys: event.usage ? Object.keys(event.usage) : [],
        responseUsageKeys: event.response?.usage ? Object.keys(event.response.usage) : [],
        // Deep dive into usage data quality
        eventUsageDetailedDebug: event.usage ? {
          promptTokens: { value: event.usage.promptTokens, type: typeof event.usage.promptTokens, isNaN: isNaN(event.usage.promptTokens) },
          completionTokens: { value: event.usage.completionTokens, type: typeof event.usage.completionTokens, isNaN: isNaN(event.usage.completionTokens) },
          totalTokens: { value: event.usage.totalTokens, type: typeof event.usage.totalTokens, isNaN: isNaN(event.usage.totalTokens) }
        } : null,
        // Check if usage data is in steps (seen in Requesty responses)
        stepsDebug: event.steps ? {
          stepsCount: event.steps.length,
          stepsKeys: event.steps.map((step: any, i: number) => ({ index: i, keys: Object.keys(step) })),
          stepsUsage: event.steps.map((step: any, i: number) => ({
            index: i,
            hasUsage: !!step.usage,
            usage: step.usage
          }))
        } : null
      });

      // Force timing data for testing
      if (timeToFirstTokenMs === null) {
        timeToFirstTokenMs = 500; // Force a test value
        console.log(`[Chat ${id}][onFinish] Forced timeToFirstTokenMs to 500ms for testing`);
      }

      // Minimal fix: cast event.response to OpenRouterResponse
      const response = event.response as OpenRouterResponse;

      try {
        // Validate response structure
        if (!response || !response.messages) {
          console.error(`[Chat ${id}][onFinish] Invalid response structure:`, response);
          return;
        }

        console.log(`[Chat ${id}][onFinish] Response has annotations:`, !!response.annotations);
        if (response.annotations) {
          console.log(`[Chat ${id}][onFinish] Annotation count:`, response.annotations.length);
          console.log(`[Chat ${id}][onFinish] Annotation types:`, response.annotations.map(a => a.type));
        }

        const allMessages = appendResponseMessages({
          messages: modelMessages,
          responseMessages: response.messages as any, // Cast to any to bypass type error
        });

        // Extract citations from response messages
        const processedMessages = allMessages.map(msg => {
          if (msg.role === 'assistant' && (response.annotations?.length)) {
            console.log(`[Chat ${id}] Found ${response.annotations.length} annotations:`, response.annotations);

            const citations = response.annotations
              .filter((a: Annotation) => a.type === 'url_citation')
              .map((c: Annotation) => ({
                url: c.url_citation.url,
                title: c.url_citation.title,
                content: c.url_citation.content,
                startIndex: c.url_citation.start_index,
                endIndex: c.url_citation.end_index
              }));

            console.log(`[Chat ${id}] Processed citations:`, citations);

            // Add citations to message parts if they exist
            if (citations.length > 0 && msg.parts) {
              console.log(`[Chat ${id}] Adding citations to ${msg.parts.length} message parts`);
              msg.parts = (msg.parts as any[]).map(part => {
                if (part.type === 'text') {
                  return {
                    ...part,
                    citations
                  };
                }
                return part;
              });
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
            isAnonymous,
          });
          console.log(`[Chat ${id}][onFinish] Successfully saved chat with all messages.`);
        } catch (dbError: any) {
          console.error(`[Chat ${id}][onFinish] DATABASE_ERROR saving chat:`, dbError);
          // This error occurs after the stream has finished.
          // We can't change the HTTP response to the client here.
          // Robust logging is key.
        }

        let dbMessages;
        let assistantMessageId: string | undefined;

        try {
          dbMessages = (convertToDBMessages(processedMessages as any, id) as any[]).map(msg => ({
            ...msg,
            hasWebSearch: effectiveWebSearchEnabled && msg.role === 'assistant' && (response.annotations?.length || 0) > 0, // Only set true if web search was actually used
            webSearchContextSize: secureWebSearch.enabled ? secureWebSearch.contextSize : undefined // Store original request if needed, or effective
          }));

          // Extract the assistant message ID from the converted messages to ensure consistency
          const assistantMessage = dbMessages.find(msg => msg.role === 'assistant');
          assistantMessageId = assistantMessage?.id;

        } catch (conversionError: any) {
          console.error(`[Chat ${id}][onFinish] ERROR converting messages for DB:`, conversionError);
          // If conversion fails, we cannot save messages.
          // Log and potentially skip saving messages or save raw if possible.
          return; // Exit onFinish early if messages can't be processed for DB.
        }

        // Step 1: Save messages to database (independent)
        try {
          await saveMessages({ messages: dbMessages });
          console.log(`[Chat ${id}][onFinish] Successfully saved individual messages.`);
          messagesSavedSuccessfully = true;
        } catch (dbMessagesError: any) {
          console.error(`[Chat ${id}][onFinish] DATABASE_ERROR saving messages:`, dbMessagesError);
          // Continue to analytics logging even if message saving fails
        }

        // Step 2: Track detailed token usage metrics (INDEPENDENT of database operations)
        const typedResponse = response as any;
        const provider = selectedModel.split('/')[0];
        finalAssistantMessageId = assistantMessageId || response.messages?.[response.messages.length - 1]?.id || nanoid();

        try {
          logDiagnostic('TOKEN_TRACKING_START', `Starting detailed token tracking`, {
            requestId,
            userId,
            chatId: id,
            messageId: finalAssistantMessageId,
            modelId: selectedModel,
            provider,
            tokenUsage: typedResponse.usage || {
              inputTokens: 0,
              outputTokens: 0,
              totalTokens: 0
            }
          });

          // Debug: Log the actual response structure to understand the format
          const lastMessage = typedResponse.messages?.[typedResponse.messages.length - 1];
          const lastMessageContent = lastMessage?.content;
          let contentPreview = '';

          if (typeof lastMessageContent === 'string') {
            contentPreview = lastMessageContent.substring(0, 100);
          } else if (Array.isArray(lastMessageContent)) {
            // Handle structured content (Google models)
            const textParts = lastMessageContent
              .filter((part: any) => part.type === 'text')
              .map((part: any) => part.text)
              .join(' ');
            contentPreview = textParts.substring(0, 100);
          } else if (lastMessageContent) {
            contentPreview = JSON.stringify(lastMessageContent).substring(0, 100);
          }

          // Extract generation ID for OpenRouter cost tracking
          const generationId = provider === 'openrouter' ?
            (typedResponse.id || typedResponse.generation_id || typedResponse.generationId) : null;

          console.log(`[Chat ${id}][onFinish] ${provider.toUpperCase()} response structure:`, {
            hasUsage: !!typedResponse.usage,
            usageKeys: typedResponse.usage ? Object.keys(typedResponse.usage) : [],
            usageValue: typedResponse.usage,
            hasMessages: !!typedResponse.messages,
            messageCount: typedResponse.messages?.length || 0,
            lastMessageContent: contentPreview,
            generationId: generationId,
            hasGenerationId: !!generationId,
            provider: provider // Add provider info for clarity
          });

          // Extract token usage with better fallback logic
          // Check event.usage first (AI SDK location), then fallback to response.usage
          let tokenUsageData = event.usage || typedResponse.usage;

          // Enhanced logging to debug provider response
          console.log(`[Chat ${id}][onFinish] Raw ${provider.toUpperCase()} usage data:`, {
            hasEventUsage: !!event.usage,
            hasResponseUsage: !!typedResponse.usage,
            eventUsageKeys: event.usage ? Object.keys(event.usage) : [],
            responseUsageKeys: typedResponse.usage ? Object.keys(typedResponse.usage) : [],
            finalUsageSource: event.usage ? 'event.usage' : (typedResponse.usage ? 'response.usage' : 'none'),
            usageValue: tokenUsageData,
            inputTokens: tokenUsageData?.inputTokens,
            outputTokens: tokenUsageData?.outputTokens,
            promptTokens: tokenUsageData?.promptTokens,
            prompt_tokens: tokenUsageData?.prompt_tokens,
            completionTokens: tokenUsageData?.completionTokens,
            completion_tokens: tokenUsageData?.completion_tokens,
            total_tokens: tokenUsageData?.total_tokens,
            usageObject: tokenUsageData
          });

          // If no usage data or missing input tokens, try to estimate from message content
          // OpenRouter may use different field names (prompt_tokens, completion_tokens)
          const inputTokenCount = tokenUsageData?.inputTokens || tokenUsageData?.prompt_tokens || 0;
          const outputTokenCount = tokenUsageData?.outputTokens || tokenUsageData?.completion_tokens || 0;

          console.log(`[Chat ${id}][onFinish] Parsed token counts:`, {
            inputTokenCount,
            outputTokenCount,
            needsInputEstimation: inputTokenCount === 0,
            needsOutputEstimation: outputTokenCount === 0
          });

          const needsInputEstimation = !tokenUsageData ||
            inputTokenCount === 0 ||
            inputTokenCount === undefined;

          const needsOutputEstimation = !tokenUsageData ||
            outputTokenCount === 0 ||
            outputTokenCount === undefined;

          if (needsInputEstimation || needsOutputEstimation) {
            const lastMessage = typedResponse.messages?.[typedResponse.messages.length - 1];

            let outputContentLength = 0;
            let inputContentLength = 0;

            // Calculate output tokens from the AI response
            if (needsOutputEstimation && lastMessage?.content) {
              // Handle structured content (Google models)
              if (Array.isArray(lastMessage.content)) {
                outputContentLength = lastMessage.content
                  .filter((part: any) => part.type === 'text')
                  .map((part: any) => part.text)
                  .join('').length;
              } else if (typeof lastMessage.content === 'string') {
                outputContentLength = lastMessage.content.length;
              }
            }

            // Calculate input tokens from the ENTIRE conversation context sent to the AI
            if (needsInputEstimation && modelMessages) {
              console.log(`[Chat ${id}][onFinish] Estimating input tokens from full conversation context (${modelMessages.length} messages)`);

              let totalInputContentLength = 0;

              // Count all messages that were sent to the AI model
              modelMessages.forEach((message, index) => {
                let messageContentLength = 0;

                if (message.content) {
                  if (Array.isArray(message.content)) {
                    // Handle structured content (parts array)
                    messageContentLength = message.content
                      .filter((part: any) => part.type === 'text')
                      .map((part: any) => part.text || '')
                      .join('').length;
                  } else if (typeof message.content === 'string') {
                    messageContentLength = message.content.length;
                  }
                }

                // Add to total input length
                totalInputContentLength += messageContentLength;

                console.log(`[Chat ${id}][onFinish] Message ${index + 1} (${message.role}): ${messageContentLength} chars`);
              });

              inputContentLength = totalInputContentLength;
              console.log(`[Chat ${id}][onFinish] Total input content length: ${inputContentLength} chars (${modelMessages.length} messages)`);
            }

            // Add system instruction length if present
            if (needsInputEstimation && effectiveSystemInstruction) {
              const systemLength = effectiveSystemInstruction.length;
              inputContentLength += systemLength;
              console.log(`[Chat ${id}][onFinish] Added system instruction: ${systemLength} chars`);
            }

            const estimatedOutputTokens = Math.ceil(outputContentLength / 4);
            const estimatedInputTokens = Math.ceil(inputContentLength / 4);

            // Use existing token data if available, otherwise use estimates
            const finalInputTokens = needsInputEstimation ? estimatedInputTokens : inputTokenCount;
            const finalOutputTokens = needsOutputEstimation ? estimatedOutputTokens : outputTokenCount;

            tokenUsageData = {
              inputTokens: finalInputTokens,
              outputTokens: finalOutputTokens,
              totalTokens: finalInputTokens + finalOutputTokens
            };

            console.log(`[Chat ${id}][onFinish] Final token usage (estimated + OpenRouter):`, {
              originalInput: typedResponse.usage?.inputTokens,
              originalOutput: typedResponse.usage?.outputTokens,
              estimatedInput: estimatedInputTokens,
              estimatedOutput: estimatedOutputTokens,
              finalInput: finalInputTokens,
              finalOutput: finalOutputTokens,
              finalTotal: finalInputTokens + finalOutputTokens,
              conversationLength: modelMessages ? modelMessages.length : 0,
              totalInputChars: inputContentLength,
              systemInstructionChars: effectiveSystemInstruction ? effectiveSystemInstruction.length : 0
            });
          }

          // Calculate processing time ourselves since AI SDK might not provide it
          const requestEndTime = Date.now();
          const calculatedProcessingTimeMs = requestEndTime - requestStartTime;

          // Calculate tokens per second if we have timing data
          const finalOutputTokens = tokenUsageData?.outputTokens || 0;

          // If we don't have timeToFirstTokenMs from onChunk, try to estimate it
          console.log(`[DEBUG][Chat ${id}] Event duration check:`, {
            hasEvent: !!event,
            eventKeys: event ? Object.keys(event) : [],
            durationMs: event?.durationMs,
            timeToFirstTokenMs
          });

          if (timeToFirstTokenMs === null) {
            // Try to estimate time to first token
            if (event?.durationMs) {
              // Estimate time to first token as 20% of total duration (typical for streaming)
              timeToFirstTokenMs = Math.round(event.durationMs * 0.2);
              logDiagnostic('ESTIMATED_TIMING', `Estimated time to first token from event.durationMs`, {
                requestId,
                estimatedTimeToFirstTokenMs: timeToFirstTokenMs,
                totalDurationMs: event.durationMs
              });
            } else {
              // Fallback: estimate based on calculated processing time
              timeToFirstTokenMs = Math.round(calculatedProcessingTimeMs * 0.2);
              logDiagnostic('ESTIMATED_TIMING', `Estimated time to first token from calculated processing time`, {
                requestId,
                estimatedTimeToFirstTokenMs: timeToFirstTokenMs,
                calculatedProcessingTimeMs
              });
            }
          }

          if (timeToFirstTokenMs !== null && finalOutputTokens > 0 && calculatedProcessingTimeMs > 0) {
            const generationTimeMs = calculatedProcessingTimeMs - timeToFirstTokenMs;
            if (generationTimeMs > 0) {
              tokensPerSecond = (finalOutputTokens / (generationTimeMs / 1000));
            }
          }

          logDiagnostic('ENHANCED_TIMING', `Enhanced timing metrics calculated`, {
            requestId,
            timeToFirstTokenMs,
            tokensPerSecond,
            streamingStartTime: streamingStartTime?.toISOString(),
            finalOutputTokens,
            calculatedProcessingTimeMs
          });

          console.log(`[DEBUG][Chat ${id}] About to call TokenTrackingService with timing data:`, {
            timeToFirstTokenMs,
            tokensPerSecond,
            streamingStartTime,
            calculatedProcessingTimeMs
          });

          // Queue detailed cost calculation for background processing
          // This prevents blocking the response while still capturing all cost data
          const extractedTokenUsage = tokenUsageData || { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
          const inputTokens = extractedTokenUsage.inputTokens || extractedTokenUsage.prompt_tokens || 0;
          const outputTokens = extractedTokenUsage.outputTokens || extractedTokenUsage.completion_tokens || 0;

          // Note: Background cost tracking will be queued later with complete credit tracking parameters

          // Note: Credit tracking will be handled later with the legacy token tracking variables
        } catch (error: any) {
          logDiagnostic('TOKEN_TRACKING_ERROR', `Failed to track detailed token usage (independent)`, {
            requestId,
            userId,
            error: error instanceof Error ? error.message : String(error)
          });
          console.error(`[Chat ${id}][onFinish] Failed to track detailed token usage for user ${userId}:`, error);
          // Don't break the response flow if detailed tracking fails
        }
      } catch (finishError: any) {
        console.error(`[Chat ${id}][onFinish] Unexpected error in onFinish:`, finishError);
      }

      // Extract token usage from response - OpenRouter may provide it in different formats
      const typedResponse = response as any;
      let completionTokens = 0;

      // Try to extract tokens from different possible response structures
      if (typedResponse.usage?.completion_tokens) {
        completionTokens = typedResponse.usage.completion_tokens;
      } else if (typedResponse.usage?.output_tokens) {
        completionTokens = typedResponse.usage.output_tokens;
      } else {
        // Estimate based on last message content length if available
        const lastMessage = typedResponse.messages?.[typedResponse.messages.length - 1];
        if (lastMessage?.content) {
          let contentLength = 0;

          // Handle structured content (Google models)
          if (Array.isArray(lastMessage.content)) {
            contentLength = lastMessage.content
              .filter((part: any) => part.type === 'text')
              .map((part: any) => part.text)
              .join('').length;
          } else if (typeof lastMessage.content === 'string') {
            contentLength = lastMessage.content.length;
          }

          // Rough estimate: 1 token ≈ 4 characters
          completionTokens = Math.ceil(contentLength / 4);
        } else if (typeof typedResponse.content === 'string') {
          completionTokens = Math.ceil(typedResponse.content.length / 4);
        } else {
          // Default minimum to track something
          completionTokens = 1;
        }
      }

      // Existing code for tracking tokens (legacy credit system)
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

      // Track token usage for legacy credit system
      if (completionTokens > 0) {
        try {
          logDiagnostic('LEGACY_TOKEN_TRACKING_START', `Starting legacy token tracking`, {
            requestId,
            userId,
            completionTokens
          });

          // Get isAnonymous status from session if available
          let isAnonymous = false;
          try {
            isAnonymous = (session?.user as any)?.isAnonymous === true;
          } catch (error) {
            logDiagnostic('LEGACY_TOKEN_TRACKING_WARNING', `Could not determine if user is anonymous, assuming not anonymous`, {
              requestId,
              userId,
              error: error instanceof Error ? error.message : String(error)
            });
          }

          // Recalculate isUsingOwnApiKeys in callback scope since it's not accessible here
          const callbackIsUsingOwnApiKeys = checkIfUsingOwnApiKeys(selectedModel, apiKeys);

          // Get actual credits in callback scope
          let callbackActualCredits: number | null = null;
          if (!isAnonymous && userId) {
            try {
              // Use cached credit data - no additional API call needed!
              callbackActualCredits = await getCachedCreditsByExternal(userId);
            } catch (error) {
              logDiagnostic('LEGACY_TOKEN_TRACKING_WARNING', `Error getting actual credits in onFinish callback`, {
                requestId,
                userId,
                error: error instanceof Error ? error.message : String(error)
              });
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

          const actualCreditsReported = shouldDeductCredits ? 1 + additionalCost : 0;
          const trackingReason = isAnonymous ? 'Queued (stopped)' : shouldDeductCredits ? 'Queued for Polar' : isFreeModel ? 'Queued (free model)' : 'Queued (daily limit)';

          // Process token usage tracking directly (Vercel-compatible)
          if (messagesSavedSuccessfully) {
            try {
              const finalProcessingTimeMs = Date.now() - requestStartTime;

              // Opportunistic reconciliation of a few recent rows missing actual_cost (best-effort, short and non-blocking)
              // Intentionally not awaited to avoid delaying the response
              import('@/lib/services/costReconciliation').then(async ({ CostReconciliationService }) => {
                try {
                  const openrouterApiKey = apiKeys?.['OPENROUTER_API_KEY'] || process.env.OPENROUTER_API_KEY;
                  await CostReconciliationService.reconcileRecentMissingActualCosts({ limit: 3, maxAgeHours: 48, apiKeyOverride: openrouterApiKey });
                } catch (e) {
                  // Swallow errors silently
                }
              });

              // Use direct processing instead of background queue for Vercel compatibility
              const openrouterApiKey = apiKeys?.['OPENROUTER_API_KEY'] || process.env.OPENROUTER_API_KEY;
              // Enhanced debugging for token extraction
              console.log(`[Chat ${id}][onFinish] About to extract input tokens from event for ${selectedModel.split('/')[0]}`);
              const extractedInputTokens = extractInputTokensFromEvent(event);
              console.log(`[Chat ${id}][onFinish] Token extraction result: ${extractedInputTokens} input tokens`);

              await DirectTokenTrackingService.processTokenUsage({
                userId,
                chatId: id,
                ...(finalAssistantMessageId && { messageId: finalAssistantMessageId }), // Only pass if we have a valid message ID
                modelId: selectedModel,
                provider: selectedModel.split('/')[0],
                inputTokens: extractedInputTokens,
                outputTokens: completionTokens,
                generationId: typedResponse.id || typedResponse.generation_id || typedResponse.generationId || undefined,
                openRouterResponse: typedResponse, // Keep for backward compatibility
                providerResponse: typedResponse, // New unified response parameter for all providers
                apiKeyOverride: openrouterApiKey,
                // Timing parameters
                processingTimeMs: finalProcessingTimeMs,
                timeToFirstTokenMs: timeToFirstTokenMs ?? undefined,
                tokensPerSecond: tokensPerSecond ?? undefined,
                streamingStartTime: streamingStartTime ?? undefined,
                // Credit tracking parameters
                polarCustomerId,
                completionTokens,
                isAnonymous,
                shouldDeductCredits,
                additionalCost
              });

              logDiagnostic('DIRECT_TOKEN_TRACKING_COMPLETED', `Completed direct token usage tracking with credit parameters`, {
                requestId,
                userId,
                completionTokens,
                actualCreditsReported,
                trackingReason,
                shouldDeductCredits,
                additionalCost
              });
            } catch (creditTrackingError: any) {
              console.error(`[Chat ${id}][onFinish] Failed to process direct token tracking with credit parameters:`, creditTrackingError);
              // Don't fail the response if token tracking fails
            }
          } else {
            console.log(`[Chat ${id}][onFinish] Skipping background cost tracking due to message save failure`);
          }

          console.log(`${trackingReason} ${actualCreditsReported} credits for user ${userId} [Chat ${id}]`);
        } catch (error: any) {
          logDiagnostic('LEGACY_TOKEN_TRACKING_ERROR', `Failed to track legacy token usage`, {
            requestId,
            userId,
            error: error instanceof Error ? error.message : String(error)
          });
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
    console.log(`[Chat ${id}] OpenRouter user tracking: ${openRouterUserId}`);

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
                return JSON.stringify({ error: { code: "PROVIDER_ERROR", message: "The AI provider is temporarily experiencing issues. Please try again in a moment.", details: "Provider internal server error" } });
              }
              return JSON.stringify({ error: { code: "PROVIDER_ERROR", message: `API Error: ${errorValue.message}`, details: "Provider validation error" } });
            }
            if (errorValue.code) {
              return JSON.stringify({ error: { code: "PROVIDER_ERROR", message: `API Error (Code ${errorValue.code}): The AI provider returned an error response.`, details: "Provider error code" } });
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
                        return JSON.stringify({ error: { code: "PROVIDER_UNAVAILABLE", message: "The AI provider is temporarily unavailable. Please try again in a moment.", details: "Provider response format error" } });
                      }
                      if (innerIssue.path && innerIssue.path.includes('error')) {
                        return JSON.stringify({ error: { code: "PROVIDER_ERROR", message: "The AI provider returned an unexpected error format. Please try again.", details: "Provider error format issue" } });
                      }
                    }
                  }
                }
              }
            }
          }

          return JSON.stringify({ error: { code: "PROVIDER_ERROR", message: "The AI provider returned an unexpected response format. Please try again.", details: "Type validation error" } });
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

                // Try to extract more detailed error message from metadata.raw
                if (parsedBody.error.metadata.raw) {
                  // Check if metadata.raw is already a string (most common case)
                  if (typeof parsedBody.error.metadata.raw === 'string') {
                    errorMessage = parsedBody.error.metadata.raw;
                  } else {
                    // Try to parse as JSON if it's not a string
                    try {
                      const rawError = JSON.parse(parsedBody.error.metadata.raw);
                      if (rawError.detail && typeof rawError.detail === 'string') {
                        // Use the detailed error message instead of the generic one
                        errorMessage = rawError.detail;
                      } else if (rawError.message && typeof rawError.message === 'string') {
                        errorMessage = rawError.message;
                      }
                    } catch (rawParseError) {
                      console.warn(`[API Error][Chat ${id}] Failed to parse metadata.raw:`, rawParseError);
                    }
                  }
                }
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
        const hasSpecificMessage = errorMessage !== "An error occurred while processing your request.";

        if (checkMessage) {
          if (checkMessage.includes("Rate limit") || checkMessage.includes("429") || errorCode === "429") {
            errorCode = "RATE_LIMIT_EXCEEDED";
            // Only use generic message if we don't have a specific one from metadata.raw
            if (!hasSpecificMessage) {
              errorMessage = "Rate limit exceeded with the AI provider. Please try again later.";
            }
          } else if (checkMessage.includes("authentication") || checkMessage.includes("401") || errorCode === "401") {
            errorCode = "AUTHENTICATION_ERROR";
            if (!hasSpecificMessage) {
              errorMessage = "Authentication failed with the AI provider.";
            }
          } else if (checkMessage.includes("insufficient_quota") || checkMessage.includes("credit")) {
            errorCode = "INSUFFICIENT_QUOTA";
            if (!hasSpecificMessage) {
              errorMessage = "Insufficient quota or credits with the AI provider.";
            }
          } else if (checkMessage.includes("timeout") || checkMessage.includes("TIMEOUT")) {
            errorCode = "TIMEOUT_ERROR";
            if (!hasSpecificMessage) {
              errorMessage = "Request timed out. Please try again.";
            }
          } else if (checkMessage.includes("network") || checkMessage.includes("NETWORK")) {
            errorCode = "NETWORK_ERROR";
            if (!hasSpecificMessage) {
              errorMessage = "Network error occurred. Please check your connection and try again.";
            }
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

        // Always return a properly formatted JSON error response
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
        isAnonymous,
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

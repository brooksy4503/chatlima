import { streamText, generateText, tool, jsonSchema, type UIMessage, type LanguageModelResponseMetadata, type Message } from "ai";
import { saveChat, saveMessages, convertToDBMessages } from '@/lib/chat-store';
import { nanoid } from 'nanoid';
import { db } from '@/lib/db';
import { chats, messages as messagesTable } from '@/lib/db/schema';
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
import { model, type modelID, getLanguageModelWithKeys, createOpenRouterClientWithKey } from "@/ai/providers";
import { getModelDetails } from "@/lib/models/fetch-models";
import { type ModelInfo } from "@/lib/types/models";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { getApiKey } from "@/ai/providers";
import { validatePresetParameters, getModelDefaults, sanitizeSystemInstruction } from "@/lib/parameter-validation";

// Import our new services
import { ChatAuthenticationService, type AuthenticatedUser } from '@/lib/services/chatAuthenticationService';
import {
    ChatCreditValidationService,
    type CreditValidationContext,
    type CreditValidationResult,
    CreditValidationError,
    InsufficientCreditsError,
    FeatureRestrictedError,
    FreeModelOnlyError,
    PremiumModelRestrictedError
} from '@/lib/services/chatCreditValidationService';
import { ChatMessageProcessingService, type MessageProcessingContext } from '@/lib/services/chatMessageProcessingService';
import { ChatModelValidationService, type ModelValidationContext, type ModelValidationResult } from '@/lib/services/chatModelValidationService';
import { ChatMCPServerService, type MCPServerContext, type MCPServerResult } from '@/lib/services/chatMCPServerService';
import { ChatWebSearchService, type WebSearchContext, type WebSearchResult } from '@/lib/services/chatWebSearchService';
import { ChatTokenTrackingService, type TokenTrackingContext, type TokenTrackingResult } from '@/lib/services/chatTokenTrackingService';
import { ChatDatabaseService, type ChatCreationContext, type MessageSavingContext } from '@/lib/services/chatDatabaseService';

// Use optimized logging - only logs in development and uses efficient patterns
const logDiagnostic = originalLogDiagnostic;

// Allow streaming responses up to 300 seconds on Hobby plan
export const maxDuration = 300;

// Helper function to check if user is using their own API keys for the selected model
function checkIfUsingOwnApiKeys(selectedModel: string, apiKeys: Record<string, string> = {}): boolean {
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
    useOAuth?: boolean;
    id?: string;
    oauthTokens?: {
        access_token: string;
        refresh_token?: string;
        expires_in?: number;
        token_type?: string;
    };
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
export const createErrorResponse = (
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

    const isValidToken = (value: any): boolean => {
        return typeof value === 'number' && !isNaN(value) && value > 0;
    };

    const isRequestyWithInvalidTokens = (event: any): boolean => {
        if (!event) return false;

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

    let tokens = extractFromUsage(event.usage, 'event.usage');
    if (tokens !== null) return tokens;

    tokens = extractFromUsage(event.response?.usage, 'event.response.usage');
    if (tokens !== null) return tokens;

    if (isValidToken(event.promptTokens)) {
        console.log(`[DEBUG] Found input tokens in event.promptTokens: ${event.promptTokens}`);
        return event.promptTokens;
    }
    if (isValidToken(event.inputTokens)) {
        console.log(`[DEBUG] Found input tokens in event.inputTokens: ${event.inputTokens}`);
        return event.inputTokens;
    }

    if (isValidToken(event.response?.promptTokens)) {
        console.log(`[DEBUG] Found input tokens in event.response.promptTokens: ${event.response.promptTokens}`);
        return event.response.promptTokens;
    }
    if (isValidToken(event.response?.inputTokens)) {
        console.log(`[DEBUG] Found input tokens in event.response.inputTokens: ${event.response.inputTokens}`);
        return event.response.inputTokens;
    }

    if (event.response && typeof event.response === 'object') {
        console.log(`[DEBUG] Checking event.response for nested token data:`, {
            responseKeys: Object.keys(event.response),
            hasUsage: !!event.response.usage,
            hasResult: !!event.response.result,
            hasData: !!event.response.data,
            hasMetadata: !!event.response.metadata
        });

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

    if (event.steps && Array.isArray(event.steps)) {
        console.log(`[DEBUG] Checking event.steps for token data:`, {
            stepsCount: event.steps.length,
            firstStepKeys: event.steps[0] ? Object.keys(event.steps[0]) : []
        });

        // Aggregate tokens from all steps (important for tool calls)
        let totalStepInputTokens = 0;
        let totalStepOutputTokens = 0;
        let hasStepTokens = false;

        for (let i = 0; i < event.steps.length; i++) {
            const step = event.steps[i];
            if (step && step.usage) {
                const stepUsage = step.usage as any;
                const stepInputTokens = stepUsage.promptTokens || stepUsage.inputTokens || stepUsage.prompt_tokens || stepUsage.input_tokens || 0;
                const stepOutputTokens = stepUsage.completionTokens || stepUsage.outputTokens || stepUsage.completion_tokens || stepUsage.output_tokens || 0;

                if (stepInputTokens > 0 || stepOutputTokens > 0) {
                    totalStepInputTokens += stepInputTokens;
                    totalStepOutputTokens += stepOutputTokens;
                    hasStepTokens = true;
                    console.log(`[DEBUG] Step ${i} tokens: input=${stepInputTokens}, output=${stepOutputTokens}`);
                }
            }
        }

        if (hasStepTokens) {
            console.log(`[DEBUG] Aggregated step tokens: input=${totalStepInputTokens}, output=${totalStepOutputTokens}`);
            // Return the total from all steps if we found any tokens
            if (totalStepInputTokens > 0) return totalStepInputTokens;
            // If no input tokens but output tokens exist, we still have valid data
            if (totalStepOutputTokens > 0) return 0; // Return 0 for input, but indicate we found tokens
        }
    }

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

    console.log(`[DEBUG] Searching entire event object for token data as last resort`);
    const searchForTokens = (obj: any, path: string): number | null => {
        if (!obj || typeof obj !== 'object') return null;

        if (obj.promptTokens || obj.inputTokens || obj.prompt_tokens || obj.input_tokens) {
            const tokens = extractFromUsage(obj, path);
            if (tokens !== null) return tokens;
        }

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

    if (isRequestyWithInvalidTokens(event)) {
        console.log(`[DEBUG] Detected Requesty model with NaN token values - applying estimation fallback`);

        let estimatedTokens = 0;

        const textContent = event.text || '';
        const systemInstructionLength = 1673;

        if (textContent || event.response?.messages?.length > 0) {
            const totalInputChars = systemInstructionLength + (textContent.length || 0);
            estimatedTokens = Math.round(totalInputChars / 4);

            console.log(`[DEBUG] Requesty fallback estimation: ${estimatedTokens} tokens (based on ${totalInputChars} chars)`);
        } else {
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
    const requestStartTime = Date.now();

    // Create request-scoped caches for performance optimization
    const { getRemainingCreditsByExternalId: getCachedCreditsByExternal, getRemainingCredits: getCachedCredits, cache: creditCache } = createRequestCreditCache();

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

    try {
        // Parse request body
        const {
            messages,
            chatId,
            selectedModel,
            mcpServers: initialMcpServers = [],
            webSearch = { enabled: false, contextSize: 'medium' },
            apiKeys = {},
            attachments = [],
            temperature,
            maxTokens,
            systemInstruction
        }: {
            messages: UIMessage[];
            chatId?: string;
            selectedModel: string;
            mcpServers?: MCPServerConfig[];
            webSearch?: WebSearchOptions;
            apiKeys?: Record<string, string>;
            attachments?: Array<{
                name: string;
                contentType: string;
                url: string;
            }>;
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

        // 1. Authenticate user
        const authenticatedUser = await ChatAuthenticationService.authenticateUser(req);

        // 2. Validate model and get configuration
        const modelValidation = await ChatModelValidationService.validateAndConfigureModel({
            selectedModel,
            temperature,
            maxTokens,
            systemInstruction
        });

        // 3. Process messages with attachments
        const processedMessages = await ChatMessageProcessingService.processMessagesWithAttachments({
            messages,
            attachments,
            modelInfo: modelValidation.modelInfo
        });

        // 4. Add model-specific instructions
        const modelMessages = ChatMessageProcessingService.addModelSpecificInstructions(
            processedMessages.messages,
            selectedModel
        );

        // 5. Validate credits and permissions
        const creditValidation = await ChatCreditValidationService.validateCredits({
            userId: authenticatedUser.userId,
            isAnonymous: authenticatedUser.isAnonymous,
            polarCustomerId: authenticatedUser.polarCustomerId,
            selectedModel,
            isUsingOwnApiKeys: checkIfUsingOwnApiKeys(selectedModel, apiKeys),
            isFreeModel: selectedModel.endsWith(':free'),
            webSearchEnabled: webSearch.enabled,
            estimatedTokens: 30 // Basic estimate
        });

        // 5a. Check and increment daily message usage for users without credits (using free daily messages)
        // Users with credits are using credits instead, so don't check/increment daily usage
        if (!creditValidation.hasCredits) {
            // First, check if the user has reached their daily limit BEFORE incrementing
            const limitCheck = await DailyMessageUsageService.checkDailyLimit(
                authenticatedUser.userId
            );

            if (limitCheck.hasReachedLimit) {
                console.log(`[Chat] Daily message limit reached:`, {
                    userId: authenticatedUser.userId,
                    isAnonymous: authenticatedUser.isAnonymous,
                    messageCount: limitCheck.messageCount,
                    limit: limitCheck.limit,
                    remaining: limitCheck.remaining
                });
                return createErrorResponse(
                    "MESSAGE_LIMIT_REACHED",
                    "Message limit reached",
                    429,
                    JSON.stringify({
                        limit: limitCheck.limit,
                        remaining: limitCheck.remaining,
                        messageCount: limitCheck.messageCount
                    })
                );
            }

            // Only increment if limit hasn't been reached
            try {
                const incrementResult = await DailyMessageUsageService.incrementDailyUsage(
                    authenticatedUser.userId,
                    authenticatedUser.isAnonymous
                );
                console.log(`[Chat] Incremented daily message usage:`, {
                    userId: authenticatedUser.userId,
                    isAnonymous: authenticatedUser.isAnonymous,
                    newCount: incrementResult.newCount,
                    date: incrementResult.date,
                    remaining: limitCheck.remaining - 1
                });
            } catch (error) {
                console.error(`[Chat] Failed to increment daily usage:`, error);
                // Don't block the request if incrementing fails (but log it)
            }
        } else {
            console.log(`[Chat] Skipping daily usage increment - user has credits (${creditValidation.actualCredits})`);
        }

        // 6. Validate free model and premium model access
        await ChatCreditValidationService.validateFreeModelAccess({
            userId: authenticatedUser.userId,
            isAnonymous: authenticatedUser.isAnonymous,
            polarCustomerId: authenticatedUser.polarCustomerId,
            selectedModel,
            isUsingOwnApiKeys: checkIfUsingOwnApiKeys(selectedModel, apiKeys),
            isFreeModel: selectedModel.endsWith(':free'),
            webSearchEnabled: webSearch.enabled,
            estimatedTokens: 30,
            hasCredits: creditValidation.hasCredits
        });

        await ChatCreditValidationService.validatePremiumModelAccess({
            userId: authenticatedUser.userId,
            isAnonymous: authenticatedUser.isAnonymous,
            polarCustomerId: authenticatedUser.polarCustomerId,
            selectedModel,
            isUsingOwnApiKeys: checkIfUsingOwnApiKeys(selectedModel, apiKeys),
            isFreeModel: selectedModel.endsWith(':free'),
            webSearchEnabled: webSearch.enabled,
            estimatedTokens: 30,
            hasCredits: creditValidation.hasCredits
        });

        // 7. Configure web search
        const webSearchConfig = ChatWebSearchService.validateAndConfigureWebSearch({
            webSearch,
            selectedModel,
            isUsingOwnApiKeys: checkIfUsingOwnApiKeys(selectedModel, apiKeys),
            isAnonymous: authenticatedUser.isAnonymous,
            actualCredits: creditValidation.actualCredits,
            modelInfo: modelValidation.modelInfo
        });

        // 8. Initialize MCP servers
        const mcpResult = await ChatMCPServerService.initializeMCPServers({
            mcpServers: initialMcpServers,
            selectedModel
        });

        // Register cleanup for MCP clients
        if (mcpResult.cleanup) {
            req.signal.addEventListener('abort', async () => {
                await mcpResult.cleanup();
            });
        }

        // 9. Prepare chat ID
        const id = chatId || nanoid();
        const isNewChat = !chatId || !(await ChatDatabaseService.checkChatExists({
            chatId: id,
            userId: authenticatedUser.userId
        }));

        // 10. Pre-emptively create chat if new
        if (isNewChat) {
            await ChatDatabaseService.createChatIfNotExists({
                id,
                userId: authenticatedUser.userId,
                selectedModel,
                apiKeys,
                isAnonymous: authenticatedUser.isAnonymous,
                messages: []
            });
        }

        // Continue with the rest of the implementation from the original route.ts
        // This is where the actual streaming logic begins

        // Get model info for validation and defaults
        const selectedModelInfo = modelValidation.modelInfo;

        // Process attachments into message parts
        async function processMessagesWithAttachments(
            messages: UIMessage[],
            attachments: Array<{ name: string; contentType: string; url: string }>,
            modelInfo: any
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
                const imageParts: any[] = attachments.map((attachment, index) => {
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
                            size: 0,
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
        const processedMessagesWithAttachments = await processMessagesWithAttachments(messages, attachments, selectedModelInfo);

        // Prepare messages for the model
        const modelMessagesFinal: UIMessage[] = [...processedMessagesWithAttachments];

        if (
            selectedModel === "openrouter/deepseek/deepseek-r1" ||
            selectedModel === "openrouter/deepseek/deepseek-r1-0528" ||
            selectedModel === "openrouter/deepseek/deepseek-r1-0528-qwen3-8b" ||
            selectedModel === "openrouter/x-ai/grok-3-beta" ||
            selectedModel === "openrouter/x-ai/grok-3-mini-beta" ||
            selectedModel === "openrouter/x-ai/grok-3-mini-beta-reasoning-high" ||
            selectedModel === "openrouter/qwen/qwq-32b"
        ) {
            const systemContent = "Please provide your reasoning within <think> tags. After closing the </think> tag, provide your final answer directly without any other special tags.";
            modelMessagesFinal.unshift({
                role: "system",
                id: nanoid(),
                content: systemContent,
                parts: [{ type: "text", text: systemContent }]
            });
        }

        // Use tools from MCP service
        const tools = mcpResult.tools;

        console.log("messages", messages);
        console.log("parts", messages.map(m => m.parts.map(p => p)));

        // Log web search status
        if (webSearchConfig.enabled) {
            console.log(`[Web Search] ENABLED with context size: ${webSearchConfig.contextSize}`);
        } else {
            console.log(`[Web Search] DISABLED`);
        }

        let modelInstance;
        let effectiveWebSearchEnabled = webSearchConfig.enabled;

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

            console.log(`[Chat ${id}] OpenRouter API key available: ${openrouterApiKey.substring(0, 8)}...`);
        }

        // Check if the selected model supports web search
        const currentModelDetails = selectedModelInfo;
        if (webSearchConfig.enabled && selectedModel.startsWith("openrouter/")) {
            if (currentModelDetails?.supportsWebSearch === true) {
                // Model supports web search, use :online variant
                const openrouterModelId = selectedModel.replace("openrouter/", "") + ":online";
                const openrouterClient = createOpenRouterClientWithKey(apiKeys?.['OPENROUTER_API_KEY'], authenticatedUser.isAnonymous
                    ? `chatlima_anon_${authenticatedUser.userId}`
                    : `chatlima_user_${authenticatedUser.userId}`);
                if (
                    selectedModel === "openrouter/deepseek/deepseek-r1" ||
                    selectedModel === "openrouter/deepseek/deepseek-r1-0528" ||
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
                modelInstance = getLanguageModelWithKeys(selectedModel, apiKeys, authenticatedUser.isAnonymous
                    ? `chatlima_anon_${authenticatedUser.userId}`
                    : `chatlima_user_${authenticatedUser.userId}`);
                console.log(`[Web Search] Requested for ${selectedModel}, but not supported or not enabled for this model. Using standard model.`);
            }
        } else {
            if (webSearchConfig.enabled) {
                console.log(`[Web Search] Requested but ${selectedModel} is not an OpenRouter model or web search support unknown. Disabling web search for this call.`);
            }
            effectiveWebSearchEnabled = false;
            modelInstance = getLanguageModelWithKeys(selectedModel, apiKeys, authenticatedUser.isAnonymous
                ? `chatlima_anon_${authenticatedUser.userId}`
                : `chatlima_user_${authenticatedUser.userId}`);
        }

        const modelOptions: any = {};

        if (effectiveWebSearchEnabled) {
            modelOptions.web_search_options = {
                search_context_size: webSearchConfig.contextSize
            };
        }

        // Always set logprobs: false for these models at the providerOptions level for streamText
        if (
            selectedModel === "openrouter/deepseek/deepseek-r1" ||
            selectedModel === "openrouter/deepseek/deepseek-r1-0528" ||
            selectedModel === "openrouter/x-ai/grok-3-beta" ||
            selectedModel === "openrouter/x-ai/grok-3-mini-beta" ||
            selectedModel === "openrouter/x-ai/grok-3-mini-beta-reasoning-high" ||
            selectedModel === "openrouter/qwen/qwq-32b" ||
            selectedModel.includes("openrouter/minimax/m2") ||
            selectedModel.includes("openrouter/minimax-m2")
        ) {
            modelOptions.logprobs = false;
        }

        // Helper function to recursively remove $schema fields from any object
        const removeSchemaRecursively = (obj: any): any => {
            if (obj === null || obj === undefined) return obj;
            if (typeof obj !== 'object') return obj;
            if ((obj as any)._def && typeof (obj as any)._def === 'object' && 'typeName' in (obj as any)._def) {
                return obj;
            }
            if (Array.isArray(obj)) {
                obj.forEach((item, idx) => {
                    obj[idx] = removeSchemaRecursively(item);
                });
                return obj;
            }
            for (const key of Object.keys(obj)) {
                if (key === '$schema') {
                    delete obj[key];
                    continue;
                }
                obj[key] = removeSchemaRecursively((obj as any)[key]);
            }
            return obj;
        };

        const cleanToolsForGoogleModels = (tools: any) => {
            console.log(`[GOOGLE CLEAN] Cleaning ${Object.keys(tools).length} tools for Google models`);
            const cleanedTools = removeSchemaRecursively(tools);
            console.log(`[GOOGLE CLEAN] Cleaned tools, removed $schema fields recursively`);
            return cleanedTools;
        };

        const isGoogleModel = selectedModel.includes('vertex/google/') ||
            selectedModel.includes('google/gemini') ||
            selectedModel.includes('openrouter/google/') ||
            selectedModel.includes('coding/gemini') ||
            selectedModel.includes('requesty/google/') ||
            (selectedModel.includes('vertex') && selectedModel.includes('google')) ||
            (selectedModel.toLowerCase().includes('gemini'));

        if (isGoogleModel) {
            console.log(`[GOOGLE MODEL DETECTED] ${selectedModel} - Will clean $schema from tools`);
        }

        const toolsToUse = isGoogleModel && Object.keys(tools).length > 0
            ? cleanToolsForGoogleModels(tools)
            : tools;

        // Get default parameters and apply preset overrides
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

        // Convert to appropriate format for OpenRouter and Requesty models
        const isOpenRouterModel = selectedModel.startsWith("openrouter/");
        const isRequestyModel = selectedModel.startsWith("requesty/");
        const needsFormatConversion = isOpenRouterModel || isRequestyModel;

        let formattedMessages = needsFormatConversion
            ? convertToOpenRouterFormat(modelMessagesFinal)
            : modelMessagesFinal;

        // Filter out tool messages - they should not be sent to AI SDK as input
        // Tool messages are only used in responses, not in conversation history
        formattedMessages = formattedMessages.filter((msg: any) => msg.role !== "tool");

        console.log(`[DEBUG] Using ${needsFormatConversion ? 'converted' : 'raw'} message format for model:`, selectedModel);
        console.log("[DEBUG] Formatted messages for model:", JSON.stringify(formattedMessages, null, 2));

        // 17. Set up streaming payload
        const openRouterPayload = {
            model: modelInstance,
            system: effectiveSystemInstruction,
            temperature: effectiveTemperature,
            maxTokens: effectiveMaxTokens,
            messages: formattedMessages,
            tools: toolsToUse,
            maxSteps: 20,
            user: authenticatedUser.isAnonymous
                ? `chatlima_anon_${authenticatedUser.userId}`
                : `chatlima_user_${authenticatedUser.userId}`,
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
                    user: authenticatedUser.isAnonymous
                        ? `chatlima_anon_${authenticatedUser.userId}`
                        : `chatlima_user_${authenticatedUser.userId}`,
                    extraBody: {
                        user: authenticatedUser.isAnonymous
                            ? `chatlima_anon_${authenticatedUser.userId}`
                            : `chatlima_user_${authenticatedUser.userId}`,
                    },
                },
                requesty: {
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

                logChunk(id, chunk, firstTokenTime, requestId);
            },
            async onFinish(event: any) {
                console.log(`[Chat ${id}][onFinish] Stream finished, processing and saving...`);

                // Track whether messages are saved successfully for background cost tracking
                let messagesSavedSuccessfully = false;
                const finalAssistantMessageId: string = nanoid();
                let actualMessageId: string | undefined = undefined;
                let tokenUsageData: any = null; // Declare at onFinish scope

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
                    eventUsage: event.usage,
                    responseUsage: event.response?.usage,
                    eventUsageKeys: event.usage ? Object.keys(event.usage) : [],
                    responseUsageKeys: event.response?.usage ? Object.keys(event.response.usage) : [],
                    eventUsageDetailedDebug: event.usage ? {
                        promptTokens: { value: event.usage.promptTokens, type: typeof event.usage.promptTokens, isNaN: isNaN(event.usage.promptTokens) },
                        completionTokens: { value: event.usage.completionTokens, type: typeof event.usage.completionTokens, isNaN: isNaN(event.usage.completionTokens) },
                        totalTokens: { value: event.usage.totalTokens, type: typeof event.usage.totalTokens, isNaN: isNaN(event.usage.totalTokens) }
                    } : null,
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

                if (timeToFirstTokenMs === null) {
                    timeToFirstTokenMs = 500;
                    console.log(`[Chat ${id}][onFinish] Forced timeToFirstTokenMs to 500ms for testing`);
                }

                const response = event.response as OpenRouterResponse;

                try {
                    if (!response || !response.messages) {
                        console.error(`[Chat ${id}][onFinish] Invalid response structure:`, response);
                        return;
                    }

                    console.log(`[Chat ${id}][onFinish] Response has annotations:`, !!response.annotations);
                    if (response.annotations) {
                        console.log(`[Chat ${id}][onFinish] Annotation count:`, response.annotations.length);
                        console.log(`[Chat ${id}][onFinish] Annotation types:`, response.annotations.map(a => a.type));
                    }

                    // Manually concatenate request and response messages
                    const allMessages = [...modelMessagesFinal, ...(response.messages || [])];

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

                    try {
                        await saveChat({
                            id,
                            userId: authenticatedUser.userId,
                            messages: processedMessages as any,
                            selectedModel,
                            apiKeys,
                            isAnonymous: authenticatedUser.isAnonymous,
                        });
                        console.log(`[Chat ${id}][onFinish] Successfully saved chat with all messages.`);
                    } catch (dbError: any) {
                        console.error(`[Chat ${id}][onFinish] DATABASE_ERROR saving chat:`, dbError);
                    }

                    let dbMessages;
                    let assistantMessageId: string | undefined;
                    let finalAssistantMessageId: string = nanoid();

                    try {
                        dbMessages = (convertToDBMessages(processedMessages as any, id) as any[]).map(msg => ({
                            ...msg,
                            hasWebSearch: effectiveWebSearchEnabled && msg.role === 'assistant' && (response.annotations?.length || 0) > 0,
                            webSearchContextSize: webSearchConfig.enabled ? webSearchConfig.contextSize : undefined
                        }));

                        const assistantMessage = dbMessages.find(msg => msg.role === 'assistant');
                        assistantMessageId = assistantMessage?.id;

                    } catch (conversionError: any) {
                        console.error(`[Chat ${id}][onFinish] ERROR converting messages for DB:`, conversionError);
                        return;
                    }

                    try {
                        await saveMessages({ messages: dbMessages });
                        console.log(`[Chat ${id}][onFinish] Successfully saved individual messages.`);
                        messagesSavedSuccessfully = true;
                    } catch (dbMessagesError: any) {
                        console.error(`[Chat ${id}][onFinish] DATABASE_ERROR saving messages:`, dbMessagesError);
                    }

                    const typedResponse = response as any;
                    const provider = selectedModel.split('/')[0];
                    finalAssistantMessageId = assistantMessageId || response.messages?.[response.messages.length - 1]?.id || nanoid();

                    try {
                        logDiagnostic('TOKEN_TRACKING_START', `Starting detailed token tracking`, {
                            requestId,
                            userId: authenticatedUser.userId,
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

                        const lastMessage = typedResponse.messages?.[typedResponse.messages.length - 1];
                        const lastMessageContent = lastMessage?.content;
                        let contentPreview = '';

                        if (typeof lastMessageContent === 'string') {
                            contentPreview = lastMessageContent.substring(0, 100);
                        } else if (Array.isArray(lastMessageContent)) {
                            const textParts = lastMessageContent
                                .filter((part: any) => part.type === 'text')
                                .map((part: any) => part.text)
                                .join(' ');
                            contentPreview = textParts.substring(0, 100);
                        } else if (lastMessageContent) {
                            contentPreview = JSON.stringify(lastMessageContent).substring(0, 100);
                        }

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
                            provider: provider
                        });

                        tokenUsageData = event.usage || typedResponse.usage;

                        // Check for tool call steps and aggregate their token usage
                        if (event.steps && Array.isArray(event.steps)) {
                            console.log(`[Chat ${id}][onFinish] Found ${event.steps.length} steps, checking for tool call tokens`);

                            let totalStepInputTokens = 0;
                            let totalStepOutputTokens = 0;
                            let hasStepTokens = false;

                            for (let i = 0; i < event.steps.length; i++) {
                                const step = event.steps[i];
                                if (step && step.usage) {
                                    const stepUsage = step.usage as any;
                                    const stepInputTokens = stepUsage.promptTokens || stepUsage.inputTokens || stepUsage.prompt_tokens || stepUsage.input_tokens || 0;
                                    const stepOutputTokens = stepUsage.completionTokens || stepUsage.outputTokens || stepUsage.completion_tokens || stepUsage.output_tokens || 0;

                                    if (stepInputTokens > 0 || stepOutputTokens > 0) {
                                        totalStepInputTokens += stepInputTokens;
                                        totalStepOutputTokens += stepOutputTokens;
                                        hasStepTokens = true;
                                        console.log(`[Chat ${id}][onFinish] Step ${i} tokens: input=${stepInputTokens}, output=${stepOutputTokens}`);
                                    }
                                }
                            }

                            if (hasStepTokens) {
                                console.log(`[Chat ${id}][onFinish] Aggregated step tokens: input=${totalStepInputTokens}, output=${totalStepOutputTokens}`);

                                // Merge step tokens with main usage data
                                tokenUsageData = {
                                    ...tokenUsageData,
                                    inputTokens: totalStepInputTokens || tokenUsageData?.inputTokens || tokenUsageData?.prompt_tokens || 0,
                                    outputTokens: totalStepOutputTokens || tokenUsageData?.outputTokens || tokenUsageData?.completion_tokens || 0,
                                    totalTokens: (totalStepInputTokens + totalStepOutputTokens) || tokenUsageData?.totalTokens || tokenUsageData?.total_tokens
                                };
                            }
                        }

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

                            if (needsOutputEstimation && lastMessage?.content) {
                                if (Array.isArray(lastMessage.content)) {
                                    outputContentLength = lastMessage.content
                                        .filter((part: any) => part.type === 'text')
                                        .map((part: any) => part.text)
                                        .join('').length;
                                } else if (typeof lastMessage.content === 'string') {
                                    outputContentLength = lastMessage.content.length;
                                }
                            }

                            if (needsInputEstimation && modelMessagesFinal) {
                                console.log(`[Chat ${id}][onFinish] Estimating input tokens from full conversation context (${modelMessagesFinal.length} messages)`);

                                let totalInputContentLength = 0;

                                modelMessagesFinal.forEach((message, index) => {
                                    let messageContentLength = 0;

                                    if (message.content) {
                                        if (Array.isArray(message.content)) {
                                            messageContentLength = message.content
                                                .filter((part: any) => part.type === 'text')
                                                .map((part: any) => part.text || '')
                                                .join('').length;
                                        } else if (typeof message.content === 'string') {
                                            messageContentLength = message.content.length;
                                        }
                                    }

                                    totalInputContentLength += messageContentLength;

                                    console.log(`[Chat ${id}][onFinish] Message ${index + 1} (${message.role}): ${messageContentLength} chars`);
                                });

                                inputContentLength = totalInputContentLength;
                                console.log(`[Chat ${id}][onFinish] Total input content length: ${inputContentLength} chars (${modelMessagesFinal.length} messages)`);
                            }

                            if (needsInputEstimation && effectiveSystemInstruction) {
                                const systemLength = effectiveSystemInstruction.length;
                                inputContentLength += systemLength;
                                console.log(`[Chat ${id}][onFinish] Added system instruction: ${systemLength} chars`);
                            }

                            const estimatedOutputTokens = Math.ceil(outputContentLength / 4);
                            const estimatedInputTokens = Math.ceil(inputContentLength / 4);

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
                                conversationLength: modelMessagesFinal ? modelMessagesFinal.length : 0,
                                totalInputChars: inputContentLength,
                                systemInstructionChars: effectiveSystemInstruction ? effectiveSystemInstruction.length : 0
                            });
                        }

                        const requestEndTime = Date.now();
                        const calculatedProcessingTimeMs = requestEndTime - requestStartTime;

                        const finalOutputTokens = tokenUsageData?.outputTokens || 0;

                        if (timeToFirstTokenMs === null) {
                            if (event?.durationMs) {
                                timeToFirstTokenMs = Math.round(event.durationMs * 0.2);
                                logDiagnostic('ESTIMATED_TIMING', `Estimated time to first token from event.durationMs`, {
                                    requestId,
                                    estimatedTimeToFirstTokenMs: timeToFirstTokenMs,
                                    totalDurationMs: event.durationMs
                                });
                            } else {
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

                        const extractedTokenUsage = tokenUsageData || { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
                        const inputTokens = extractedTokenUsage.inputTokens || extractedTokenUsage.prompt_tokens || 0;
                        const outputTokens = extractedTokenUsage.outputTokens || extractedTokenUsage.completion_tokens || 0;

                        // Now that messages are saved, we can get the actual message ID from the database
                        if (messagesSavedSuccessfully) {
                            try {
                                const savedMessages = await db.query.messages.findMany({
                                    where: eq(messagesTable.chatId, id),
                                    orderBy: [messagesTable.createdAt]
                                });

                                const assistantMessage = savedMessages.find(msg => msg.role === 'assistant');
                                if (assistantMessage) {
                                    actualMessageId = assistantMessage.id;
                                    console.log(`[Chat ${id}][onFinish] Found actual message ID from database: ${actualMessageId}`);
                                }
                            } catch (msgQueryError) {
                                console.warn(`[Chat ${id}][onFinish] Could not query actual message ID:`, msgQueryError);
                            }
                        }

                    } catch (error: any) {
                        logDiagnostic('TOKEN_TRACKING_ERROR', `Failed to track detailed token usage (independent)`, {
                            requestId,
                            userId: authenticatedUser.userId,
                            error: error instanceof Error ? error.message : String(error)
                        });
                        console.error(`[Chat ${id}][onFinish] Failed to track detailed token usage for user ${authenticatedUser.userId}:`, error);
                    }
                } catch (finishError: any) {
                    console.error(`[Chat ${id}][onFinish] Unexpected error in onFinish:`, finishError);
                }

                // Extract token usage from response - OpenRouter may provide it in different formats
                const typedResponse = response as any;
                let completionTokens = 0;

                if (typedResponse.usage?.completion_tokens) {
                    completionTokens = typedResponse.usage.completion_tokens;
                } else if (typedResponse.usage?.output_tokens) {
                    completionTokens = typedResponse.usage.output_tokens;
                } else {
                    const lastMessage = typedResponse.messages?.[typedResponse.messages.length - 1];
                    if (lastMessage?.content) {
                        let contentLength = 0;

                        if (Array.isArray(lastMessage.content)) {
                            contentLength = lastMessage.content
                                .filter((part: any) => part.type === 'text')
                                .map((part: any) => part.text)
                                .join('').length;
                        } else if (typeof lastMessage.content === 'string') {
                            contentLength = lastMessage.content.length;
                        }

                        completionTokens = Math.ceil(contentLength / 4);
                    } else if (typeof typedResponse.content === 'string') {
                        completionTokens = Math.ceil(typedResponse.content.length / 4);
                    } else {
                        completionTokens = 1;
                    }
                }

                // Existing code for tracking tokens (legacy credit system)
                let polarCustomerId: string | undefined;

                try {
                    const session = await auth.api.getSession({ headers: req.headers });

                    polarCustomerId = (session?.user as any)?.polarCustomerId ||
                        (session?.user as any)?.metadata?.polarCustomerId;
                } catch (error) {
                    console.warn('Failed to get session for Polar customer ID:', error);
                }

                if (completionTokens > 0) {
                    try {
                        logDiagnostic('LEGACY_TOKEN_TRACKING_START', `Starting legacy token tracking`, {
                            requestId,
                            userId: authenticatedUser.userId,
                            completionTokens
                        });

                        let isAnonymous = authenticatedUser.isAnonymous;
                        try {
                            const session = await auth.api.getSession({ headers: req.headers });
                            isAnonymous = (session?.user as any)?.isAnonymous === true;
                        } catch (error) {
                            logDiagnostic('LEGACY_TOKEN_TRACKING_WARNING', `Could not determine if user is anonymous, assuming not anonymous`, {
                                requestId,
                                userId: authenticatedUser.userId,
                                error: error instanceof Error ? error.message : String(error)
                            });
                        }

                        const callbackIsUsingOwnApiKeys = checkIfUsingOwnApiKeys(selectedModel, apiKeys);

                        let callbackActualCredits: number | null = null;
                        if (!isAnonymous && authenticatedUser.userId) {
                            try {
                                callbackActualCredits = await getCachedCreditsByExternal(authenticatedUser.userId);
                            } catch (error) {
                                logDiagnostic('LEGACY_TOKEN_TRACKING_WARNING', `Error getting actual credits in onFinish callback`, {
                                    requestId,
                                    userId: authenticatedUser.userId,
                                    error: error instanceof Error ? error.message : String(error)
                                });
                            }
                        }

                        const isFreeModel = selectedModel.endsWith(':free');

                        let shouldDeductCredits = false;
                        if (!isAnonymous && !callbackIsUsingOwnApiKeys && !isFreeModel && callbackActualCredits !== null && callbackActualCredits > 0) {
                            shouldDeductCredits = true;
                        }

                        let additionalCost = 0;
                        if (webSearchConfig.enabled && !callbackIsUsingOwnApiKeys && shouldDeductCredits) {
                            additionalCost = WEB_SEARCH_COST;
                        }

                        const actualCreditsReported = shouldDeductCredits ? 1 + additionalCost : 0;
                        const trackingReason = isAnonymous ? 'Queued (stopped)' : shouldDeductCredits ? 'Queued for Polar' : isFreeModel ? 'Queued (free model)' : 'Queued (daily limit)';

                        if (messagesSavedSuccessfully) {
                            try {
                                const finalProcessingTimeMs = Date.now() - requestStartTime;

                                import('@/lib/services/costReconciliation').then(async ({ CostReconciliationService }) => {
                                    try {
                                        const openrouterApiKey = apiKeys?.['OPENROUTER_API_KEY'] || process.env.OPENROUTER_API_KEY;
                                        await CostReconciliationService.reconcileRecentMissingActualCosts({ limit: 3, maxAgeHours: 48, apiKeyOverride: openrouterApiKey });
                                    } catch (e) {
                                        // Swallow errors silently
                                    }
                                });

                                const openrouterApiKey = apiKeys?.['OPENROUTER_API_KEY'] || process.env.OPENROUTER_API_KEY;

                                const extractedInputTokens = extractInputTokensFromEvent(event);
                                console.log(`[Chat ${id}][onFinish] Token extraction result: ${extractedInputTokens} input tokens`);

                                // Use aggregated token data if available from steps processing above
                                const finalInputTokens = tokenUsageData?.inputTokens || extractedInputTokens;
                                const finalOutputTokens = tokenUsageData?.outputTokens || completionTokens;

                                console.log(`[Chat ${id}][onFinish] Final token counts for tracking: input=${finalInputTokens}, output=${finalOutputTokens}`);

                                await DirectTokenTrackingService.processTokenUsage({
                                    userId: authenticatedUser.userId,
                                    chatId: id,
                                    messageId: actualMessageId || finalAssistantMessageId,
                                    modelId: selectedModel,
                                    provider: selectedModel.split('/')[0],
                                    inputTokens: finalInputTokens,
                                    outputTokens: finalOutputTokens,
                                    generationId: typedResponse.id || typedResponse.generation_id || typedResponse.generationId || undefined,
                                    openRouterResponse: typedResponse,
                                    providerResponse: typedResponse,
                                    apiKeyOverride: openrouterApiKey,
                                    processingTimeMs: finalProcessingTimeMs,
                                    timeToFirstTokenMs: timeToFirstTokenMs ?? undefined,
                                    tokensPerSecond: tokensPerSecond ?? undefined,
                                    streamingStartTime: streamingStartTime ?? undefined,
                                    polarCustomerId,
                                    completionTokens,
                                    isAnonymous,
                                    shouldDeductCredits,
                                    additionalCost,
                                    modelInfo: modelValidation.modelInfo ?? undefined
                                });

                                logDiagnostic('DIRECT_TOKEN_TRACKING_COMPLETED', `Completed direct token usage tracking with credit parameters`, {
                                    requestId,
                                    userId: authenticatedUser.userId,
                                    completionTokens,
                                    actualCreditsReported,
                                    trackingReason,
                                    shouldDeductCredits,
                                    additionalCost
                                });
                            } catch (creditTrackingError: any) {
                                console.error(`[Chat ${id}][onFinish] Failed to process direct token tracking with credit parameters:`, creditTrackingError);
                            }
                        } else {
                            console.log(`[Chat ${id}][onFinish] Skipping background cost tracking due to message save failure`);
                        }

                        console.log(`${trackingReason} ${actualCreditsReported} credits for user ${authenticatedUser.userId} [Chat ${id}]`);
                    } catch (error: any) {
                        logDiagnostic('LEGACY_TOKEN_TRACKING_ERROR', `Failed to track legacy token usage`, {
                            requestId,
                            userId: authenticatedUser.userId,
                            error: error instanceof Error ? error.message : String(error)
                        });
                        console.error(`[Chat ${id}][onFinish] Failed to track token usage for user ${authenticatedUser.userId}:`, error);
                    }
                }
            }
        };

        console.log(`[Chat ${id}] Using model: ${selectedModel}, effectiveWebSearchEnabled: ${webSearchConfig.enabled}`);
        console.log(`[Chat ${id}] OpenRouter user tracking: ${authenticatedUser.isAnonymous ? `chatlima_anon_${authenticatedUser.userId}` : `chatlima_user_${authenticatedUser.userId}`}`);

        const result = streamText(openRouterPayload);

        return result.toDataStreamResponse({
            sendReasoning: true,
            getErrorMessage: (error: any) => {
                console.error(`[API Error][Chat ${id}] Error in stream processing:`, {
                    error: error,
                    message: error?.message,
                    stack: error?.stack,
                    responseBody: error?.responseBody,
                    name: error?.name,
                    cause: error?.cause,
                });

                if (error?.name === 'AI_TypeValidationError') {
                    let errorMessage = "The AI provider returned an unexpected response format. Please try again.";
                    if (error?.value?.error?.message) {
                        errorMessage = `API Error: ${error.value.error.message}`;
                    }
                    return JSON.stringify({ error: { code: "PROVIDER_ERROR", message: errorMessage, details: "Type validation error" } });
                }

                let errorCode = "STREAM_ERROR";
                let errorMessage = "An error occurred while processing your request.";
                const errorDetails: any = {};

                // Try to extract error details from various sources
                if (error?.message) {
                    errorDetails.rawMessage = error.message;
                }

                if (error?.cause) {
                    errorDetails.cause = error.cause;
                }

                if (error && typeof error.responseBody === 'string') {
                    try {
                        const parsedBody = JSON.parse(error.responseBody);
                        errorDetails.responseBody = parsedBody;
                        if (parsedBody.error && typeof parsedBody.error.message === 'string') {
                            errorMessage = parsedBody.error.message;
                            if (parsedBody.error.code) {
                                errorCode = String(parsedBody.error.code);
                            }
                        }
                    } catch (e) {
                        console.warn(`[API Error][Chat ${id}] Failed to parse error.responseBody`);
                        errorDetails.responseBody = error.responseBody;
                    }
                }

                // Check if error has standard properties
                if (error?.code) {
                    errorCode = String(error.code);
                }

                // Use error message if available
                if (error?.message && !errorDetails.responseBody) {
                    errorMessage = error.message;
                }

                // Log the final error for debugging
                console.error(`[API Error][Chat ${id}] Final error response:`, { errorCode, errorMessage, errorDetails });

                return JSON.stringify({ error: { code: errorCode, message: errorMessage, details: errorDetails } });
            },
        });

    } catch (error: any) {
        console.error(`[API Route Error][Chat ${requestId}] Error in refactored route:`, JSON.stringify(error, null, 2));

        if (error instanceof Response) {
            return error; // Already a proper error response
        }

        // Handle domain-specific credit validation errors
        if (error instanceof CreditValidationError) {
            return new Response(
                JSON.stringify({
                    error: {
                        code: error.code,
                        message: error.message,
                        details: error.details
                    }
                }),
                { status: error.status, headers: { "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({
                error: {
                    code: "INTERNAL_ERROR",
                    message: "An internal error occurred",
                    details: error.message
                }
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
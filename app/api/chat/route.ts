import { streamText, generateText, tool, jsonSchema, stepCountIs, type UIMessage, type LanguageModel, type LanguageModelResponseMetadata } from "ai";
import { saveChat, saveMessages, convertToDBMessages } from '@/lib/chat-store';
import { generateTitle } from '@/app/actions';
import {
    extractGeneratedImageUrlsFromStreamEvent,
    getUIMessageText,
    userMessageRequestsImageCreation,
} from '@/lib/message-utils';
import {
    buildAssistantMessageForPersistence,
    countPersistableDisplayParts,
    createStreamFinishGate,
    processMessagesForPersistence,
} from '@/lib/chat-message-persistence';
import { nanoid } from 'nanoid';
import { db } from '@/lib/db';
import { chats, messages as messagesTable } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { trackTokenUsage, hasEnoughCredits, WEB_SEARCH_COST } from '@/lib/tokenCounter';
import { resolveAllowedImageModel } from '@/lib/constants/image-generation-models';
import { TokenTrackingService } from '@/lib/tokenTracking';
import { CostCalculationService } from '@/lib/services/costCalculation';
import { SimpleCostEstimationService } from '@/lib/services/simpleCostEstimation';
import { DirectTokenTrackingService } from '@/lib/services/directTokenTracking';
import { getRemainingCredits, getRemainingCreditsByExternalId, getSubscriptionTypeByExternalId } from '@/lib/polar';
import { createRequestCreditCache, hasEnoughCreditsWithCache } from '@/lib/services/creditCache';
import { auth } from '@/lib/auth';
import { logDiagnostic as originalLogDiagnostic, logChunk, logPerformanceMetrics, logError, logRequestBoundary } from '@/lib/utils/performantLogging';
import { DailyMessageUsageService } from '@/lib/services/dailyMessageUsageService';
import { UsageLimitsService } from '@/lib/services/usageLimits';
import { OptimizedUsageLimitsService } from '@/lib/services/optimizedUsageLimits';
import type { ImageUIPart } from '@/lib/types';
import { convertToOpenRouterFormat } from '@/lib/openrouter-utils';
import { model, type modelID, getLanguageModelWithKeys, createOpenRouterClientWithKey, usesTagBasedReasoningExtraction, wrapWithTagBasedReasoning } from "@/ai/providers";
import { getModelDetails } from "@/lib/models/fetch-models";
import { type ModelInfo } from "@/lib/types/models";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { getApiKey } from "@/ai/providers";
import { validatePresetParameters, getModelDefaults, sanitizeSystemInstruction } from "@/lib/parameter-validation";
import { cleanToolsForGoogleModels, isGoogleModel } from '@/lib/google-model-tools';
import { z } from "zod";
import { parseFile } from "@/lib/file-reader";
import { fetchFileContent } from "@/lib/file-upload";
import { startBackgroundStreamConsumption } from "@/lib/chat-stream-consumption";
import { registerChatAbortController, abortChatGeneration } from "@/lib/chat-stop-registry";

// Import our new services
import { ChatAuthenticationService, ChatAuthenticationError, type AuthenticatedUser } from '@/lib/services/chatAuthenticationService';
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
import { ChatImageGenerationService, type ImageGenerationOptions } from '@/lib/services/chatImageGenerationService';
import { resolveOpenRouterWebSearchRouteSetup } from '@/lib/services/openRouterWebSearchRouteSetup';
import { ChatTokenTrackingService, type TokenTrackingContext, type TokenTrackingResult } from '@/lib/services/chatTokenTrackingService';
import { ChatDatabaseService, type ChatCreationContext, type MessageSavingContext } from '@/lib/services/chatDatabaseService';
import { buildProjectContext, formatProjectContextForSystemPrompt } from '@/lib/services/projectContext';
import { WebFetchService, WebFetchError } from '@/lib/services/webFetchService';
import { getAccessPolicyFlags } from '@/lib/config/access-policy';
import { canUserChat, hasProviderByokForModel } from '@/lib/services/accessGateService';

// Use optimized logging - only logs in development and uses efficient patterns
const logDiagnostic = originalLogDiagnostic;

// Allow streaming responses up to 300 seconds on Hobby plan
export const maxDuration = 300;

// Helper function to check if user is using their own API keys for the selected model
function checkIfUsingOwnApiKeys(selectedModel: string, apiKeys: Record<string, string> = {}): boolean {
    return hasProviderByokForModel(selectedModel, apiKeys);
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

interface ImageGenerationRequestOptions {
    enabled: boolean;
    quality?: ImageGenerationOptions['quality'];
    aspectRatio?: string;
    outputFormat?: ImageGenerationOptions['outputFormat'];
    model?: string;
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
    readonly messages: Array<UIMessage | { role: string; content?: string | unknown[]; parts?: unknown[]; id?: string }>;
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
        const body = await req.json();
        const action = body?.action;

        if (action === 'stop') {
            const authenticatedUser = await ChatAuthenticationService.authenticateUser(req);
            const stopChatId = typeof body?.chatId === 'string' ? body.chatId : '';

            if (!stopChatId) {
                return createErrorResponse(
                    'INVALID_REQUEST',
                    'chatId is required to stop generation.',
                    400
                );
            }

            const stopped = abortChatGeneration(authenticatedUser.userId, stopChatId);
            return Response.json({ ok: true, stopped, chatId: stopChatId });
        }

        // Parse request body
        const {
            messages,
            chatId,
            selectedModel,
            mcpServers: initialMcpServers = [],
            webSearch = { enabled: false, contextSize: 'medium' },
            imageGeneration = {
                enabled: false,
                quality: 'medium' as const,
                aspectRatio: '1:1',
                outputFormat: 'png' as const,
                model: 'openai/gpt-5-image',
            },
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
            imageGeneration?: ImageGenerationRequestOptions;
            apiKeys?: Record<string, string>;
            attachments?: Array<{
                name: string;
                contentType: string;
                url: string;
            }>;
            temperature?: number;
            maxTokens?: number;
            systemInstruction?: string;
        } = body;

        logDiagnostic('REQUEST_PARSED', `Request body parsed`, {
            requestId,
            messagesCount: messages.length,
            chatId,
            selectedModel,
            attachmentsCount: attachments.length,
            webSearchEnabled: webSearch.enabled,
            imageGenerationEnabled: imageGeneration.enabled,
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

        const accessPolicyFlags = getAccessPolicyFlags();
        let hasPaidSubscription = false;

        if (!authenticatedUser.isAnonymous) {
            try {
                const subscriptionType = await getSubscriptionTypeByExternalId(authenticatedUser.userId);
                hasPaidSubscription = subscriptionType === 'monthly' || subscriptionType === 'yearly';
            } catch (error) {
                console.warn('[AccessGate] Failed to resolve subscription type, treating as unsubscribed:', error);
            }
        }

        const gateResult = canUserChat({
            isAnonymous: authenticatedUser.isAnonymous,
            hasPaidSubscription,
            selectedModel,
            apiKeys,
            flags: accessPolicyFlags
        });

        if (!gateResult.allowed) {
            console.warn('[AccessGate] Chat request blocked', {
                reason: gateResult.reason,
                userId: authenticatedUser.userId,
                isAnonymous: authenticatedUser.isAnonymous,
                selectedModel
            });
            return createErrorResponse(
                gateResult.reason,
                gateResult.reason === 'PAYWALL_BYOK_REQUIRED'
                    ? "Paid subscription required, or add a BYOK API key for this model's provider."
                    : "Paid subscription required to chat.",
                402
            );
        }

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
        if (!accessPolicyFlags.billingEnforced && !creditValidation.hasCredits) {
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
        }, {
            agenticWebToolsEnabled: accessPolicyFlags.openrouterAgenticWebToolsEnabled,
        });

        const resolvedImageGenerationModel = resolveAllowedImageModel(imageGeneration.model);

        const imageGenerationConfig = ChatImageGenerationService.validateAndConfigureImageGeneration({
            imageGeneration: {
                enabled: imageGeneration.enabled,
                quality: imageGeneration.quality ?? 'medium',
                aspectRatio: imageGeneration.aspectRatio ?? '1:1',
                outputFormat: imageGeneration.outputFormat ?? 'png',
                model: resolvedImageGenerationModel,
            },
            selectedModel,
            isUsingOwnApiKeys: checkIfUsingOwnApiKeys(selectedModel, apiKeys),
            isAnonymous: authenticatedUser.isAnonymous,
            actualCredits: creditValidation.actualCredits,
            modelInfo: modelValidation.modelInfo,
        });

        try {
            ChatImageGenerationService.validateImageGenerationRequest({
                imageGeneration: {
                    enabled: imageGeneration.enabled,
                    quality: imageGeneration.quality ?? 'medium',
                    aspectRatio: imageGeneration.aspectRatio ?? '1:1',
                    outputFormat: imageGeneration.outputFormat ?? 'png',
                    model: resolvedImageGenerationModel,
                },
                selectedModel,
                isUsingOwnApiKeys: checkIfUsingOwnApiKeys(selectedModel, apiKeys),
                isAnonymous: authenticatedUser.isAnonymous,
                actualCredits: creditValidation.actualCredits,
                modelInfo: modelValidation.modelInfo,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Image generation is not available.';
            return createErrorResponse('FEATURE_RESTRICTED', message, 403);
        }

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
        const streamAbortController = new AbortController();
        registerChatAbortController(authenticatedUser.userId, id, streamAbortController);
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

        // Start title generation in parallel with streaming so it is ready when the response finishes
        const titleGenerationPromise = isNewChat && (messages as UIMessage[]).some((m) => m.role === 'user')
            ? generateTitle(
                messages as UIMessage[],
                selectedModel,
                apiKeys,
                authenticatedUser.userId,
                authenticatedUser.isAnonymous
            )
            : undefined;

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
                    content: getUIMessageText(lastMessage).substring(0, 100),
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
                const existingParts = lastMessage.parts?.length
                    ? lastMessage.parts
                    : [{ type: 'text', text: getUIMessageText(lastMessage) }];
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
                parts: [{ type: "text", text: systemContent }]
            });
        }

        // Use tools from MCP service
        const tools = mcpResult.tools;

        // Build a lookup from the user-visible attached files section:
        // "- name | filepath: uploads/... | url: https://..."
        const attachedFileUrlByPath = new Map<string, string>();
        for (const msg of messages) {
            if (msg.role !== 'user') continue;
            const messageText = getUIMessageText(msg);
            if (!messageText) continue;
            const lines = messageText.split('\n');
            for (const line of lines) {
                const match = line.match(/filepath:\s*([^\s|]+)\s*\|\s*url:\s*(https?:\/\/\S+)/i);
                if (match) {
                    const filepath = match[1].trim();
                    const fileUrl = match[2].trim();
                    attachedFileUrlByPath.set(filepath, fileUrl);
                }
            }
        }

        // Add read_file tool for file analysis
        const read_file = tool({
            description: `Read contents of a file uploaded by the user. Supports: CSV, Excel, PDF, text files, code files. Returns parsed content based on file type.`,
            inputSchema: z.object({
                filepath: z.string().describe('File path or full URL (e.g., "uploads/data-2024-02-06-143022.csv" or "https://...")'),
            }),
            execute: async ({ filepath }) => {
                try {
                    const rawPath = (filepath || '').trim();
                    const normalizedPath = rawPath.startsWith('://')
                        ? `https${rawPath}`
                        : rawPath.startsWith('//')
                            ? `https:${rawPath}`
                            : rawPath;

                    const isFullUrl = /^https?:\/\//i.test(normalizedPath);
                    const blobBaseUrl = process.env.BLOB_PUBLIC_URL || process.env.NEXT_PUBLIC_BLOB_URL;
                    const mappedUrl = attachedFileUrlByPath.get(rawPath) || attachedFileUrlByPath.get(normalizedPath);
                    const projectMappedUrl = projectFileUrlByPath.get(rawPath) || projectFileUrlByPath.get(normalizedPath);
                    const blobUrl = isFullUrl
                        ? normalizedPath
                        : mappedUrl
                            ? mappedUrl
                            : projectMappedUrl
                                ? projectMappedUrl
                                : blobBaseUrl
                                    ? `${blobBaseUrl.replace(/\/$/, '')}/${normalizedPath.replace(/^\//, '')}`
                                    : normalizedPath;

                    if (!/^https?:\/\//i.test(blobUrl)) {
                        return JSON.stringify({
                            success: false,
                            error: 'Invalid file reference. Expected an absolute URL or a filepath with BLOB_PUBLIC_URL configured.'
                        });
                    }

                    const result = await fetchFileContent(blobUrl);
                    if (!result.success || !result.content) {
                        return JSON.stringify({ success: false, error: result.error || 'Failed to fetch file' });
                    }

                    const buffer = Buffer.from(result.content);
                    const cleanPath = (result.finalUrl || filepath).split('?')[0].split('#')[0];
                    const filename = cleanPath.split('/').pop() || filepath;
                    const responseMimeType = result.contentType?.split(';')[0]?.trim();
                    const parseResult = await parseFile(buffer, filename, responseMimeType);

                    if (!parseResult.success) {
                        return JSON.stringify({ success: false, error: parseResult.error || 'Failed to parse file' });
                    }

                    return JSON.stringify({ success: true, content: parseResult.content }, null, 2);
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Unknown error';
                    console.error('[read_file] Error:', error);
                    return JSON.stringify({ success: false, error: message });
                }
            },
        });

        const webFetchPolicy = {
            ...WebFetchService.getDefaultPolicy(),
            enabled: accessPolicyFlags.nativeWebFetchEnabled,
            defaultMaxChars: accessPolicyFlags.nativeWebFetchMaxChars,
            defaultTimeoutMs: accessPolicyFlags.nativeWebFetchTimeoutMs,
            maxResponseBytes: accessPolicyFlags.nativeWebFetchMaxBytes,
            maxRedirects: accessPolicyFlags.nativeWebFetchMaxRedirects,
            siteModeEnabled: accessPolicyFlags.nativeWebFetchSiteModeEnabled,
            siteModeMaxPages: accessPolicyFlags.nativeWebFetchSiteModeMaxPages,
            siteModeDepth: accessPolicyFlags.nativeWebFetchSiteModeDepth,
        };

        const web_fetch = tool({
            description: "Fetch and extract readable content from a public web URL. Best for reading a specific link and using it as context.",
            inputSchema: z.object({
                url: z.string().describe("Public http/https URL to read"),
                mode: z.enum(["markdown", "text"]).optional().describe("Output format. Defaults to markdown."),
                maxChars: z.number().int().positive().max(100000).optional().describe("Maximum characters to return. Defaults to server policy."),
                followRedirects: z.boolean().optional().describe("Whether to follow redirects. Defaults to true."),
                timeoutMs: z.number().int().positive().max(60000).optional().describe("Request timeout in milliseconds. Defaults to server policy."),
                siteMode: z.boolean().optional().describe("Optional whole-site mode. Disabled unless explicitly enabled by server configuration."),
                siteModeSameDomain: z.boolean().optional().describe("When siteMode is enabled, limit crawl to the same domain. Defaults to true."),
                siteModeMaxPages: z.number().int().positive().max(100).optional().describe("When siteMode is enabled, maximum pages to crawl (capped by server policy)."),
                siteModeDepth: z.number().int().min(0).max(5).optional().describe("When siteMode is enabled, crawl depth (capped by server policy)."),
            }),
            execute: async ({ url, mode, maxChars, followRedirects, timeoutMs, siteMode, siteModeSameDomain, siteModeMaxPages, siteModeDepth }) => {
                try {
                    const result = await WebFetchService.fetchPage({
                        url,
                        mode,
                        maxChars,
                        followRedirects,
                        timeoutMs,
                        siteMode,
                        siteModeSameDomain,
                        siteModeMaxPages,
                        siteModeDepth,
                    }, webFetchPolicy);
                    return JSON.stringify({ success: true, ...result }, null, 2);
                } catch (error) {
                    if (error instanceof WebFetchError) {
                        return JSON.stringify({
                            success: false,
                            code: error.code,
                            error: error.message,
                        });
                    }
                    const message = error instanceof Error ? error.message : "Unknown web fetch error";
                    return JSON.stringify({
                        success: false,
                        code: "WEB_FETCH_UNKNOWN_ERROR",
                        error: message,
                    });
                }
            },
        });

        // Merge native + MCP tools (OpenRouter server tools added after model resolution)
        const baseTools = {
            ...tools,
            read_file,
            ...(webFetchPolicy.enabled ? { web_fetch } : {}),
        };

        // Log web search status
        if (webSearchConfig.enabled) {
            console.log(`[Web Search] ENABLED (${webSearchConfig.useAgenticServerTools ? 'agentic server tools' : 'legacy :online plugin'}) with context size: ${webSearchConfig.contextSize}`);
        } else {
            console.log(`[Web Search] DISABLED`);
        }

        if (imageGenerationConfig.enabled) {
            console.log(`[Image Generation] ENABLED (model: ${imageGenerationConfig.model}, quality: ${imageGenerationConfig.quality}, aspect: ${imageGenerationConfig.aspectRatio})`);
        } else if (imageGeneration.enabled) {
            console.log(`[Image Generation] Requested but not available for ${selectedModel}`);
        } else {
            console.log(`[Image Generation] DISABLED`);
        }

        let effectiveWebSearchEnabled = webSearchConfig.enabled;
        let openRouterServerTools: Record<string, unknown> = {};

        const openrouterUserId = authenticatedUser.isAnonymous
            ? `chatlima_anon_${authenticatedUser.userId}`
            : `chatlima_user_${authenticatedUser.userId}`;

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

        const webSearchSetup = resolveOpenRouterWebSearchRouteSetup({
            selectedModel,
            webSearchConfig,
            modelInfo: selectedModelInfo,
            apiKeys,
            openrouterUserId,
            getLanguageModelWithKeys,
            createOpenRouterClientWithKey,
            usesTagBasedReasoningExtraction,
            wrapWithTagBasedReasoning,
        });

        const modelInstance = webSearchSetup.modelInstance;
        effectiveWebSearchEnabled = webSearchSetup.effectiveWebSearchEnabled;
        openRouterServerTools = webSearchSetup.openRouterServerTools;
        const modelOptions = webSearchSetup.modelOptions;

        if (webSearchConfig.enabled && webSearchConfig.useAgenticServerTools && Object.keys(openRouterServerTools).length > 0) {
            console.log(`[Web Search] Agentic server tools enabled for ${selectedModel}`);
        } else if (webSearchConfig.enabled && !webSearchConfig.useAgenticServerTools && effectiveWebSearchEnabled) {
            const legacyModelId = ChatWebSearchService.getWebSearchModelId(selectedModel, webSearchConfig)
                .replace("openrouter/", "");
            console.log(`[Web Search] Legacy :online enabled for ${selectedModel} using ${legacyModelId}`);
        } else if (webSearchConfig.enabled && !effectiveWebSearchEnabled) {
            console.log(`[Web Search] Requested for ${selectedModel}, but not supported or unavailable. Using standard model.`);
        } else if (webSearchConfig.enabled && !selectedModel.startsWith("openrouter/")) {
            console.log(`[Web Search] Requested but ${selectedModel} is not an OpenRouter model. Disabling web search for this call.`);
        }

        const allTools = {
            ...baseTools,
            ...openRouterServerTools,
            ...ChatImageGenerationService.buildOpenRouterServerTools(
                imageGenerationConfig,
                apiKeys?.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY
            ),
        };

        const lastUserMessageText = (() => {
            for (let i = messages.length - 1; i >= 0; i--) {
                const msg = messages[i];
                if (msg.role === 'user') {
                    return getUIMessageText(msg);
                }
            }
            return '';
        })();

        const shouldForceImageGenerationTool =
            imageGenerationConfig.enabled &&
            userMessageRequestsImageCreation(lastUserMessageText);

        if (shouldForceImageGenerationTool) {
            console.log(
                `[Image Generation] Forcing image_generation tool on first step for ${selectedModel}`
            );
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

        if (isGoogleModel(selectedModel)) {
            console.log(`[GOOGLE MODEL DETECTED] ${selectedModel} - Will wrap tool input schemas without $schema metadata`);
        }

        const toolsToUse = isGoogleModel(selectedModel) && Object.keys(allTools).length > 0
            ? cleanToolsForGoogleModels(allTools)
            : allTools;

        // Get default parameters and apply preset overrides
        const modelDefaults = getModelDefaults(selectedModelInfo);
        const effectiveTemperature = temperature !== undefined ? temperature : modelDefaults.temperature;
        const effectiveMaxTokens = maxTokens !== undefined ? maxTokens : modelDefaults.maxTokens;
        let effectiveSystemInstruction = systemInstruction !== undefined
            ? sanitizeSystemInstruction(systemInstruction)
            : `You are a helpful AI assistant. Today's date is ${new Date().toISOString().split('T')[0]}.

You have access to external tools provided by connected servers. These tools can perform specific actions like running code, searching databases, or accessing external services.

## File Attachments:
When a user message contains an "[Attached files:]" section with "filepath" and/or "url":
1. Use the \`read_file\` tool to inspect the relevant file(s) before answering questions about file contents.
2. Prefer using the \`filepath\` value when provided; if unavailable, use the file URL.
3. If reading a file fails, clearly explain what failed and what the user can retry.

${webFetchPolicy.enabled ? `
## Native URL Fetch:
When users ask to read, summarize, analyze, or extract information from a URL:
1. Prefer the \`web_fetch\` tool for direct page reading.
2. For messages containing multiple URLs, fetch the first URL unless the user explicitly asks for all.
3. Only use \`siteMode: true\` when the user explicitly asks for whole-site or multi-page crawling.
4. Cite the source URL in your response and mention when content was truncated.
5. If fetching fails, explain the failure and suggest retrying or narrowing scope.
` : ''}

${webSearchConfig.useAgenticServerTools ? `
## Web Search Enabled (Agentic):
You have the \`web_search\` server tool available. Use it when the user needs current information from the web.
1. Only search when fresh information is required
2. Cite sources using markdown links: [domain.com](full-url)
3. Prefer OpenRouter fetch for pages discovered during search; use native \`web_fetch\` for explicit user-provided URLs
` : effectiveWebSearchEnabled ? `
## Web Search Enabled:
You have web search capabilities enabled. When you use web search:
1. Cite your sources using markdown links
2. Use the format [domain.com](full-url) for citations
3. Only cite reliable and relevant sources
4. Integrate the information naturally into your responses
` : ''}

${imageGenerationConfig.enabled ? `
## Image Generation Enabled:
You have the \`image_generation\` server tool available. Use it when the user wants you to create, draw, or generate an image.
1. Call the tool with a detailed visual prompt when image creation is requested or clearly implied
2. After generation, describe what was created and reference the image naturally in your reply
3. If generation fails due to content policy, explain clearly and suggest a revised prompt
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

        let projectContext: Awaited<ReturnType<typeof buildProjectContext>> = null;
        const projectFileUrlByPath = new Map<string, string>();

        try {
            projectContext = await buildProjectContext({
                chatId: id,
                userId: authenticatedUser.userId,
            });

            if (projectContext) {
                for (const file of projectContext.files) {
                    if (file.filepath && file.url) {
                        projectFileUrlByPath.set(file.filepath, file.url);
                    }
                }
                effectiveSystemInstruction = `${effectiveSystemInstruction}\n\n${formatProjectContextForSystemPrompt(projectContext)}`;
            }
        } catch (projectContextError) {
            console.warn(`[Chat ${id}] Failed to build project context:`, projectContextError);
        }

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

        const streamFinishGate = createStreamFinishGate();
        const streamFinishState = {
            tokenUsageData: null as any,
            messagesSavedSuccessfully: false,
            savedAssistantPartCount: 0,
            actualMessageId: undefined as string | undefined,
            finalAssistantMessageId: nanoid(),
            uiResponseMessage: null as UIMessage | null,
            streamFinishEvent: null as any,
            streamFinishResponse: null as OpenRouterResponse | null,
        };

        let persistInFlight: Promise<void> = Promise.resolve();

        const persistAssistantMessages = async (
            source: 'ui' | 'stream',
            responseMessage?: UIMessage,
        ) => {
            const runPersist = async () => {
            const uiMsg = responseMessage ?? streamFinishState.uiResponseMessage;
            const event = streamFinishState.streamFinishEvent;
            const response = streamFinishState.streamFinishResponse;

            if (!uiMsg?.parts?.length && !event?.text) {
                return;
            }

            try {
                const clientMessages = messages as UIMessage[];
                const trailingAssistant = clientMessages[clientMessages.length - 1];
                const historyMessages =
                    trailingAssistant?.role === 'assistant'
                        ? clientMessages.slice(0, -1)
                        : clientMessages;

                const responseAssistantId = response?.messages
                    ?.filter((m: { role?: string }) => m.role === 'assistant')
                    .pop()?.id;

                const assistantMessage = buildAssistantMessageForPersistence({
                    clientMessages,
                    uiResponseMessage: uiMsg ?? null,
                    streamText: event?.text || '',
                    reasoningText: event?.reasoningText,
                    responseAssistantId,
                });

                if (streamFinishState.messagesSavedSuccessfully) {
                    const newCount = countPersistableDisplayParts(assistantMessage.parts);
                    if (newCount <= streamFinishState.savedAssistantPartCount) {
                        return;
                    }
                }

                const webSearchInvocationCount = event
                    ? ChatWebSearchService.resolveWebSearchInvocationCount({
                        steps: event.steps,
                        usage: event.usage,
                    })
                    : 0;
                const webSearchWasUsed = event
                    ? ChatWebSearchService.messageUsedWebSearch({
                        steps: event.steps,
                        usage: event.usage,
                        hasCitationAnnotations: (response?.annotations?.length || 0) > 0,
                    })
                    : false;

                const imageUrlsFromStream = extractGeneratedImageUrlsFromStreamEvent(
                    event,
                    response
                );
                const imageGenerationWasUsed =
                    imageGenerationConfig.enabled &&
                    (ChatImageGenerationService.countImageGenerationInvocations(event?.steps) > 0 ||
                        imageUrlsFromStream.length > 0);

                const processedMessages = processMessagesForPersistence({
                    historyMessages,
                    assistantMessage,
                    annotations: response?.annotations,
                    webSearch: {
                        useAgenticServerTools: webSearchConfig.useAgenticServerTools,
                        enabled: effectiveWebSearchEnabled,
                        wasUsed: webSearchWasUsed,
                        invocationCount: webSearchInvocationCount,
                    },
                    imageGeneration: imageGenerationConfig.enabled
                        ? {
                              enabled: true,
                              wasUsed: imageGenerationWasUsed,
                              imageUrls: imageUrlsFromStream,
                          }
                        : undefined,
                });

                const processedAssistant = processedMessages.find((m) => m.role === 'assistant');
                if (processedAssistant && source === 'ui') {
                    streamFinishState.uiResponseMessage = processedAssistant;
                }

                const logTag = source === 'ui' ? 'uiOnFinish' : 'onFinish';
                console.log(`[Chat ${id}][${logTag}] Persisting assistant parts:`, {
                    partTypes:
                        processedMessages
                            .find((m) => m.role === 'assistant')
                            ?.parts?.map((p) => p.type) ?? [],
                    partCount:
                        processedMessages.find((m) => m.role === 'assistant')?.parts?.length ?? 0,
                });

                const dbMessages = (convertToDBMessages(processedMessages as any, id) as any[]).map(msg => ({
                    ...msg,
                    hasWebSearch: effectiveWebSearchEnabled && msg.role === 'assistant' && (
                        webSearchConfig.useAgenticServerTools
                            ? webSearchWasUsed
                            : (response?.annotations?.length || 0) > 0
                    ),
                    webSearchContextSize: webSearchConfig.enabled ? webSearchConfig.contextSize : undefined
                }));

                const savedAssistant = dbMessages.find(msg => msg.role === 'assistant');
                streamFinishState.finalAssistantMessageId =
                    savedAssistant?.id ||
                    response?.messages?.filter((m: { role?: string }) => m.role === 'assistant').pop()?.id ||
                    streamFinishState.finalAssistantMessageId;

                await saveMessages({ messages: dbMessages });
                streamFinishState.messagesSavedSuccessfully = true;
                streamFinishState.savedAssistantPartCount = countPersistableDisplayParts(
                    processedAssistant?.parts ?? assistantMessage.parts
                );
                console.log(`[Chat ${id}][${logTag}] Successfully saved messages.`);

                await saveChat({
                    id,
                    userId: authenticatedUser.userId,
                    messages: processedMessages as any,
                    selectedModel,
                    apiKeys,
                    isAnonymous: authenticatedUser.isAnonymous,
                    titleGenerationPromise,
                });

                try {
                    const savedMessages = await db.query.messages.findMany({
                        where: eq(messagesTable.chatId, id),
                        orderBy: [messagesTable.createdAt]
                    });
                    const assistantRow = savedMessages.find(msg => msg.role === 'assistant');
                    if (assistantRow) {
                        streamFinishState.actualMessageId = assistantRow.id;
                    }
                } catch (msgQueryError) {
                    console.warn(`[Chat ${id}][${logTag}] Could not query actual message ID:`, msgQueryError);
                }
            } catch (persistError: any) {
                const logTag = source === 'ui' ? 'uiOnFinish' : 'onFinish';
                console.error(`[Chat ${id}][${logTag}] Failed to persist messages:`, persistError);
            }
            };

            persistInFlight = persistInFlight.then(runPersist, runPersist);
            await persistInFlight;
        };

        const trackTokenUsageFromStreamFinish = async (event: any, response: OpenRouterResponse) => {
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

            if (completionTokens <= 0) {
                return;
            }

            let polarCustomerId: string | undefined;
            try {
                const session = await auth.api.getSession({ headers: req.headers });
                polarCustomerId = (session?.user as any)?.polarCustomerId ||
                    (session?.user as any)?.metadata?.polarCustomerId;
            } catch (error) {
                console.warn('Failed to get session for Polar customer ID:', error);
            }

            let isAnonymous = authenticatedUser.isAnonymous;
            try {
                const session = await auth.api.getSession({ headers: req.headers });
                isAnonymous = (session?.user as any)?.isAnonymous === true;
            } catch {
                // keep default
            }

            const callbackIsUsingOwnApiKeys = checkIfUsingOwnApiKeys(selectedModel, apiKeys);
            let callbackActualCredits: number | null = null;
            if (!isAnonymous && authenticatedUser.userId) {
                try {
                    callbackActualCredits = await getCachedCreditsByExternal(authenticatedUser.userId);
                } catch (error) {
                    logDiagnostic('LEGACY_TOKEN_TRACKING_WARNING', `Error getting actual credits in onFinish`, {
                        requestId,
                        userId: authenticatedUser.userId,
                        error: error instanceof Error ? error.message : String(error),
                    });
                }
            }

            const isFreeModel = selectedModel.endsWith(':free');
            let shouldDeductCredits = false;
            if (!isAnonymous && !callbackIsUsingOwnApiKeys && !isFreeModel && callbackActualCredits !== null && callbackActualCredits > 0) {
                shouldDeductCredits = true;
            }

            let additionalCost = 0;
            if (shouldDeductCredits) {
                additionalCost =
                    ChatWebSearchService.computeWebSearchCreditCost({
                        webSearchEnabled: webSearchConfig.enabled,
                        useAgenticServerTools: webSearchConfig.useAgenticServerTools,
                        isUsingOwnApiKeys: callbackIsUsingOwnApiKeys,
                        shouldDeductCredits,
                        steps: event.steps,
                        usage: event.usage,
                        hasCitationAnnotations: (response.annotations?.length || 0) > 0,
                    }) +
                    ChatImageGenerationService.computeImageGenerationCreditCost({
                        imageGenerationEnabled: imageGenerationConfig.enabled,
                        isUsingOwnApiKeys: callbackIsUsingOwnApiKeys,
                        shouldDeductCredits,
                        model: imageGenerationConfig.model,
                        steps: event.steps,
                    });
            }

            const tokenUsageData = streamFinishState.tokenUsageData;
            const extractedInputTokens = extractInputTokensFromEvent(event);
            const finalInputTokens = tokenUsageData?.inputTokens || extractedInputTokens;
            const finalOutputTokens = tokenUsageData?.outputTokens || completionTokens;
            const openrouterApiKey = apiKeys?.['OPENROUTER_API_KEY'] || process.env.OPENROUTER_API_KEY;

            import('@/lib/services/costReconciliation').then(async ({ CostReconciliationService }) => {
                try {
                    await CostReconciliationService.reconcileRecentMissingActualCosts({
                        limit: 3,
                        maxAgeHours: 48,
                        apiKeyOverride: openrouterApiKey,
                    });
                } catch {
                    // Swallow errors silently
                }
            });

            await DirectTokenTrackingService.processTokenUsage({
                userId: authenticatedUser.userId,
                chatId: id,
                // Chat messages are replaced during post-stream persistence upgrades
                // (text-only -> full UI parts). Keep usage scoped to the chat so
                // those message deletes do not cascade-delete token metrics.
                messageId: undefined,
                modelId: selectedModel,
                provider: selectedModel.split('/')[0],
                inputTokens: finalInputTokens,
                outputTokens: finalOutputTokens,
                generationId: typedResponse.id || typedResponse.generation_id || typedResponse.generationId || undefined,
                openRouterResponse: typedResponse,
                providerResponse: typedResponse,
                apiKeyOverride: openrouterApiKey,
                processingTimeMs: Date.now() - requestStartTime,
                timeToFirstTokenMs: timeToFirstTokenMs ?? undefined,
                tokensPerSecond: tokensPerSecond ?? undefined,
                streamingStartTime: streamingStartTime ?? undefined,
                polarCustomerId,
                completionTokens,
                isAnonymous,
                shouldDeductCredits,
                additionalCost,
                modelInfo: modelValidation.modelInfo ?? undefined,
            });
        };

        const handleUiStreamFinish = async (responseMessage: UIMessage) => {
            streamFinishState.uiResponseMessage = responseMessage;
            await persistAssistantMessages('ui', responseMessage);
        };

        const handleStreamTextFinishReady = (event: any, response: OpenRouterResponse) => {
            streamFinishState.streamFinishEvent = event;
            streamFinishState.streamFinishResponse = response;
            streamFinishGate.notify(event, response);
        };

        const finalizeStreamPersistence = async () => {
            if (!streamFinishState.streamFinishEvent || !streamFinishState.streamFinishResponse) {
                return;
            }

            // UI onFinish usually follows with MCP tool-* parts; brief wait avoids text-only saves
            for (let i = 0; i < 30 && !streamFinishState.uiResponseMessage; i++) {
                await new Promise((resolve) => setTimeout(resolve, 200));
            }

            if (streamFinishState.messagesSavedSuccessfully) {
                if (streamFinishState.uiResponseMessage) {
                    await persistAssistantMessages('stream', streamFinishState.uiResponseMessage);
                }
                return;
            }

            await persistAssistantMessages('stream', streamFinishState.uiResponseMessage ?? undefined);
        };

        // 17. Set up streaming payload
        const openRouterPayload = {
            model: modelInstance as LanguageModel,
            abortSignal: streamAbortController.signal,
            system: effectiveSystemInstruction,
            temperature: effectiveTemperature,
            maxOutputTokens: effectiveMaxTokens,
            messages: formattedMessages,
            tools: toolsToUse,
            ...(shouldForceImageGenerationTool
                ? {
                      prepareStep: async ({ stepNumber }: { stepNumber: number }) => {
                          if (stepNumber === 0) {
                              return {
                                  toolChoice: {
                                      type: 'tool' as const,
                                      toolName: 'image_generation' as any,
                                  },
                              };
                          }
                          return {};
                      },
                  }
                : {}),
            stopWhen: stepCountIs(20),
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
                console.log(`[Chat ${id}][onFinish] Stream finished, computing usage...`);

                let tokenUsageData: any = null;

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

                    handleStreamTextFinishReady(event, response);
                    streamFinishState.finalAssistantMessageId =
                        response.messages?.filter((m: { role?: string }) => m.role === 'assistant').pop()?.id ||
                        streamFinishState.finalAssistantMessageId;

                    const typedResponse = response as any;
                    const provider = selectedModel.split('/')[0];

                    try {
                        logDiagnostic('TOKEN_TRACKING_START', `Starting detailed token tracking`, {
                            requestId,
                            userId: authenticatedUser.userId,
                            chatId: id,
                            messageId: streamFinishState.finalAssistantMessageId,
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
                                    const messageContentLength = getUIMessageText(message).length;

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

                        streamFinishState.tokenUsageData = tokenUsageData;

                        // Do not await persistence or billing here — streamText onFinish blocks
                        // stream closure, and useChat stays in "streaming" until the HTTP body closes.
                        void (async () => {
                            try {
                                await finalizeStreamPersistence();
                            } catch (persistError) {
                                console.error(`[Chat ${id}][onFinish] Failed stream persistence:`, persistError);
                            }

                            try {
                                await trackTokenUsageFromStreamFinish(event, response);
                            } catch (tokenError) {
                                console.error(`[Chat ${id}][onFinish] Failed token tracking:`, tokenError);
                            }
                        })();

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
            }
        };

        console.log(`[Chat ${id}] Using model: ${selectedModel}, effectiveWebSearchEnabled: ${webSearchConfig.enabled}`);
        console.log(`[Chat ${id}] OpenRouter user tracking: ${authenticatedUser.isAnonymous ? `chatlima_anon_${authenticatedUser.userId}` : `chatlima_user_${authenticatedUser.userId}`}`);

        const result = streamText(openRouterPayload);
        startBackgroundStreamConsumption(result, id);

        return result.toUIMessageStreamResponse({
            originalMessages: messages,
            sendReasoning: true,
            onFinish: ({ responseMessage }) => {
                void handleUiStreamFinish(responseMessage).catch((err) => {
                    console.error(`[Chat ${id}][uiOnFinish] Unhandled error:`, err);
                });
            },
            onError: (error: unknown) => {
                const err = error as any;
                console.error(`[API Error][Chat ${id}] Error in stream processing:`, {
                    error: err,
                    message: err?.message,
                    stack: err?.stack,
                    responseBody: err?.responseBody,
                    name: err?.name,
                    cause: err?.cause,
                });

                if (err?.name === 'AI_TypeValidationError') {
                    let errorMessage = "The AI provider returned an unexpected response format. Please try again.";
                    if (err?.value?.error?.message) {
                        errorMessage = `API Error: ${err.value.error.message}`;
                    }
                    return JSON.stringify({ error: { code: "PROVIDER_ERROR", message: errorMessage, details: "Type validation error" } });
                }

                let errorCode = "STREAM_ERROR";
                let errorMessage = "An error occurred while processing your request.";
                const errorDetails: any = {};

                // Try to extract error details from various sources
                if (err?.message) {
                    errorDetails.rawMessage = err.message;
                }

                if (err?.cause) {
                    errorDetails.cause = err.cause;
                }

                if (err && typeof err.responseBody === 'string') {
                    try {
                        const parsedBody = JSON.parse(err.responseBody);
                        errorDetails.responseBody = parsedBody;
                        if (parsedBody.error && typeof parsedBody.error.message === 'string') {
                            errorMessage = parsedBody.error.message;
                            if (parsedBody.error.code) {
                                errorCode = String(parsedBody.error.code);
                            }
                        }
                    } catch (e) {
                        console.warn(`[API Error][Chat ${id}] Failed to parse error.responseBody`);
                        errorDetails.responseBody = err.responseBody;
                    }
                }

                // Check if error has standard properties
                if (err?.code) {
                    errorCode = String(err.code);
                }

                // Use error message if available
                if (err?.message && !errorDetails.responseBody) {
                    errorMessage = err.message;
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

        if (error instanceof ChatAuthenticationError) {
            return createErrorResponse(error.code, error.message, error.status);
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

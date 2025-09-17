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

// Import our extracted services
import { AuthService } from '@/lib/services/authService';
import { CreditService } from '@/lib/services/creditService';
import { UsageLimitsService as NewUsageLimitsService } from '@/lib/services/usageLimitsService';
import { MessageProcessingService } from '@/lib/services/messageProcessingService';
import { MCPService, type MCPServerConfig } from '@/lib/services/mcpService';
import { WebSearchService, type WebSearchOptions } from '@/lib/services/webSearchService';
import { ErrorHandlerService } from '@/lib/services/errorHandlerService';

// Use optimized logging - only logs in development and uses efficient patterns
const logDiagnostic = originalLogDiagnostic;

// Allow streaming responses up to 300 seconds on Hobby plan
export const maxDuration = 300;

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
}

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
        chatId,
        selectedModel,
        messageCount: messages.length,
        hasAttachments: attachments.length > 0,
        hasMcpServers: initialMcpServers.length > 0,
        webSearchEnabled: webSearch.enabled
    });

    try {
        // 1. AUTHENTICATION - Use AuthService
        const authResult = await AuthService.getFullSession(req);
        if (!authResult.session || !authResult.userId) {
            logDiagnostic('AUTH_FAILED', `Authentication failed - no session`, { requestId });
            return ErrorHandlerService.createAuthError();
        }

        const { userId, isAnonymous, polarCustomerId, openRouterUserId } = authResult;
        logDiagnostic('AUTH_SUCCESS', `Authentication successful`, {
            requestId,
            userId,
            isAnonymous
        });

        // 2. PARAMETER VALIDATION
        const validationErrors: string[] = [];

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            validationErrors.push("Messages array is required and must not be empty");
        }

        if (!selectedModel || typeof selectedModel !== 'string') {
            validationErrors.push("Selected model is required and must be a string");
        }

        if (validationErrors.length > 0) {
            logDiagnostic('VALIDATION_FAILED', `Parameter validation failed`, {
                requestId,
                errors: validationErrors
            });
            return ErrorHandlerService.createValidationError(validationErrors.join(', '));
        }

        // 3. MODEL INFORMATION
        const selectedModelInfo = await getModelDetails(selectedModel);
        if (!selectedModelInfo) {
            logDiagnostic('MODEL_NOT_FOUND', `Model not found`, {
                requestId,
                selectedModel
            });
            return ErrorHandlerService.createErrorResponse(
                "MODEL_NOT_FOUND",
                `Model '${selectedModel}' not found`,
                400
            );
        }

        // 4. CREDIT CHECKING - Use CreditService
        const creditResult = await CreditService.checkCredits({
            selectedModel,
            apiKeys,
            estimatedTokens: 30, // Conservative estimation for initial check
            userId,
            isAnonymous,
            polarCustomerId,
            modelInfo: selectedModelInfo
        });

        if (!creditResult.hasCredits) {
            logDiagnostic('INSUFFICIENT_CREDITS', `Insufficient credits`, {
                requestId,
                actualCredits: creditResult.actualCredits,
                isUsingOwnApiKeys: creditResult.isUsingOwnApiKeys,
                isFreeModel: creditResult.isFreeModel
            });
            return ErrorHandlerService.createCreditError(
                `Insufficient credits. Available: ${creditResult.actualCredits || 0}`,
                `Required credits for model ${selectedModel}`
            );
        }

        // 5. USAGE LIMITS CHECKING - Use UsageLimitsService
        const usageLimitsResult = await NewUsageLimitsService.shouldBlockUser(userId);

        if (usageLimitsResult.shouldBlock) {
            logDiagnostic('USAGE_LIMIT_EXCEEDED', `Usage limit exceeded`, {
                requestId,
                reason: usageLimitsResult.reason
            });
            return ErrorHandlerService.createUsageLimitError(
                usageLimitsResult.reason || 'Usage limit exceeded'
            );
        }

        // 6. MESSAGE PROCESSING - Use MessageProcessingService
        const processedMessagesResult = await MessageProcessingService.processMessagesWithAttachments(
            messages,
            attachments,
            selectedModelInfo,
            selectedModel
        );
        const processedMessages = processedMessagesResult.messages;

        // 7. MCP SERVER INITIALIZATION - Use MCPService
        const mcpResult = await MCPService.initializeMCPServers(
            initialMcpServers,
            req.signal
        );

        // 8. WEB SEARCH VALIDATION - Use WebSearchService
        const webSearchResult = WebSearchService.validateWebSearch(
            webSearch,
            creditResult.hasCredits,
            creditResult.isUsingOwnApiKeys,
            isAnonymous,
            selectedModel,
            selectedModelInfo?.supportsWebSearch || false
        );

        if (!webSearchResult.shouldEnable && webSearchResult.reason) {
            return ErrorHandlerService.createWebSearchError(webSearchResult.reason);
        }

        // 9. MODEL INSTANCE CREATION
        const modelInstance = getLanguageModelWithKeys(selectedModel, apiKeys);
        const effectiveWebSearchEnabled = webSearchResult.shouldEnable;

        // 10. PRESET PARAMETER VALIDATION
        const modelDefaults = getModelDefaults(selectedModelInfo);
        const validatedParams = validatePresetParameters(
            selectedModelInfo,
            temperature ?? modelDefaults.temperature,
            maxTokens ?? modelDefaults.maxTokens,
            systemInstruction ? sanitizeSystemInstruction(systemInstruction) : modelDefaults.systemInstruction
        );

        if (validatedParams.errors.length > 0) {
            logDiagnostic('PARAMETER_VALIDATION_FAILED', `Parameter validation failed`, {
                requestId,
                errors: validatedParams.errors
            });
            return ErrorHandlerService.createValidationError(validatedParams.errors.join(', '));
        }

        // 11. CONVERT MESSAGES TO OPENROUTER FORMAT
        const modelMessages = MessageProcessingService.convertToOpenRouterFormat(processedMessages);

        // 12. MODEL OPTIONS
        const modelOptions = effectiveWebSearchEnabled ? {
            web_search_options: {
                search_context_size: webSearchResult.config.contextSize
            }
        } : {};

        // 13. STREAMING CONFIGURATION
        const id = nanoid();
        const streamingConfig = {
            model: modelInstance,
            messages: modelMessages,
            tools: mcpResult.tools,
            maxTokens: maxTokens ?? modelDefaults.maxTokens,
            temperature: temperature ?? modelDefaults.temperature,
            system: systemInstruction ? sanitizeSystemInstruction(systemInstruction) : modelDefaults.systemInstruction,
            ...modelOptions,
            onChunk: async (chunk: any) => {
                try {
                    if (!firstTokenTime) {
                        firstTokenTime = Date.now();
                        timeToFirstTokenMs = firstTokenTime - requestStartTime;
                        streamingStartTime = new Date();
                        logDiagnostic('FIRST_TOKEN_RECEIVED', `First token received`, {
                            requestId,
                            timeToFirstTokenMs,
                            streamingStartTime: streamingStartTime.toISOString()
                        });
                    }

                    // Calculate tokens per second
                    if (streamingStartTime && chunk.text) {
                        const elapsedSeconds = (Date.now() - streamingStartTime.getTime()) / 1000;
                        const tokenCount = chunk.text.length / 4; // Rough estimation
                        tokensPerSecond = tokenCount / elapsedSeconds;
                    }

                    logChunk(chatId || 'unknown', chunk, firstTokenTime, requestId);
                } catch (error) {
                    logError('CHUNK_PROCESSING_ERROR', error, requestId);
                }
            },
            onStop: async (reason: string) => {
                try {
                    logDiagnostic('STREAM_STOPPED', `Stream stopped`, {
                        requestId,
                        reason,
                        timeToFirstTokenMs,
                        tokensPerSecond
                    });

                    // Track token usage
                    if (firstTokenTime && streamingStartTime) {
                        const totalTime = Date.now() - requestStartTime;
                        const streamingTime = Date.now() - streamingStartTime.getTime();

                        await TokenTrackingService.trackTokenUsage({
                            userId,
                            chatId: chatId || 'unknown',
                            messageId: id,
                            modelId: selectedModel,
                            provider: selectedModel.split('/')[0],
                            tokenUsage: {
                                inputTokens: 0,
                                outputTokens: 0,
                                totalTokens: 0
                            },
                            timeToFirstTokenMs: timeToFirstTokenMs || undefined,
                            tokensPerSecond: tokensPerSecond || undefined,
                            streamingStartTime: streamingStartTime
                        });
                    }
                } catch (error) {
                    logError('ON_STOP_ERROR', error, requestId);
                }
            },
            onFinish: async (result: any) => {
                try {
                    logDiagnostic('STREAM_FINISHED', `Stream finished`, {
                        requestId,
                        finishReason: result.finishReason,
                        usage: result.usage
                    });

                    // Save chat and messages
                    if (chatId) {
                        await saveMessages({
                            messages: convertToDBMessages([...processedMessages, {
                                id,
                                role: 'assistant',
                                content: result.text
                            }], chatId)
                        });
                    } else {
                        const newChatId = nanoid();
                        await saveChat({
                            id: newChatId,
                            userId,
                            title: processedMessages[0]?.content?.substring(0, 50) || 'New Chat'
                        });
                        await saveMessages({
                            messages: convertToDBMessages([...processedMessages, {
                                id,
                                role: 'assistant',
                                content: result.text
                            }], newChatId)
                        });
                    }

                    // Log performance metrics
                    logPerformanceMetrics(requestId, {
                        requestStartTime,
                        firstTokenTime,
                        timeToFirstTokenMs
                    });
                } catch (error) {
                    logError('ON_FINISH_ERROR', error, requestId);
                }
            }
        };

        // 14. INCREMENT DAILY USAGE
        await NewUsageLimitsService.incrementDailyUsage(userId, isAnonymous);

        // 15. START STREAMING
        logDiagnostic('STREAMING_START', `Starting stream`, {
            requestId,
            selectedModel,
            messageCount: modelMessages.length,
            hasTools: Object.keys(mcpResult.tools).length > 0,
            webSearchEnabled: webSearchResult.shouldEnable
        });

        const result = await streamText(streamingConfig);

        logRequestBoundary('END', requestId, {
            totalTime: Date.now() - requestStartTime,
            timeToFirstTokenMs,
            tokensPerSecond
        });

        return result.toDataStreamResponse();

    } catch (error) {
        logError('TOP_LEVEL_ERROR', error, requestId);

        return ErrorHandlerService.createInternalError(
            'An unexpected error occurred while processing your request',
            error instanceof Error ? error.message : String(error)
        );
    }
}

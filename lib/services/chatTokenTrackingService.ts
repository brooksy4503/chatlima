import { DirectTokenTrackingService } from '@/lib/services/directTokenTracking';
import { logDiagnostic } from '@/lib/utils/performantLogging';
import type { LanguageModelResponseMetadata } from 'ai';

// Define the extended response type used in the original route
interface OpenRouterResponse extends LanguageModelResponseMetadata {
    readonly messages: any[];
    annotations?: any[];
    body?: unknown;
    usage?: {
        promptTokens?: number;
        completionTokens?: number;
        totalTokens?: number;
        inputTokens?: number;
        outputTokens?: number;
        prompt_tokens?: number;
        completion_tokens?: number;
    };
}

export interface TokenTrackingContext {
    userId: string;
    chatId: string;
    messageId?: string;
    selectedModel: string;
    provider: string;
    polarCustomerId?: string;
    isAnonymous: boolean;
    isUsingOwnApiKeys: boolean;
    shouldDeductCredits: boolean;
    webSearchEnabled: boolean;
    webSearchCost: number;
    apiKeys?: Record<string, string>;
}

export interface TokenTrackingResult {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCost: number;
    actualCost?: number;
    processingTimeMs: number;
    timeToFirstTokenMs?: number;
    tokensPerSecond?: number;
    streamingStartTime?: Date;
}

export class ChatTokenTrackingService {
    /**
     * Processes token tracking for a completed chat request
     */
    static async processTokenTracking(
        context: TokenTrackingContext,
        response: OpenRouterResponse,
        event: any,
        requestStartTime: number,
        timeToFirstTokenMs?: number,
        streamingStartTime?: Date
    ): Promise<TokenTrackingResult> {
        const {
            userId,
            chatId,
            messageId,
            selectedModel,
            provider,
            polarCustomerId,
            isAnonymous,
            isUsingOwnApiKeys,
            shouldDeductCredits,
            webSearchEnabled,
            webSearchCost,
            apiKeys
        } = context;

        const requestId = `token_track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        logDiagnostic('TOKEN_TRACKING_PROCESS_START', 'Starting token tracking process', {
            requestId,
            userId,
            chatId,
            messageId,
            provider,
            isAnonymous,
            shouldDeductCredits
        });

        try {
            // Extract token usage from response
            const tokenUsage = this.extractTokenUsage(response, event, requestId);

            // Calculate processing time
            const processingTimeMs = Date.now() - requestStartTime;

            // Calculate tokens per second if we have timing data
            let tokensPerSecond: number | undefined;
            if (timeToFirstTokenMs !== undefined && tokenUsage.outputTokens > 0 && processingTimeMs > 0) {
                const generationTimeMs = processingTimeMs - timeToFirstTokenMs;
                if (generationTimeMs > 0) {
                    tokensPerSecond = (tokenUsage.outputTokens / (generationTimeMs / 1000));
                }
            }

            // Calculate additional cost for web search
            const additionalCost = webSearchEnabled && !isUsingOwnApiKeys && shouldDeductCredits ? webSearchCost : 0;

            // Process token tracking with DirectTokenTrackingService
            await DirectTokenTrackingService.processTokenUsage({
                userId,
                chatId,
                messageId,
                modelId: selectedModel,
                provider,
                inputTokens: tokenUsage.inputTokens,
                outputTokens: tokenUsage.outputTokens,
                generationId: this.extractGenerationId(response, provider),
                openRouterResponse: response,
                providerResponse: response,
                apiKeyOverride: apiKeys?.['OPENROUTER_API_KEY'],
                processingTimeMs,
                timeToFirstTokenMs: timeToFirstTokenMs ?? undefined,
                tokensPerSecond: tokensPerSecond ?? undefined,
                streamingStartTime: streamingStartTime ?? undefined,
                polarCustomerId,
                completionTokens: tokenUsage.outputTokens,
                isAnonymous,
                shouldDeductCredits,
                additionalCost
            });

            const result: TokenTrackingResult = {
                inputTokens: tokenUsage.inputTokens,
                outputTokens: tokenUsage.outputTokens,
                totalTokens: tokenUsage.totalTokens,
                estimatedCost: 0, // Cost calculation is handled internally by DirectTokenTrackingService
                actualCost: undefined, // Will be updated asynchronously if available
                processingTimeMs,
                timeToFirstTokenMs,
                tokensPerSecond,
                streamingStartTime
            };

            logDiagnostic('TOKEN_TRACKING_PROCESS_COMPLETE', 'Token tracking process completed', {
                requestId,
                userId,
                inputTokens: result.inputTokens,
                outputTokens: result.outputTokens,
                estimatedCost: result.estimatedCost,
                actualCost: result.actualCost,
                processingTimeMs: result.processingTimeMs
            });

            return result;

        } catch (error) {
            logDiagnostic('TOKEN_TRACKING_PROCESS_ERROR', 'Error in token tracking process', {
                requestId,
                userId,
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * Extracts token usage from response and event data
     */
    private static extractTokenUsage(
        response: OpenRouterResponse,
        event: any,
        requestId: string
    ): { inputTokens: number; outputTokens: number; totalTokens: number } {
        // Try to extract from event first (AI SDK format)
        let inputTokens = 0;
        let outputTokens = 0;

        if (event?.usage) {
            inputTokens = event.usage.promptTokens || event.usage.inputTokens || event.usage.prompt_tokens || 0;
            outputTokens = event.usage.completionTokens || event.usage.outputTokens || event.usage.completion_tokens || 0;
        } else if (response?.usage) {
            inputTokens = response.usage.promptTokens || response.usage.inputTokens || response.usage.prompt_tokens || 0;
            outputTokens = response.usage.completionTokens || response.usage.outputTokens || response.usage.completion_tokens || 0;
        }

        // If input tokens are missing, try to extract from event using the helper function
        if (inputTokens === 0) {
            inputTokens = this.extractInputTokensFromEvent(event);
        }

        // If output tokens are still missing, estimate from response content
        if (outputTokens === 0) {
            outputTokens = this.estimateOutputTokens(response, event);
        }

        const totalTokens = inputTokens + outputTokens;

        logDiagnostic('TOKEN_EXTRACTION', 'Token usage extracted', {
            requestId,
            inputTokens,
            outputTokens,
            totalTokens,
            source: event?.usage ? 'event' : (response as any)?.usage ? 'response' : 'estimated'
        });

        return { inputTokens, outputTokens, totalTokens };
    }

    /**
     * Extracts input tokens from event data (copied from original route)
     */
    private static extractInputTokensFromEvent(event: any): number {
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

        // Try event.usage first (AI SDK format)
        let tokens = 0;
        if (event.usage) {
            if (isValidToken(event.usage.promptTokens)) {
                tokens = event.usage.promptTokens;
            } else if (isValidToken(event.usage.inputTokens)) {
                tokens = event.usage.inputTokens;
            } else if (isValidToken(event.usage.prompt_tokens)) {
                tokens = event.usage.prompt_tokens;
            } else if (isValidToken(event.usage.input_tokens)) {
                tokens = event.usage.input_tokens;
            }
        }

        // Try event.response.usage (common in streaming responses)
        if (tokens === 0 && event.response?.usage) {
            if (isValidToken(event.response.usage.promptTokens)) {
                tokens = event.response.usage.promptTokens;
            } else if (isValidToken(event.response.usage.inputTokens)) {
                tokens = event.response.usage.inputTokens;
            } else if (isValidToken(event.response.usage.prompt_tokens)) {
                tokens = event.response.usage.prompt_tokens;
            } else if (isValidToken(event.response.usage.input_tokens)) {
                tokens = event.response.usage.input_tokens;
            }
        }

        // Try root level on event
        if (tokens === 0) {
            if (isValidToken(event.promptTokens)) {
                tokens = event.promptTokens;
            } else if (isValidToken(event.inputTokens)) {
                tokens = event.inputTokens;
            }
        }

        console.log(`[DEBUG] Extracted input tokens: ${tokens}`);
        return tokens;
    }

    /**
     * Estimates output tokens from response content when not provided
     */
    private static estimateOutputTokens(response: OpenRouterResponse, event: any): number {
        // Try to get content from various possible locations
        let content = '';

        // Check response messages
        const responseMessages = (response as any)?.messages;
        if (responseMessages && responseMessages.length > 0) {
            const lastMessage = responseMessages[responseMessages.length - 1];
            if (lastMessage?.content) {
                if (typeof lastMessage.content === 'string') {
                    content = lastMessage.content;
                } else if (Array.isArray(lastMessage.content)) {
                    // Handle structured content (Google models)
                    content = lastMessage.content
                        .filter((part: any) => part.type === 'text')
                        .map((part: any) => part.text || '')
                        .join('');
                }
            }
        }

        // Check event content as fallback
        if (!content && event?.text) {
            content = event.text;
        }

        if (!content) {
            return 1; // Minimum fallback
        }

        // Rough estimation: ~4 characters per token
        return Math.ceil(content.length / 4);
    }

    /**
     * Extracts generation ID from response for cost tracking
     */
    private static extractGenerationId(response: LanguageModelResponseMetadata, provider: string): string | undefined {
        if (provider === 'openrouter') {
            const typedResponse = response as any;
            return typedResponse.id || typedResponse.generation_id || typedResponse.generationId;
        }
        return undefined;
    }

    /**
     * Processes token tracking for stopped streams
     */
    static async processStoppedStreamTokenTracking(
        context: TokenTrackingContext,
        currentText: string,
        requestStartTime: number,
        timeToFirstTokenMs?: number,
        streamingStartTime?: Date
    ): Promise<TokenTrackingResult> {
        const { userId, chatId, selectedModel, provider, isUsingOwnApiKeys, shouldDeductCredits, webSearchEnabled, webSearchCost } = context;

        const requestId = `stopped_track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        logDiagnostic('STOPPED_STREAM_TRACKING_START', 'Processing token tracking for stopped stream', {
            requestId,
            userId,
            chatId,
            textLength: currentText.length
        });

        // Estimate tokens from partial content
        const outputTokens = Math.ceil(currentText.length / 4); // Rough estimate
        const processingTimeMs = Date.now() - requestStartTime;

        // Calculate tokens per second if available
        let tokensPerSecond: number | undefined;
        if (timeToFirstTokenMs !== undefined && outputTokens > 0 && processingTimeMs > 0) {
            const generationTimeMs = processingTimeMs - timeToFirstTokenMs;
            if (generationTimeMs > 0) {
                tokensPerSecond = (outputTokens / (generationTimeMs / 1000));
            }
        }

        // Calculate additional cost for web search
        const additionalCost = webSearchEnabled && !isUsingOwnApiKeys && shouldDeductCredits ? webSearchCost : 0;

        try {
            await DirectTokenTrackingService.processTokenUsage({
                userId,
                chatId,
                modelId: selectedModel,
                provider,
                inputTokens: 0, // Not available in stopped stream
                outputTokens,
                providerResponse: null,
                processingTimeMs,
                timeToFirstTokenMs: timeToFirstTokenMs ?? undefined,
                tokensPerSecond: tokensPerSecond ?? undefined,
                streamingStartTime: streamingStartTime ?? undefined,
                polarCustomerId: context.polarCustomerId,
                completionTokens: outputTokens,
                isAnonymous: context.isAnonymous,
                shouldDeductCredits,
                additionalCost
            });

            const result: TokenTrackingResult = {
                inputTokens: 0,
                outputTokens,
                totalTokens: outputTokens,
                estimatedCost: 0, // Will be calculated by DirectTokenTrackingService
                processingTimeMs,
                timeToFirstTokenMs,
                tokensPerSecond,
                streamingStartTime
            };

            logDiagnostic('STOPPED_STREAM_TRACKING_COMPLETE', 'Stopped stream token tracking completed', {
                requestId,
                userId,
                outputTokens,
                processingTimeMs
            });

            return result;

        } catch (error) {
            logDiagnostic('STOPPED_STREAM_TRACKING_ERROR', 'Error in stopped stream token tracking', {
                requestId,
                userId,
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }
}
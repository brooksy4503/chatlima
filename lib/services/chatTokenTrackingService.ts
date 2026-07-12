import { DirectTokenTrackingService } from '@/lib/services/directTokenTracking';
import { logDiagnostic } from '@/lib/utils/performantLogging';
import type { LanguageModelResponseMetadata } from 'ai';
import { getModelDetails } from '@/lib/models/fetch-models';
import { ModelInfo } from '@/lib/types/models';
import type { TokenUsageSnapshot } from '@/lib/chat/streamTokenUsage';

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
    /** When set, replaces the default web-search-only additional cost calculation. */
    additionalCost?: number;
    apiKeys?: Record<string, string>;
    modelInfo?: ModelInfo; // Model information for variable credit cost calculation
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
     * Processes token tracking for a completed chat request using a pre-resolved snapshot.
     */
    static async processTokenTracking(
        context: TokenTrackingContext,
        tokenUsage: TokenUsageSnapshot,
        response: OpenRouterResponse,
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
            shouldDeductCredits,
            usageSource: tokenUsage.source,
        });

        try {
            const processingTimeMs = Date.now() - requestStartTime;

            let tokensPerSecond: number | undefined;
            if (timeToFirstTokenMs !== undefined && tokenUsage.outputTokens > 0 && processingTimeMs > 0) {
                const generationTimeMs = processingTimeMs - timeToFirstTokenMs;
                if (generationTimeMs > 0) {
                    tokensPerSecond = tokenUsage.outputTokens / (generationTimeMs / 1000);
                }
            }

            const additionalCost =
                context.additionalCost !== undefined
                    ? context.additionalCost
                    : webSearchEnabled && !isUsingOwnApiKeys && shouldDeductCredits
                      ? webSearchCost
                      : 0;

            let modelInfo = context.modelInfo;
            if (!modelInfo && selectedModel) {
                try {
                    modelInfo = (await getModelDetails(selectedModel)) ?? undefined;
                } catch (error) {
                    console.warn(`[ChatTokenTracking] Failed to fetch model info for ${selectedModel}, using default credit cost:`, error);
                }
            }

            await DirectTokenTrackingService.processTokenUsage({
                userId,
                chatId,
                messageId,
                modelId: selectedModel,
                provider,
                inputTokens: tokenUsage.inputTokens,
                outputTokens: tokenUsage.outputTokens,
                usageSource: tokenUsage.source,
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
                additionalCost,
                modelInfo
            });

            const result: TokenTrackingResult = {
                inputTokens: tokenUsage.inputTokens,
                outputTokens: tokenUsage.outputTokens,
                totalTokens: tokenUsage.totalTokens,
                estimatedCost: 0,
                actualCost: undefined,
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
                processingTimeMs: result.processingTimeMs,
                usageSource: tokenUsage.source,
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
     * Extracts generation ID from response for cost tracking
     */
    private static extractGenerationId(response: LanguageModelResponseMetadata, provider: string): string | undefined {
        if (provider === 'openrouter') {
            const typedResponse = response as {
                id?: string;
                generation_id?: string;
                generationId?: string;
                body?: { id?: string; generation_id?: string; generationId?: string };
            };
            const candidates = [
                typedResponse.body?.id,
                typedResponse.body?.generation_id,
                typedResponse.body?.generationId,
                typedResponse.id,
                typedResponse.generation_id,
                typedResponse.generationId,
            ].filter((id): id is string => typeof id === 'string' && id.length > 0);

            // Prefer canonical OpenRouter generation ids when present.
            return candidates.find((id) => id.startsWith('gen-')) || candidates[0];
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

        const outputTokens = Math.ceil(currentText.length / 4);
        const processingTimeMs = Date.now() - requestStartTime;

        let tokensPerSecond: number | undefined;
        if (timeToFirstTokenMs !== undefined && outputTokens > 0 && processingTimeMs > 0) {
            const generationTimeMs = processingTimeMs - timeToFirstTokenMs;
            if (generationTimeMs > 0) {
                tokensPerSecond = outputTokens / (generationTimeMs / 1000);
            }
        }

        const additionalCost = webSearchEnabled && !isUsingOwnApiKeys && shouldDeductCredits ? webSearchCost : 0;

        try {
            await DirectTokenTrackingService.processTokenUsage({
                userId,
                chatId,
                modelId: selectedModel,
                provider,
                inputTokens: 0,
                outputTokens,
                usageSource: 'estimated',
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
                estimatedCost: 0,
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

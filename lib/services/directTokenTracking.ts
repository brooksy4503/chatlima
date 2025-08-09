/**
 * Direct token usage tracking service for Vercel serverless environments
 * Inserts token usage metrics immediately instead of using background processing
 */

import { db } from '@/lib/db';
import { tokenUsageMetrics } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { trackTokenUsage } from '@/lib/tokenCounter';
import { SimplifiedCostCalculationService } from './simplifiedCostCalculation';
import { OpenRouterCostExtractor } from './openRouterCostExtractor';
import { OpenRouterCostTracker } from './openrouterCostTracker';
import { nanoid } from 'nanoid';

interface DirectTokenTrackingParams {
    userId: string;
    chatId: string;
    messageId: string;
    modelId: string;
    provider: string;
    inputTokens: number;
    outputTokens: number;
    generationId?: string;
    openRouterResponse?: any; // Legacy name for backward compatibility
    providerResponse?: any; // New generic response parameter for all providers
    // Timing parameters
    processingTimeMs?: number;
    timeToFirstTokenMs?: number;
    tokensPerSecond?: number;
    streamingStartTime?: Date;
    // Credit tracking parameters
    polarCustomerId?: string;
    completionTokens?: number;
    isAnonymous?: boolean;
    shouldDeductCredits?: boolean;
    additionalCost?: number;
    // For OpenRouter async fetch when the user used their own key
    apiKeyOverride?: string;
}

export class DirectTokenTrackingService {
    /**
     * Process token usage tracking immediately (for Vercel serverless)
     * This runs synchronously before the HTTP response is sent
     */
    static async processTokenUsage(params: DirectTokenTrackingParams): Promise<void> {
        const startTime = Date.now();

        try {
            console.log(`[DirectTokenTracking] Processing token usage for user ${params.userId}, chat ${params.chatId}, provider ${params.provider}`);

            // Use the already-extracted input tokens (extracted correctly in chat API for all providers)
            // Only try to re-extract if the passed tokens are 0 or missing
            const extractedInputTokens = params.inputTokens > 0 ?
                params.inputTokens :
                this.extractInputTokensFromResponse(
                    params.providerResponse || params.openRouterResponse,
                    params.provider,
                    params.inputTokens
                );
            console.log(`[DirectTokenTracking] Input tokens: original=${params.inputTokens}, final=${extractedInputTokens}, provider=${params.provider}`);

            let actualCost: number | null = null;
            let estimatedCost = 0;
            const isFreeOpenRouterModel = params.provider === 'openrouter' && params.modelId.endsWith(':free');

            // Extract actual cost from provider response (currently only OpenRouter supports this)
            const providerResponse = params.providerResponse || params.openRouterResponse;
            if (params.provider === 'openrouter' && providerResponse) {
                const costData = OpenRouterCostExtractor.extractCostFromResponse(providerResponse);
                if (costData.actualCost !== null && OpenRouterCostExtractor.validateCostData(costData)) {
                    actualCost = costData.actualCost;
                    console.log(`[DirectTokenTracking] Using actual cost from OpenRouter response: $${actualCost}`);

                    // Update pricing cache for future estimations
                    if (costData.inputTokens && costData.outputTokens) {
                        OpenRouterCostExtractor.updatePricingCacheFromActualCost(
                            params.modelId,
                            costData.inputTokens,
                            costData.outputTokens,
                            actualCost
                        );
                    }
                }
            }

            // TODO: Add cost extraction for Requesty if they provide cost information in their responses
            // Currently Requesty does not appear to provide cost data in API responses

            // Calculate estimated cost using the simplified service (fast, no DB queries)
            try {
                const simpleCostBreakdown = SimplifiedCostCalculationService.calculateCost(
                    extractedInputTokens,
                    params.outputTokens,
                    params.modelId,
                    params.provider,
                    {
                        includeVolumeDiscounts: false,
                        openRouterResponse: providerResponse // Use unified response parameter
                    }
                );
                estimatedCost = simpleCostBreakdown.totalCost;

                // If we don't have actual cost yet and the simplified service provided it, use it
                if (!actualCost && simpleCostBreakdown.source === 'actual') {
                    actualCost = estimatedCost;
                }
            } catch (error) {
                console.warn('Failed to calculate simplified cost, using fallback estimation:', error);
                // Fallback to very simple calculation
                estimatedCost = OpenRouterCostExtractor.getEstimatedCost(params.modelId, extractedInputTokens, params.outputTokens);
            }

            // For free OpenRouter models, ensure actual cost is stored as 0
            if (actualCost === null && isFreeOpenRouterModel) {
                actualCost = 0;
            }

            // Store the results in token usage metrics table
            await db.insert(tokenUsageMetrics).values({
                id: nanoid(),
                userId: params.userId,
                chatId: params.chatId,
                messageId: params.messageId,
                modelId: params.modelId,
                provider: params.provider,
                inputTokens: extractedInputTokens,
                outputTokens: params.outputTokens,
                totalTokens: extractedInputTokens + params.outputTokens,
                estimatedCost: estimatedCost.toString(),
                actualCost: actualCost?.toString(),
                currency: 'USD',
                processingTimeMs: params.processingTimeMs,
                timeToFirstTokenMs: params.timeToFirstTokenMs,
                tokensPerSecond: params.tokensPerSecond?.toString(),
                streamingStartTime: params.streamingStartTime,
                status: 'completed',
                metadata: {
                    directProcessed: true,
                    processedAt: new Date().toISOString(),
                    ...(params.generationId && { generationId: params.generationId })
                },
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            // Handle credit tracking if parameters are provided
            if (params.polarCustomerId !== undefined || params.completionTokens !== undefined) {
                try {
                    await trackTokenUsage(
                        params.userId,
                        params.polarCustomerId,
                        params.completionTokens || params.outputTokens, // Fallback to outputTokens if completionTokens not provided
                        params.isAnonymous || false,
                        params.shouldDeductCredits || false,
                        params.additionalCost || 0
                    );
                    console.log(`[DirectTokenTracking] Successfully processed credit tracking for user ${params.userId}`);
                } catch (creditError) {
                    console.error(`[DirectTokenTracking] Failed to process credit tracking for user ${params.userId}:`, creditError);
                    // Don't fail the entire operation if credit tracking fails
                }
            }

            const processingTime = Date.now() - startTime;
            console.log(`[DirectTokenTracking] Successfully processed token usage in ${processingTime}ms - estimated: $${estimatedCost}, actual: $${actualCost || 'N/A'}`);

            // If we don't have actual cost, try to fetch it asynchronously (fire-and-forget)
            // Currently only supported for OpenRouter
            if (!actualCost && params.provider === 'openrouter' && params.generationId) {
                // Try with the same API key context the original request used (if present on response)
                const apiKeyOverride = params.apiKeyOverride || (providerResponse as any)?.apiKey || undefined;
                this.fetchActualCostAsync(params.generationId, params.userId, params.chatId, params.messageId, apiKeyOverride).catch(error => {
                    console.warn(`[DirectTokenTracking] Failed to fetch actual cost asynchronously for generation ${params.generationId}:`, error);
                });
            }

        } catch (error) {
            const processingTime = Date.now() - startTime;
            console.error(`[DirectTokenTracking] Failed to process token usage for user ${params.userId} after ${processingTime}ms:`, error);

            // Store error record
            try {
                const errorExtractedInputTokens = params.inputTokens > 0 ?
                    params.inputTokens :
                    this.extractInputTokensFromResponse(
                        params.providerResponse || params.openRouterResponse,
                        params.provider,
                        params.inputTokens
                    );
                await db.insert(tokenUsageMetrics).values({
                    id: nanoid(),
                    userId: params.userId,
                    chatId: params.chatId,
                    messageId: params.messageId,
                    modelId: params.modelId,
                    provider: params.provider,
                    inputTokens: errorExtractedInputTokens,
                    outputTokens: params.outputTokens,
                    totalTokens: errorExtractedInputTokens + params.outputTokens,
                    estimatedCost: '0',
                    currency: 'USD',
                    processingTimeMs: params.processingTimeMs,
                    timeToFirstTokenMs: params.timeToFirstTokenMs,
                    tokensPerSecond: params.tokensPerSecond?.toString(),
                    streamingStartTime: params.streamingStartTime,
                    status: 'failed',
                    errorMessage: error instanceof Error ? error.message : String(error),
                    metadata: {
                        directProcessed: true,
                        processingFailed: true,
                        directProcessingTimeMs: processingTime
                    },
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            } catch (dbError) {
                console.error(`[DirectTokenTracking] Failed to store error record for user ${params.userId}:`, dbError);
            }

            // Re-throw the error so the caller knows processing failed
            throw error;
        }
    }

    /**
     * Extract input tokens from various provider response formats
     */
    private static extractInputTokensFromResponse(response: any, provider: string, fallbackInputTokens: number): number {
        if (!response) return fallbackInputTokens;

        console.log(`[DirectTokenTracking] Extracting tokens from ${provider} response:`, {
            hasUsage: !!response.usage,
            usageKeys: response.usage ? Object.keys(response.usage) : [],
            responseKeys: Object.keys(response),
            provider
        });

        // Try standard AI SDK format (works for Requesty and other providers)
        const usage = response.usage;
        if (usage) {
            // AI SDK standard format (used by most providers including Requesty)
            if (usage.promptTokens) {
                console.log(`[DirectTokenTracking] Found input tokens in usage.promptTokens: ${usage.promptTokens}`);
                return usage.promptTokens;
            }
            if (usage.inputTokens) {
                console.log(`[DirectTokenTracking] Found input tokens in usage.inputTokens: ${usage.inputTokens}`);
                return usage.inputTokens;
            }
            // OpenRouter-style format
            if (usage.prompt_tokens) {
                console.log(`[DirectTokenTracking] Found input tokens in usage.prompt_tokens: ${usage.prompt_tokens}`);
                return usage.prompt_tokens;
            }
            if (usage.input_tokens) {
                console.log(`[DirectTokenTracking] Found input tokens in usage.input_tokens: ${usage.input_tokens}`);
                return usage.input_tokens;
            }
        }

        // Check root level (for non-standard response formats)
        if (response.promptTokens) {
            console.log(`[DirectTokenTracking] Found input tokens at root level promptTokens: ${response.promptTokens}`);
            return response.promptTokens;
        }
        if (response.inputTokens) {
            console.log(`[DirectTokenTracking] Found input tokens at root level inputTokens: ${response.inputTokens}`);
            return response.inputTokens;
        }
        if (response.prompt_tokens) {
            console.log(`[DirectTokenTracking] Found input tokens at root level prompt_tokens: ${response.prompt_tokens}`);
            return response.prompt_tokens;
        }
        if (response.input_tokens) {
            console.log(`[DirectTokenTracking] Found input tokens at root level input_tokens: ${response.input_tokens}`);
            return response.input_tokens;
        }

        // Try metadata (for complex response structures)
        if (response.metadata?.rawUsage) {
            const rawUsage = response.metadata.rawUsage;
            if (rawUsage.inputTokens) {
                console.log(`[DirectTokenTracking] Found input tokens in metadata.rawUsage.inputTokens: ${rawUsage.inputTokens}`);
                return rawUsage.inputTokens;
            }
            if (rawUsage.prompt_tokens) {
                console.log(`[DirectTokenTracking] Found input tokens in metadata.rawUsage.prompt_tokens: ${rawUsage.prompt_tokens}`);
                return rawUsage.prompt_tokens;
            }
        }

        console.log(`[DirectTokenTracking] No input tokens found in ${provider} response, using fallback: ${fallbackInputTokens}`);
        return fallbackInputTokens;
    }

    /**
     * Fetch actual cost from OpenRouter asynchronously (fire-and-forget)
     */
    private static async fetchActualCostAsync(generationId: string, userId: string, chatId: string, messageId: string, apiKeyOverride?: string): Promise<void> {
        try {
            const openRouterData = await OpenRouterCostTracker.fetchActualCost(generationId, apiKeyOverride);
            if (openRouterData.actualCost !== null) {
                // Get existing record to preserve metadata
                const existingRecord = await db.select()
                    .from(tokenUsageMetrics)
                    .where(
                        and(
                            eq(tokenUsageMetrics.userId, userId),
                            eq(tokenUsageMetrics.chatId, chatId),
                            eq(tokenUsageMetrics.messageId, messageId)
                        )
                    )
                    .limit(1);

                const existingMetadata = existingRecord[0]?.metadata || {};

                // Update the existing record with actual cost, preserving existing metadata
                await db.update(tokenUsageMetrics)
                    .set({
                        actualCost: openRouterData.actualCost.toString(),
                        updatedAt: new Date(),
                        metadata: {
                            ...existingMetadata, // Preserve existing metadata
                            actualCostUpdatedAsync: true,
                            asyncUpdateProcessedAt: new Date().toISOString(),
                            asyncUpdateGenerationId: generationId
                        }
                    })
                    .where(
                        and(
                            eq(tokenUsageMetrics.userId, userId),
                            eq(tokenUsageMetrics.chatId, chatId),
                            eq(tokenUsageMetrics.messageId, messageId)
                        )
                    );
                console.log(`[DirectTokenTracking] Updated actual cost asynchronously: $${openRouterData.actualCost}`);
            }
        } catch (error) {
            console.warn(`[DirectTokenTracking] Failed to update actual cost asynchronously for generation ${generationId}:`, error);
        }
    }
}

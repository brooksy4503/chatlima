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
    openRouterResponse?: any;
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
}

export class DirectTokenTrackingService {
    /**
     * Process token usage tracking immediately (for Vercel serverless)
     * This runs synchronously before the HTTP response is sent
     */
    static async processTokenUsage(params: DirectTokenTrackingParams): Promise<void> {
        const startTime = Date.now();

        try {
            console.log(`[DirectTokenTracking] Processing token usage for user ${params.userId}, chat ${params.chatId}`);

            // Extract input tokens using comprehensive method
            const extractedInputTokens = this.extractInputTokens(params.openRouterResponse, params.inputTokens);
            console.log(`[DirectTokenTracking] Input tokens: original=${params.inputTokens}, extracted=${extractedInputTokens}`);

            let actualCost: number | null = null;
            let estimatedCost = 0;

            // Extract actual cost from OpenRouter response first (fastest method)
            if (params.provider === 'openrouter' && params.openRouterResponse) {
                const costData = OpenRouterCostExtractor.extractCostFromResponse(params.openRouterResponse);
                if (costData.actualCost !== null && OpenRouterCostExtractor.validateCostData(costData)) {
                    actualCost = costData.actualCost;
                    console.log(`[DirectTokenTracking] Using actual cost from response: $${actualCost}`);

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

            // Calculate estimated cost using the simplified service (fast, no DB queries)
            try {
                const simpleCostBreakdown = SimplifiedCostCalculationService.calculateCost(
                    extractedInputTokens,
                    params.outputTokens,
                    params.modelId,
                    params.provider,
                    {
                        includeVolumeDiscounts: false,
                        openRouterResponse: params.openRouterResponse
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
            if (!actualCost && params.provider === 'openrouter' && params.generationId) {
                this.fetchActualCostAsync(params.generationId, params.userId, params.chatId, params.messageId).catch(error => {
                    console.warn(`[DirectTokenTracking] Failed to fetch actual cost asynchronously for generation ${params.generationId}:`, error);
                });
            }

        } catch (error) {
            const processingTime = Date.now() - startTime;
            console.error(`[DirectTokenTracking] Failed to process token usage for user ${params.userId} after ${processingTime}ms:`, error);

            // Store error record
            try {
                const errorExtractedInputTokens = this.extractInputTokens(params.openRouterResponse, params.inputTokens);
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
     * Extract input tokens from various response formats
     */
    private static extractInputTokens(openRouterResponse: any, fallbackInputTokens: number): number {
        if (!openRouterResponse) return fallbackInputTokens;

        // Try various field names in the response
        const usage = openRouterResponse.usage;
        if (usage) {
            if (usage.prompt_tokens) return usage.prompt_tokens;
            if (usage.input_tokens) return usage.input_tokens;
        }

        // Check root level
        if (openRouterResponse.prompt_tokens) return openRouterResponse.prompt_tokens;
        if (openRouterResponse.input_tokens) return openRouterResponse.input_tokens;

        // Try metadata
        if (openRouterResponse.metadata?.rawUsage) {
            const rawUsage = openRouterResponse.metadata.rawUsage;
            if (rawUsage.inputTokens) return rawUsage.inputTokens;
            if (rawUsage.prompt_tokens) return rawUsage.prompt_tokens;
        }

        return fallbackInputTokens;
    }

    /**
     * Fetch actual cost from OpenRouter asynchronously (fire-and-forget)
     */
    private static async fetchActualCostAsync(generationId: string, userId: string, chatId: string, messageId: string): Promise<void> {
        try {
            const openRouterData = await OpenRouterCostTracker.fetchActualCost(generationId);
            if (openRouterData.actualCost !== null) {
                // Update the existing record with actual cost
                await db.update(tokenUsageMetrics)
                    .set({
                        actualCost: openRouterData.actualCost.toString(),
                        updatedAt: new Date(),
                        metadata: {
                            directProcessed: true,
                            processedAt: new Date().toISOString(),
                            generationId: generationId,
                            actualCostUpdatedAsync: true
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

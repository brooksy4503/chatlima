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
import { getModelDetails } from '@/lib/models/fetch-models';
import { ModelInfo } from '@/lib/types/models';

interface DirectTokenTrackingParams {
    userId: string;
    chatId: string;
    messageId?: string; // Made optional since it's no longer required in the database
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
    // Model information for variable credit cost calculation
    modelInfo?: ModelInfo;
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

            // Trust the already-extracted input tokens from chat API (which uses comprehensive extraction logic)
            // The chat API's extractInputTokensFromEvent() handles all provider formats correctly
            let extractedInputTokens = params.inputTokens;

            // Only try to re-extract if we truly have no tokens (0 or undefined)
            if (!extractedInputTokens || extractedInputTokens === 0) {
                console.log(`[DirectTokenTracking] No input tokens provided (${extractedInputTokens}), attempting extraction from ${params.provider} response`);
                extractedInputTokens = this.extractInputTokensFromResponse(
                    params.providerResponse || params.openRouterResponse,
                    params.provider
                );
            }

            console.log(`[DirectTokenTracking] Input tokens: original=${params.inputTokens}, final=${extractedInputTokens}, provider=${params.provider}`);

            // Validate that we have input tokens - this is critical for accurate tracking
            if (extractedInputTokens === 0) {
                console.warn(`[DirectTokenTracking] WARNING: No input tokens extracted for ${params.provider} model ${params.modelId}. This may indicate a problem with token extraction.`);
                // Log additional debug info to help troubleshoot
                if (params.providerResponse || params.openRouterResponse) {
                    console.warn(`[DirectTokenTracking] Response available but no tokens extracted. Response keys:`,
                        Object.keys(params.providerResponse || params.openRouterResponse));
                }
            }

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
                    // Fetch modelInfo if not provided (needed for variable credit cost calculation)
                    let modelInfo = params.modelInfo;
                    if (!modelInfo && params.modelId) {
                        try {
                            modelInfo = (await getModelDetails(params.modelId)) ?? undefined;
                        } catch (error) {
                            console.warn(`[DirectTokenTracking] Failed to fetch model info for ${params.modelId}, using default credit cost:`, error);
                        }
                    }

                    await trackTokenUsage(
                        params.userId,
                        params.polarCustomerId,
                        params.completionTokens || params.outputTokens, // Fallback to outputTokens if completionTokens not provided
                        params.isAnonymous || false,
                        params.shouldDeductCredits || false,
                        params.additionalCost || 0,
                        modelInfo
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
                // Only call fetchActualCostAsync if we have a messageId
                if (params.messageId) {
                    this.fetchActualCostAsync(params.generationId, params.userId, params.chatId, params.messageId, apiKeyOverride).catch(error => {
                        console.warn(`[DirectTokenTracking] Failed to fetch actual cost asynchronously for generation ${params.generationId}:`, error);
                    });
                }
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
                        params.provider
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
     * Extract input tokens from provider response using the same logic as the test script
     * This matches the successful extraction logic that works for Requesty and other providers
     */
    private static extractInputTokensFromResponse(response: any, provider: string): number {
        if (!response) {
            console.log(`[DirectTokenTracking] No response provided for ${provider}, returning 0`);
            return 0;
        }

        console.log(`[DirectTokenTracking] Extracting tokens from ${provider} response:`, {
            hasUsage: !!response.usage,
            usageKeys: response.usage ? Object.keys(response.usage) : [],
            responseKeys: Object.keys(response),
            provider
        });

        // Use the same comprehensive extraction logic as the successful test script
        // This prioritizes AI SDK standard format (promptTokens) which Requesty uses
        const usage = response.usage;
        const usageAny = usage as any;

        const extractedInputTokens =
            usage?.promptTokens ||           // AI SDK standard (Requesty, most providers)
            usageAny?.inputTokens ||         // Alternative AI SDK format
            usageAny?.prompt_tokens ||       // OpenRouter style
            usageAny?.input_tokens ||        // Alternative OpenRouter style
            response.promptTokens ||         // Root level (fallback)
            response.inputTokens ||          // Root level alternative
            response.prompt_tokens ||        // Root level OpenRouter style
            response.input_tokens ||         // Root level alternative
            response.metadata?.rawUsage?.inputTokens ||     // Metadata fallback
            response.metadata?.rawUsage?.prompt_tokens ||   // Metadata OpenRouter style
            0;

        if (extractedInputTokens > 0) {
            console.log(`[DirectTokenTracking] Successfully extracted ${extractedInputTokens} input tokens from ${provider} response`);
        } else {
            console.log(`[DirectTokenTracking] No input tokens found in ${provider} response structure:`, {
                hasUsage: !!usage,
                usagePromptTokens: usage?.promptTokens,
                usageInputTokens: usageAny?.inputTokens,
                usagePrompt_tokens: usageAny?.prompt_tokens,
                usageInput_tokens: usageAny?.input_tokens,
                responsePromptTokens: response.promptTokens,
                responseInputTokens: response.inputTokens,
                fullUsage: usage
            });
        }

        return extractedInputTokens;
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

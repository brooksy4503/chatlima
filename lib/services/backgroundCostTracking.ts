/**
 * Background cost tracking service
 * Handles detailed cost calculations asynchronously after responses are sent
 */

import { db } from '@/lib/db';
import { tokenUsageMetrics } from '@/lib/db/schema';
import { trackTokenUsage } from '@/lib/tokenCounter';
import { CostCalculationService } from './costCalculation';
import { SimplifiedCostCalculationService } from './simplifiedCostCalculation';
import { OpenRouterCostTracker } from './openrouterCostTracker';
import { OpenRouterCostExtractor } from './openRouterCostExtractor';
import { nanoid } from 'nanoid';

interface BackgroundCostJob {
    id: string;
    userId: string;
    chatId: string;
    messageId: string;
    modelId: string;
    provider: string;
    inputTokens: number;
    outputTokens: number;
    generationId?: string;
    openRouterResponse?: any;
    timestamp: Date;
    // Timing data
    processingTimeMs?: number;
    timeToFirstTokenMs?: number;
    tokensPerSecond?: number;
    streamingStartTime?: Date;
    // Credit tracking data
    polarCustomerId?: string;
    completionTokens?: number;
    isAnonymous?: boolean;
    shouldDeductCredits?: boolean;
    additionalCost?: number;
}

// In-memory queue for background processing
const costTrackingQueue: BackgroundCostJob[] = [];
let isProcessing = false;

export class BackgroundCostTrackingService {
    /**
 * Queue a cost calculation and credit tracking job for background processing
 */
    static queueCostCalculation(params: {
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
    }): void {
        const job: BackgroundCostJob = {
            id: nanoid(),
            ...params,
            timestamp: new Date()
        };

        costTrackingQueue.push(job);

        // Start processing if not already running
        if (!isProcessing) {
            this.processQueue();
        }
    }

    /**
     * Process the cost calculation queue
     */
    private static async processQueue(): Promise<void> {
        if (isProcessing || costTrackingQueue.length === 0) {
            return;
        }

        isProcessing = true;

        try {
            while (costTrackingQueue.length > 0) {
                const job = costTrackingQueue.shift();
                if (job) {
                    await this.processJob(job);
                }
            }
        } catch (error) {
            console.error('Error processing cost tracking queue:', error);
        } finally {
            isProcessing = false;
        }
    }

    /**
     * Extract input tokens from various response formats (similar to TokenTrackingService)
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
     * Process a single cost calculation job
     */
    private static async processJob(job: BackgroundCostJob): Promise<void> {
        try {
            console.log(`[BackgroundCostTracking] Processing job ${job.id} for user ${job.userId}`);

            let actualCost: number | null = null;
            let estimatedCost = 0;

            // Extract input tokens using comprehensive method
            const extractedInputTokens = this.extractInputTokens(job.openRouterResponse, job.inputTokens);
            console.log(`[BackgroundCostTracking] Input tokens: original=${job.inputTokens}, extracted=${extractedInputTokens}`);

            // Extract actual cost from OpenRouter response first (fastest method)
            if (job.provider === 'openrouter' && job.openRouterResponse) {
                const costData = OpenRouterCostExtractor.extractCostFromResponse(job.openRouterResponse);
                if (costData.actualCost !== null && OpenRouterCostExtractor.validateCostData(costData)) {
                    actualCost = costData.actualCost;
                    console.log(`[BackgroundCostTracking] Using actual cost from response: $${actualCost}`);

                    // Update pricing cache for future estimations
                    if (costData.inputTokens && costData.outputTokens) {
                        OpenRouterCostExtractor.updatePricingCacheFromActualCost(
                            job.modelId,
                            costData.inputTokens,
                            costData.outputTokens,
                            actualCost
                        );
                    }
                }
            }

            // Fallback: Try to get actual cost from OpenRouter generation API if needed
            if (!actualCost && job.provider === 'openrouter' && job.generationId) {
                try {
                    const openRouterData = await OpenRouterCostTracker.fetchActualCost(job.generationId);
                    if (openRouterData.actualCost !== null) {
                        actualCost = openRouterData.actualCost;
                        console.log(`[BackgroundCostTracking] Using actual cost from generation API: $${actualCost}`);
                    }
                } catch (error) {
                    console.warn(`Failed to fetch OpenRouter cost for generation ${job.generationId}:`, error);
                }
            }

            // Calculate estimated cost using the simplified service (fast, no DB queries)
            try {
                // First try the simplified service for fast calculation
                const simpleCostBreakdown = SimplifiedCostCalculationService.calculateCost(
                    extractedInputTokens,
                    job.outputTokens,
                    job.modelId,
                    job.provider,
                    {
                        includeVolumeDiscounts: false,
                        openRouterResponse: job.openRouterResponse
                    }
                );
                estimatedCost = simpleCostBreakdown.totalCost;

                // If we don't have actual cost yet and the simplified service didn't provide it, 
                // use the estimated cost as final cost
                if (!actualCost && simpleCostBreakdown.source === 'actual') {
                    actualCost = estimatedCost;
                }
            } catch (error) {
                console.warn('Failed to calculate simplified cost, using fallback estimation:', error);
                // Fallback to very simple calculation
                estimatedCost = OpenRouterCostExtractor.getEstimatedCost(job.modelId, extractedInputTokens, job.outputTokens);
            }

            // Store the results
            await db.insert(tokenUsageMetrics).values({
                id: nanoid(),
                userId: job.userId,
                chatId: job.chatId,
                messageId: job.messageId,
                modelId: job.modelId,
                provider: job.provider,
                inputTokens: extractedInputTokens,
                outputTokens: job.outputTokens,
                totalTokens: extractedInputTokens + job.outputTokens,
                estimatedCost: estimatedCost.toString(),
                actualCost: actualCost?.toString(),
                currency: 'USD',
                processingTimeMs: job.processingTimeMs,
                timeToFirstTokenMs: job.timeToFirstTokenMs,
                tokensPerSecond: job.tokensPerSecond?.toString(),
                streamingStartTime: job.streamingStartTime,
                status: 'completed',
                metadata: {
                    backgroundProcessed: true,
                    processedAt: new Date().toISOString(),
                    jobId: job.id,
                    ...(job.generationId && { generationId: job.generationId })
                },
                createdAt: job.timestamp,
                updatedAt: new Date(),
            });

            console.log(`[BackgroundCostTracking] Successfully processed job ${job.id} - estimated: $${estimatedCost}, actual: $${actualCost || 'N/A'}`);

            // Handle credit tracking if parameters are provided
            if (job.polarCustomerId !== undefined || job.completionTokens !== undefined) {
                try {
                    await trackTokenUsage(
                        job.userId,
                        job.polarCustomerId,
                        job.completionTokens || job.outputTokens, // Fallback to outputTokens if completionTokens not provided
                        job.isAnonymous || false,
                        job.shouldDeductCredits || false,
                        job.additionalCost || 0
                    );
                    console.log(`[BackgroundCostTracking] Successfully processed credit tracking for job ${job.id}`);
                } catch (creditError) {
                    console.error(`[BackgroundCostTracking] Failed to process credit tracking for job ${job.id}:`, creditError);
                    // Don't fail the entire job if credit tracking fails
                }
            }

        } catch (error) {
            console.error(`[BackgroundCostTracking] Failed to process job ${job.id}:`, error);

            // Store error record
            try {
                // Extract input tokens for error case too
                const errorExtractedInputTokens = this.extractInputTokens(job.openRouterResponse, job.inputTokens);
                await db.insert(tokenUsageMetrics).values({
                    id: nanoid(),
                    userId: job.userId,
                    chatId: job.chatId,
                    messageId: job.messageId,
                    modelId: job.modelId,
                    provider: job.provider,
                    inputTokens: errorExtractedInputTokens,
                    outputTokens: job.outputTokens,
                    totalTokens: errorExtractedInputTokens + job.outputTokens,
                    estimatedCost: '0',
                    currency: 'USD',
                    processingTimeMs: job.processingTimeMs,
                    timeToFirstTokenMs: job.timeToFirstTokenMs,
                    tokensPerSecond: job.tokensPerSecond?.toString(),
                    streamingStartTime: job.streamingStartTime,
                    status: 'failed',
                    errorMessage: error instanceof Error ? error.message : String(error),
                    metadata: {
                        backgroundProcessed: true,
                        processingFailed: true,
                        jobId: job.id
                    },
                    createdAt: job.timestamp,
                    updatedAt: new Date(),
                });
            } catch (dbError) {
                console.error(`[BackgroundCostTracking] Failed to store error record for job ${job.id}:`, dbError);
            }
        }
    }

    /**
     * Get queue status for monitoring
     */
    static getQueueStatus(): { queueLength: number; isProcessing: boolean } {
        return {
            queueLength: costTrackingQueue.length,
            isProcessing
        };
    }

    /**
     * Force process queue (for testing/debugging)
     */
    static async forceProcessQueue(): Promise<void> {
        await this.processQueue();
    }
}

// Process queue every 5 seconds if there are jobs
setInterval(() => {
    if (costTrackingQueue.length > 0 && !isProcessing) {
        BackgroundCostTrackingService.forceProcessQueue();
    }
}, 5000);

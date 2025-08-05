import { db } from './db';
import { tokenUsageMetrics, modelPricing, dailyTokenUsage, users, chats, messages } from './db/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { modelID } from '@/ai/providers';
import { CostCalculationService } from './services/costCalculation';
import { OpenRouterCostTracker } from './services/openrouterCostTracker';

// Diagnostic logging helper
const logDiagnostic = (category: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[TokenTracking:${category}] ${timestamp} - ${message}`, data || '');
};

/**
 * Interface for token usage data from AI provider responses
 */
export interface TokenUsageData {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    promptTokens?: number; // Alternative name for inputTokens
    completionTokens?: number; // Alternative name for outputTokens
    usage?: {
        prompt_tokens?: number;
        completion_tokens?: number;
        total_tokens?: number;
        input_tokens?: number;
        output_tokens?: number;
    };
    // Additional OpenRouter response formats
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    input_tokens?: number;
    output_tokens?: number;
}

/**
 * Interface for token tracking parameters
 */
export interface TokenTrackingParams {
    userId: string;
    chatId: string;
    messageId: string;
    modelId: modelID;
    provider: string;
    tokenUsage: TokenUsageData;
    processingTimeMs?: number;
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    errorMessage?: string;
    metadata?: Record<string, any>;
    /** Generation ID from OpenRouter for fetching actual costs */
    generationId?: string;
}

/**
 * Interface for model pricing information
 */
export interface ModelPricingInfo {
    modelId: string;
    provider: string;
    inputTokenPrice: number;
    outputTokenPrice: number;
    currency: string;
    effectiveFrom: Date;
    effectiveTo?: Date;
    isActive: boolean;
}

/**
 * Token tracking service for capturing and storing detailed token usage metrics
 */
export class TokenTrackingService {
    /**
     * Track token usage for a chat interaction
     */
    static async trackTokenUsage(params: TokenTrackingParams): Promise<void> {
        const trackingId = nanoid(); // Unique ID for this tracking attempt
        logDiagnostic('TRACK_START', `Starting token tracking`, { trackingId, userId: params.userId, modelId: params.modelId, provider: params.provider });

        try {
            const {
                userId,
                chatId,
                messageId,
                modelId,
                provider,
                tokenUsage,
                processingTimeMs,
                status = 'completed',
                errorMessage,
                metadata = {},
                generationId
            } = params;

            // Extract token counts from various possible formats
            let inputTokens = this.extractInputTokens(tokenUsage);
            let outputTokens = this.extractOutputTokens(tokenUsage);
            let totalTokens = inputTokens + outputTokens;

            logDiagnostic('TOKEN_EXTRACTION', `Extracted token counts`, { trackingId, inputTokens, outputTokens, totalTokens, rawUsage: tokenUsage });

            // Get model pricing information
            logDiagnostic('PRICING_LOOKUP', `Looking up model pricing`, { trackingId, modelId, provider });
            const pricingInfo = await this.getModelPricing(modelId, provider);
            logDiagnostic('PRICING_RESULT', `Model pricing result`, { trackingId, hasPricing: !!pricingInfo, currency: pricingInfo?.currency });

            // Calculate costs using estimated pricing first
            logDiagnostic('COST_CALCULATION', `Calculating estimated costs`, { trackingId, inputTokens, outputTokens });
            let { estimatedCost, actualCost: fallbackActualCost } = await this.calculateCosts(
                inputTokens,
                outputTokens,
                modelId,
                provider,
                pricingInfo
            );
            logDiagnostic('COST_RESULT', `Estimated cost calculation result`, { trackingId, estimatedCost, actualCost: fallbackActualCost });

            // For OpenRouter: Try to fetch actual cost and native token counts
            let finalActualCost = fallbackActualCost;
            let openRouterData = null;

            if (provider === 'openrouter' && generationId) {
                logDiagnostic('OPENROUTER_FETCH_START', `Fetching actual cost from OpenRouter`, { trackingId, generationId });

                const openRouterResult = await OpenRouterCostTracker.fetchActualCost(generationId);
                openRouterData = openRouterResult.generationData;

                if (openRouterResult.actualCost !== null) {
                    finalActualCost = openRouterResult.actualCost;
                    logDiagnostic('OPENROUTER_ACTUAL_COST', `Retrieved actual cost from OpenRouter`, {
                        trackingId,
                        generationId,
                        actualCost: finalActualCost,
                        estimatedCost,
                        costDifference: finalActualCost - estimatedCost
                    });
                }

                // Use native token counts if available (more accurate than normalized counts)
                if (openRouterResult.nativeInputTokens !== null && openRouterResult.nativeOutputTokens !== null) {
                    inputTokens = openRouterResult.nativeInputTokens;
                    outputTokens = openRouterResult.nativeOutputTokens;
                    totalTokens = inputTokens + outputTokens;

                    logDiagnostic('OPENROUTER_NATIVE_TOKENS', `Using native token counts from OpenRouter`, {
                        trackingId,
                        generationId,
                        nativeInputTokens: inputTokens,
                        nativeOutputTokens: outputTokens,
                        originalInputTokens: this.extractInputTokens(tokenUsage),
                        originalOutputTokens: this.extractOutputTokens(tokenUsage)
                    });

                    // Recalculate estimated cost using native token counts for better accuracy
                    logDiagnostic('COST_RECALCULATION', `Recalculating costs with native tokens`, { trackingId, inputTokens, outputTokens });
                    const { estimatedCost: recalculatedCost } = await this.calculateCosts(
                        inputTokens,
                        outputTokens,
                        modelId,
                        provider,
                        pricingInfo
                    );

                    // Update estimated cost to use native token calculation
                    const originalEstimatedCost = estimatedCost;
                    estimatedCost = recalculatedCost;

                    logDiagnostic('COST_RECALC_RESULT', `Updated estimated cost using native tokens`, {
                        trackingId,
                        originalEstimatedCost,
                        recalculatedCost,
                        improvement: `${((Math.abs(originalEstimatedCost - recalculatedCost) / Math.max(originalEstimatedCost, recalculatedCost)) * 100).toFixed(1)}% difference`
                    });
                }
            }

            // Store token usage metrics
            logDiagnostic('DB_INSERT_START', `Inserting token usage metrics`, { trackingId, userId, chatId, messageId });
            const recordId = nanoid();

            // Prepare enhanced metadata
            const enhancedMetadata = {
                ...metadata,
                rawUsage: tokenUsage,
                ...(generationId && { generationId }),
                ...(openRouterData && { openRouterData }),
                ...(provider === 'openrouter' && {
                    openRouterFetch: {
                        attempted: !!generationId,
                        successful: !!openRouterData,
                        hasActualCost: finalActualCost !== fallbackActualCost
                    }
                })
            };

            await db.insert(tokenUsageMetrics).values({
                id: recordId,
                userId,
                chatId,
                messageId,
                modelId,
                provider,
                inputTokens,
                outputTokens,
                totalTokens,
                estimatedCost: estimatedCost.toString(),
                actualCost: finalActualCost ? finalActualCost.toString() : undefined,
                currency: pricingInfo?.currency || 'USD',
                processingTimeMs,
                status,
                errorMessage,
                metadata: enhancedMetadata,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            logDiagnostic('DB_INSERT_SUCCESS', `Successfully inserted token usage metrics`, { trackingId, recordId });

            // Update daily token usage
            logDiagnostic('DAILY_UPDATE_START', `Updating daily token usage`, { trackingId, userId, provider });
            await this.updateDailyTokenUsage({
                userId,
                provider,
                inputTokens,
                outputTokens,
                totalTokens,
                estimatedCost,
                actualCost: finalActualCost || 0,
            });
            logDiagnostic('DAILY_UPDATE_SUCCESS', `Successfully updated daily token usage`, { trackingId });

            logDiagnostic('TRACK_SUCCESS', `Token tracking completed successfully`, {
                trackingId,
                userId,
                modelId,
                inputTokens,
                outputTokens,
                totalTokens,
                estimatedCost,
                actualCost: finalActualCost
            });
        } catch (error) {
            logDiagnostic('TRACK_ERROR', `Error tracking token usage`, {
                trackingId,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
            console.error('[TokenTracking] Error tracking token usage:', error);
            // Don't throw - we don't want to break the chat flow if tracking fails
        }
    }

    /**
     * Extract input tokens from various token usage formats
     */
    private static extractInputTokens(tokenUsage: TokenUsageData): number {
        logDiagnostic('EXTRACT_INPUT_DEBUG', `Extracting input tokens from:`, {
            hasInputTokens: !!tokenUsage.inputTokens,
            hasPromptTokens: !!tokenUsage.promptTokens,
            hasUsage: !!tokenUsage.usage,
            usageKeys: tokenUsage.usage ? Object.keys(tokenUsage.usage) : [],
            rawTokenUsage: tokenUsage
        });

        // Direct properties
        if (tokenUsage.inputTokens) return tokenUsage.inputTokens;
        if (tokenUsage.promptTokens) return tokenUsage.promptTokens;
        if (tokenUsage.input_tokens) return tokenUsage.input_tokens;
        if (tokenUsage.prompt_tokens) return tokenUsage.prompt_tokens;

        // Nested usage object
        if (tokenUsage.usage?.prompt_tokens) return tokenUsage.usage.prompt_tokens;
        if (tokenUsage.usage?.input_tokens) return tokenUsage.usage.input_tokens;

        // Handle direct usage object
        if (tokenUsage.usage && typeof tokenUsage.usage === 'object') {
            const usage = tokenUsage.usage as any;
            if (usage.prompt_tokens) return usage.prompt_tokens;
            if (usage.input_tokens) return usage.input_tokens;
        }

        return 0;
    }

    /**
     * Extract output tokens from various token usage formats
     */
    private static extractOutputTokens(tokenUsage: TokenUsageData): number {
        logDiagnostic('EXTRACT_OUTPUT_DEBUG', `Extracting output tokens from:`, {
            hasOutputTokens: !!tokenUsage.outputTokens,
            hasCompletionTokens: !!tokenUsage.completionTokens,
            hasUsage: !!tokenUsage.usage,
            usageKeys: tokenUsage.usage ? Object.keys(tokenUsage.usage) : [],
            rawTokenUsage: tokenUsage
        });

        // Direct properties
        if (tokenUsage.outputTokens) return tokenUsage.outputTokens;
        if (tokenUsage.completionTokens) return tokenUsage.completionTokens;
        if (tokenUsage.output_tokens) return tokenUsage.output_tokens;
        if (tokenUsage.completion_tokens) return tokenUsage.completion_tokens;

        // Nested usage object
        if (tokenUsage.usage?.completion_tokens) return tokenUsage.usage.completion_tokens;
        if (tokenUsage.usage?.output_tokens) return tokenUsage.usage.output_tokens;

        // Handle direct usage object
        if (tokenUsage.usage && typeof tokenUsage.usage === 'object') {
            const usage = tokenUsage.usage as any;
            if (usage.completion_tokens) return usage.completion_tokens;
            if (usage.output_tokens) return usage.output_tokens;
        }

        return 0;
    }

    /**
     * Get model pricing information
     */
    private static async getModelPricing(modelId: string, provider: string): Promise<ModelPricingInfo | null> {
        const pricingId = nanoid(); // Unique ID for this pricing lookup
        logDiagnostic('PRICING_LOOKUP_START', `Starting model pricing lookup`, { pricingId, modelId, provider });

        try {
            logDiagnostic('PRICING_DB_QUERY', `Querying database for pricing`, {
                pricingId,
                modelId,
                provider,
                conditions: {
                    modelId,
                    provider,
                    isActive: true,
                    effectiveFrom: new Date(),
                    effectiveTo: null
                }
            });

            const pricing = await db.query.modelPricing.findFirst({
                where: and(
                    eq(modelPricing.modelId, modelId),
                    eq(modelPricing.provider, provider),
                    eq(modelPricing.isActive, true),
                    gte(modelPricing.effectiveFrom, new Date()),
                    sql`${modelPricing.effectiveTo} IS NULL OR ${modelPricing.effectiveTo} >= ${new Date()}`
                ),
                orderBy: desc(modelPricing.effectiveFrom),
            });

            logDiagnostic('PRICING_DB_RESULT', `Database query result`, {
                pricingId,
                foundPricing: !!pricing,
                dbPricingId: pricing?.id,
                inputPrice: pricing?.inputTokenPrice,
                outputPrice: pricing?.outputTokenPrice,
                currency: pricing?.currency
            });

            if (pricing) {
                const result = {
                    modelId: pricing.modelId,
                    provider: pricing.provider,
                    inputTokenPrice: parseFloat(pricing.inputTokenPrice.toString()),
                    outputTokenPrice: parseFloat(pricing.outputTokenPrice.toString()),
                    currency: pricing.currency,
                    effectiveFrom: pricing.effectiveFrom,
                    effectiveTo: pricing.effectiveTo || undefined,
                    isActive: pricing.isActive,
                };

                logDiagnostic('PRICING_FOUND', `Found pricing in database`, { pricingId, result });
                return result;
            }

            logDiagnostic('PRICING_NOT_FOUND', `No pricing found in database, using default`, { pricingId, modelId, provider });

            // Return default pricing if not found
            const defaultPricing = this.getDefaultPricing(modelId, provider);
            logDiagnostic('PRICING_DEFAULT', `Using default pricing`, { pricingId, defaultPricing });
            return defaultPricing;
        } catch (error) {
            logDiagnostic('PRICING_ERROR', `Error getting model pricing`, {
                pricingId,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                modelId,
                provider
            });

            console.error('[TokenTracking] Error getting model pricing:', error);
            const fallbackPricing = this.getDefaultPricing(modelId, provider);
            logDiagnostic('PRICING_FALLBACK', `Using fallback default pricing after error`, { pricingId, fallbackPricing });
            return fallbackPricing;
        }
    }

    /**
     * Get default pricing for a model/provider combination
     */
    private static getDefaultPricing(modelId: string, provider: string): ModelPricingInfo {
        // Default pricing based on provider (rough estimates)
        const defaultPrices: Record<string, { input: number; output: number }> = {
            openai: { input: 0.0005, output: 0.0015 }, // $0.50 / 1M input, $1.50 / 1M output
            anthropic: { input: 0.003, output: 0.015 }, // $3.00 / 1M input, $15.00 / 1M output
            google: { input: 0.0005, output: 0.0015 }, // $0.50 / 1M input, $1.50 / 1M output
            groq: { input: 0.00005, output: 0.00008 }, // $0.05 / 1M input, $0.08 / 1M output
            xai: { input: 0.0002, output: 0.0006 }, // $0.20 / 1M input, $0.60 / 1M output
            openrouter: { input: 0.0005, output: 0.0015 }, // Varies by model, using OpenAI as baseline
            requesty: { input: 0.0005, output: 0.0015 }, // Varies by model, using OpenAI as baseline
        };

        const prices = defaultPrices[provider] || defaultPrices.openai;

        return {
            modelId,
            provider,
            inputTokenPrice: prices.input,
            outputTokenPrice: prices.output,
            currency: 'USD',
            effectiveFrom: new Date(),
            isActive: true,
        };
    }

    /**
     * Calculate costs based on token usage and pricing
     */
    private static async calculateCosts(
        inputTokens: number,
        outputTokens: number,
        modelId: modelID,
        provider: string,
        pricing: ModelPricingInfo | null
    ): Promise<{ estimatedCost: number; actualCost: number | null }> {
        const calculationId = nanoid(); // Unique ID for this cost calculation
        logDiagnostic('COST_CALC_START', `Starting cost calculation`, {
            calculationId,
            inputTokens,
            outputTokens,
            modelId,
            provider,
            hasPricing: !!pricing
        });

        try {
            logDiagnostic('COST_CALC_SERVICE', `Using CostCalculationService`, {
                calculationId,
                inputTokens,
                outputTokens,
                modelId,
                provider
            });

            // Use the new CostCalculationService for more accurate calculations
            const costBreakdown = await CostCalculationService.calculateCost(
                inputTokens,
                outputTokens,
                modelId,
                provider,
                { includeVolumeDiscounts: false } // Don't apply volume discounts for individual records
            );

            logDiagnostic('COST_CALC_SERVICE_RESULT', `CostCalculationService result`, {
                calculationId,
                subtotal: costBreakdown.subtotal,
                totalCost: costBreakdown.totalCost,
                currency: costBreakdown.currency
            });

            const result = {
                estimatedCost: costBreakdown.subtotal, // Use subtotal before discounts
                actualCost: costBreakdown.totalCost
            };

            logDiagnostic('COST_CALC_SUCCESS', `Cost calculation completed successfully`, { calculationId, result });
            return result;
        } catch (error) {
            logDiagnostic('COST_CALC_SERVICE_ERROR', `Error calculating costs with CostCalculationService`, {
                calculationId,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });

            console.error('[TokenTracking] Error calculating costs with CostCalculationService:', error);

            logDiagnostic('COST_CALC_FALLBACK', `Using fallback calculation method`, {
                calculationId,
                hasPricing: !!pricing,
                pricing: pricing ? {
                    inputTokenPrice: pricing.inputTokenPrice,
                    outputTokenPrice: pricing.outputTokenPrice,
                    currency: pricing.currency
                } : null
            });

            // Fallback to original calculation method
            if (!pricing) {
                const noPricingResult = { estimatedCost: 0, actualCost: null };
                logDiagnostic('COST_CALC_NO_PRICING', `No pricing available, returning zero cost`, { calculationId, result: noPricingResult });
                return noPricingResult;
            }

            // Convert prices from per 1M tokens to per token
            const inputPricePerToken = pricing.inputTokenPrice / 1000000;
            const outputPricePerToken = pricing.outputTokenPrice / 1000000;

            const inputCost = inputTokens * inputPricePerToken;
            const outputCost = outputTokens * outputPricePerToken;
            const estimatedCost = inputCost + outputCost;

            // For now, actual cost is the same as estimated (could be adjusted with actual billing data)
            const actualCost = estimatedCost;

            const fallbackResult = { estimatedCost, actualCost };

            logDiagnostic('COST_CALC_FALLBACK_SUCCESS', `Fallback calculation completed`, {
                calculationId,
                inputPricePerToken,
                outputPricePerToken,
                inputCost,
                outputCost,
                estimatedCost,
                actualCost,
                result: fallbackResult
            });

            return fallbackResult;
        }
    }

    /**
     * Update daily token usage aggregation
     */
    private static async updateDailyTokenUsage(params: {
        userId: string;
        provider: string;
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
        estimatedCost: number;
        actualCost: number;
    }): Promise<void> {
        const updateId = nanoid(); // Unique ID for this update attempt
        logDiagnostic('DAILY_UPDATE_START', `Starting daily token usage update`, {
            updateId,
            userId: params.userId,
            provider: params.provider,
            inputTokens: params.inputTokens,
            outputTokens: params.outputTokens
        });

        try {
            // Use UTC date to avoid timezone issues
            const today = new Date();
            const todayString = today.toISOString().split('T')[0];

            logDiagnostic('DAILY_LOOKUP', `Checking for existing daily entry`, {
                updateId,
                userId: params.userId,
                date: todayString,
                provider: params.provider
            });

            // Check if entry exists for today
            const existing = await db.query.dailyTokenUsage.findFirst({
                where: and(
                    eq(dailyTokenUsage.userId, params.userId),
                    eq(dailyTokenUsage.date, todayString),
                    eq(dailyTokenUsage.provider, params.provider)
                ),
            });

            logDiagnostic('DAILY_LOOKUP_RESULT', `Existing entry check result`, {
                updateId,
                hasExisting: !!existing,
                existingId: existing?.id
            });

            if (existing) {
                // Update existing entry
                logDiagnostic('DAILY_UPDATE_EXISTING', `Updating existing daily entry`, {
                    updateId,
                    existingId: existing.id,
                    currentTokens: {
                        input: existing.totalInputTokens,
                        output: existing.totalOutputTokens,
                        total: existing.totalTokens
                    },
                    addingTokens: {
                        input: params.inputTokens,
                        output: params.outputTokens,
                        total: params.totalTokens
                    }
                });

                await db.update(dailyTokenUsage).set({
                    totalInputTokens: sql`${dailyTokenUsage.totalInputTokens} + ${params.inputTokens}`,
                    totalOutputTokens: sql`${dailyTokenUsage.totalOutputTokens} + ${params.outputTokens}`,
                    totalTokens: sql`${dailyTokenUsage.totalTokens} + ${params.totalTokens}`,
                    totalEstimatedCost: sql`${dailyTokenUsage.totalEstimatedCost} + ${params.estimatedCost}`,
                    totalActualCost: sql`${dailyTokenUsage.totalActualCost} + ${params.actualCost}`,
                    requestCount: sql`${dailyTokenUsage.requestCount} + 1`,
                    updatedAt: new Date(),
                }).where(
                    and(
                        eq(dailyTokenUsage.id, existing.id)
                    )
                );

                logDiagnostic('DAILY_UPDATE_SUCCESS', `Successfully updated existing daily entry`, { updateId, existingId: existing.id });
            } else {
                // Create new entry
                logDiagnostic('DAILY_CREATE_NEW', `Creating new daily entry`, {
                    updateId,
                    userId: params.userId,
                    date: todayString,
                    provider: params.provider,
                    tokens: {
                        input: params.inputTokens,
                        output: params.outputTokens,
                        total: params.totalTokens
                    }
                });

                const newId = nanoid();
                await db.insert(dailyTokenUsage).values({
                    id: newId,
                    userId: params.userId,
                    date: todayString,
                    provider: params.provider,
                    totalInputTokens: params.inputTokens,
                    totalOutputTokens: params.outputTokens,
                    totalTokens: params.totalTokens,
                    totalEstimatedCost: params.estimatedCost.toString(),
                    totalActualCost: params.actualCost.toString(),
                    requestCount: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

                logDiagnostic('DAILY_CREATE_SUCCESS', `Successfully created new daily entry`, { updateId, newId });
            }
        } catch (error) {
            logDiagnostic('DAILY_UPDATE_ERROR', `Error updating daily token usage`, {
                updateId,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                params
            });
            console.error('[TokenTracking] Error updating daily token usage:', error);
            // Don't throw - this is not critical for the main functionality
        }
    }

    /**
     * Get token usage statistics for a user
     */
    static async getUserTokenStats(userId: string, options?: {
        startDate?: Date;
        endDate?: Date;
        provider?: string;
    }): Promise<{
        totalInputTokens: number;
        totalOutputTokens: number;
        totalTokens: number;
        totalEstimatedCost: number;
        totalActualCost: number;
        requestCount: number;
        breakdownByProvider: Array<{
            provider: string;
            inputTokens: number;
            outputTokens: number;
            totalTokens: number;
            estimatedCost: number;
            actualCost: number;
            requestCount: number;
        }>;
    }> {
        try {
            // Build query conditions
            const conditions = [eq(tokenUsageMetrics.userId, userId)];
            if (options?.startDate) {
                conditions.push(gte(tokenUsageMetrics.createdAt, options.startDate));
            }
            if (options?.endDate) {
                conditions.push(lte(tokenUsageMetrics.createdAt, options.endDate));
            }
            if (options?.provider) {
                conditions.push(eq(tokenUsageMetrics.provider, options.provider));
            }

            const query = db.select({
                totalInputTokens: sql<number>`SUM(${tokenUsageMetrics.inputTokens})`,
                totalOutputTokens: sql<number>`SUM(${tokenUsageMetrics.outputTokens})`,
                totalTokens: sql<number>`SUM(${tokenUsageMetrics.totalTokens})`,
                totalEstimatedCost: sql<number>`SUM(${tokenUsageMetrics.estimatedCost})`,
                totalActualCost: sql<number>`SUM(COALESCE(${tokenUsageMetrics.actualCost}, 0))`,
                requestCount: sql<number>`COUNT(*)`,
            }).from(tokenUsageMetrics).where(and(...conditions));

            const result = await query;

            // Get breakdown by provider
            const breakdownConditions = [eq(tokenUsageMetrics.userId, userId)];
            if (options?.startDate) {
                breakdownConditions.push(gte(tokenUsageMetrics.createdAt, options.startDate));
            }
            if (options?.endDate) {
                breakdownConditions.push(lte(tokenUsageMetrics.createdAt, options.endDate));
            }
            if (options?.provider) {
                breakdownConditions.push(eq(tokenUsageMetrics.provider, options.provider));
            }

            const breakdownQuery = db.select({
                provider: tokenUsageMetrics.provider,
                inputTokens: sql<number>`SUM(${tokenUsageMetrics.inputTokens})`,
                outputTokens: sql<number>`SUM(${tokenUsageMetrics.outputTokens})`,
                totalTokens: sql<number>`SUM(${tokenUsageMetrics.totalTokens})`,
                estimatedCost: sql<number>`SUM(${tokenUsageMetrics.estimatedCost})`,
                actualCost: sql<number>`SUM(COALESCE(${tokenUsageMetrics.actualCost}, 0))`,
                requestCount: sql<number>`COUNT(*)`,
            }).from(tokenUsageMetrics)
                .where(and(...breakdownConditions))
                .groupBy(tokenUsageMetrics.provider);

            const breakdown = await breakdownQuery;

            return {
                totalInputTokens: Number(result[0]?.totalInputTokens || 0),
                totalOutputTokens: Number(result[0]?.totalOutputTokens || 0),
                totalTokens: Number(result[0]?.totalTokens || 0),
                totalEstimatedCost: Number(result[0]?.totalEstimatedCost || 0),
                totalActualCost: Number(result[0]?.totalActualCost || 0),
                requestCount: Number(result[0]?.requestCount || 0),
                breakdownByProvider: breakdown.map(item => ({
                    provider: item.provider,
                    inputTokens: Number(item.inputTokens),
                    outputTokens: Number(item.outputTokens),
                    totalTokens: Number(item.totalTokens),
                    estimatedCost: Number(item.estimatedCost),
                    actualCost: Number(item.actualCost),
                    requestCount: Number(item.requestCount),
                })),
            };
        } catch (error) {
            console.error('[TokenTracking] Error getting user token stats:', error);
            throw error;
        }
    }

    /**
     * Get daily token usage for a user
     */
    static async getDailyTokenUsage(userId: string, options?: {
        startDate?: Date;
        endDate?: Date;
        provider?: string;
    }): Promise<Array<{
        date: Date;
        provider: string;
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
        estimatedCost: number;
        actualCost: number;
        requestCount: number;
    }>> {
        try {
            // Build query conditions
            const conditions = [eq(dailyTokenUsage.userId, userId)];
            if (options?.startDate) {
                conditions.push(gte(dailyTokenUsage.date, options.startDate.toISOString().split('T')[0]));
            }
            if (options?.endDate) {
                conditions.push(lte(dailyTokenUsage.date, options.endDate.toISOString().split('T')[0]));
            }
            if (options?.provider) {
                conditions.push(eq(dailyTokenUsage.provider, options.provider));
            }

            const query = db.select().from(dailyTokenUsage)
                .where(and(...conditions))
                .orderBy(desc(dailyTokenUsage.date));

            const result = await query;

            return result.map(item => ({
                date: new Date(item.date),
                provider: item.provider,
                inputTokens: item.totalInputTokens,
                outputTokens: item.totalOutputTokens,
                totalTokens: item.totalTokens,
                estimatedCost: Number(item.totalEstimatedCost),
                actualCost: Number(item.totalActualCost),
                requestCount: item.requestCount,
            }));
        } catch (error) {
            console.error('[TokenTracking] Error getting daily token usage:', error);
            throw error;
        }
    }

    /**
     * Get token usage statistics for a specific chat
     */
    static async getChatTokenUsage(chatId: string, userId: string): Promise<{
        totalInputTokens: number;
        totalOutputTokens: number;
        totalTokens: number;
        totalEstimatedCost: number;
        totalActualCost: number;
        messageCount: number;
        breakdownByMessage: Array<{
            messageId: string;
            modelId: string;
            provider: string;
            inputTokens: number;
            outputTokens: number;
            totalTokens: number;
            estimatedCost: number;
            actualCost: number;
            createdAt: Date;
        }>;
    }> {
        try {
            // Get all token usage records for this chat
            const records = await db.query.tokenUsageMetrics.findMany({
                where: and(
                    eq(tokenUsageMetrics.chatId, chatId),
                    eq(tokenUsageMetrics.userId, userId)
                ),
                orderBy: desc(tokenUsageMetrics.createdAt),
            });

            // Calculate totals
            const totalInputTokens = records.reduce((sum, record) => sum + record.inputTokens, 0);
            const totalOutputTokens = records.reduce((sum, record) => sum + record.outputTokens, 0);
            const totalTokens = totalInputTokens + totalOutputTokens;
            const totalEstimatedCost = records.reduce((sum, record) => sum + parseFloat(record.estimatedCost.toString()), 0);
            const totalActualCost = records.reduce((sum, record) => {
                const actualCost = record.actualCost ? parseFloat(record.actualCost.toString()) : 0;
                return sum + actualCost;
            }, 0);

            // Create breakdown by message
            const breakdownByMessage = records.map(record => ({
                messageId: record.messageId,
                modelId: record.modelId,
                provider: record.provider,
                inputTokens: record.inputTokens,
                outputTokens: record.outputTokens,
                totalTokens: record.totalTokens,
                estimatedCost: parseFloat(record.estimatedCost.toString()),
                actualCost: record.actualCost ? parseFloat(record.actualCost.toString()) : 0,
                createdAt: record.createdAt,
            }));

            return {
                totalInputTokens,
                totalOutputTokens,
                totalTokens,
                totalEstimatedCost,
                totalActualCost,
                messageCount: records.length,
                breakdownByMessage,
            };
        } catch (error) {
            console.error('[TokenTracking] Error getting chat token usage:', error);
            return {
                totalInputTokens: 0,
                totalOutputTokens: 0,
                totalTokens: 0,
                totalEstimatedCost: 0,
                totalActualCost: 0,
                messageCount: 0,
                breakdownByMessage: [],
            };
        }
    }

    /**
     * Set up model pricing information
     */
    static async setModelPricing(pricing: Omit<ModelPricingInfo, 'effectiveFrom'>): Promise<void> {
        const pricingId = nanoid(); // Unique ID for this pricing update
        logDiagnostic('PRICING_SET_START', `Starting model pricing update`, {
            pricingId,
            modelId: pricing.modelId,
            provider: pricing.provider,
            inputPrice: pricing.inputTokenPrice,
            outputPrice: pricing.outputTokenPrice,
            currency: pricing.currency,
            isActive: pricing.isActive
        });

        try {
            logDiagnostic('PRICING_DEACTIVATE_START', `Deactivating existing pricing`, {
                pricingId,
                modelId: pricing.modelId,
                provider: pricing.provider
            });

            // Deactivate existing pricing for this model/provider
            const deactivateResult = await db.update(modelPricing).set({
                isActive: false,
                effectiveTo: new Date(),
                updatedAt: new Date(),
            }).where(
                and(
                    eq(modelPricing.modelId, pricing.modelId),
                    eq(modelPricing.provider, pricing.provider),
                    eq(modelPricing.isActive, true)
                )
            );

            logDiagnostic('PRICING_DEACTIVATE_RESULT', `Deactivation result`, {
                pricingId,
                rowsAffected: deactivateResult ? 'unknown' : 'none'
            });

            logDiagnostic('PRICING_INSERT_START', `Inserting new pricing`, {
                pricingId,
                modelId: pricing.modelId,
                provider: pricing.provider,
                inputPrice: pricing.inputTokenPrice,
                outputPrice: pricing.outputTokenPrice
            });

            // Insert new pricing
            const newPricingId = nanoid();
            await db.insert(modelPricing).values({
                id: newPricingId,
                modelId: pricing.modelId,
                provider: pricing.provider,
                inputTokenPrice: pricing.inputTokenPrice.toString(),
                outputTokenPrice: pricing.outputTokenPrice.toString(),
                currency: pricing.currency,
                effectiveFrom: new Date(),
                isActive: pricing.isActive,
                metadata: {},
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            logDiagnostic('PRICING_INSERT_SUCCESS', `Successfully inserted new pricing`, {
                pricingId,
                newPricingId
            });

            console.log(`[TokenTracking] Updated pricing for ${pricing.modelId}/${pricing.provider}`);
        } catch (error) {
            logDiagnostic('PRICING_SET_ERROR', `Error setting model pricing`, {
                pricingId,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                pricing
            });
            console.error('[TokenTracking] Error setting model pricing:', error);
            throw error;
        }
    }
}
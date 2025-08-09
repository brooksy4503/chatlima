import { db } from '@/lib/db';
import { tokenUsageMetrics, modelPricing, dailyTokenUsage, users } from '@/lib/db/schema';
import { eq, and, gte, lte, desc, sql, sum, count, avg } from 'drizzle-orm';
import { modelID } from '@/ai/providers';
import { nanoid } from 'nanoid';

// Diagnostic logging helper
const logDiagnostic = (category: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[CostCalculation:${category}] ${timestamp} - ${message}`, data || '');
};

/**
 * Currency exchange rates interface
 */
export interface CurrencyRates {
    [currency: string]: number;
}

/**
 * Volume discount tier interface
 */
export interface VolumeDiscountTier {
    minTokens: number;
    maxTokens?: number;
    discountPercentage: number;
}

/**
 * Provider pricing configuration interface
 */
export interface ProviderPricingConfig {
    provider: string;
    currency: string;
    volumeDiscountTiers: VolumeDiscountTier[];
    specialModels?: {
        [modelId: string]: {
            inputTokenPrice: number;
            outputTokenPrice: number;
        };
    };
}

/**
 * Cost calculation options interface
 */
export interface CostCalculationOptions {
    includeVolumeDiscounts?: boolean;
    currency?: string;
    exchangeRates?: CurrencyRates;
    customPricing?: {
        [modelId: string]: {
            inputTokenPrice: number;
            outputTokenPrice: number;
        };
    };
}

/**
 * Cost breakdown interface
 */
export interface CostBreakdown {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    inputCost: number;
    outputCost: number;
    subtotal: number;
    discountAmount: number;
    totalCost: number;
    currency: string;
    volumeDiscountApplied?: boolean;
    discountPercentage?: number;
}

/**
 * Aggregated cost data interface
 */
export interface AggregatedCostData {
    totalInputTokens: number;
    totalOutputTokens: number;
    totalTokens: number;
    totalInputCost: number;
    totalOutputCost: number;
    totalSubtotal: number;
    totalDiscount: number;
    totalCost: number;
    currency: string;
    requestCount: number;
    averageCostPerRequest: number;
    averageCostPerToken: number;
    breakdownByProvider: {
        [provider: string]: CostBreakdown;
    };
    breakdownByModel: {
        [modelId: string]: CostBreakdown;
    };
    breakdownByDay: {
        [date: string]: CostBreakdown;
    };
}

/**
 * Projected cost interface
 */
export interface ProjectedCost {
    projectedDailyCost: number;
    projectedMonthlyCost: number;
    projectedYearlyCost: number;
    currency: string;
    basedOnPeriod: {
        days: number;
        startDate: Date;
        endDate: Date;
    };
    confidence: 'low' | 'medium' | 'high';
}

/**
 * Usage limit warning interface
 */
export interface UsageLimitWarning {
    isApproachingLimit: boolean;
    isOverLimit: boolean;
    currentUsage: number;
    limit: number;
    percentageUsed: number;
    projectedOverage: number;
    currency: string;
    recommendations: string[];
}

/**
 * Cost Calculation Service
 * 
 * Provides comprehensive cost calculation and analytics for token usage
 * across different AI providers and models with support for volume discounts,
 * currency conversion, and usage projections.
 */
export class CostCalculationService {
    private static defaultCurrency = 'USD';

    // Cache for pricing data to avoid repeated database queries
    private static pricingCache = new Map<string, {
        data: { inputTokenPrice: number; outputTokenPrice: number; currency: string; source: 'database' | 'default' };
        timestamp: number;
    }>();
    private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    private static defaultExchangeRates: CurrencyRates = {
        USD: 1,
        EUR: 0.85,
        GBP: 0.73,
        JPY: 110,
        AUD: 1.35,
        CAD: 1.25,
    };

    private static providerConfigs: ProviderPricingConfig[] = [
        {
            provider: 'openai',
            currency: 'USD',
            volumeDiscountTiers: [
                { minTokens: 0, maxTokens: 1000000, discountPercentage: 0 },
                { minTokens: 1000001, maxTokens: 10000000, discountPercentage: 5 },
                { minTokens: 10000001, maxTokens: 50000000, discountPercentage: 10 },
                { minTokens: 50000001, discountPercentage: 15 },
            ],
        },
        {
            provider: 'anthropic',
            currency: 'USD',
            volumeDiscountTiers: [
                { minTokens: 0, maxTokens: 500000, discountPercentage: 0 },
                { minTokens: 500001, maxTokens: 5000000, discountPercentage: 3 },
                { minTokens: 5000001, maxTokens: 25000000, discountPercentage: 7 },
                { minTokens: 25000001, discountPercentage: 12 },
            ],
        },
        {
            provider: 'google',
            currency: 'USD',
            volumeDiscountTiers: [
                { minTokens: 0, maxTokens: 2000000, discountPercentage: 0 },
                { minTokens: 2000001, maxTokens: 20000000, discountPercentage: 4 },
                { minTokens: 20000001, maxTokens: 100000000, discountPercentage: 8 },
                { minTokens: 100000001, discountPercentage: 12 },
            ],
        },
        {
            provider: 'groq',
            currency: 'USD',
            volumeDiscountTiers: [
                { minTokens: 0, maxTokens: 5000000, discountPercentage: 0 },
                { minTokens: 5000001, maxTokens: 50000000, discountPercentage: 2 },
                { minTokens: 50000001, discountPercentage: 5 },
            ],
        },
        {
            provider: 'xai',
            currency: 'USD',
            volumeDiscountTiers: [
                { minTokens: 0, maxTokens: 1000000, discountPercentage: 0 },
                { minTokens: 1000001, maxTokens: 10000000, discountPercentage: 3 },
                { minTokens: 10000001, discountPercentage: 7 },
            ],
        },
        {
            provider: 'openrouter',
            currency: 'USD',
            volumeDiscountTiers: [
                { minTokens: 0, maxTokens: 1000000, discountPercentage: 0 },
                { minTokens: 1000001, maxTokens: 10000000, discountPercentage: 2 },
                { minTokens: 10000001, discountPercentage: 5 },
            ],
        },
        {
            provider: 'requesty',
            currency: 'USD',
            volumeDiscountTiers: [
                { minTokens: 0, maxTokens: 2000000, discountPercentage: 0 },
                { minTokens: 2000001, maxTokens: 20000000, discountPercentage: 3 },
                { minTokens: 20000001, discountPercentage: 6 },
            ],
        },
    ];

    /**
     * Calculate cost for a single token usage record
     */
    static async calculateCostForRecord(
        recordId: string,
        options: CostCalculationOptions = {}
    ): Promise<CostBreakdown> {
        try {
            const record = await db.query.tokenUsageMetrics.findFirst({
                where: eq(tokenUsageMetrics.id, recordId),
            });

            if (!record) {
                throw new Error(`Token usage record with ID ${recordId} not found`);
            }

            return this.calculateCost(
                record.inputTokens,
                record.outputTokens,
                record.modelId,
                record.provider,
                options
            );
        } catch (error) {
            console.error('[CostCalculation] Error calculating cost for record:', error);
            throw error;
        }
    }

    /**
     * Calculate cost for a specific token usage with pre-fetched pricing
     */
    private static async calculateCostWithPricing(
        inputTokens: number,
        outputTokens: number,
        modelId: modelID,
        provider: string,
        pricing: { inputTokenPrice: number; outputTokenPrice: number; currency: string; source: 'database' | 'default' },
        options: CostCalculationOptions = {}
    ): Promise<CostBreakdown> {
        const calculationId = nanoid();
        logDiagnostic('CALCULATE_WITH_PRICING_START', `Starting cost calculation with pre-fetched pricing`, {
            calculationId,
            inputTokens,
            outputTokens,
            modelId,
            provider,
            pricingSource: pricing.source
        });

        try {
            const {
                includeVolumeDiscounts = true,
                currency = this.defaultCurrency,
                exchangeRates = this.defaultExchangeRates,
            } = options;

            // Convert prices to per-token values
            let inputPricePerToken: number;
            let outputPricePerToken: number;

            if (pricing.source === 'database') {
                // Database prices are already per-token
                inputPricePerToken = pricing.inputTokenPrice;
                outputPricePerToken = pricing.outputTokenPrice;
            } else {
                // Default prices are per 1M tokens
                inputPricePerToken = pricing.inputTokenPrice / 1000000;
                outputPricePerToken = pricing.outputTokenPrice / 1000000;
            }

            // Calculate base costs
            const inputCost = inputTokens * inputPricePerToken;
            const outputCost = outputTokens * outputPricePerToken;
            const subtotal = inputCost + outputCost;

            // Apply volume discounts if enabled
            let discountAmount = 0;
            let volumeDiscountApplied = false;
            let discountPercentage = 0;

            if (includeVolumeDiscounts) {
                const totalTokens = inputTokens + outputTokens;
                const providerConfig = this.providerConfigs.find(c => c.provider === provider);

                if (providerConfig) {
                    for (const tier of providerConfig.volumeDiscountTiers) {
                        if (totalTokens >= tier.minTokens && (!tier.maxTokens || totalTokens <= tier.maxTokens)) {
                            discountPercentage = tier.discountPercentage;
                            discountAmount = subtotal * (discountPercentage / 100);
                            volumeDiscountApplied = true;
                            break;
                        }
                    }
                }
            }

            const totalCost = subtotal - discountAmount;

            // Convert currency if needed
            let finalCost = totalCost;
            let finalCurrency = currency;
            if (pricing.currency !== currency && exchangeRates[pricing.currency] && exchangeRates[currency]) {
                finalCost = this.convertCurrency(totalCost, pricing.currency, currency, exchangeRates);
                finalCurrency = currency;
            }

            const result = {
                inputTokens,
                outputTokens,
                totalTokens: inputTokens + outputTokens,
                inputCost,
                outputCost,
                subtotal,
                discountAmount,
                totalCost: finalCost,
                currency: finalCurrency,
                volumeDiscountApplied,
                discountPercentage,
            };

            logDiagnostic('CALCULATE_WITH_PRICING_SUCCESS', `Cost calculation completed with pre-fetched pricing`, {
                calculationId,
                result: {
                    inputCost,
                    outputCost,
                    subtotal,
                    discountAmount,
                    totalCost: finalCost,
                    currency: finalCurrency
                }
            });

            return result;
        } catch (error) {
            logDiagnostic('CALCULATE_WITH_PRICING_ERROR', `Error calculating cost with pre-fetched pricing`, {
                calculationId,
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * Calculate cost based on token usage
     */
    static async calculateCost(
        inputTokens: number,
        outputTokens: number,
        modelId: modelID,
        provider: string,
        options: CostCalculationOptions = {}
    ): Promise<CostBreakdown> {
        const calculationId = nanoid(); // Unique ID for this cost calculation
        logDiagnostic('CALCULATE_START', `Starting cost calculation`, {
            calculationId,
            inputTokens,
            outputTokens,
            modelId,
            provider,
            options
        });

        try {
            const {
                includeVolumeDiscounts = true,
                currency = this.defaultCurrency,
                exchangeRates = this.defaultExchangeRates,
                customPricing = {},
            } = options;

            logDiagnostic('PRICING_LOOKUP', `Looking up pricing information`, {
                calculationId,
                modelId,
                provider,
                hasCustomPricing: !!customPricing[modelId],
                requestedCurrency: currency
            });

            // Get pricing information
            let inputTokenPrice: number;
            let outputTokenPrice: number;
            let pricingCurrency: string;
            let pricingSource: 'custom' | 'database' | 'default' = 'default';

            // Check for custom pricing first
            if (customPricing[modelId]) {
                logDiagnostic('PRICING_CUSTOM', `Using custom pricing`, {
                    calculationId,
                    modelId,
                    inputPrice: customPricing[modelId].inputTokenPrice,
                    outputPrice: customPricing[modelId].outputTokenPrice
                });

                inputTokenPrice = customPricing[modelId].inputTokenPrice;
                outputTokenPrice = customPricing[modelId].outputTokenPrice;
                pricingCurrency = currency;
                pricingSource = 'custom';
            } else {
                // Get pricing from database
                logDiagnostic('PRICING_DB_QUERY', `Querying database for pricing`, {
                    calculationId,
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
                        lte(modelPricing.effectiveFrom, new Date()),
                        sql`${modelPricing.effectiveTo} IS NULL OR ${modelPricing.effectiveTo} >= ${new Date()}`
                    ),
                    orderBy: desc(modelPricing.effectiveFrom),
                });

                if (pricing) {
                    logDiagnostic('PRICING_DB_FOUND', `Found pricing in database`, {
                        calculationId,
                        dbPricingId: pricing.id,
                        inputPrice: pricing.inputTokenPrice,
                        outputPrice: pricing.outputTokenPrice,
                        currency: pricing.currency
                    });

                    inputTokenPrice = parseFloat(pricing.inputTokenPrice.toString());
                    outputTokenPrice = parseFloat(pricing.outputTokenPrice.toString());
                    pricingCurrency = pricing.currency;
                    pricingSource = 'database';
                } else {
                    logDiagnostic('PRICING_DB_NOT_FOUND', `No pricing in database, using default`, {
                        calculationId,
                        modelId,
                        provider
                    });

                    // Use default pricing based on provider
                    const providerConfig = this.providerConfigs.find(c => c.provider === provider);
                    if (!providerConfig) {
                        logDiagnostic('PRICING_NO_CONFIG', `No provider configuration found`, {
                            calculationId,
                            provider
                        });
                        throw new Error(`No pricing configuration found for provider: ${provider}`);
                    }

                    // Check for special model pricing
                    if (providerConfig.specialModels && providerConfig.specialModels[modelId]) {
                        logDiagnostic('PRICING_SPECIAL_MODEL', `Using special model pricing`, {
                            calculationId,
                            modelId,
                            inputPrice: providerConfig.specialModels[modelId].inputTokenPrice,
                            outputPrice: providerConfig.specialModels[modelId].outputTokenPrice
                        });

                        inputTokenPrice = providerConfig.specialModels[modelId].inputTokenPrice;
                        outputTokenPrice = providerConfig.specialModels[modelId].outputTokenPrice;
                    } else {
                        // Use default provider pricing
                        const defaultPrices = this.getDefaultProviderPricing(provider);
                        logDiagnostic('PRICING_DEFAULT_PROVIDER', `Using default provider pricing`, {
                            calculationId,
                            provider,
                            inputPrice: defaultPrices.input,
                            outputPrice: defaultPrices.output
                        });

                        inputTokenPrice = defaultPrices.input;
                        outputTokenPrice = defaultPrices.output;
                    }
                    pricingCurrency = providerConfig.currency;
                }
            }

            // Convert prices to per-token values
            // Database prices are already per-token, default prices are per 1M tokens
            let inputPricePerToken: number;
            let outputPricePerToken: number;

            if (pricingSource === 'database') {
                // Database prices are already per-token (in dollars per token)
                logDiagnostic('PRICING_CONVERSION', `Using database prices (already per-token)`, {
                    calculationId,
                    inputTokenPrice,
                    outputTokenPrice
                });
                inputPricePerToken = inputTokenPrice;
                outputPricePerToken = outputTokenPrice;
            } else {
                // Default and custom prices are per 1M tokens
                logDiagnostic('PRICING_CONVERSION', `Converting default/custom prices (per 1M tokens)`, {
                    calculationId,
                    inputTokenPrice,
                    outputTokenPrice
                });
                inputPricePerToken = inputTokenPrice / 1000000;
                outputPricePerToken = outputTokenPrice / 1000000;
            }

            logDiagnostic('COST_CALCULATION', `Calculating base costs`, {
                calculationId,
                pricingSource,
                inputPricePerToken,
                outputPricePerToken,
                pricingCurrency
            });

            // Calculate base costs
            const inputCost = inputTokens * inputPricePerToken;
            const outputCost = outputTokens * outputPricePerToken;
            const subtotal = inputCost + outputCost;

            logDiagnostic('BASE_COSTS', `Base costs calculated`, {
                calculationId,
                inputCost,
                outputCost,
                subtotal
            });

            // Apply volume discounts if enabled
            let discountAmount = 0;
            let volumeDiscountApplied = false;
            let discountPercentage = 0;

            if (includeVolumeDiscounts) {
                const totalTokens = inputTokens + outputTokens;
                const providerConfig = this.providerConfigs.find(c => c.provider === provider);

                logDiagnostic('VOLUME_DISCOUNT_CHECK', `Checking volume discounts`, {
                    calculationId,
                    totalTokens,
                    provider,
                    hasProviderConfig: !!providerConfig
                });

                if (providerConfig) {
                    for (const tier of providerConfig.volumeDiscountTiers) {
                        if (totalTokens >= tier.minTokens && (!tier.maxTokens || totalTokens <= tier.maxTokens)) {
                            discountAmount = subtotal * (tier.discountPercentage / 100);
                            volumeDiscountApplied = true;
                            discountPercentage = tier.discountPercentage;

                            logDiagnostic('VOLUME_DISCOUNT_APPLIED', `Volume discount applied`, {
                                calculationId,
                                tier: {
                                    minTokens: tier.minTokens,
                                    maxTokens: tier.maxTokens,
                                    discountPercentage: tier.discountPercentage
                                },
                                discountAmount,
                                discountPercentage
                            });

                            break;
                        }
                    }
                }
            }

            const totalCost = subtotal - discountAmount;

            logDiagnostic('COST_BEFORE_CURRENCY', `Cost before currency conversion`, {
                calculationId,
                subtotal,
                discountAmount,
                totalCost,
                originalCurrency: pricingCurrency
            });

            // Convert to requested currency if needed
            const finalInputCost = this.convertCurrency(inputCost, pricingCurrency, currency, exchangeRates);
            const finalOutputCost = this.convertCurrency(outputCost, pricingCurrency, currency, exchangeRates);
            const finalSubtotal = this.convertCurrency(subtotal, pricingCurrency, currency, exchangeRates);
            const finalDiscountAmount = this.convertCurrency(discountAmount, pricingCurrency, currency, exchangeRates);
            const finalTotalCost = this.convertCurrency(totalCost, pricingCurrency, currency, exchangeRates);

            logDiagnostic('CURRENCY_CONVERSION', `Currency conversion applied`, {
                calculationId,
                fromCurrency: pricingCurrency,
                toCurrency: currency,
                rates: exchangeRates,
                convertedCosts: {
                    inputCost: finalInputCost,
                    outputCost: finalOutputCost,
                    subtotal: finalSubtotal,
                    discountAmount: finalDiscountAmount,
                    totalCost: finalTotalCost
                }
            });

            const result = {
                inputTokens,
                outputTokens,
                totalTokens: inputTokens + outputTokens,
                inputCost: finalInputCost,
                outputCost: finalOutputCost,
                subtotal: finalSubtotal,
                discountAmount: finalDiscountAmount,
                totalCost: finalTotalCost,
                currency,
                volumeDiscountApplied,
                discountPercentage,
            };

            logDiagnostic('CALCULATE_SUCCESS', `Cost calculation completed successfully`, {
                calculationId,
                result
            });

            return result;
        } catch (error) {
            logDiagnostic('CALCULATE_ERROR', `Error calculating cost`, {
                calculationId,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                inputTokens,
                outputTokens,
                modelId,
                provider
            });
            console.error('[CostCalculation] Error calculating cost:', error);
            throw error;
        }
    }

    /**
     * Get aggregated costs for a user over a time period
     */
    static async getAggregatedCosts(
        userId: string,
        options: {
            startDate?: Date;
            endDate?: Date;
            provider?: string;
            modelId?: modelID;
            currency?: string;
            includeVolumeDiscounts?: boolean;
        } = {}
    ): Promise<AggregatedCostData> {
        const aggregationId = nanoid(); // Unique ID for this aggregation
        logDiagnostic('AGGREGATE_START', `Starting aggregated costs calculation`, {
            aggregationId,
            userId,
            options
        });

        try {
            const {
                startDate,
                endDate,
                provider,
                modelId,
                currency = this.defaultCurrency,
                includeVolumeDiscounts = true,
            } = options;

            logDiagnostic('AGGREGATE_PARAMS', `Processing aggregation parameters`, {
                aggregationId,
                userId,
                startDate: startDate?.toISOString(),
                endDate: endDate?.toISOString(),
                provider,
                modelId,
                currency,
                includeVolumeDiscounts
            });

            // Build query conditions
            const conditions = [eq(tokenUsageMetrics.userId, userId)];
            if (startDate) {
                conditions.push(gte(tokenUsageMetrics.createdAt, startDate));
            }
            if (endDate) {
                conditions.push(lte(tokenUsageMetrics.createdAt, endDate));
            }
            if (provider) {
                conditions.push(eq(tokenUsageMetrics.provider, provider));
            }
            if (modelId) {
                conditions.push(eq(tokenUsageMetrics.modelId, modelId));
            }

            logDiagnostic('AGGREGATE_DB_QUERY', `Querying database for token usage metrics`, {
                aggregationId,
                conditionsCount: conditions.length,
                hasDateFilter: !!(startDate || endDate),
                hasProviderFilter: !!provider,
                hasModelFilter: !!modelId
            });

            // Get all matching records
            const records = await db.query.tokenUsageMetrics.findMany({
                where: and(...conditions),
                orderBy: desc(tokenUsageMetrics.createdAt),
            });

            logDiagnostic('AGGREGATE_DB_RESULT', `Database query result`, {
                aggregationId,
                recordCount: records.length,
                recordsSample: records.slice(0, 3).map(r => ({
                    id: r.id,
                    modelId: r.modelId,
                    provider: r.provider,
                    inputTokens: r.inputTokens,
                    outputTokens: r.outputTokens,
                    createdAt: r.createdAt.toISOString()
                }))
            });

            // Batch fetch pricing for all unique model-provider combinations
            const uniqueModelProviders = Array.from(new Set(records.map(r => `${r.modelId}:${r.provider}`)))
                .map(pair => {
                    const [modelId, provider] = pair.split(':');
                    return { modelId, provider };
                });

            logDiagnostic('AGGREGATE_BATCH_PRICING_START', `Starting batch pricing lookup`, {
                aggregationId,
                uniqueModelCount: uniqueModelProviders.length,
                totalRecordCount: records.length
            });

            const batchPricing = await this.getBatchPricing(uniqueModelProviders, { currency, includeVolumeDiscounts });

            logDiagnostic('AGGREGATE_BATCH_PRICING_COMPLETE', `Batch pricing lookup completed`, {
                aggregationId,
                pricingMapSize: batchPricing.size,
                databasePricingCount: Array.from(batchPricing.values()).filter(p => p.source === 'database').length,
                defaultPricingCount: Array.from(batchPricing.values()).filter(p => p.source === 'default').length
            });

            // Calculate costs for each record using batch pricing
            const costBreakdowns: CostBreakdown[] = [];
            logDiagnostic('AGGREGATE_COST_CALC_START', `Starting cost calculation for records`, {
                aggregationId,
                recordCount: records.length
            });

            for (let i = 0; i < records.length; i++) {
                const record = records[i];
                const pricingKey = `${record.modelId}:${record.provider}`;
                const pricing = batchPricing.get(pricingKey);

                if (!pricing) {
                    logDiagnostic('AGGREGATE_PRICING_MISSING', `No pricing found for model`, {
                        aggregationId,
                        recordIndex: i,
                        modelId: record.modelId,
                        provider: record.provider
                    });
                    continue;
                }

                logDiagnostic('AGGREGATE_COST_CALC_RECORD', `Calculating cost for record`, {
                    aggregationId,
                    recordIndex: i,
                    recordId: record.id,
                    modelId: record.modelId,
                    provider: record.provider,
                    inputTokens: record.inputTokens,
                    outputTokens: record.outputTokens,
                    pricingSource: pricing.source
                });

                // Calculate costs using batch pricing data
                const breakdown = await this.calculateCostWithPricing(
                    record.inputTokens,
                    record.outputTokens,
                    record.modelId,
                    record.provider,
                    pricing,
                    { currency, includeVolumeDiscounts }
                );
                costBreakdowns.push(breakdown);
            }

            logDiagnostic('AGGREGATE_COST_CALC_COMPLETE', `Completed cost calculation for all records`, {
                aggregationId,
                breakdownCount: costBreakdowns.length
            });

            // Aggregate costs
            let totalInputTokens = 0;
            let totalOutputTokens = 0;
            let totalInputCost = 0;
            let totalOutputCost = 0;
            let totalSubtotal = 0;
            let totalDiscount = 0;
            let totalCost = 0;

            const breakdownByProvider: { [provider: string]: CostBreakdown } = {};
            const breakdownByModel: { [modelId: string]: CostBreakdown } = {};
            const breakdownByDay: { [date: string]: CostBreakdown } = {};

            logDiagnostic('AGGREGATE_PROCESSING', `Processing cost breakdowns`, {
                aggregationId,
                breakdownCount: costBreakdowns.length
            });

            for (const breakdown of costBreakdowns) {
                const record = records[costBreakdowns.indexOf(breakdown)];
                if (!record) continue;

                // Update totals
                totalInputTokens += breakdown.inputTokens;
                totalOutputTokens += breakdown.outputTokens;
                totalInputCost += breakdown.inputCost;
                totalOutputCost += breakdown.outputCost;
                totalSubtotal += breakdown.subtotal;
                totalDiscount += breakdown.discountAmount;
                totalCost += breakdown.totalCost;

                // Update provider breakdown
                if (!breakdownByProvider[record.provider]) {
                    breakdownByProvider[record.provider] = {
                        inputTokens: 0,
                        outputTokens: 0,
                        totalTokens: 0,
                        inputCost: 0,
                        outputCost: 0,
                        subtotal: 0,
                        discountAmount: 0,
                        totalCost: 0,
                        currency,
                    };
                }
                breakdownByProvider[record.provider].inputTokens += breakdown.inputTokens;
                breakdownByProvider[record.provider].outputTokens += breakdown.outputTokens;
                breakdownByProvider[record.provider].totalTokens += breakdown.totalTokens;
                breakdownByProvider[record.provider].inputCost += breakdown.inputCost;
                breakdownByProvider[record.provider].outputCost += breakdown.outputCost;
                breakdownByProvider[record.provider].subtotal += breakdown.subtotal;
                breakdownByProvider[record.provider].discountAmount += breakdown.discountAmount;
                breakdownByProvider[record.provider].totalCost += breakdown.totalCost;

                // Update model breakdown
                if (!breakdownByModel[record.modelId]) {
                    breakdownByModel[record.modelId] = {
                        inputTokens: 0,
                        outputTokens: 0,
                        totalTokens: 0,
                        inputCost: 0,
                        outputCost: 0,
                        subtotal: 0,
                        discountAmount: 0,
                        totalCost: 0,
                        currency,
                    };
                }
                breakdownByModel[record.modelId].inputTokens += breakdown.inputTokens;
                breakdownByModel[record.modelId].outputTokens += breakdown.outputTokens;
                breakdownByModel[record.modelId].totalTokens += breakdown.totalTokens;
                breakdownByModel[record.modelId].inputCost += breakdown.inputCost;
                breakdownByModel[record.modelId].outputCost += breakdown.outputCost;
                breakdownByModel[record.modelId].subtotal += breakdown.subtotal;
                breakdownByModel[record.modelId].discountAmount += breakdown.discountAmount;
                breakdownByModel[record.modelId].totalCost += breakdown.totalCost;

                // Update daily breakdown
                const dateKey = record.createdAt.toISOString().split('T')[0];
                if (!breakdownByDay[dateKey]) {
                    breakdownByDay[dateKey] = {
                        inputTokens: 0,
                        outputTokens: 0,
                        totalTokens: 0,
                        inputCost: 0,
                        outputCost: 0,
                        subtotal: 0,
                        discountAmount: 0,
                        totalCost: 0,
                        currency,
                    };
                }
                breakdownByDay[dateKey].inputTokens += breakdown.inputTokens;
                breakdownByDay[dateKey].outputTokens += breakdown.outputTokens;
                breakdownByDay[dateKey].totalTokens += breakdown.totalTokens;
                breakdownByDay[dateKey].inputCost += breakdown.inputCost;
                breakdownByDay[dateKey].outputCost += breakdown.outputCost;
                breakdownByDay[dateKey].subtotal += breakdown.subtotal;
                breakdownByDay[dateKey].discountAmount += breakdown.discountAmount;
                breakdownByDay[dateKey].totalCost += breakdown.totalCost;
            }

            const requestCount = records.length;
            const averageCostPerRequest = requestCount > 0 ? totalCost / requestCount : 0;
            const averageCostPerToken = totalInputTokens + totalOutputTokens > 0 ? totalCost / (totalInputTokens + totalOutputTokens) : 0;

            logDiagnostic('AGGREGATE_SUMMARY', `Aggregation summary`, {
                aggregationId,
                totals: {
                    totalInputTokens,
                    totalOutputTokens,
                    totalTokens: totalInputTokens + totalOutputTokens,
                    totalInputCost,
                    totalOutputCost,
                    totalSubtotal,
                    totalDiscount,
                    totalCost
                },
                averages: {
                    averageCostPerRequest,
                    averageCostPerToken
                },
                breakdowns: {
                    providersCount: Object.keys(breakdownByProvider).length,
                    modelsCount: Object.keys(breakdownByModel).length,
                    daysCount: Object.keys(breakdownByDay).length
                }
            });

            const result = {
                totalInputTokens,
                totalOutputTokens,
                totalTokens: totalInputTokens + totalOutputTokens,
                totalInputCost,
                totalOutputCost,
                totalSubtotal,
                totalDiscount,
                totalCost,
                currency,
                requestCount,
                averageCostPerRequest,
                averageCostPerToken,
                breakdownByProvider,
                breakdownByModel,
                breakdownByDay,
            };

            logDiagnostic('AGGREGATE_SUCCESS', `Aggregated costs calculation completed successfully`, {
                aggregationId,
                result: {
                    ...result,
                    // Don't log the full breakdown objects to avoid overly verbose logs
                    breakdownByProvider: Object.keys(result.breakdownByProvider),
                    breakdownByModel: Object.keys(result.breakdownByModel),
                    breakdownByDay: Object.keys(result.breakdownByDay)
                }
            });

            return result;
        } catch (error) {
            logDiagnostic('AGGREGATE_ERROR', `Error getting aggregated costs`, {
                aggregationId,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                userId,
                options
            });
            console.error('[CostCalculation] Error getting aggregated costs:', error);
            throw error;
        }
    }

    /**
     * Calculate projected costs based on usage patterns
     */
    static async calculateProjectedCosts(
        userId: string,
        options: {
            periodDays?: number;
            provider?: string;
            modelId?: modelID;
            currency?: string;
        } = {}
    ): Promise<ProjectedCost> {
        try {
            const {
                periodDays = 30,
                provider,
                modelId,
                currency = this.defaultCurrency,
            } = options;

            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - periodDays);

            // Get aggregated costs for the period
            const aggregatedData = await this.getAggregatedCosts(userId, {
                startDate,
                endDate,
                provider,
                modelId,
                currency,
            });

            // Calculate daily average cost
            const dailyAverageCost = aggregatedData.totalCost / periodDays;

            // Project costs
            const projectedDailyCost = dailyAverageCost;
            const projectedMonthlyCost = dailyAverageCost * 30;
            const projectedYearlyCost = dailyAverageCost * 365;

            // Determine confidence based on data consistency
            let confidence: 'low' | 'medium' | 'high' = 'medium';
            if (periodDays < 7) {
                confidence = 'low';
            } else if (periodDays >= 30 && aggregatedData.requestCount > 100) {
                confidence = 'high';
            }

            return {
                projectedDailyCost,
                projectedMonthlyCost,
                projectedYearlyCost,
                currency,
                basedOnPeriod: {
                    days: periodDays,
                    startDate,
                    endDate,
                },
                confidence,
            };
        } catch (error) {
            console.error('[CostCalculation] Error calculating projected costs:', error);
            throw error;
        }
    }

    /**
     * Check if user is approaching usage limits
     */
    static async checkUsageLimits(
        userId: string,
        options: {
            monthlyLimit?: number;
            currency?: string;
        } = {}
    ): Promise<UsageLimitWarning> {
        try {
            const {
                monthlyLimit = 100, // Default $100 monthly limit
                currency = this.defaultCurrency,
            } = options;

            // Get current month's usage
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            const aggregatedData = await this.getAggregatedCosts(userId, {
                startDate: startOfMonth,
                endDate: now,
                currency,
            });

            const currentUsage = aggregatedData.totalCost;
            const percentageUsed = (currentUsage / monthlyLimit) * 100;

            // Calculate projected overage
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            const daysPassed = now.getDate();
            const daysRemaining = daysInMonth - daysPassed;
            const dailyAverage = currentUsage / daysPassed;
            const projectedMonthlyUsage = dailyAverage * daysInMonth;
            const projectedOverage = Math.max(0, projectedMonthlyUsage - monthlyLimit);

            // Generate recommendations
            const recommendations: string[] = [];
            if (percentageUsed > 80) {
                recommendations.push('Consider upgrading to a higher tier plan');
                recommendations.push('Monitor usage closely to avoid service interruption');
            }
            if (percentageUsed > 50) {
                recommendations.push('Review usage patterns and optimize where possible');
            }
            if (aggregatedData.breakdownByProvider) {
                const mostExpensiveProvider = Object.entries(aggregatedData.breakdownByProvider)
                    .sort(([, a], [, b]) => b.totalCost - a.totalCost)[0];
                if (mostExpensiveProvider) {
                    recommendations.push(`Consider using alternative providers to reduce costs (${mostExpensiveProvider[0]} is your most expensive provider)`);
                }
            }

            return {
                isApproachingLimit: percentageUsed > 80,
                isOverLimit: percentageUsed > 100,
                currentUsage,
                limit: monthlyLimit,
                percentageUsed,
                projectedOverage,
                currency,
                recommendations,
            };
        } catch (error) {
            console.error('[CostCalculation] Error checking usage limits:', error);
            throw error;
        }
    }

    /**
     * Get provider pricing configuration
     */
    static getProviderConfig(provider: string): ProviderPricingConfig | undefined {
        return this.providerConfigs.find(config => config.provider === provider);
    }

    /**
     * Get all provider configurations
     */
    static getAllProviderConfigs(): ProviderPricingConfig[] {
        return [...this.providerConfigs];
    }

    /**
     * Update provider configuration
     */
    static updateProviderConfig(provider: string, config: Partial<ProviderPricingConfig>): void {
        const index = this.providerConfigs.findIndex(c => c.provider === provider);
        if (index !== -1) {
            this.providerConfigs[index] = { ...this.providerConfigs[index], ...config };
        } else {
            this.providerConfigs.push({
                provider,
                currency: 'USD',
                volumeDiscountTiers: [],
                ...config,
            });
        }
    }

    /**
     * Convert currency
     */
    private static convertCurrency(
        amount: number,
        fromCurrency: string,
        toCurrency: string,
        exchangeRates: CurrencyRates
    ): number {
        if (fromCurrency === toCurrency) {
            return amount;
        }

        const fromRate = exchangeRates[fromCurrency] || 1;
        const toRate = exchangeRates[toCurrency] || 1;

        return (amount / fromRate) * toRate;
    }

    /**
     * Get default provider pricing
     */
    private static getDefaultProviderPricing(provider: string): { input: number; output: number } {
        const defaultPrices: Record<string, { input: number; output: number }> = {
            openai: { input: 0.0005, output: 0.0015 }, // $0.50 / 1M input, $1.50 / 1M output
            anthropic: { input: 0.003, output: 0.015 }, // $3.00 / 1M input, $15.00 / 1M output
            google: { input: 0.0005, output: 0.0015 }, // $0.50 / 1M input, $1.50 / 1M output
            groq: { input: 0.00005, output: 0.00008 }, // $0.05 / 1M input, $0.08 / 1M output
            xai: { input: 0.0002, output: 0.0006 }, // $0.20 / 1M input, $0.60 / 1M output
            openrouter: { input: 0.00125, output: 0.01 }, // Updated to match Gemini 2.5 Pro pricing: $1.25/$10 per 1M tokens
            requesty: { input: 0.0005, output: 0.0015 }, // Varies by model, using OpenAI as baseline
        };

        return defaultPrices[provider] || defaultPrices.openai;
    }

    /**
 * Batch fetch pricing for multiple models in a single query with caching
 */
    private static async getBatchPricing(
        modelProviderPairs: Array<{ modelId: string; provider: string }>,
        options: CostCalculationOptions = {}
    ): Promise<Map<string, { inputTokenPrice: number; outputTokenPrice: number; currency: string; source: 'database' | 'default' }>> {
        const pricingMap = new Map();
        const now = Date.now();

        // Extract unique model-provider combinations
        const uniquePairs = Array.from(new Set(modelProviderPairs.map(p => `${p.modelId}:${p.provider}`)))
            .map(pair => {
                const [modelId, provider] = pair.split(':');
                return { modelId, provider };
            });

        // Check cache first
        const uncachedPairs: Array<{ modelId: string; provider: string }> = [];
        for (const { modelId, provider } of uniquePairs) {
            const cacheKey = `${modelId}:${provider}`;
            const cached = this.pricingCache.get(cacheKey);

            if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
                pricingMap.set(cacheKey, cached.data);
            } else {
                uncachedPairs.push({ modelId, provider });
            }
        }

        // Only query database for uncached items
        if (uncachedPairs.length > 0) {
            const allPricing = await db.query.modelPricing.findMany({
                where: and(
                    sql`(${modelPricing.modelId}, ${modelPricing.provider}) IN (${sql.join(uncachedPairs.map(p => sql`(${p.modelId}, ${p.provider})`), sql`, `)})`,
                    eq(modelPricing.isActive, true),
                    lte(modelPricing.effectiveFrom, new Date()),
                    sql`${modelPricing.effectiveTo} IS NULL OR ${modelPricing.effectiveTo} >= ${new Date()}`
                ),
                orderBy: [desc(modelPricing.effectiveFrom), desc(modelPricing.modelId)]
            });

            // Group by model-provider and take the most recent for each
            const pricingByModel = new Map();
            for (const pricing of allPricing) {
                const key = `${pricing.modelId}:${pricing.provider}`;
                if (!pricingByModel.has(key)) {
                    pricingByModel.set(key, pricing);
                }
            }

            // Build result map with fallbacks for missing models
            for (const { modelId, provider } of uncachedPairs) {
                const key = `${modelId}:${provider}`;
                const pricing = pricingByModel.get(key);

                if (pricing) {
                    const pricingData = {
                        inputTokenPrice: parseFloat(pricing.inputTokenPrice.toString()),
                        outputTokenPrice: parseFloat(pricing.outputTokenPrice.toString()),
                        currency: pricing.currency,
                        source: 'database' as const
                    };
                    pricingMap.set(key, pricingData);
                    this.pricingCache.set(key, { data: pricingData, timestamp: now });
                } else {
                    // Use default pricing
                    const providerConfig = this.providerConfigs.find(c => c.provider === provider);
                    if (providerConfig) {
                        let inputPrice: number;
                        let outputPrice: number;

                        if (providerConfig.specialModels && providerConfig.specialModels[modelId]) {
                            inputPrice = providerConfig.specialModels[modelId].inputTokenPrice;
                            outputPrice = providerConfig.specialModels[modelId].outputTokenPrice;
                        } else {
                            const defaultPrices = this.getDefaultProviderPricing(provider);
                            inputPrice = defaultPrices.input;
                            outputPrice = defaultPrices.output;
                        }

                        const pricingData = {
                            inputTokenPrice: inputPrice,
                            outputTokenPrice: outputPrice,
                            currency: providerConfig.currency,
                            source: 'default' as const
                        };
                        pricingMap.set(key, pricingData);
                        this.pricingCache.set(key, { data: pricingData, timestamp: now });
                    }
                }
            }
        }

        return pricingMap;
    }
}
import { db } from '@/lib/db';
import { modelPricing } from '@/lib/db/schema';
import { eq, and, sql, count, avg, min, max } from 'drizzle-orm';
import { fetchAllModels, getEnvironmentApiKeys } from '@/lib/models/fetch-models';
import { nanoid } from 'nanoid';

export interface PricingSyncResult {
    success: boolean;
    modelsProcessed: number;
    newPricingEntries: number;
    updatedPricingEntries: number;
    errors: string[];
}

export class PricingSyncService {
    /**
     * Sync pricing data from model APIs to the modelPricing table
     */
    static async syncPricingData(): Promise<PricingSyncResult> {
        const result: PricingSyncResult = {
            success: false,
            modelsProcessed: 0,
            newPricingEntries: 0,
            updatedPricingEntries: 0,
            errors: []
        };

        // Track processed models to avoid duplicates
        const processedModels = new Set<string>();

        try {
            console.log('[PricingSync] Starting pricing data sync...');

            // Try to fetch current models with pricing from APIs
            let models: any[] = [];
            let useFallback = false;

            try {
                // Get environment API keys for server-side fetching
                const environmentKeys = getEnvironmentApiKeys();

                const modelsResponse = await fetchAllModels({
                    environment: environmentKeys,
                    user: {}
                }, true); // Force refresh

                if (modelsResponse && modelsResponse.models && modelsResponse.models.length > 0) {
                    models = modelsResponse.models;
                    console.log(`[PricingSync] Successfully fetched ${models.length} models from API`);
                } else {
                    console.log('[PricingSync] API fetch returned no models, using fallback pricing data');
                    useFallback = true;
                }
            } catch (error) {
                console.log('[PricingSync] API fetch error, using fallback pricing data:', error);
                useFallback = true;
            }

            if (useFallback) {
                models = this.getFallbackPricingData();
                console.log(`[PricingSync] Using fallback data with ${models.length} models`);
            }

            result.modelsProcessed = models.length;

            console.log(`[PricingSync] Processing ${models.length} models...`);

            for (const model of models) {
                try {
                    // Skip if already processed to avoid duplicates
                    if (processedModels.has(model.id)) {
                        console.log(`[PricingSync] Skipping model ${model.id} - already processed`);
                        continue;
                    }

                    // Skip models with no pricing data
                    if (!model.pricing?.input && !model.pricing?.output) {
                        console.log(`[PricingSync] Skipping model ${model.id} - no pricing data`);
                        continue;
                    }

                    // Skip models with zero or negative pricing (violates database constraint)
                    const inputPrice = model.pricing?.input || 0;
                    const outputPrice = model.pricing?.output || 0;

                    // Check for very small values that might be rounded to zero
                    const minValidPrice = 0.0000001; // 1e-7 minimum valid price (more conservative)

                    if (inputPrice <= minValidPrice || outputPrice <= minValidPrice) {
                        console.log(`[PricingSync] Skipping model ${model.id} - pricing too small (input: ${inputPrice}, output: ${outputPrice}) - below threshold ${minValidPrice}`);
                        continue;
                    }

                    // Log successful pricing data for debugging
                    console.log(`[PricingSync] Processing model ${model.id} with valid pricing (input: ${inputPrice}, output: ${outputPrice})`);

                    // Extract provider from model ID
                    const provider = this.extractProviderFromModelId(model.id);

                    // Check if pricing entry already exists
                    const existingPricing = await db
                        .select()
                        .from(modelPricing)
                        .where(
                            and(
                                eq(modelPricing.modelId, model.id),
                                eq(modelPricing.provider, provider),
                                eq(modelPricing.isActive, true)
                            )
                        )
                        .limit(1);

                    const pricingData = {
                        modelId: model.id,
                        provider,
                        inputTokenPrice: inputPrice,
                        outputTokenPrice: outputPrice,
                        currency: model.pricing.currency || 'USD',
                        effectiveFrom: new Date(),
                        isActive: true,
                        metadata: {
                            modelName: model.name,
                            capabilities: model.capabilities,
                            premium: model.premium,
                            vision: model.vision,
                            contextMax: model.contextMax
                        }
                    };

                    if (existingPricing.length > 0) {
                        // Update existing pricing entry
                        const existing = existingPricing[0];

                        // Check if pricing has changed
                        if (
                            existing.inputTokenPrice !== pricingData.inputTokenPrice ||
                            existing.outputTokenPrice !== pricingData.outputTokenPrice
                        ) {
                            try {
                                // Deactivate old pricing entry
                                await db
                                    .update(modelPricing)
                                    .set({
                                        isActive: false,
                                        effectiveTo: new Date(),
                                        updatedAt: new Date()
                                    })
                                    .where(eq(modelPricing.id, existing.id));

                                // Create new pricing entry
                                await db.insert(modelPricing).values({
                                    id: nanoid(),
                                    ...pricingData,
                                    createdAt: new Date(),
                                    updatedAt: new Date()
                                });

                                result.updatedPricingEntries++;
                                console.log(`[PricingSync] Updated pricing for ${model.id}`);
                            } catch (error) {
                                if (error instanceof Error && error.message.includes('duplicate key')) {
                                    console.log(`[PricingSync] Skipping ${model.id} - duplicate detected during update`);
                                    continue;
                                }
                                throw error;
                            }
                        } else {
                            console.log(`[PricingSync] Skipping ${model.id} - pricing unchanged`);
                        }
                    } else {
                        // Create new pricing entry
                        try {
                            await db.insert(modelPricing).values({
                                id: nanoid(),
                                ...pricingData,
                                createdAt: new Date(),
                                updatedAt: new Date()
                            });

                            result.newPricingEntries++;
                            console.log(`[PricingSync] Added new pricing for ${model.id}`);
                        } catch (error) {
                            if (error instanceof Error && error.message.includes('duplicate key')) {
                                console.log(`[PricingSync] Skipping ${model.id} - duplicate detected during insert`);
                                continue;
                            }
                            throw error;
                        }
                    }

                    // Mark as processed to avoid duplicates
                    processedModels.add(model.id);
                } catch (error) {
                    const errorMsg = `Failed to process model ${model.id}: ${error}`;
                    console.error(`[PricingSync] ${errorMsg}`);
                    result.errors.push(errorMsg);
                }
            }

            result.success = true;
            console.log(`[PricingSync] Sync completed successfully. Processed: ${result.modelsProcessed}, New: ${result.newPricingEntries}, Updated: ${result.updatedPricingEntries}`);
            console.log(`[PricingSync] Summary: ${result.newPricingEntries + result.updatedPricingEntries} pricing entries saved, ${result.errors.length} errors encountered`);
            console.log(`[PricingSync] Duplicates avoided: ${processedModels.size} unique models processed`);

        } catch (error) {
            const errorMsg = `Pricing sync failed: ${error}`;
            console.error(`[PricingSync] ${errorMsg}`);
            result.errors.push(errorMsg);
        }

        return result;
    }

    /**
     * Get fallback pricing data when API is not available
     */
    private static getFallbackPricingData() {
        return [
            {
                id: 'openrouter/anthropic/claude-3-5-sonnet-20241022',
                name: 'Claude 3.5 Sonnet',
                provider: 'OpenRouter',
                pricing: {
                    input: 0.000003,
                    output: 0.000015,
                    currency: 'USD'
                },
                capabilities: ['General Purpose', 'Reasoning'],
                premium: true,
                vision: false,
                contextMax: 200000
            },
            {
                id: 'openrouter/openai/gpt-4o',
                name: 'GPT-4o',
                provider: 'OpenRouter',
                pricing: {
                    input: 0.000005,
                    output: 0.000015,
                    currency: 'USD'
                },
                capabilities: ['General Purpose', 'Vision'],
                premium: true,
                vision: true,
                contextMax: 128000
            },
            {
                id: 'openrouter/openai/gpt-4o-mini',
                name: 'GPT-4o Mini',
                provider: 'OpenRouter',
                pricing: {
                    input: 0.00000015,
                    output: 0.0000006,
                    currency: 'USD'
                },
                capabilities: ['General Purpose', 'Fast'],
                premium: false,
                vision: true,
                contextMax: 128000
            },
            {
                id: 'requesty/anthropic/claude-3-5-sonnet-20241022',
                name: 'Claude 3.5 Sonnet',
                provider: 'Requesty',
                pricing: {
                    input: 0.000003,
                    output: 0.000015,
                    currency: 'USD'
                },
                capabilities: ['General Purpose', 'Reasoning'],
                premium: true,
                vision: false,
                contextMax: 200000
            },
            {
                id: 'requesty/openai/gpt-4o',
                name: 'GPT-4o',
                provider: 'Requesty',
                pricing: {
                    input: 0.000005,
                    output: 0.000015,
                    currency: 'USD'
                },
                capabilities: ['General Purpose', 'Vision'],
                premium: true,
                vision: true,
                contextMax: 128000
            }
        ];
    }

    /**
     * Extract provider name from model ID
     */
    private static extractProviderFromModelId(modelId: string): string {
        if (modelId.startsWith('openrouter/')) {
            return 'OpenRouter';
        } else if (modelId.startsWith('requesty/')) {
            return 'Requesty';
        } else if (modelId.includes('claude')) {
            return 'Anthropic';
        } else if (modelId.includes('gpt')) {
            return 'OpenAI';
        } else if (modelId.includes('grok')) {
            return 'XAI';
        } else if (modelId.includes('qwen')) {
            return 'Groq';
        } else {
            return 'Unknown';
        }
    }

    /**
     * Get current pricing statistics
     */
    static async getPricingStats() {
        const stats = await db
            .select({
                totalModels: count(),
                activeModels: count(),
                providers: modelPricing.provider,
                avgInputPrice: avg(modelPricing.inputTokenPrice),
                avgOutputPrice: avg(modelPricing.outputTokenPrice),
                minInputPrice: min(modelPricing.inputTokenPrice),
                maxInputPrice: max(modelPricing.inputTokenPrice),
                minOutputPrice: min(modelPricing.outputTokenPrice),
                maxOutputPrice: max(modelPricing.outputTokenPrice)
            })
            .from(modelPricing)
            .where(eq(modelPricing.isActive, true));

        return stats;
    }
} 
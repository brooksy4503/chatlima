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
    skippedModels: number;
    errors: string[];
    details: string[];
}

export class PricingSyncTestService {
    /**
     * TEST VERSION: Sync pricing data for only a few models to verify fixes
     */
    static async syncPricingDataTest(maxModels: number = 5): Promise<PricingSyncResult> {
        const result: PricingSyncResult = {
            success: false,
            modelsProcessed: 0,
            newPricingEntries: 0,
            updatedPricingEntries: 0,
            skippedModels: 0,
            errors: [],
            details: []
        };

        // Track processed models to avoid duplicates
        const processedModels = new Set<string>();

        try {
            console.log(`[PricingSyncTest] Starting LIMITED pricing data sync (max ${maxModels} models)...`);
            result.details.push(`Starting test sync with maximum ${maxModels} models`);

            // Try to fetch current models with pricing from APIs
            let models: any[] = [];
            let useFallback = false;

            try {
                // Get environment API keys for server-side fetching
                const environmentKeys = getEnvironmentApiKeys();
                result.details.push(`Environment keys available: ${Object.keys(environmentKeys).join(', ')}`);

                const modelsResponse = await fetchAllModels({
                    environment: environmentKeys,
                    user: {}
                }, true); // Force refresh

                if (modelsResponse && modelsResponse.models && modelsResponse.models.length > 0) {
                    models = modelsResponse.models;
                    console.log(`[PricingSyncTest] Successfully fetched ${models.length} models from API`);
                    result.details.push(`Fetched ${models.length} models from API`);
                } else {
                    console.log('[PricingSyncTest] API fetch returned no models, using fallback pricing data');
                    result.details.push('API fetch failed, using fallback data');
                    useFallback = true;
                }
            } catch (error) {
                console.log('[PricingSyncTest] API fetch error, using fallback pricing data:', error);
                result.errors.push(`API fetch error: ${error}`);
                result.details.push(`API fetch error: ${error}`);
                useFallback = true;
            }

            if (useFallback) {
                models = this.getFallbackPricingData();
                console.log(`[PricingSyncTest] Using fallback data with ${models.length} models`);
                result.details.push(`Using fallback data with ${models.length} models`);
            }

            // LIMIT MODELS FOR TESTING
            const originalCount = models.length;
            models = models.slice(0, maxModels);
            console.log(`[PricingSyncTest] LIMITED to ${models.length} models (from ${originalCount} total)`);
            result.details.push(`Limited to ${models.length} models for testing (from ${originalCount} total)`);

            result.modelsProcessed = models.length;

            console.log(`[PricingSyncTest] Processing ${models.length} models...`);

            for (const model of models) {
                try {
                    // Skip if already processed to avoid duplicates
                    if (processedModels.has(model.id)) {
                        console.log(`[PricingSyncTest] Skipping model ${model.id} - already processed`);
                        result.skippedModels++;
                        continue;
                    }

                    // Skip models with no pricing data
                    if (!model.pricing?.input && !model.pricing?.output) {
                        console.log(`[PricingSyncTest] Skipping model ${model.id} - no pricing data`);
                        result.details.push(`Skipped ${model.id}: no pricing data`);
                        result.skippedModels++;
                        continue;
                    }

                    // Skip models with zero or negative pricing
                    const inputPrice = model.pricing?.input || 0;
                    const outputPrice = model.pricing?.output || 0;

                    // UPDATED: More reasonable threshold (was too strict before)
                    const minValidPrice = 0.0000001; // 1e-7 minimum valid price

                    if (inputPrice <= 0 || outputPrice <= 0) {
                        console.log(`[PricingSyncTest] Skipping model ${model.id} - zero/negative pricing (input: ${inputPrice}, output: ${outputPrice})`);
                        result.details.push(`Skipped ${model.id}: zero/negative pricing`);
                        result.skippedModels++;
                        continue;
                    }

                    if (inputPrice < minValidPrice || outputPrice < minValidPrice) {
                        console.log(`[PricingSyncTest] Skipping model ${model.id} - pricing too small (input: ${inputPrice}, output: ${outputPrice}) - below threshold ${minValidPrice}`);
                        result.details.push(`Skipped ${model.id}: pricing below threshold (${inputPrice}, ${outputPrice})`);
                        result.skippedModels++;
                        continue;
                    }

                    // Log successful pricing data for debugging
                    console.log(`[PricingSyncTest] Processing model ${model.id} with valid pricing (input: ${inputPrice}, output: ${outputPrice})`);
                    result.details.push(`Processing ${model.id}: input=${inputPrice}, output=${outputPrice}`);

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
                            contextMax: model.contextMax,
                            testSync: true // Mark as test sync
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
                                // IMPROVED: Use transaction for atomicity
                                await db.transaction(async (tx) => {
                                    // Deactivate old pricing entry
                                    await tx
                                        .update(modelPricing)
                                        .set({
                                            isActive: false,
                                            effectiveTo: new Date(),
                                            updatedAt: new Date()
                                        })
                                        .where(eq(modelPricing.id, existing.id));

                                    // Create new pricing entry
                                    await tx.insert(modelPricing).values({
                                        id: nanoid(),
                                        ...pricingData,
                                        createdAt: new Date(),
                                        updatedAt: new Date()
                                    });
                                });

                                result.updatedPricingEntries++;
                                console.log(`[PricingSyncTest] ✅ Updated pricing for ${model.id}`);
                                result.details.push(`✅ Updated ${model.id}: ${existing.inputTokenPrice} → ${inputPrice}`);
                            } catch (error) {
                                if (error instanceof Error && error.message.includes('unique')) {
                                    console.log(`[PricingSyncTest] ⚠️ Skipping ${model.id} - unique constraint issue`);
                                    result.details.push(`⚠️ Skipped ${model.id}: unique constraint issue`);
                                    result.skippedModels++;
                                    continue;
                                }
                                throw error;
                            }
                        } else {
                            console.log(`[PricingSyncTest] ➡️ Skipping ${model.id} - pricing unchanged`);
                            result.details.push(`➡️ Unchanged ${model.id}: pricing already current`);
                            result.skippedModels++;
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
                            console.log(`[PricingSyncTest] ✅ Added new pricing for ${model.id}`);
                            result.details.push(`✅ Added new ${model.id}: input=${inputPrice}, output=${outputPrice}`);
                        } catch (error) {
                            if (error instanceof Error && error.message.includes('unique')) {
                                console.log(`[PricingSyncTest] ⚠️ Skipping ${model.id} - unique constraint issue during insert`);
                                result.details.push(`⚠️ Skipped ${model.id}: unique constraint issue (insert)`);
                                result.skippedModels++;
                                continue;
                            }
                            throw error;
                        }
                    }

                    // Mark as processed to avoid duplicates
                    processedModels.add(model.id);
                } catch (error) {
                    const errorMsg = `Failed to process model ${model.id}: ${error}`;
                    console.error(`[PricingSyncTest] ${errorMsg}`);
                    result.errors.push(errorMsg);
                    result.details.push(`❌ Error ${model.id}: ${error}`);
                }
            }

            result.success = true;
            console.log(`[PricingSyncTest] ✅ Test sync completed! Processed: ${result.modelsProcessed}, New: ${result.newPricingEntries}, Updated: ${result.updatedPricingEntries}, Skipped: ${result.skippedModels}`);
            result.details.push(`✅ Test sync completed: ${result.newPricingEntries + result.updatedPricingEntries} changes, ${result.skippedModels} skipped, ${result.errors.length} errors`);

        } catch (error) {
            const errorMsg = `Pricing sync test failed: ${error}`;
            console.error(`[PricingSyncTest] ${errorMsg}`);
            result.errors.push(errorMsg);
            result.details.push(`❌ Test sync failed: ${error}`);
        }

        return result;
    }

    /**
     * Get fallback pricing data when API is not available (limited for testing)
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
                activeModels: sql<number>`COUNT(*) FILTER (WHERE ${modelPricing.isActive} = true)`,
                inactiveModels: sql<number>`COUNT(*) FILTER (WHERE ${modelPricing.isActive} = false)`,
                avgInputPrice: avg(modelPricing.inputTokenPrice),
                avgOutputPrice: avg(modelPricing.outputTokenPrice),
                minInputPrice: min(modelPricing.inputTokenPrice),
                maxInputPrice: max(modelPricing.inputTokenPrice),
                minOutputPrice: min(modelPricing.outputTokenPrice),
                maxOutputPrice: max(modelPricing.outputTokenPrice)
            })
            .from(modelPricing);

        return stats[0];
    }
}
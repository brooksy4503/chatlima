/**
 * OpenRouter cost extraction service
 * Extracts actual costs from OpenRouter API responses instead of estimating
 */

interface OpenRouterCostData {
    actualCost: number | null;
    inputTokens: number | null;
    outputTokens: number | null;
    totalCost: number | null;
    currency: string;
    source: 'response' | 'generation_api' | 'estimated';
}

export class OpenRouterCostExtractor {
    /**
     * Extract cost information from OpenRouter API response
     */
    static extractCostFromResponse(response: any): OpenRouterCostData {
        try {
            // Check for cost information in the usage object
            const usage = response?.usage;

            if (usage) {
                // OpenRouter may include cost information directly in usage
                if (usage.total_cost !== undefined) {
                    return {
                        actualCost: Number(usage.total_cost),
                        inputTokens: usage.prompt_tokens || usage.input_tokens || null,
                        outputTokens: usage.completion_tokens || usage.output_tokens || null,
                        totalCost: Number(usage.total_cost),
                        currency: 'USD',
                        source: 'response'
                    };
                }

                // Some models include cost per token information
                if (usage.cost_per_input_token && usage.cost_per_output_token) {
                    const inputTokens = usage.prompt_tokens || usage.input_tokens || 0;
                    const outputTokens = usage.completion_tokens || usage.output_tokens || 0;
                    const totalCost = (inputTokens * usage.cost_per_input_token) + (outputTokens * usage.cost_per_output_token);

                    return {
                        actualCost: totalCost,
                        inputTokens,
                        outputTokens,
                        totalCost,
                        currency: 'USD',
                        source: 'response'
                    };
                }
            }

            // Check for cost information at the root level
            if (response.total_cost !== undefined) {
                return {
                    actualCost: Number(response.total_cost),
                    inputTokens: response.usage?.prompt_tokens || response.usage?.input_tokens || null,
                    outputTokens: response.usage?.completion_tokens || response.usage?.output_tokens || null,
                    totalCost: Number(response.total_cost),
                    currency: 'USD',
                    source: 'response'
                };
            }

            // No cost information found in response
            return {
                actualCost: null,
                inputTokens: response.usage?.prompt_tokens || response.usage?.input_tokens || null,
                outputTokens: response.usage?.completion_tokens || response.usage?.output_tokens || null,
                totalCost: null,
                currency: 'USD',
                source: 'estimated'
            };

        } catch (error) {
            console.warn('Error extracting cost from OpenRouter response:', error);
            return {
                actualCost: null,
                inputTokens: null,
                outputTokens: null,
                totalCost: null,
                currency: 'USD',
                source: 'estimated'
            };
        }
    }

    /**
     * Update pricing cache based on actual OpenRouter costs
     * This helps improve future estimations
     */
    static updatePricingCacheFromActualCost(
        modelId: string,
        inputTokens: number,
        outputTokens: number,
        actualCost: number
    ): void {
        try {
            if (inputTokens > 0 && outputTokens > 0 && actualCost > 0) {
                // Calculate actual cost per token to update cache
                const totalTokens = inputTokens + outputTokens;
                const costPerToken = actualCost / totalTokens;
                const costPer1MTokens = costPerToken * 1000000;

                // Import and update the simple cost estimation cache
                // This requires the cache to be accessible, which might need refactoring
                console.log(`[OpenRouterCostExtractor] Learned pricing for ${modelId}: $${costPer1MTokens.toFixed(2)} per 1M tokens`);

                // You could store this in a database table for pricing updates
                // or update the in-memory cache in SimpleCostEstimationService
            }
        } catch (error) {
            console.warn('Error updating pricing cache from actual cost:', error);
        }
    }

    /**
     * Validate that cost data makes sense
     */
    static validateCostData(costData: OpenRouterCostData): boolean {
        // Check for reasonable cost bounds (prevent obvious API errors)
        if (costData.actualCost !== null) {
            // Cost should be positive and reasonable (not more than $100 per request)
            if (costData.actualCost < 0 || costData.actualCost > 100) {
                console.warn(`Suspicious cost detected: $${costData.actualCost}`);
                return false;
            }
        }

        // Check token counts are reasonable
        if (costData.inputTokens !== null && costData.inputTokens < 0) return false;
        if (costData.outputTokens !== null && costData.outputTokens < 0) return false;

        return true;
    }

    /**
     * Get a reasonable cost estimate if no actual cost is available
     */
    static getEstimatedCost(
        modelId: string,
        inputTokens: number,
        outputTokens: number
    ): number {
        // Simple fallback estimation based on common OpenRouter pricing
        const modelPricing: Record<string, { input: number; output: number }> = {
            'openai/gpt-4o': { input: 2.5, output: 10 },
            'openai/gpt-4o-mini': { input: 0.15, output: 0.6 },
            'anthropic/claude-3.5-sonnet': { input: 3, output: 15 },
            'anthropic/claude-3.5-haiku': { input: 0.8, output: 4 },
            'google/gemini-pro': { input: 0.5, output: 1.5 },
        };

        const pricing = modelPricing[modelId] || { input: 1, output: 3 }; // Default
        return (inputTokens * pricing.input + outputTokens * pricing.output) / 1000000;
    }
}

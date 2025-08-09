/**
 * Simplified cost estimation service for real-time usage
 * Provides fast estimates without expensive database queries
 */

import { nanoid } from 'nanoid';

// In-memory cache for pricing data
const PRICING_CACHE = new Map<string, { price: number; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface SimpleCostEstimate {
    estimatedCost: number;
    currency: string;
    source: 'cache' | 'default';
}

interface UsageEstimate {
    dailyTokens: number;
    monthlyTokens: number;
    dailyCost: number;
    monthlyCost: number;
}

export class SimpleCostEstimationService {
    private static defaultPricing: Record<string, { input: number; output: number }> = {
        // OpenRouter pricing per 1M tokens (USD)
        'openai/gpt-4o': { input: 2.5, output: 10 },
        'openai/gpt-4o-mini': { input: 0.15, output: 0.6 },
        'openai/gpt-3.5-turbo': { input: 0.5, output: 1.5 },
        'anthropic/claude-3.5-sonnet': { input: 3, output: 15 },
        'anthropic/claude-3.5-haiku': { input: 0.8, output: 4 },
        'google/gemini-pro': { input: 0.5, output: 1.5 },
        // Add more models as needed - these are rough estimates
    };

    /**
     * Get fast cost estimate for tokens without database queries
     */
    static estimateCost(
        inputTokens: number,
        outputTokens: number,
        modelId: string,
        provider: string = 'openrouter'
    ): SimpleCostEstimate {
        const cacheKey = `${provider}:${modelId}`;

        // Check cache first
        const cached = PRICING_CACHE.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            const totalTokens = inputTokens + outputTokens;
            return {
                estimatedCost: (totalTokens * cached.price) / 1000000, // Convert from per-1M to per-token
                currency: 'USD',
                source: 'cache'
            };
        }

        // Use default pricing
        const pricing = this.defaultPricing[modelId] || { input: 1, output: 2 }; // Fallback
        const inputCost = (inputTokens * pricing.input) / 1000000;
        const outputCost = (outputTokens * pricing.output) / 1000000;
        const totalCost = inputCost + outputCost;

        // Cache the average price for simple lookups
        const avgPrice = (pricing.input + pricing.output) / 2;
        PRICING_CACHE.set(cacheKey, { price: avgPrice, timestamp: Date.now() });

        return {
            estimatedCost: totalCost,
            currency: 'USD',
            source: 'default'
        };
    }

    /**
     * Fast usage estimation without expensive aggregation queries
     * Uses approximate calculations for real-time limits checking
     */
    static async estimateUsage(userId: string): Promise<UsageEstimate> {
        // For now, return conservative estimates
        // In a real implementation, you could use pre-computed daily/monthly totals
        // that are updated by background jobs

        return {
            dailyTokens: 0, // Placeholder - implement based on your needs
            monthlyTokens: 0,
            dailyCost: 0,
            monthlyCost: 0
        };
    }

    /**
     * Update pricing cache from external source (e.g., OpenRouter API)
     */
    static updatePricingCache(modelId: string, provider: string, averagePrice: number): void {
        const cacheKey = `${provider}:${modelId}`;
        PRICING_CACHE.set(cacheKey, { price: averagePrice, timestamp: Date.now() });
    }

    /**
     * Clear expired entries from cache
     */
    static cleanupCache(): void {
        const now = Date.now();
        for (const [key, value] of PRICING_CACHE.entries()) {
            if (now - value.timestamp > CACHE_TTL) {
                PRICING_CACHE.delete(key);
            }
        }
    }
}

// Clean up cache every hour
setInterval(() => {
    SimpleCostEstimationService.cleanupCache();
}, 60 * 60 * 1000);

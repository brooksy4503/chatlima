/**
 * Simplified cost calculation service
 * Replaces the complex 1,302-line CostCalculationService with lightweight alternatives
 * Focused on essential functionality without expensive database operations
 */

import { SimpleCostEstimationService } from './simpleCostEstimation';
import { OpenRouterCostExtractor } from './openRouterCostExtractor';

export interface SimpleCostBreakdown {
    subtotal: number;
    totalCost: number;
    currency: string;
    inputTokens: number;
    outputTokens: number;
    volumeDiscountApplied: boolean;
    discountAmount: number;
    source: 'actual' | 'estimated' | 'cached';
}

export interface SimpleCostCalculationOptions {
    includeVolumeDiscounts?: boolean;
    currency?: string;
    exchangeRates?: Record<string, number>;
    openRouterResponse?: any;
}

export class SimplifiedCostCalculationService {
    /**
     * Calculate cost using simplified logic - no database queries
     * Much faster than the original CostCalculationService
     */
    static calculateCost(
        inputTokens: number,
        outputTokens: number,
        modelId: string,
        provider: string,
        options: SimpleCostCalculationOptions = {}
    ): SimpleCostBreakdown {
        const {
            includeVolumeDiscounts = false,
            currency = 'USD',
            openRouterResponse
        } = options;

        let actualCost: number | null = null;
        let source: 'actual' | 'estimated' | 'cached' = 'estimated';

        // Try to extract actual cost from OpenRouter response first
        if (provider === 'openrouter' && openRouterResponse) {
            const costData = OpenRouterCostExtractor.extractCostFromResponse(openRouterResponse);
            if (costData.actualCost !== null && OpenRouterCostExtractor.validateCostData(costData)) {
                actualCost = costData.actualCost;
                source = 'actual';
            }
        }

        // Fallback to estimation if no actual cost
        let totalCost: number;
        if (actualCost !== null) {
            totalCost = actualCost;
        } else {
            const estimate = SimpleCostEstimationService.estimateCost(inputTokens, outputTokens, modelId, provider);
            totalCost = estimate.estimatedCost;
            source = estimate.source as 'estimated' | 'cached';
        }

        // Apply simple volume discount if enabled
        let discountAmount = 0;
        let volumeDiscountApplied = false;

        if (includeVolumeDiscounts && totalCost > 0) {
            // Simple discount: 5% for requests over $1, 10% for requests over $5
            if (totalCost > 5) {
                discountAmount = totalCost * 0.1;
                volumeDiscountApplied = true;
            } else if (totalCost > 1) {
                discountAmount = totalCost * 0.05;
                volumeDiscountApplied = true;
            }
        }

        const subtotal = totalCost;
        const finalCost = totalCost - discountAmount;

        return {
            subtotal,
            totalCost: finalCost,
            currency,
            inputTokens,
            outputTokens,
            volumeDiscountApplied,
            discountAmount,
            source
        };
    }

    /**
     * Simplified cost calculation for a record (async version for compatibility)
     */
    static async calculateCostAsync(
        inputTokens: number,
        outputTokens: number,
        modelId: string,
        provider: string,
        options: SimpleCostCalculationOptions = {}
    ): Promise<SimpleCostBreakdown> {
        // Just call the synchronous version - no expensive async operations
        return this.calculateCost(inputTokens, outputTokens, modelId, provider, options);
    }

    /**
     * Batch cost calculation for multiple requests
     */
    static calculateBatchCosts(
        requests: Array<{
            inputTokens: number;
            outputTokens: number;
            modelId: string;
            provider: string;
            options?: SimpleCostCalculationOptions;
        }>
    ): SimpleCostBreakdown[] {
        return requests.map(req =>
            this.calculateCost(req.inputTokens, req.outputTokens, req.modelId, req.provider, req.options)
        );
    }

    /**
     * Get aggregated costs for a user (simplified version)
     * This is a placeholder - for production, you'd implement proper aggregation
     */
    static async getAggregatedCosts(
        userId: string,
        options: {
            startDate: Date;
            endDate: Date;
            currency?: string;
        }
    ): Promise<{ totalCost: number; currency: string; recordCount: number }> {
        // For now, return minimal data
        // In a full implementation, you could query pre-computed aggregates
        return {
            totalCost: 0,
            currency: options.currency || 'USD',
            recordCount: 0
        };
    }

    /**
     * Calculate cost for a specific record (simplified version)
     */
    static async calculateCostForRecord(
        recordId: string,
        options: SimpleCostCalculationOptions = {}
    ): Promise<SimpleCostBreakdown> {
        // Placeholder implementation
        // In a full version, you'd fetch the record and calculate its cost
        return {
            subtotal: 0,
            totalCost: 0,
            currency: options.currency || 'USD',
            inputTokens: 0,
            outputTokens: 0,
            volumeDiscountApplied: false,
            discountAmount: 0,
            source: 'estimated'
        };
    }
}

// Export the simplified service as the default cost calculation service
export { SimplifiedCostCalculationService as FastCostCalculationService };

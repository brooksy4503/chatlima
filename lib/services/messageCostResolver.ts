import { OpenRouterCostExtractor } from './openRouterCostExtractor';
import { SimpleCostEstimationService } from './simpleCostEstimation';
import { isOpenRouterFreeModel } from '@/lib/utils/creditCostCalculator';

export type MessageCostSource =
    | 'openrouter_response'
    | 'openrouter_generation'
    | 'estimated';

export interface ResolvedMessageCost {
    actualCost: number | null;
    estimatedCost: number;
    costSource: MessageCostSource;
}

export interface ResolveMessageCostParams {
    inputTokens: number;
    outputTokens: number;
    modelId: string;
    provider: string;
    providerResponse?: unknown;
}

/**
 * Resolve per-message dollar cost at write time (sync, no DB).
 * Prefers OpenRouter actual cost from the provider response, then fast estimation.
 */
export function resolveMessageCost(params: ResolveMessageCostParams): ResolvedMessageCost {
    const { inputTokens, outputTokens, modelId, provider, providerResponse } = params;

    let actualCost: number | null = null;
    let costSource: MessageCostSource = 'estimated';

    if (provider === 'openrouter' && providerResponse) {
        const costData = OpenRouterCostExtractor.extractCostFromResponse(providerResponse);
        if (costData.actualCost !== null && OpenRouterCostExtractor.validateCostData(costData)) {
            actualCost = costData.actualCost;
            costSource = 'openrouter_response';

            if (costData.inputTokens && costData.outputTokens) {
                OpenRouterCostExtractor.updatePricingCacheFromActualCost(
                    modelId,
                    costData.inputTokens,
                    costData.outputTokens,
                    actualCost
                );
            }
        }
    }

    let estimatedCost: number;
    try {
        estimatedCost = SimpleCostEstimationService.estimateCost(
            inputTokens,
            outputTokens,
            modelId,
            provider
        ).estimatedCost;
    } catch {
        estimatedCost = OpenRouterCostExtractor.getEstimatedCost(modelId, inputTokens, outputTokens);
    }

    if (actualCost === null && isOpenRouterFreeModel(modelId)) {
        actualCost = 0;
        costSource = 'openrouter_response';
    }

    return {
        actualCost,
        estimatedCost,
        costSource,
    };
}

/** Authoritative row cost: provider actual when present, otherwise estimate. */
export function authoritativeRowCost(
    actualCost: string | null | undefined,
    estimatedCost: string | number
): number {
    if (actualCost !== null && actualCost !== undefined && actualCost !== '') {
        const parsed = parseFloat(String(actualCost));
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }
    const estimated = parseFloat(String(estimatedCost));
    return Number.isFinite(estimated) ? estimated : 0;
}

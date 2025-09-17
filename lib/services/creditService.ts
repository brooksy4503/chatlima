import { hasEnoughCredits, WEB_SEARCH_COST } from '@/lib/tokenCounter';
import { getRemainingCredits, getRemainingCreditsByExternalId } from '@/lib/polar';
import { createRequestCreditCache, hasEnoughCreditsWithCache } from '@/lib/services/creditCache';
import { getModelDetails } from '@/lib/models/fetch-models';
import type { modelID } from '@/ai/providers';
import type { ModelInfo } from '@/lib/types/models';

export interface CreditCheckResult {
    hasCredits: boolean;
    actualCredits: number | null;
    isUsingOwnApiKeys: boolean;
    isFreeModel: boolean;
    creditCache: any;
}

export interface CreditCheckParams {
    selectedModel: modelID;
    apiKeys: Record<string, string>;
    estimatedTokens: number;
    userId: string;
    isAnonymous: boolean;
    polarCustomerId?: string;
    modelInfo?: ModelInfo;
}

export class CreditService {
    /**
     * Check if user is using their own API keys
     */
    static checkIfUsingOwnApiKeys(selectedModel: modelID, apiKeys: Record<string, string> = {}): boolean {
        // Map model providers to their API key names
        const providerKeyMap: Record<string, string> = {
            'openai': 'OPENAI_API_KEY',
            'anthropic': 'ANTHROPIC_API_KEY',
            'groq': 'GROQ_API_KEY',
            'xai': 'XAI_API_KEY',
            'openrouter': 'OPENROUTER_API_KEY',
            'requesty': 'REQUESTY_API_KEY'
        };

        // Extract provider from model ID
        const provider = selectedModel.split('/')[0];
        const requiredApiKey = providerKeyMap[provider];

        if (!requiredApiKey) {
            return false; // Unknown provider
        }

        // Check if user has provided their own API key for this provider
        const hasApiKey = Boolean(apiKeys[requiredApiKey] && apiKeys[requiredApiKey].trim().length > 0);

        return hasApiKey;
    }

    /**
     * Check if model is free
     */
    static isFreeModel(selectedModel: modelID): boolean {
        return selectedModel.endsWith(':free');
    }

    /**
     * Perform comprehensive credit check
     */
    static async checkCredits(params: CreditCheckParams): Promise<CreditCheckResult> {
        const {
            selectedModel,
            apiKeys,
            estimatedTokens,
            userId,
            isAnonymous,
            polarCustomerId,
            modelInfo
        } = params;

        const { getRemainingCreditsByExternalId: getCachedCreditsByExternal, getRemainingCredits: getCachedCredits, cache: creditCache } = createRequestCreditCache();

        const isUsingOwnApiKeys = this.checkIfUsingOwnApiKeys(selectedModel, apiKeys);
        const isFreeModel = this.isFreeModel(selectedModel);

        let hasCredits = false;
        let actualCredits: number | null = null;

        // SECURITY FIX: Do NOT set hasCredits=true for free models - they still need daily limits
        if (isUsingOwnApiKeys) {
            hasCredits = true; // Allow request to proceed
        } else if (isFreeModel) {
            // For free models, we still need to check daily limits but don't deduct credits
            // DO NOT set hasCredits = true here - let the actual credit check determine this
        } else {
            // Check credits using both the external ID (userId) and legacy polarCustomerId
            // Pass isAnonymous flag to skip Polar checks for anonymous users
            try {
                hasCredits = await hasEnoughCreditsWithCache(polarCustomerId, userId, estimatedTokens, isAnonymous, modelInfo || undefined, creditCache);

                // Get actual credit balance for logging
                if (!isAnonymous) {
                    try {
                        // Use cached credit data from the hasEnoughCredits call above - no additional API call needed!
                        actualCredits = await getCachedCreditsByExternal(userId);
                    } catch (error) {
                        console.error('Error getting cached credits by external ID:', error);
                        // Fallback to Polar customer ID if available
                        if (polarCustomerId) {
                            try {
                                actualCredits = await getCachedCredits(polarCustomerId);
                            } catch (polarError) {
                                console.error('Error getting cached credits by Polar customer ID:', polarError);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Credit check failed:', error);
                // Log but continue - don't block users if credit check fails
                hasCredits = true; // Allow request to proceed
            }
        }

        return {
            hasCredits,
            actualCredits,
            isUsingOwnApiKeys,
            isFreeModel,
            creditCache
        };
    }

    /**
     * Check if user has negative credit balance (should be blocked)
     */
    static shouldBlockNegativeCredits(
        isUsingOwnApiKeys: boolean,
        isFreeModel: boolean,
        isAnonymous: boolean,
        actualCredits: number | null
    ): boolean {
        return !isUsingOwnApiKeys && !isFreeModel && !isAnonymous && actualCredits !== null && actualCredits < 0;
    }

    /**
     * Get web search cost
     */
    static getWebSearchCost(): number {
        return WEB_SEARCH_COST;
    }
}

import { createRequestCreditCache, hasEnoughCreditsWithCache } from '@/lib/services/creditCache';
import { hasEnoughCredits, WEB_SEARCH_COST } from '@/lib/tokenCounter';
import { getModelDetails } from '@/lib/models/fetch-models';
import { logDiagnostic } from '@/lib/utils/performantLogging';
import type { modelID } from '@/ai/providers';
import { hasUnlimitedFreeModels } from '@/lib/polar';

// Domain-specific error classes for credit validation
export class CreditValidationError extends Error {
    constructor(
        public code: string,
        message: string,
        public status: number,
        public details?: string
    ) {
        super(message);
        this.name = 'CreditValidationError';
    }
}

export class InsufficientCreditsError extends CreditValidationError {
    constructor(message: string, details?: string) {
        super('INSUFFICIENT_CREDITS', message, 402, details);
        this.name = 'InsufficientCreditsError';
    }
}

export class FeatureRestrictedError extends CreditValidationError {
    constructor(message: string, details?: string) {
        super('FEATURE_RESTRICTED', message, 403, details);
        this.name = 'FeatureRestrictedError';
    }
}

export class FreeModelOnlyError extends CreditValidationError {
    constructor(message: string, details?: string) {
        super('FREE_MODEL_ONLY', message, 403, details);
        this.name = 'FreeModelOnlyError';
    }
}

export class PremiumModelRestrictedError extends CreditValidationError {
    constructor(message: string, details?: string) {
        super('PREMIUM_MODEL_RESTRICTED', message, 403, details);
        this.name = 'PremiumModelRestrictedError';
    }
}

export interface CreditValidationContext {
    userId: string;
    isAnonymous: boolean;
    polarCustomerId?: string;
    selectedModel: modelID;
    isUsingOwnApiKeys: boolean;
    isFreeModel: boolean;
    webSearchEnabled: boolean;
    estimatedTokens: number;
    hasCredits?: boolean; // Optional for validation methods that need it
}

export interface CreditValidationResult {
    hasCredits: boolean;
    actualCredits: number | null;
    canUseWebSearch: boolean;
    creditCache: any;
}

export class ChatCreditValidationService {
    /**
     * Validates user credits and permissions for the chat request
     */
    static async validateCredits(context: CreditValidationContext): Promise<CreditValidationResult> {
        const {
            userId,
            isAnonymous,
            polarCustomerId,
            selectedModel,
            isUsingOwnApiKeys,
            isFreeModel,
            webSearchEnabled,
            estimatedTokens
        } = context;

        const requestId = `credit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create request-scoped caches for performance optimization
        const { getRemainingCreditsByExternalId: getCachedCreditsByExternal, getRemainingCredits: getCachedCredits, cache: creditCache } = createRequestCreditCache();

        logDiagnostic('CREDIT_CHECK_START', 'Starting credit check', {
            requestId,
            userId,
            isAnonymous,
            polarCustomerId,
            isUsingOwnApiKeys,
            isFreeModel,
            estimatedTokens
        });

        let hasCredits = false;
        let actualCredits: number | null = null;

        // Check for yearly subscription (unlimited free models)
        let hasUnlimitedFreeModelsAccess = false;
        if (!isAnonymous && userId) {
            try {
                hasUnlimitedFreeModelsAccess = await hasUnlimitedFreeModels(userId);
            } catch (error) {
                logDiagnostic('UNLIMITED_CHECK_ERROR', 'Error checking unlimited free models access', {
                    requestId,
                    userId,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }

        // Skip credit checks entirely if user is using their own API keys
        if (isUsingOwnApiKeys) {
            logDiagnostic('CREDIT_CHECK_SKIP', 'User is using own API keys, skipping credit checks', { requestId, userId });
            hasCredits = true;
        } else if (isFreeModel && hasUnlimitedFreeModelsAccess) {
            logDiagnostic('CREDIT_CHECK_SKIP', 'Yearly subscriber using free model, skipping credit checks', {
                requestId,
                userId,
                selectedModel
            });
            // Yearly subscribers using free models don't need credits
            hasCredits = true;
        } else if (isFreeModel) {
            logDiagnostic('CREDIT_CHECK_SKIP', 'User is using a free model, but still checking for actual credits for limit purposes', {
                requestId,
                userId,
                selectedModel
            });
            // DO NOT set hasCredits = true here - let the actual credit check determine this
        } else {
            try {
                const modelInfo = await getModelDetails(selectedModel);

                // Check credits using both the external ID (userId) and legacy polarCustomerId
                hasCredits = await hasEnoughCreditsWithCache(polarCustomerId, userId, estimatedTokens, isAnonymous, modelInfo || undefined, creditCache);
                logDiagnostic('CREDIT_CHECK_RESULT', 'hasEnoughCredits result', {
                    requestId,
                    userId,
                    hasCredits
                });

                // Also get the actual credit balance to check for negative balances
                if (!isAnonymous) {
                    if (userId) {
                        try {
                            actualCredits = await getCachedCreditsByExternal(userId);
                            logDiagnostic('CREDIT_BALANCE', 'Actual credits for user (cached)', {
                                requestId,
                                userId,
                                actualCredits
                            });
                        } catch (error) {
                            logDiagnostic('CREDIT_BALANCE_ERROR', 'Error getting actual credits by external ID', {
                                requestId,
                                userId,
                                error: error instanceof Error ? error.message : String(error)
                            });
                            // Fall back to legacy method
                            if (polarCustomerId) {
                                try {
                                    actualCredits = await getCachedCredits(polarCustomerId);
                                    logDiagnostic('CREDIT_BALANCE_LEGACY', 'Actual credits via legacy method (cached)', {
                                        requestId,
                                        userId,
                                        actualCredits
                                    });
                                } catch (legacyError) {
                                    logDiagnostic('CREDIT_BALANCE_LEGACY_ERROR', 'Error getting actual credits by legacy method', {
                                        requestId,
                                        userId,
                                        error: legacyError instanceof Error ? legacyError.message : String(legacyError)
                                    });
                                }
                            }
                        }
                    }
                }
            } catch (error: any) {
                logDiagnostic('CREDIT_CHECK_ERROR', 'Error checking credits', {
                    requestId,
                    userId,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }

        // Check for negative credit balance - block if user has negative credits (skip if using own API keys or free model)
        if (!isUsingOwnApiKeys && !isFreeModel && !isAnonymous && actualCredits !== null && actualCredits < 0) {
            console.log(`[Debug] User ${userId} has negative credits (${actualCredits}), blocking request`);
            throw new InsufficientCreditsError(
                `Your account has a negative credit balance (${actualCredits}). Please purchase more credits to continue.`,
                `User has ${actualCredits} credits`
            );
        }

        // Determine web search permission
        let canUseWebSearch = false;

        if (!isUsingOwnApiKeys && !isAnonymous && actualCredits !== null && actualCredits >= WEB_SEARCH_COST) {
            canUseWebSearch = webSearchEnabled;
        } else if (isUsingOwnApiKeys && webSearchEnabled) {
            canUseWebSearch = true;
        }

        // Block unpaid attempts for web search
        if (webSearchEnabled && !canUseWebSearch) {
            if (isAnonymous) {
                console.log(`[Security] Anonymous user ${userId} tried to use Web Search, blocking request`);
                throw new FeatureRestrictedError(
                    "Web Search is only available to signed-in users with credits. Please sign in and purchase credits to use this feature.",
                    "Anonymous users cannot use Web Search"
                );
            }

            if (actualCredits !== null && actualCredits < WEB_SEARCH_COST) {
                console.log(`[Security] User ${userId} tried to bypass Web Search payment (${actualCredits} < ${WEB_SEARCH_COST})`);
                throw new InsufficientCreditsError(
                    `You need at least ${WEB_SEARCH_COST} credits to use Web Search. Your balance is ${actualCredits}.`,
                    `User attempted to bypass Web Search payment with ${actualCredits} credits`
                );
            }
        }

        return {
            hasCredits,
            actualCredits,
            canUseWebSearch,
            creditCache
        };
    }

    /**
     * Validates free model access restrictions
     */
    static async validateFreeModelAccess(context: CreditValidationContext): Promise<void> {
        const { isUsingOwnApiKeys, isFreeModel, hasCredits, isAnonymous, userId } = context;

        // Check for yearly subscription
        let hasUnlimitedFreeModelsAccess = false;
        if (!isAnonymous && userId) {
            try {
                hasUnlimitedFreeModelsAccess = await hasUnlimitedFreeModels(userId);
            } catch (error) {
                // Ignore error, assume no unlimited access
            }
        }

        // Block non-free model access for users without credits (unless they have yearly subscription)
        // Yearly subscribers can only use free models, so block premium models
        if (!isUsingOwnApiKeys && !isFreeModel && !hasCredits) {
            if (hasUnlimitedFreeModelsAccess) {
                // Yearly subscribers trying to use premium models
                console.log(`[SECURITY] Yearly subscriber attempted premium model: ${context.selectedModel}`);
                throw new PremiumModelRestrictedError(
                    "Your yearly subscription provides unlimited access to free models only. Please upgrade to the monthly plan to access premium models.",
                    `Yearly subscriber attempted premium model access`
                );
            } else {
                // Regular users without credits
                const userType = isAnonymous ? "Anonymous users" : "Users without credits";
                const actionRequired = isAnonymous ? "Please sign in and purchase credits" : "Please purchase credits";

                console.log(`[SECURITY] ${userType} attempted non-free model: ${context.selectedModel}`);
                throw new FreeModelOnlyError(
                    `${userType} can only use free models. ${actionRequired} to access other models.`,
                    `Free-model-only enforcement for ${isAnonymous ? 'anonymous' : 'non-credit'} user`
                );
            }
        }
    }

    /**
     * Validates premium model access
     */
    static async validatePremiumModelAccess(context: CreditValidationContext): Promise<void> {
        const { isUsingOwnApiKeys, isFreeModel, hasCredits, isAnonymous, selectedModel, userId } = context;

        // Get model info for premium check
        const modelInfo = await getModelDetails(selectedModel);

        // Check for yearly subscription
        let hasUnlimitedFreeModelsAccess = false;
        if (!isAnonymous && userId) {
            try {
                hasUnlimitedFreeModelsAccess = await hasUnlimitedFreeModels(userId);
            } catch (error) {
                // Ignore error, assume no unlimited access
            }
        }

        if (!isUsingOwnApiKeys && !isFreeModel && !hasCredits && modelInfo?.premium) {
            if (hasUnlimitedFreeModelsAccess) {
                // Yearly subscribers trying to use premium models
                console.log(`[SECURITY] Yearly subscriber attempted premium model: ${selectedModel}`);
                throw new PremiumModelRestrictedError(
                    "Your yearly subscription provides unlimited access to free models only. Please upgrade to the monthly plan to access premium models.",
                    `Yearly subscriber attempted premium model access`
                );
            } else {
                const userType = isAnonymous ? "Anonymous users" : "Users without credits";
                const actionRequired = isAnonymous ? "Please sign in and purchase credits" : "Please purchase credits";

                console.log(`[SECURITY] ${userType} attempted to access premium model: ${selectedModel}`);
                throw new PremiumModelRestrictedError(
                    `${userType} cannot access premium models. ${actionRequired} to use ${modelInfo.name || selectedModel}.`,
                    `Premium model access denied for ${isAnonymous ? 'anonymous' : 'non-credit'} user`
                );
            }
        }
    }
}
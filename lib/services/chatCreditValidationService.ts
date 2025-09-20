import { createRequestCreditCache, hasEnoughCreditsWithCache } from '@/lib/services/creditCache';
import { hasEnoughCredits, WEB_SEARCH_COST } from '@/lib/tokenCounter';
import { getModelDetails } from '@/lib/models/fetch-models';
import { logDiagnostic } from '@/lib/utils/performantLogging';
import type { modelID } from '@/ai/providers';

// Helper to create standardized error responses
const createErrorResponse = (
    code: string,
    message: string,
    status: number,
    details?: string
) => {
    return new Response(
        JSON.stringify({ error: { code, message, details } }),
        { status, headers: { "Content-Type": "application/json" } }
    );
};

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

        // Skip credit checks entirely if user is using their own API keys
        if (isUsingOwnApiKeys) {
            logDiagnostic('CREDIT_CHECK_SKIP', 'User is using own API keys, skipping credit checks', { requestId, userId });
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
            throw createErrorResponse(
                "INSUFFICIENT_CREDITS",
                `Your account has a negative credit balance (${actualCredits}). Please purchase more credits to continue.`,
                402,
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
                throw createErrorResponse(
                    "FEATURE_RESTRICTED",
                    "Web Search is only available to signed-in users with credits. Please sign in and purchase credits to use this feature.",
                    403,
                    "Anonymous users cannot use Web Search"
                );
            }

            if (actualCredits !== null && actualCredits < WEB_SEARCH_COST) {
                console.log(`[Security] User ${userId} tried to bypass Web Search payment (${actualCredits} < ${WEB_SEARCH_COST})`);
                throw createErrorResponse(
                    "INSUFFICIENT_CREDITS",
                    `You need at least ${WEB_SEARCH_COST} credits to use Web Search. Your balance is ${actualCredits}.`,
                    402,
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
    static validateFreeModelAccess(context: CreditValidationContext): void {
        const { isUsingOwnApiKeys, isFreeModel, hasCredits, isAnonymous } = context;

        // Block non-free model access for users without credits
        if (!isUsingOwnApiKeys && !isFreeModel && !hasCredits) {
            const userType = isAnonymous ? "Anonymous users" : "Users without credits";
            const actionRequired = isAnonymous ? "Please sign in and purchase credits" : "Please purchase credits";

            console.log(`[SECURITY] ${userType} attempted non-free model: ${context.selectedModel}`);
            throw createErrorResponse(
                'FREE_MODEL_ONLY',
                `${userType} can only use free models. ${actionRequired} to access other models.`,
                403,
                `Free-model-only enforcement for ${isAnonymous ? 'anonymous' : 'non-credit'} user`
            );
        }
    }

    /**
     * Validates premium model access
     */
    static async validatePremiumModelAccess(context: CreditValidationContext): Promise<void> {
        const { isUsingOwnApiKeys, isFreeModel, hasCredits, isAnonymous, selectedModel } = context;

        // Get model info for premium check
        const modelInfo = await getModelDetails(selectedModel);

        if (!isUsingOwnApiKeys && !isFreeModel && !hasCredits && modelInfo?.premium) {
            const userType = isAnonymous ? "Anonymous users" : "Users without credits";
            const actionRequired = isAnonymous ? "Please sign in and purchase credits" : "Please purchase credits";

            console.log(`[SECURITY] ${userType} attempted to access premium model: ${selectedModel}`);
            throw createErrorResponse(
                "PREMIUM_MODEL_RESTRICTED",
                `${userType} cannot access premium models. ${actionRequired} to use ${modelInfo.name || selectedModel}.`,
                403,
                `Premium model access denied for ${isAnonymous ? 'anonymous' : 'non-credit'} user`
            );
        }
    }
}
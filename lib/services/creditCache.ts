import { cache } from 'react';
import {
    getRemainingCredits as originalGetRemainingCredits,
    getRemainingCreditsByExternalId as originalGetRemainingCreditsByExternalId,
} from '@/lib/polar';
import { calculateCreditCostPerMessage } from '@/lib/utils/creditCostCalculator';
import { ModelInfo } from '@/lib/types/models';

/** Request-scoped memoization via React cache (dedupes Polar calls within one request). */
export const getCachedCreditsByExternalId = cache(originalGetRemainingCreditsByExternalId);
export const getCachedCredits = cache(originalGetRemainingCredits);

/**
 * Check whether the user has enough Polar credits for the selected model tier.
 */
export async function hasEnoughCreditsWithCache(
    polarCustomerId: string | undefined,
    userId: string | undefined,
    _requiredTokens: number = 1,
    isAnonymous: boolean = false,
    modelInfo?: ModelInfo
): Promise<boolean> {
    if (isAnonymous) {
        return false;
    }

    const requiredCredits = calculateCreditCostPerMessage(modelInfo ?? null);

    if (userId) {
        try {
            const remainingCreditsByExternal = await getCachedCreditsByExternalId(userId);

            if (remainingCreditsByExternal !== null) {
                return remainingCreditsByExternal >= requiredCredits;
            }

            console.log(`No Polar customer found for user ${userId}, falling back to daily message limits`);
            return false;
        } catch (error) {
            console.warn('Error checking credits by external ID:', error);
        }
    }

    if (polarCustomerId) {
        try {
            const remainingCredits = await getCachedCredits(polarCustomerId);

            if (remainingCredits === null) {
                console.log(`No Polar customer/meter found for customer ${polarCustomerId}`);
                return false;
            }

            return remainingCredits >= requiredCredits;
        } catch (error) {
            console.warn('Error checking credits by customer ID:', error);
            return false;
        }
    }

    console.log('No user ID or customer ID provided for credit check');
    return false;
}

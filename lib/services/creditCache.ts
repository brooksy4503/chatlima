import { getRemainingCredits as originalGetRemainingCredits, getRemainingCreditsByExternalId as originalGetRemainingCreditsByExternalId } from '@/lib/polar';

/**
 * Request-scoped cache for credit balances to prevent redundant API calls within the same request
 * This complements the existing Polar API by adding in-memory caching for credit checks
 */
export class RequestCreditCache {
    private cache = new Map<string, number | null>();

    /**
     * Get user credits by external ID with request-level caching
     * Falls back to the original Polar API if not cached
     */
    async getRemainingCreditsByExternalId(userId: string): Promise<number | null> {
        const cacheKey = `external:${userId}`;

        // Check request-level cache first
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey)!;
        }

        // Fetch from original Polar API
        const result = await originalGetRemainingCreditsByExternalId(userId);

        // Cache the result for this request (including null results)
        this.cache.set(cacheKey, result);

        return result;
    }

    /**
     * Get user credits by Polar customer ID with request-level caching
     * Falls back to the original Polar API if not cached
     */
    async getRemainingCredits(polarCustomerId: string): Promise<number | null> {
        const cacheKey = `polar:${polarCustomerId}`;

        // Check request-level cache first
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey)!;
        }

        // Fetch from original Polar API
        const result = await originalGetRemainingCredits(polarCustomerId);

        // Cache the result for this request (including null results)
        this.cache.set(cacheKey, result);

        return result;
    }

    /**
     * Clear the request cache (useful for testing or when needed)
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get cache size for debugging
     */
    size(): number {
        return this.cache.size;
    }

    /**
     * Check if a user's credits are already cached in this request
     */
    hasExternalId(userId: string): boolean {
        return this.cache.has(`external:${userId}`);
    }

    /**
     * Check if a polar customer's credits are already cached in this request
     */
    hasPolarId(polarCustomerId: string): boolean {
        return this.cache.has(`polar:${polarCustomerId}`);
    }

    /**
     * Get cache statistics for debugging
     */
    getStats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

/**
 * Helper function that creates a request-scoped credit cache and returns bound functions
 * Use this in API routes to automatically get request-level caching
 */
export function createRequestCreditCache(): {
    getRemainingCreditsByExternalId: (userId: string) => Promise<number | null>;
    getRemainingCredits: (polarCustomerId: string) => Promise<number | null>;
    cache: RequestCreditCache;
} {
    const cache = new RequestCreditCache();

    return {
        getRemainingCreditsByExternalId: cache.getRemainingCreditsByExternalId.bind(cache),
        getRemainingCredits: cache.getRemainingCredits.bind(cache),
        cache
    };
}

/**
 * Enhanced hasEnoughCredits function with request-level caching support
 * This reduces redundant API calls by reusing cached credit balances
 */
export async function hasEnoughCreditsWithCache(
    polarCustomerId: string | undefined,
    userId: string | undefined,
    requiredTokens: number = 1,
    isAnonymous: boolean = false,
    modelInfo?: any, // ModelInfo type
    creditCache?: RequestCreditCache
): Promise<boolean> {
    // For anonymous users, skip Polar credit checks completely
    if (isAnonymous) {
        return false;
    }

    // Check if the selected model is premium
    const isPremiumModel = modelInfo?.premium === true;

    // First, try to get credits via external ID if userId is provided
    if (userId) {
        try {
            // Use cache if provided, otherwise fall back to original function
            const remainingCreditsByExternal = creditCache
                ? await creditCache.getRemainingCreditsByExternalId(userId)
                : await originalGetRemainingCreditsByExternalId(userId);

            // If we got a valid result (including 0), use it
            if (remainingCreditsByExternal !== null) {
                // If it's a premium model, user must have more than 0 credits.
                // For non-premium, the standard check of remainingCredits >= requiredTokens applies.
                if (isPremiumModel) {
                    return remainingCreditsByExternal > 0;
                }
                return remainingCreditsByExternal >= requiredTokens;
            }
            // If we got null, this means no Polar customer exists
            console.log(`No Polar customer found for user ${userId}, falling back to daily message limits`);
            return false;
        } catch (error) {
            console.warn('Error checking credits by external ID:', error);
            // Fall through to the legacy method
        }
    }

    // Legacy method: use polarCustomerId if provided
    if (polarCustomerId) {
        try {
            // Use cache if provided, otherwise fall back to original function
            const remainingCredits = creditCache
                ? await creditCache.getRemainingCredits(polarCustomerId)
                : await originalGetRemainingCredits(polarCustomerId);

            // If we couldn't determine the credits (null), this means no Polar customer/meter
            if (remainingCredits === null) {
                console.log(`No Polar customer/meter found for customer ${polarCustomerId}`);
                return false;
            }

            // For premium models, user must have more than 0 credits
            if (isPremiumModel) {
                return remainingCredits > 0;
            }
            return remainingCredits >= requiredTokens;
        } catch (error) {
            console.warn('Error checking credits by customer ID:', error);
            return false;
        }
    }

    // If we don't have any user/customer ID, deny access
    console.log('No user ID or customer ID provided for credit check');
    return false;
}

import { ModelInfo, ApiKeyContext } from '@/lib/types/models';
import { getModelDetails as originalGetModelDetails } from './fetch-models';

/**
 * Request-scoped cache for model details to prevent redundant API calls within the same request
 * This complements the existing provider-level caching in fetch-models.ts
 */
export class RequestModelCache {
    private cache = new Map<string, ModelInfo | null>();

    /**
     * Get model details with request-level caching
     * Falls back to the original getModelDetails if not cached
     */
    async getModelDetails(modelId: string, apiKeyContext?: ApiKeyContext): Promise<ModelInfo | null> {
        // Check request-level cache first
        if (this.cache.has(modelId)) {
            return this.cache.get(modelId)!;
        }

        // Fetch from original function (which handles provider-level caching)
        const result = await originalGetModelDetails(modelId, apiKeyContext);

        // Cache the result for this request
        this.cache.set(modelId, result);

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
     * Check if a model is already cached in this request
     */
    has(modelId: string): boolean {
        return this.cache.has(modelId);
    }
}

/**
 * Helper function that creates a request-scoped cache and returns a bound getModelDetails function
 * Use this in API routes to automatically get request-level caching
 */
export function createRequestModelCache(): {
    getModelDetails: (modelId: string, apiKeyContext?: ApiKeyContext) => Promise<ModelInfo | null>;
    cache: RequestModelCache;
} {
    const cache = new RequestModelCache();

    return {
        getModelDetails: cache.getModelDetails.bind(cache),
        cache
    };
}

/**
 * Simple helper for single model lookups with automatic request caching
 * For more complex scenarios, use createRequestModelCache() directly
 */
export async function getModelDetailsWithCache(
    modelId: string,
    apiKeyContext?: ApiKeyContext,
    cache?: RequestModelCache
): Promise<ModelInfo | null> {
    if (cache) {
        return cache.getModelDetails(modelId, apiKeyContext);
    }

    // Fall back to original function if no cache provided
    return originalGetModelDetails(modelId, apiKeyContext);
}

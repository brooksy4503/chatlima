import {
    ModelInfo,
    ProviderInfo,
    ModelsResponse,
    CachedProviderData,
    ProviderFetchResult,
    ApiKeyContext
} from '@/lib/types/models';
import { PROVIDERS } from './provider-configs';
import { CACHE_CONFIG } from './client-constants';

// In-memory cache for provider data
const providerCache = new Map<string, CachedProviderData>();

// Rate limiting tracker
const rateLimitTracker = new Map<string, { count: number; resetTime: number }>();

// Helper to check if cache is valid
function isCacheValid(cached: CachedProviderData): boolean {
    return new Date() < cached.expiresAt;
}

// Helper to get API key for provider
function getProviderApiKey(providerKey: string, apiKeyContext: ApiKeyContext): string | null {
    // Check user-provided keys first
    if (apiKeyContext.user?.[providerKey]) {
        return apiKeyContext.user[providerKey];
    }

    // Fall back to environment variables
    if (apiKeyContext.environment[providerKey]) {
        return apiKeyContext.environment[providerKey];
    }

    return null;
}

// Helper to check rate limits
function checkRateLimit(providerKey: string): boolean {
    const config = PROVIDERS[providerKey];
    if (!config.rateLimit) return true;

    const now = Date.now();
    const tracker = rateLimitTracker.get(providerKey);

    if (!tracker || now > tracker.resetTime) {
        // Reset rate limit tracker
        rateLimitTracker.set(providerKey, {
            count: 1,
            resetTime: now + (60 * 1000) // 1 minute
        });
        return true;
    }

    if (tracker.count >= config.rateLimit.requestsPerMinute) {
        return false;
    }

    tracker.count++;
    return true;
}

// Health check for a provider
async function checkProviderHealth(
    providerKey: string,
    apiKey: string,
    signal?: AbortSignal
): Promise<boolean> {
    const config = PROVIDERS[providerKey];
    if (!config.healthCheck) return true;

    try {
        const response = await fetch(config.healthCheck, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            signal,
        });

        return response.ok;
    } catch (error) {
        console.warn(`Health check failed for ${providerKey}:`, error);
        return false;
    }
}

// Fetch models from a single provider with retry logic
async function fetchProviderModels(
    providerKey: string,
    apiKeyContext: ApiKeyContext,
    signal?: AbortSignal
): Promise<ProviderFetchResult> {
    const config = PROVIDERS[providerKey];
    const apiKey = getProviderApiKey(config.envKey, apiKeyContext);

    const providerInfo: ProviderInfo = {
        name: config.name,
        status: 'down',
        lastChecked: new Date(),
        modelCount: 0,
        hasEnvironmentKey: !!apiKeyContext.environment[config.envKey],
        supportsUserKeys: true,
    };

    // Return early if no API key
    if (!apiKey) {
        return {
            success: false,
            models: [],
            provider: {
                ...providerInfo,
                error: 'No API key available',
            },
            error: new Error(`No API key found for ${providerKey}`),
        };
    }

    // Check rate limits
    if (!checkRateLimit(providerKey)) {
        return {
            success: false,
            models: [],
            provider: {
                ...providerInfo,
                status: 'degraded',
                error: 'Rate limit exceeded',
            },
            error: new Error(`Rate limit exceeded for ${providerKey}`),
        };
    }

    // Check provider health first (skip if no health check endpoint)
    if (config.healthCheck) {
        const isHealthy = await checkProviderHealth(providerKey, apiKey, signal);
        if (!isHealthy) {
            return {
                success: false,
                models: [],
                provider: {
                    ...providerInfo,
                    error: 'Health check failed',
                },
                error: new Error(`Health check failed for ${providerKey}`),
            };
        }
    }

    // Fetch models with retry logic
    let lastError: Error | null = null;
    const retryConfig = config.retryConfig || { maxRetries: 3, backoffMs: 1000 };

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
        try {
            const response = await fetch(config.endpoint, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://www.chatlima.com/',
                    'X-Title': process.env.NEXT_PUBLIC_APP_TITLE || 'ChatLima',
                },
                signal,
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const models = config.parse(data);

            return {
                success: true,
                models,
                provider: {
                    ...providerInfo,
                    status: 'healthy',
                    modelCount: models.length,
                },
            };

        } catch (error) {
            lastError = error as Error;

            // Don't retry on the last attempt
            if (attempt < retryConfig.maxRetries) {
                await new Promise(resolve =>
                    setTimeout(resolve, retryConfig.backoffMs * Math.pow(2, attempt))
                );
            }
        }
    }

    return {
        success: false,
        models: [],
        provider: {
            ...providerInfo,
            error: lastError?.message || 'Unknown error',
        },
        error: lastError || new Error('Unknown error'),
    };
}

// Get cached data for a provider
function getCachedProviderData(providerKey: string): CachedProviderData | null {
    const cached = providerCache.get(providerKey);
    if (cached && isCacheValid(cached)) {
        return cached;
    }
    return null;
}

// Cache provider data
function setCachedProviderData(providerKey: string, data: CachedProviderData): void {
    providerCache.set(providerKey, data);
}

// Main function to fetch all models
export async function fetchAllModels(
    apiKeyContext: ApiKeyContext,
    forceRefresh = false,
    signal?: AbortSignal
): Promise<ModelsResponse> {
    const allModels: ModelInfo[] = [];
    const providers: Record<string, ProviderInfo> = {};
    const userProvidedKeys: string[] = [];
    let cacheHit = false;

    // Fetch from each provider
    for (const [providerKey, config] of Object.entries(PROVIDERS)) {
        // Check if user provided API key for this provider
        if (apiKeyContext.user?.[config.envKey]) {
            userProvidedKeys.push(providerKey);
        }

        // Try to use cached data first (unless forced refresh)
        if (!forceRefresh) {
            const cached = getCachedProviderData(providerKey);
            if (cached) {
                allModels.push(...cached.models);
                providers[providerKey] = cached.provider;
                cacheHit = true;
                continue;
            }
        }

        // Fetch fresh data
        const result = await fetchProviderModels(providerKey, apiKeyContext, signal);

        if (result.success) {
            allModels.push(...result.models);

            // Cache the successful result
            const cachedData: CachedProviderData = {
                models: result.models,
                provider: result.provider,
                timestamp: new Date(),
                expiresAt: new Date(Date.now() + CACHE_CONFIG.modelListTTL),
            };
            setCachedProviderData(providerKey, cachedData);
        }

        providers[providerKey] = result.provider;
    }

    // Remove duplicates based on model ID (user models take precedence)
    const uniqueModels = allModels.reduce((acc, model) => {
        if (!acc.has(model.id)) {
            acc.set(model.id, model);
        }
        return acc;
    }, new Map<string, ModelInfo>());

    return {
        models: Array.from(uniqueModels.values()),
        metadata: {
            lastUpdated: new Date(),
            providers,
            totalModels: uniqueModels.size,
            cacheHit,
            userProvidedKeys: userProvidedKeys.length > 0 ? userProvidedKeys : undefined,
        },
    };
}

// Helper to get environment API keys (server-side only)
export function getEnvironmentApiKeys(): Record<string, string> {
    const envKeys: Record<string, string> = {};

    for (const config of Object.values(PROVIDERS)) {
        const value = process.env[config.envKey];
        if (value) {
            envKeys[config.envKey] = value;
        }
    }

    return envKeys;
}

// Clear cache for a specific provider or all providers
export function clearProviderCache(providerKey?: string): void {
    if (providerKey) {
        providerCache.delete(providerKey);
    } else {
        providerCache.clear();
    }
}

// Get cache statistics
export function getCacheStats() {
    const stats = {
        totalEntries: providerCache.size,
        validEntries: 0,
        expiredEntries: 0,
    };

    for (const cached of providerCache.values()) {
        if (isCacheValid(cached)) {
            stats.validEntries++;
        } else {
            stats.expiredEntries++;
        }
    }

    return stats;
}

// Server-side utility to get model details by ID
export async function getModelDetails(modelId: string, apiKeyContext?: ApiKeyContext): Promise<ModelInfo | null> {
    try {
        const response = await fetchAllModels(apiKeyContext || { environment: getEnvironmentApiKeys() });
        return response.models.find(model => model.id === modelId) || null;
    } catch (error) {
        console.error(`Failed to fetch model details for ${modelId}:`, error);
        return null;
    }
}

// Server-side utility to check if a model has a capability
export async function checkModelCapability(
    modelId: string,
    capability: 'vision' | 'webSearch' | 'premium',
    apiKeyContext?: ApiKeyContext
): Promise<boolean> {
    const modelInfo = await getModelDetails(modelId, apiKeyContext);
    if (!modelInfo) return false;

    switch (capability) {
        case 'vision':
            return modelInfo.vision === true;
        case 'webSearch':
            return modelInfo.supportsWebSearch === true;
        case 'premium':
            return modelInfo.premium === true;
        default:
            return false;
    }
} 
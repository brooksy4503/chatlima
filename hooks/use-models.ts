"use client";

import useSWR from 'swr';
import { useState, useCallback, useMemo } from 'react';
import { ModelsResponse, ModelInfo } from '@/lib/types/models';

// Configuration for SWR
const SWR_CONFIG = {
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 30 * 1000, // 30 seconds
    errorRetryCount: 3,
    errorRetryInterval: 2000,
};

// Custom fetcher with API key support
async function modelsFetcher(
    url: string,
    userApiKeys?: Record<string, string>
): Promise<ModelsResponse> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // Include user API keys if provided
    if (userApiKeys && Object.keys(userApiKeys).length > 0) {
        headers['x-api-keys'] = JSON.stringify(userApiKeys);
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
    }

    return response.json();
}

// Hook interface
interface UseModelsOptions {
    userApiKeys?: Record<string, string>;
    enabled?: boolean;
    refreshInterval?: number;
}

interface UseModelsReturn {
    models: ModelInfo[];
    isLoading: boolean;
    isValidating: boolean;
    error: Error | null;
    metadata?: ModelsResponse['metadata'];
    refresh: () => Promise<ModelsResponse | undefined>;
    forceRefresh: () => Promise<ModelsResponse | undefined>;
    mutate: (data?: ModelsResponse) => Promise<ModelsResponse | undefined>;
}

// Main hook
export function useModels(options: UseModelsOptions = {}): UseModelsReturn {
    const {
        userApiKeys,
        enabled = true,
        refreshInterval = SWR_CONFIG.refreshInterval,
    } = options;

    // Create a stable key that includes user API keys
    // IMPORTANT: The key MUST change when API keys change to force SWR to refetch
    const swrKey = useMemo(() => {
        if (!enabled) return null;

        const baseKey = '/api/models';
        const keyHash = userApiKeys ? JSON.stringify(Object.keys(userApiKeys).sort().map(k => `${k}:${userApiKeys[k].substring(0, 10)}`)) : '';
        return keyHash ? `${baseKey}?keys=${encodeURIComponent(keyHash)}` : baseKey;
    }, [enabled, userApiKeys]);

    // Create a stable fetcher that uses current userApiKeys
    // This ensures SWR always uses the latest API keys when refetching
    const fetcher = useCallback(() => {
        return modelsFetcher('/api/models', userApiKeys);
    }, [userApiKeys]);

    // SWR hook with custom fetcher
    const {
        data,
        error,
        isLoading,
        isValidating,
        mutate
    } = useSWR<ModelsResponse>(
        swrKey,
        fetcher,
        {
            ...SWR_CONFIG,
            refreshInterval,
            onError: (error) => {
                console.error('Error fetching models:', error);
            },
            onSuccess: (data) => {
                console.log(`Fetched ${data.models.length} models from ${Object.keys(data.metadata.providers).length} providers`);
            },
        }
    );

    // Refresh function (uses cache, respects stale-while-revalidate)
    const refresh = useCallback(async () => {
        return mutate();
    }, [mutate]);

    // Force refresh function (bypasses cache)
    const forceRefresh = useCallback(async () => {
        try {
            // Clear cache and force fresh fetch
            const result = await mutate(
                modelsFetcher('/api/models?force=true', userApiKeys),
                { revalidate: false }
            );
            return result;
        } catch (error) {
            console.error('Error during force refresh:', error);
            throw error;
        }
    }, [mutate, userApiKeys]);

    return {
        models: data?.models || [],
        isLoading,
        isValidating,
        error,
        metadata: data?.metadata,
        refresh,
        forceRefresh,
        mutate,
    };
}

// Legacy compatibility hook that mimics the old static models behavior
export function useStaticModels(): {
    models: string[];
    modelDetails: Record<string, any>;
    isLoading: boolean;
} {
    const { models, isLoading } = useModels();

    // Convert new ModelInfo to legacy format
    const legacyModels = useMemo(() => {
        return models.map(model => model.id);
    }, [models]);

    const legacyModelDetails = useMemo(() => {
        const details: Record<string, any> = {};
        models.forEach(model => {
            details[model.id] = {
                provider: model.provider,
                name: model.name,
                description: model.description,
                apiVersion: model.apiVersion,
                capabilities: model.capabilities,
                enabled: model.enabled,
                supportsWebSearch: model.supportsWebSearch,
                premium: model.premium,
                vision: model.vision,
                temperatureRange: model.temperatureRange,
                maxTokensRange: model.maxTokensRange,
                supportsTemperature: model.supportsTemperature,
                supportsMaxTokens: model.supportsMaxTokens,
                supportsSystemInstruction: model.supportsSystemInstruction,
                maxSystemInstructionLength: model.maxSystemInstructionLength,
            };
        });
        return details;
    }, [models]);

    return {
        models: legacyModels,
        modelDetails: legacyModelDetails,
        isLoading,
    };
}

// Utility hook for provider health monitoring
export function useProviderHealth() {
    const { metadata, isLoading, error } = useModels();

    const healthStatus = useMemo(() => {
        if (!metadata) return { overall: 'unknown', providers: {} };

        const providers = metadata.providers;
        const healthyCount = Object.values(providers).filter(p => p.status === 'healthy').length;
        const totalCount = Object.keys(providers).length;

        let overall: 'healthy' | 'degraded' | 'down' | 'unknown' = 'unknown';
        if (totalCount === 0) {
            overall = 'unknown';
        } else if (healthyCount === totalCount) {
            overall = 'healthy';
        } else if (healthyCount > 0) {
            overall = 'degraded';
        } else {
            overall = 'down';
        }

        return {
            overall,
            providers,
            healthyCount,
            totalCount,
            lastUpdated: metadata.lastUpdated,
        };
    }, [metadata]);

    return {
        ...healthStatus,
        isLoading,
        error,
    };
}

// Utility hook for cache management
export function useModelsCache() {
    const [isClearing, setIsClearing] = useState(false);

    const clearCache = useCallback(async (provider?: string) => {
        setIsClearing(true);
        try {
            const response = await fetch('/api/models', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } finally {
            setIsClearing(false);
        }
    }, []);

    const getCacheStats = useCallback(async () => {
        const response = await fetch('/api/models?stats=true');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    }, []);

    return {
        clearCache,
        getCacheStats,
        isClearing,
    };
} 
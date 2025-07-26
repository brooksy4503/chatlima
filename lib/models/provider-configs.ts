import { ProviderConfig, ModelInfo, RawProviderModel } from '@/lib/types/models';

// OpenRouter model parser
export function parseOpenRouterModels(data: any): ModelInfo[] {
    if (!data || !Array.isArray(data.data)) {
        throw new Error('Invalid OpenRouter API response format');
    }

    return data.data.map((model: any): ModelInfo => {
        const id = `openrouter/${model.id}`;

        // Parse capabilities from model properties
        const capabilities: string[] = [];
        if (model.architecture?.modality?.includes('text')) capabilities.push('Text');
        if (model.architecture?.modality?.includes('image')) capabilities.push('Vision');
        if (model.top_provider?.name?.toLowerCase().includes('anthropic')) capabilities.push('Reasoning');
        if (model.id.includes('code') || model.name?.toLowerCase().includes('code')) capabilities.push('Coding');
        if (model.id.includes('fast') || model.name?.toLowerCase().includes('flash')) capabilities.push('Fast');
        if (model.id.includes('reasoning') || model.id.includes('thinking')) capabilities.push('Reasoning');

        // Default capabilities if none detected
        if (capabilities.length === 0) capabilities.push('General Purpose');

        // Determine maxTokensRange based on model capabilities
        let maxTokensRange: { min: number; max: number; default: number };

        const maxCompletionTokens = model.top_provider?.max_completion_tokens;

        if (maxCompletionTokens && maxCompletionTokens > 0) {
            // Use the actual max completion tokens from the provider
            maxTokensRange = {
                min: 1,
                max: maxCompletionTokens,
                default: Math.min(4096, Math.floor(maxCompletionTokens * 0.25))
            };
        } else {
            // Handle specific models with known high token limits
            if (model.id.includes('gemini')) {
                // Gemini models support high output token limits
                maxTokensRange = {
                    min: 1,
                    max: 65536,
                    default: 4096
                };
            } else if (model.id.includes('claude') && model.id.includes('opus-4')) {
                // Claude Opus 4 supports high output
                maxTokensRange = {
                    min: 1,
                    max: 32000,
                    default: 4096
                };
            } else if (model.id.includes('claude') && model.id.includes('sonnet-4')) {
                // Claude Sonnet 4 supports very high output
                maxTokensRange = {
                    min: 1,
                    max: 64000,
                    default: 4096
                };
            } else if (model.id.includes('gpt-4') || model.id.includes('o1') || model.id.includes('o3') || model.id.includes('o4')) {
                // OpenAI GPT-4 and reasoning models
                maxTokensRange = {
                    min: 1,
                    max: 32768,
                    default: 4096
                };
            } else if (model.id.includes('llama') && model.context_length && model.context_length > 100000) {
                // Large context Llama models
                maxTokensRange = {
                    min: 1,
                    max: 16384,
                    default: 4096
                };
            } else {
                // Default fallback based on context length
                const contextLength = model.context_length || 8192;
                const estimatedMaxTokens = Math.min(8192, Math.floor(contextLength * 0.5));
                maxTokensRange = {
                    min: 1,
                    max: estimatedMaxTokens,
                    default: Math.min(4096, Math.floor(estimatedMaxTokens * 0.5))
                };
            }
        }

        return {
            id,
            provider: 'OpenRouter',
            name: model.name || model.id,
            description: model.description || `${model.name} via OpenRouter`,
            capabilities,
            premium: model.pricing?.prompt ? parseFloat(model.pricing.prompt) > 0 : false,
            vision: model.architecture?.modality?.includes('image') || false,
            contextMax: model.context_length || undefined,
            apiVersion: model.id,
            status: 'available',
            lastChecked: new Date(),
            pricing: model.pricing ? {
                input: parseFloat(model.pricing.prompt) || undefined,
                output: parseFloat(model.pricing.completion) || undefined,
                currency: 'USD'
            } : undefined,
            // Legacy compatibility
            enabled: true,
            supportsWebSearch: true,
            supportsTemperature: true,
            supportsMaxTokens: true,
            supportsSystemInstruction: true,
            maxTokensRange,
        };
    });
}

// Requesty model parser - Dynamic parser for Requesty API
export function parseRequestyModels(data: any): ModelInfo[] {
    if (!data || !Array.isArray(data)) {
        throw new Error('Invalid Requesty API response format');
    }

    return data.map((model: any): ModelInfo => {
        const providerId = `${model.provider}/${model.model}`;
        const id = `requesty/${providerId}`;

        // Parse capabilities from model properties
        const capabilities: string[] = [];

        if (model.supports_vision) capabilities.push('Vision');
        if (model.supports_reasoning) capabilities.push('Reasoning');
        if (model.supports_caching) capabilities.push('Caching');
        if (model.supports_computer_use) capabilities.push('Tools');

        // Determine if it's coding-related based on model name
        if (model.model?.toLowerCase().includes('code') ||
            model.model?.toLowerCase().includes('coder') ||
            model.description?.toLowerCase().includes('coding')) {
            capabilities.push('Coding');
        }

        // Determine if it's fast based on model name
        if (model.model?.toLowerCase().includes('fast') ||
            model.model?.toLowerCase().includes('turbo') ||
            model.model?.toLowerCase().includes('flash')) {
            capabilities.push('Fast');
        }

        // Default to general purpose if no specific capabilities
        if (capabilities.length === 0) capabilities.push('General Purpose');

        // Determine if premium based on pricing (threshold of $3+ per million input tokens)
        const inputPrice = parseFloat(model.input_tokens_price_per_million || '0');
        const isPremium = inputPrice >= 3.0;

        // Generate a user-friendly name
        const providerName = model.provider.charAt(0).toUpperCase() + model.provider.slice(1);
        const modelName = model.model.split('/').pop() || model.model; // Get last part after slash
        const displayName = `${providerName} ${modelName}`;

        return {
            id,
            provider: 'Requesty',
            name: displayName,
            description: model.description || `${displayName} via Requesty`,
            capabilities,
            premium: isPremium,
            vision: model.supports_vision || false,
            contextMax: model.context_window || undefined,
            apiVersion: model.model,
            status: 'available',
            lastChecked: new Date(),
            pricing: {
                input: parseFloat(model.input_tokens_price_per_million) || undefined,
                output: parseFloat(model.output_tokens_price_per_million) || undefined,
                currency: 'USD'
            },
            // Legacy compatibility
            enabled: true,
            supportsWebSearch: false, // Requesty doesn't specifically support web search
            supportsTemperature: true,
            supportsMaxTokens: true,
            supportsSystemInstruction: true,
        };
    }).sort((a, b) => {
        // Sort by provider first, then by model name
        const providerCompare = a.name.localeCompare(b.name);
        return providerCompare;
    });
}

// Provider configuration registry
export const PROVIDERS: Record<string, ProviderConfig> = {
    openrouter: {
        name: 'OpenRouter',
        envKey: 'OPENROUTER_API_KEY',
        endpoint: 'https://openrouter.ai/api/v1/models',
        healthCheck: 'https://openrouter.ai/api/v1/auth/key',
        parse: parseOpenRouterModels,
        rateLimit: { requestsPerMinute: 60, burstLimit: 10 },
        retryConfig: { maxRetries: 3, backoffMs: 1000 },
    },
    requesty: {
        name: 'Requesty',
        envKey: 'REQUESTY_API_KEY',
        endpoint: 'https://api.requesty.ai/router/models', // Updated to use the actual models API
        healthCheck: undefined, // Requesty doesn't have a specific health check endpoint
        parse: parseRequestyModels,
        rateLimit: { requestsPerMinute: 120, burstLimit: 20 },
        retryConfig: { maxRetries: 3, backoffMs: 500 },
    },
    // Future providers can be added here
} satisfies Record<string, ProviderConfig>;

// Cache configuration
export const CACHE_CONFIG = {
    modelListTTL: 10 * 60 * 1000,      // 10 minutes
    modelDetailsTTL: 60 * 60 * 1000,   // 1 hour  
    providerHealthTTL: 30 * 1000,      // 30 seconds
    forceRefreshKey: 'force-refresh',   // Admin override
};

// Model migrations for backwards compatibility
export const MODEL_MIGRATIONS = [
    {
        oldId: 'openrouter/anthropic/claude-3.5-sonnet-old',
        newId: 'openrouter/anthropic/claude-3.5-sonnet',
        reason: 'renamed' as const,
        automaticMigration: true,
    },
    // Add more migrations as needed
]; 
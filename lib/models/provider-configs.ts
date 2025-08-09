import { ProviderConfig, ModelInfo, RawProviderModel } from '@/lib/types/models';
import { CACHE_CONFIG } from './client-constants';
import fs from 'fs';
import path from 'path';

// Interface for blocked models data
interface BlockedModelsList {
    models: Record<string, {
        provider: string;
        reason: string;
        lastTested: string;
        testError: string;
        retryCount: number;
        manuallyBlocked: boolean;
    }>;
}

// Load blocked models from JSON file
function loadBlockedModels(): Set<string> {
    try {
        const blockedModelsPath = path.join(process.cwd(), 'lib/models/blocked-models.json');
        if (!fs.existsSync(blockedModelsPath)) {
            console.warn('Blocked models file not found, using empty blocked list');
            return new Set();
        }

        const data = fs.readFileSync(blockedModelsPath, 'utf-8');
        const blockedData: BlockedModelsList = JSON.parse(data);
        return new Set(Object.keys(blockedData.models));
    } catch (error) {
        console.warn('Failed to load blocked models, using empty blocked list:', error);
        return new Set();
    }
}

// Cached blocked models (loaded once per process)
let BLOCKED_MODELS: Set<string> | null = null;

function getBlockedModels(): Set<string> {
    if (BLOCKED_MODELS === null) {
        BLOCKED_MODELS = loadBlockedModels();
    }
    return BLOCKED_MODELS;
}

// OpenRouter model parser
export function parseOpenRouterModels(data: any): ModelInfo[] {
    if (!data || !Array.isArray(data.data)) {
        throw new Error('Invalid OpenRouter API response format');
    }

    return data.data
        .filter((model: any) => {
            // Filter out blocked models
            const blockedModels = getBlockedModels();
            if (blockedModels.has(model.id)) {
                console.warn(`Filtering out blocked model: ${model.id}`);
                return false;
            }
            return true;
        })
        .map((model: any): ModelInfo => {
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

            // Override max tokens for specific models that have incorrect API limits
            if (model.id.includes('deepseek')) {
                // DeepSeek models support up to 8000 output tokens (override API reported value)
                maxTokensRange = {
                    min: 1,
                    max: 8000,
                    default: 4096
                };
            } else if (maxCompletionTokens && maxCompletionTokens > 0) {
                // Use the actual max completion tokens from the provider
                // Adjust default specifically for GPT-5 models to allow longer outputs by default
                const gpt5Default = model.id.includes('gpt-5')
                    ? 8192
                    : Math.min(4096, Math.floor(maxCompletionTokens * 0.25));
                maxTokensRange = {
                    min: 1,
                    max: maxCompletionTokens,
                    default: gpt5Default
                };
            } else {
                // Handle specific models with known high token limits
                if (model.id.includes('gpt-5')) {
                    // OpenAI GPT-5 family (e.g., gpt-5-nano) supports large context; set high completion cap
                    maxTokensRange = {
                        min: 1,
                        max: 128000,
                        default: 8192
                    };
                } else if (model.id.includes('gemini')) {
                    // Gemini models support high output token limits

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
                premium: (() => {
                    // Manual override for specific premium models
                    if (model.id === 'openai/gpt-4o-mini-search-preview') {
                        return true;
                    }

                    if (!model.pricing) return false;
                    const inputPrice = model.pricing.prompt ? parseFloat(model.pricing.prompt) : 0;
                    const outputPrice = model.pricing.completion ? parseFloat(model.pricing.completion) : 0;
                    // Convert per-token pricing to per-million for consistency (multiply by 1M)
                    return (inputPrice * 1000000) >= 3.0 || (outputPrice * 1000000) >= 5.0;
                })(),
                vision: model.architecture?.modality?.includes('image') || false,
                contextMax: model.context_length || undefined,
                apiVersion: model.id,
                status: 'available',
                lastChecked: new Date(),
                pricing: model.pricing ? {
                    input: model.pricing.prompt !== undefined && model.pricing.prompt !== null && model.pricing.prompt !== ''
                        ? (() => {
                            const parsed = parseFloat(model.pricing.prompt);
                            return !isNaN(parsed) ? parsed : undefined;
                        })()
                        : undefined,
                    output: model.pricing.completion !== undefined && model.pricing.completion !== null && model.pricing.completion !== ''
                        ? (() => {
                            const parsed = parseFloat(model.pricing.completion);
                            return !isNaN(parsed) ? parsed : undefined;
                        })()
                        : undefined,
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

    return data
        .filter((model: any) => {
            // Filter out blocked models
            const modelId = `${model.provider}/${model.model}`;
            const blockedModels = getBlockedModels();
            if (blockedModels.has(modelId)) {
                console.warn(`Filtering out blocked model: ${modelId}`);
                return false;
            }
            return true;
        })
        .map((model: any): ModelInfo => {
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

            // Determine if premium based on pricing (threshold of $3+ per million input tokens OR $5+ per million output tokens)
            const inputPrice = parseFloat(model.input_tokens_price_per_million || '0');
            const outputPrice = parseFloat(model.output_tokens_price_per_million || '0');
            const isPremium = inputPrice >= 3.0 || outputPrice >= 5.0;

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
                    // Requesty provides pricing per million tokens, convert to per token for consistency
                    input: model.input_tokens_price_per_million !== undefined && model.input_tokens_price_per_million !== null && model.input_tokens_price_per_million !== ''
                        ? (() => {
                            const parsed = parseFloat(model.input_tokens_price_per_million);
                            return !isNaN(parsed) ? parsed / 1000000 : undefined; // Convert from per-million to per-token
                        })()
                        : undefined,
                    output: model.output_tokens_price_per_million !== undefined && model.output_tokens_price_per_million !== null && model.output_tokens_price_per_million !== ''
                        ? (() => {
                            const parsed = parseFloat(model.output_tokens_price_per_million);
                            return !isNaN(parsed) ? parsed / 1000000 : undefined; // Convert from per-million to per-token
                        })()
                        : undefined,
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
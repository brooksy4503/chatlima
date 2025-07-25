#!/usr/bin/env tsx

/**
 * Model Parameters Update Script
 * 
 * This script dynamically fetches models from OpenRouter and Requesty providers,
 * extracts their capabilities (vision, max tokens, context length), and updates 
 * the model configuration in ai/providers.ts.
 * 
 * Usage: pnpm tsx scripts/update-model-parameters.ts
 */

import dotenv from 'dotenv';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from both .env and .env.local
dotenv.config({ path: '.env.local' });
dotenv.config(); // This will load .env without overriding .env.local

interface OpenRouterModel {
    id: string;
    name: string;
    description: string;
    context_length: number;
    architecture: {
        modality: string;
        tokenizer: string;
        instruct_type: string;
        input_modalities?: string[];
        output_modalities?: string[];
    };
    pricing: {
        prompt: string;
        completion: string;
        image?: string;
        request?: string;
    };
    top_provider: {
        context_length: number;
        max_completion_tokens: number | null;
        is_moderated: boolean;
    };
    per_request_limits: {
        prompt_tokens: string;
        completion_tokens: string;
    } | null;
    provider: string; // Added for OpenRouter models
}

interface RequestyModel {
    id: string;
    name: string;
    description?: string;
    provider: string;
    supports_vision?: boolean;
    input_modalities?: string[];
    output_modalities?: string[];
    // Requesty doesn't provide token limits in their API response
    // We'll use fallback values or try to infer from OpenRouter data
}

interface ModelParameterInfo {
    id: string;
    name: string;
    provider: string;
    hasVision: boolean;
    inputModalities: string[];
    outputModalities: string[];
    maxTokensRange: {
        min: number;
        max: number;
        default: number;
    };
    contextLength: number;
    source: 'openrouter' | 'requesty' | 'static';
    reasoning?: string;
}

class ModelParameterExtractor {
    extractParameters(model: OpenRouterModel | RequestyModel): ModelParameterInfo {
        const id = model.id;
        const name = model.name;
        const description = model.description || '';

        let hasVision = false;
        let reasoning = '';
        let inputModalities: string[] = [];
        let outputModalities: string[] = [];
        let maxTokensRange = { min: 1, max: 4096, default: 1024 }; // Default fallback
        let contextLength = 4096; // Default fallback

        // Extract data from OpenRouter models
        if ('architecture' in model && 'context_length' in model) {
            const arch = model.architecture;

            // Vision capabilities
            if (arch.input_modalities) {
                inputModalities = arch.input_modalities;
                hasVision = arch.input_modalities.includes('image');
                reasoning = hasVision
                    ? `OpenRouter API reports input_modalities: [${arch.input_modalities.join(', ')}]`
                    : `OpenRouter API input_modalities: [${arch.input_modalities.join(', ')}] - no image support`;
            }

            if (arch.output_modalities) {
                outputModalities = arch.output_modalities;
            }

            // Context length
            contextLength = model.context_length || 4096;

            // Max tokens from top_provider data
            const maxCompletionTokens = model.top_provider?.max_completion_tokens;
            if (maxCompletionTokens && maxCompletionTokens > 0) {
                // Use the actual max completion tokens from the provider
                maxTokensRange = {
                    min: 1,
                    max: maxCompletionTokens,
                    default: Math.min(1024, Math.floor(maxCompletionTokens * 0.25)) // 25% of max as default
                };
                reasoning += ` | Max tokens: ${maxCompletionTokens}`;
            } else {
                // Fallback: Use context length as a basis for max tokens
                // Typically max output tokens is much smaller than context length
                const estimatedMaxTokens = Math.min(8192, Math.floor(contextLength * 0.5));
                maxTokensRange = {
                    min: 1,
                    max: estimatedMaxTokens,
                    default: Math.min(1024, Math.floor(estimatedMaxTokens * 0.25))
                };
                reasoning += ` | Estimated max tokens: ${estimatedMaxTokens} (based on context length)`;
            }
        }

        // Fallback for models where API data is missing
        if (!reasoning) {
            // Basic fallback based on model name patterns for well-known models
            const visionModelPatterns = [
                /gpt-4o/i, /gpt-4.*vision/i, /gpt-4.*turbo/i,
                /claude-3/i, /claude-4/i,
                /gemini/i,
                /llava/i, /moondream/i, /bakllava/i
            ];

            const isKnownVisionModel = visionModelPatterns.some(pattern => pattern.test(id) || pattern.test(name));

            if (isKnownVisionModel) {
                hasVision = true;
                reasoning = `Fallback: Known vision model pattern matched`;
            } else {
                hasVision = false;
                reasoning = `Fallback: No API data available, defaulting to text-only`;
            }

            // Set reasonable defaults based on model type
            if (id.includes('gpt-4') || id.includes('claude-3') || id.includes('claude-4')) {
                maxTokensRange = { min: 1, max: 8192, default: 1024 };
                contextLength = 128000;
            } else if (id.includes('gemini')) {
                maxTokensRange = { min: 1, max: 8192, default: 1024 };
                contextLength = 32000;
            } else {
                maxTokensRange = { min: 1, max: 4096, default: 1024 };
                contextLength = 8000;
            }
        }

        return {
            id,
            name,
            provider: 'provider' in model ? model.provider : id.split('/')[0] || 'unknown',
            hasVision,
            source: 'architecture' in model ? 'openrouter' : 'requesty',
            inputModalities,
            outputModalities,
            maxTokensRange,
            contextLength,
            reasoning
        };
    }
}

class OpenRouterService {
    private apiKey: string;
    private baseUrl = 'https://openrouter.ai/api/v1';

    constructor() {
        this.apiKey = process.env.OPENROUTER_API_KEY || '';
        if (!this.apiKey) {
            throw new Error('OPENROUTER_API_KEY not found in environment variables');
        }
    }

    async fetchModels(): Promise<OpenRouterModel[]> {
        console.log('🔍 Fetching OpenRouter models...');

        const response = await fetch(`${this.baseUrl}/models`, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch OpenRouter models: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`✅ Fetched ${data.data.length} OpenRouter models`);
        return data.data;
    }
}

class RequestyService {
    private apiKey: string;
    private baseUrl = 'https://router.requesty.ai/v1'; // OpenAI-compatible endpoint

    constructor() {
        this.apiKey = process.env.REQUESTY_API_KEY || '';
        if (!this.apiKey) {
            console.warn('⚠️  REQUESTY_API_KEY not found - skipping Requesty models');
        }
    }

    async fetchModels(): Promise<RequestyModel[]> {
        if (!this.apiKey) {
            return [];
        }

        console.log('🔍 Fetching Requesty models...');

        try {
            // Try OpenAI-compatible models endpoint first
            const response = await fetch(`${this.baseUrl}/models`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Fetched ${data.data?.length || 0} Requesty models from API`);

                // Convert OpenAI-compatible format to our format
                return data.data?.map((model: any) => ({
                    id: model.id,
                    name: model.name || model.id,
                    provider: model.id.split('/')[0] || 'requesty',
                    supports_vision: this.inferVisionSupport(model)
                })) || [];
            } else {
                throw new Error(`API responded with ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.warn('⚠️  Failed to fetch Requesty models from API, using fallback:', error);

            // Fall back to known models from the current configuration
            const knownRequestyModels: RequestyModel[] = [
                { id: 'openai/gpt-4o', name: 'GPT-4O', provider: 'openai', supports_vision: true },
                { id: 'openai/gpt-4o-mini', name: 'GPT-4O Mini', provider: 'openai', supports_vision: true },
                { id: 'openai/gpt-4.1', name: 'GPT-4.1', provider: 'openai', supports_vision: true },
                { id: 'openai/gpt-4.1-nano', name: 'GPT-4.1 Nano', provider: 'openai', supports_vision: true },
                { id: 'openai/gpt-4.1-mini', name: 'GPT-4.1 Mini', provider: 'openai', supports_vision: true },
                { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic', supports_vision: true },
                { id: 'anthropic/claude-3.7-sonnet', name: 'Claude 3.7 Sonnet', provider: 'anthropic', supports_vision: true },
                { id: 'google/gemini-2.5-flash-preview', name: 'Gemini 2.5 Flash Preview', provider: 'google', supports_vision: true },
                { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'google', supports_vision: true },
                { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'google', supports_vision: true },
                { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B Instruct', provider: 'meta-llama', supports_vision: false },
                { id: 'anthropic/claude-sonnet-4-20250514', name: 'Claude Sonnet 4 (20250514)', provider: 'anthropic', supports_vision: true },
                { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', provider: 'deepseek', supports_vision: false },
                { id: 'deepseek/deepseek-reasoner', name: 'DeepSeek Reasoner', provider: 'deepseek', supports_vision: false },
                { id: 'deepseek/deepseek-v3', name: 'DeepSeek V3', provider: 'deepseek', supports_vision: false },
                { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', provider: 'deepseek', supports_vision: false },
                { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B Instruct', provider: 'meta-llama', supports_vision: false },
                { id: 'google/gemini-2.5-flash-lite-preview-06-17', name: 'Gemini 2.5 Flash Lite Preview 06-17', provider: 'google', supports_vision: true },
            ];

            console.log(`✅ Using ${knownRequestyModels.length} known Requesty models`);
            return knownRequestyModels;
        }
    }

    private inferVisionSupport(model: any): boolean {
        // Default to true for major providers
        const provider = model.id.split('/')[0];
        return ['openai', 'anthropic', 'google'].includes(provider);
    }
}

class ModelConfigUpdater {
    private providersPath = join(process.cwd(), 'ai/providers.ts');

    async updateModelParameters(models: ModelParameterInfo[]): Promise<void> {
        console.log('📝 Updating model configuration...');

        try {
            const content = readFileSync(this.providersPath, 'utf8');

            // Create maps for all the parameters we want to update
            const visionMap = new Map<string, boolean>();
            const maxTokensMap = new Map<string, { min: number; max: number; default: number }>();

            for (const model of models) {
                // Map both OpenRouter and Requesty prefixed versions
                const openrouterKey = `openrouter/${model.id}`;
                const requestyKey = `requesty/${model.id}`;

                // Vision capabilities
                visionMap.set(model.id, model.hasVision);
                visionMap.set(openrouterKey, model.hasVision);
                visionMap.set(requestyKey, model.hasVision);

                // Max tokens range
                maxTokensMap.set(model.id, model.maxTokensRange);
                maxTokensMap.set(openrouterKey, model.maxTokensRange);
                maxTokensMap.set(requestyKey, model.maxTokensRange);
            }

            let updatedContent = content;
            let visionUpdatedCount = 0;
            let maxTokensUpdatedCount = 0;

            // Update vision capabilities
            const visionRegex = /(\s*"([^"]+)"\s*:\s*\{[^}]*?)vision:\s*(true|false)/g;
            updatedContent = updatedContent.replace(visionRegex, (match, prefix, modelKey, oldValue) => {
                const newVisionValue = visionMap.get(modelKey);
                if (newVisionValue !== undefined && newVisionValue !== (oldValue === 'true')) {
                    visionUpdatedCount++;
                    return `${prefix}vision: ${newVisionValue}`;
                }
                return match;
            });

            // Update existing maxTokensRange
            const maxTokensRegex = /(\s*"([^"]+)"\s*:\s*\{[^}]*?)maxTokensRange:\s*\{\s*min:\s*\d+,\s*max:\s*\d+,\s*default:\s*\d+\s*\}/g;
            updatedContent = updatedContent.replace(maxTokensRegex, (match, prefix, modelKey) => {
                const newMaxTokensRange = maxTokensMap.get(modelKey);
                if (newMaxTokensRange) {
                    maxTokensUpdatedCount++;
                    return `${prefix}maxTokensRange: { min: ${newMaxTokensRange.min}, max: ${newMaxTokensRange.max}, default: ${newMaxTokensRange.default} }`;
                }
                return match;
            });

            // Add maxTokensRange to models that don't have it yet
            // Look for models that have maxSystemInstructionLength but no maxTokensRange
            const addMaxTokensRegex = /(\s*"([^"]+)"\s*:\s*\{[^}]*?maxSystemInstructionLength:\s*\d+)(\s*\n\s*\})/g;
            updatedContent = updatedContent.replace(addMaxTokensRegex, (match, prefix, modelKey, suffix) => {
                const newMaxTokensRange = maxTokensMap.get(modelKey);
                if (newMaxTokensRange && !match.includes('maxTokensRange')) {
                    maxTokensUpdatedCount++;
                    return `${prefix},\n    maxTokensRange: { min: ${newMaxTokensRange.min}, max: ${newMaxTokensRange.max}, default: ${newMaxTokensRange.default} }${suffix}`;
                }
                return match;
            });

            // Also add maxTokensRange to models that have vision but no maxTokensRange and no maxSystemInstructionLength
            const addMaxTokensRegex2 = /(\s*"([^"]+)"\s*:\s*\{[^}]*?vision:\s*(true|false))(\s*\n\s*\})/g;
            updatedContent = updatedContent.replace(addMaxTokensRegex2, (match, prefix, modelKey, visionValue, suffix) => {
                const newMaxTokensRange = maxTokensMap.get(modelKey);
                if (newMaxTokensRange && !match.includes('maxTokensRange') && !match.includes('maxSystemInstructionLength')) {
                    maxTokensUpdatedCount++;
                    return `${prefix},\n    maxTokensRange: { min: ${newMaxTokensRange.min}, max: ${newMaxTokensRange.max}, default: ${newMaxTokensRange.default} }${suffix}`;
                }
                return match;
            });

            // Write the updated content back
            writeFileSync(this.providersPath, updatedContent, 'utf8');

            console.log(`✅ Updated ${visionUpdatedCount} models with vision capabilities`);
            console.log(`✅ Updated ${maxTokensUpdatedCount} models with max tokens range`);
        } catch (error) {
            console.error('❌ Failed to update model configuration:', error);
            throw error;
        }
    }

    generateParametersReport(models: ModelParameterInfo[]): void {
        console.log('\n📊 Model Parameters Report');
        console.log('==========================\n');

        const visionEnabled = models.filter(m => m.hasVision);
        const visionDisabled = models.filter(m => !m.hasVision);

        console.log(`✅ Vision-enabled models: ${visionEnabled.length}`);
        console.log(`❌ Non-vision models: ${visionDisabled.length}`);
        console.log(`📝 Total models analyzed: ${models.length}\n`);

        // Show detailed parameters for some key models
        console.log('🔍 Key model parameters:');
        console.log('-'.repeat(120));
        console.log('Model Name'.padEnd(35) + ' | ' + 'Provider'.padEnd(12) + ' | ' + 'Vision'.padEnd(8) + ' | ' + 'Max Tokens'.padEnd(12) + ' | ' + 'Context'.padEnd(10) + ' | Source');
        console.log('-'.repeat(120));

        // Show a sample of important models
        const keyModels = models.filter(m =>
            m.id.includes('gpt-4') ||
            m.id.includes('claude') ||
            m.id.includes('gemini') ||
            m.id.includes('llama')
        ).slice(0, 20);

        keyModels.forEach(model => {
            const maxTokensStr = `${model.maxTokensRange.min}-${model.maxTokensRange.max}`;
            console.log(
                `${model.name.padEnd(35)} | ${model.provider.padEnd(12)} | ${(model.hasVision ? '✅' : '❌').padEnd(8)} | ${maxTokensStr.padEnd(12)} | ${model.contextLength.toString().padEnd(10)} | ${model.source}`
            );
        });

        // Show models with unusually high max tokens
        console.log('\n🚀 Models with high max token limits (>4096):');
        console.log('-'.repeat(80));
        const highTokenModels = models.filter(m => m.maxTokensRange.max > 4096);
        highTokenModels.forEach(model => {
            console.log(`  ${model.name.padEnd(35)} | Max: ${model.maxTokensRange.max.toString().padEnd(6)} | Context: ${model.contextLength}`);
        });
    }
}

async function main(): Promise<void> {
    try {
        console.log('🚀 Starting model parameters update...\n');

        const extractor = new ModelParameterExtractor();
        const openRouterService = new OpenRouterService();
        const requestyService = new RequestyService();
        const configUpdater = new ModelConfigUpdater();

        // Fetch models from all providers
        const [openRouterModels, requestyModels] = await Promise.all([
            openRouterService.fetchModels(),
            requestyService.fetchModels()
        ]);

        // Extract parameters from all models
        const allModelParameters: ModelParameterInfo[] = [];

        console.log('\n🔍 Analyzing model parameters...');

        for (const model of openRouterModels) {
            allModelParameters.push(extractor.extractParameters(model));
        }

        for (const model of requestyModels) {
            allModelParameters.push(extractor.extractParameters(model));
        }

        // Generate report
        configUpdater.generateParametersReport(allModelParameters);

        // Update configuration
        await configUpdater.updateModelParameters(allModelParameters);

        console.log('\n✅ Model parameters update completed successfully!');
        console.log('\n💡 Next steps:');
        console.log('  1. Review the model parameters report above');
        console.log('  2. Test the updated configuration');
        console.log('  3. Commit the changes to ai/providers.ts');

    } catch (error) {
        console.error('❌ Error updating model parameters:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
} 
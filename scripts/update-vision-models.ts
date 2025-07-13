#!/usr/bin/env tsx

/**
 * Vision Models Update Script
 * 
 * This script dynamically fetches models from OpenRouter and other providers,
 * determines their vision capabilities, and updates the model configuration.
 * 
 * Usage: pnpm tsx scripts/update-vision-models.ts
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
}

interface RequestyModel {
    id: string;
    name: string;
    description?: string;
    provider: string;
    supports_vision?: boolean;
    input_modalities?: string[];
    output_modalities?: string[];
}

interface VisionModelInfo {
    id: string;
    name: string;
    provider: string;
    hasVision: boolean;
    inputModalities: string[];
    outputModalities: string[];
    source: 'openrouter' | 'requesty' | 'static';
    reasoning?: string;
}

class VisionDetector {
    private visionKeywords = [
        'vision', 'image', 'visual', 'multimodal', 'picture', 'photo',
        'ocr', 'chart', 'diagram', 'screenshot', 'document'
    ];

    private knownVisionModels = [
        // OpenAI models
        'gpt-4o', 'gpt-4o-mini', 'gpt-4-vision', 'gpt-4-turbo',
        // Anthropic models
        'claude-3', 'claude-3.5', 'claude-3.7', 'claude-4',
        // Google models
        'gemini', 'gemini-pro', 'gemini-flash',
        // Others
        'llava', 'bakllava', 'moondream'
    ];

    private knownNonVisionModels = [
        // Text-only models
        'gpt-3.5-turbo', 'text-davinci', 'text-curie', 'text-babbage',
        // Most open source text-only models
        'mixtral', 'mistral', 'llama-2', 'falcon', 'mpt',
        // DeepSeek models (currently do not support vision)
        'deepseek'
    ];

    detectVision(model: OpenRouterModel | RequestyModel): VisionModelInfo {
        const id = model.id;
        const name = model.name;
        const description = model.description || '';

        let hasVision = false;
        let reasoning = '';
        let inputModalities: string[] = [];
        let outputModalities: string[] = [];

        // Check architecture modalities if available (OpenRouter)
        if ('architecture' in model) {
            const arch = model.architecture;

            // Check input/output modalities
            if (arch.input_modalities) {
                inputModalities = arch.input_modalities;
                hasVision = arch.input_modalities.includes('image');
                if (hasVision) {
                    reasoning = `Detected vision from input_modalities: ${arch.input_modalities.join(', ')}`;
                }
            }

            if (arch.output_modalities) {
                outputModalities = arch.output_modalities;
            }

            // Check modality field (older API format)
            if (arch.modality && arch.modality.includes('multimodal')) {
                hasVision = true;
                reasoning = `Detected vision from modality: ${arch.modality}`;
            }
        }

        // Check Requesty-specific fields
        if ('supports_vision' in model && model.supports_vision !== undefined) {
            hasVision = model.supports_vision;
            reasoning = `Explicit vision support flag: ${model.supports_vision}`;
        }

        // Check for image pricing (indicates vision support)
        if ('pricing' in model && model.pricing.image) {
            hasVision = true;
            reasoning = `Detected vision from image pricing: $${model.pricing.image}`;
        }

        // Check known vision models
        if (!hasVision) {
            const lowerName = name.toLowerCase();
            const lowerId = id.toLowerCase();

            for (const visionModel of this.knownVisionModels) {
                if (lowerId.includes(visionModel.toLowerCase()) || lowerName.includes(visionModel.toLowerCase())) {
                    hasVision = true;
                    reasoning = `Known vision model pattern: ${visionModel}`;
                    break;
                }
            }
        }

        // Check known non-vision models
        if (hasVision) {
            const lowerName = name.toLowerCase();
            const lowerId = id.toLowerCase();

            for (const nonVisionModel of this.knownNonVisionModels) {
                if (lowerId.includes(nonVisionModel.toLowerCase()) || lowerName.includes(nonVisionModel.toLowerCase())) {
                    hasVision = false;
                    reasoning = `Known non-vision model pattern: ${nonVisionModel}`;
                    break;
                }
            }
        }

        // Check description for vision keywords
        if (!hasVision && description) {
            const lowerDesc = description.toLowerCase();
            const foundKeywords = this.visionKeywords.filter(keyword =>
                lowerDesc.includes(keyword.toLowerCase())
            );

            if (foundKeywords.length > 0) {
                hasVision = true;
                reasoning = `Vision keywords in description: ${foundKeywords.join(', ')}`;
            }
        }

        // Default assumption for newer models (2023+)
        if (!hasVision && !reasoning) {
            // Most modern models from major providers support vision
            const majorProviders = ['openai', 'anthropic', 'google'];
            const provider = id.split('/')[0]?.toLowerCase() || '';

            if (majorProviders.includes(provider)) {
                hasVision = true;
                reasoning = `Default assumption for modern ${provider} model`;
            } else {
                reasoning = `No vision indicators found`;
            }
        }

        return {
            id,
            name,
            provider: 'provider' in model ? model.provider : id.split('/')[0] || 'unknown',
            hasVision,
            inputModalities,
            outputModalities,
            source: 'architecture' in model ? 'openrouter' : 'requesty',
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
        // Infer vision support from model information
        const id = model.id.toLowerCase();
        const name = (model.name || '').toLowerCase();

        // Known vision models
        if (id.includes('gpt-4o') || id.includes('gpt-4.1') || id.includes('claude') || id.includes('gemini')) {
            return true;
        }

        // Known non-vision models
        if (id.includes('deepseek') || id.includes('llama') && !id.includes('vision')) {
            return false;
        }

        // Default to true for major providers
        const provider = id.split('/')[0];
        return ['openai', 'anthropic', 'google'].includes(provider);
    }
}

class ModelConfigUpdater {
    private providersPath = join(process.cwd(), 'ai/providers.ts');

    async updateVisionCapabilities(visionModels: VisionModelInfo[]): Promise<void> {
        console.log('📝 Updating model configuration...');

        try {
            const content = readFileSync(this.providersPath, 'utf8');

            // Create a map of model IDs to vision capabilities
            const visionMap = new Map<string, boolean>();

            for (const model of visionModels) {
                // Map both OpenRouter and Requesty prefixed versions
                const openrouterKey = `openrouter/${model.id}`;
                const requestyKey = `requesty/${model.id}`;

                visionMap.set(model.id, model.hasVision);
                visionMap.set(openrouterKey, model.hasVision);
                visionMap.set(requestyKey, model.hasVision);
            }

            // Update the modelDetails object
            let updatedContent = content;
            let updatedCount = 0;

            // Find and update vision: true/false in modelDetails
            const visionRegex = /(\s*"[^"]+"\s*:\s*\{[^}]*?)vision:\s*(true|false)/g;

            // Read the current vision values from modelDetails
            // We'll use a regex to build a map of current values
            const currentVisionMap = new Map<string, boolean>();
            const currentVisionRegex = /(\s*"([^"]+)"\s*:\s*\{[^}]*?)vision:\s*(true|false)/g;
            let match;
            while ((match = currentVisionRegex.exec(content)) !== null) {
                const modelKey = match[2];
                const value = match[3] === 'true';
                currentVisionMap.set(modelKey, value);
            }

            updatedContent = updatedContent.replace(visionRegex, (match, prefix, oldValue) => {
                // Extract the model key from the prefix
                const keyMatch = prefix.match(/"([^"]+)"\s*:\s*\{/);
                if (keyMatch) {
                    const modelKey = keyMatch[1];
                    const newVisionValue = visionMap.get(modelKey);
                    const currentVisionValue = currentVisionMap.get(modelKey);
                    // Only update if the value is different
                    if (newVisionValue !== undefined && newVisionValue !== currentVisionValue) {
                        updatedCount++;
                        return `${prefix}vision: ${newVisionValue}`;
                    }
                }
                return match;
            });

            // Write the updated content back
            writeFileSync(this.providersPath, updatedContent, 'utf8');

            console.log(`✅ Updated ${updatedCount} models with vision capabilities`);
        } catch (error) {
            console.error('❌ Failed to update model configuration:', error);
            throw error;
        }
    }

    generateVisionReport(visionModels: VisionModelInfo[]): void {
        console.log('\n📊 Vision Capabilities Report');
        console.log('==============================\n');

        const visionEnabled = visionModels.filter(m => m.hasVision);
        const visionDisabled = visionModels.filter(m => !m.hasVision);

        console.log(`✅ Vision-enabled models: ${visionEnabled.length}`);
        console.log(`❌ Non-vision models: ${visionDisabled.length}`);
        console.log(`📝 Total models analyzed: ${visionModels.length}\n`);

        // Show vision-enabled models
        if (visionEnabled.length > 0) {
            console.log('🔍 Vision-enabled models:');
            console.log('-'.repeat(80));
            visionEnabled.forEach(model => {
                console.log(`  ${model.name.padEnd(35)} | ${model.provider.padEnd(12)} | ${model.reasoning}`);
            });
        }

        // Show models without vision
        if (visionDisabled.length > 0) {
            console.log('\n📄 Non-vision models:');
            console.log('-'.repeat(80));
            visionDisabled.forEach(model => {
                console.log(`  ${model.name.padEnd(35)} | ${model.provider.padEnd(12)} | ${model.reasoning}`);
            });
        }
    }
}

async function main(): Promise<void> {
    try {
        console.log('🚀 Starting vision models update...\n');

        const detector = new VisionDetector();
        const openRouterService = new OpenRouterService();
        const requestyService = new RequestyService();
        const configUpdater = new ModelConfigUpdater();

        // Fetch models from all providers
        const [openRouterModels, requestyModels] = await Promise.all([
            openRouterService.fetchModels(),
            requestyService.fetchModels()
        ]);

        // Detect vision capabilities
        const allVisionModels: VisionModelInfo[] = [];

        console.log('\n🔍 Analyzing vision capabilities...');

        for (const model of openRouterModels) {
            allVisionModels.push(detector.detectVision(model));
        }

        for (const model of requestyModels) {
            allVisionModels.push(detector.detectVision(model));
        }

        // Generate report
        configUpdater.generateVisionReport(allVisionModels);

        // Update configuration
        await configUpdater.updateVisionCapabilities(allVisionModels);

        console.log('\n✅ Vision models update completed successfully!');
        console.log('\n💡 Next steps:');
        console.log('  1. Review the vision capabilities report above');
        console.log('  2. Test the updated configuration');
        console.log('  3. Commit the changes to ai/providers.ts');

    } catch (error) {
        console.error('❌ Error updating vision models:', error);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
} 
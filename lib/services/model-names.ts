import { db } from '@/lib/db';
import { modelPricing } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Known model display names mapping
const KNOWN_MODEL_NAMES: Record<string, string> = {
    // OpenAI Models
    'gpt-4o': 'GPT-4o',
    'gpt-4o-mini': 'GPT-4o Mini',
    'gpt-4-turbo': 'GPT-4 Turbo',
    'gpt-4': 'GPT-4',
    'gpt-3.5-turbo': 'GPT-3.5 Turbo',
    'gpt-3.5-turbo-16k': 'GPT-3.5 Turbo 16K',

    // Anthropic Models
    'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet',
    'claude-3-5-haiku-20241022': 'Claude 3.5 Haiku',
    'claude-3-opus-20240229': 'Claude 3 Opus',
    'claude-3-sonnet-20240229': 'Claude 3 Sonnet',
    'claude-3-haiku-20240307': 'Claude 3 Haiku',
    'claude-2.1': 'Claude 2.1',
    'claude-2.0': 'Claude 2.0',
    'claude-instant-1.2': 'Claude Instant 1.2',

    // Google Models
    'gemini-1.5-pro': 'Gemini 1.5 Pro',
    'gemini-1.5-flash': 'Gemini 1.5 Flash',
    'gemini-1.0-pro': 'Gemini 1.0 Pro',
    'gemini-pro': 'Gemini Pro',
    'gemini-pro-vision': 'Gemini Pro Vision',

    // Groq Models
    'llama-3.1-70b-versatile': 'Llama 3.1 70B Versatile',
    'llama-3.1-8b-versatile': 'Llama 3.1 8B Versatile',
    'llama-3.1-405b-reasoning': 'Llama 3.1 405B Reasoning',
    'mixtral-8x7b-32768': 'Mixtral 8x7B',
    'gemma-7b-it': 'Gemma 7B IT',
    'gemma-2-9b-it': 'Gemma 2 9B IT',

    // xAI Models
    'grok-beta': 'Grok Beta',
    'grok-2': 'Grok 2',

    // OpenRouter Models
    'openai/gpt-4o': 'GPT-4o (OpenRouter)',
    'openai/gpt-4o-mini': 'GPT-4o Mini (OpenRouter)',
    'anthropic/claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet (OpenRouter)',
    'anthropic/claude-3-5-haiku-20241022': 'Claude 3.5 Haiku (OpenRouter)',
    'google/gemini-1.5-pro': 'Gemini 1.5 Pro (OpenRouter)',
    'meta-llama/llama-3.1-70b-versatile': 'Llama 3.1 70B (OpenRouter)',

    // Requesty Models
    'requesty/gpt-4o': 'GPT-4o (Requesty)',
    'requesty/claude-3-5-sonnet': 'Claude 3.5 Sonnet (Requesty)',
    'requesty/gemini-1.5-pro': 'Gemini 1.5 Pro (Requesty)',
};

export class ModelNameService {
    /**
     * Get display name for a model ID
     */
    static getDisplayName(modelId: string): string {
        // First check known model names
        if (KNOWN_MODEL_NAMES[modelId]) {
            return KNOWN_MODEL_NAMES[modelId];
        }

        // Try to extract provider and model from OpenRouter format
        if (modelId.includes('/')) {
            const [provider, model] = modelId.split('/');
            const baseModelName = KNOWN_MODEL_NAMES[model];
            if (baseModelName) {
                return `${baseModelName} (${provider})`;
            }
        }

        // Fallback: format the model ID nicely
        return this.formatModelId(modelId);
    }

    /**
     * Format a model ID into a readable display name
     */
    private static formatModelId(modelId: string): string {
        // Remove common prefixes and format
        let formatted = modelId
            .replace(/^openai\//, '')
            .replace(/^anthropic\//, '')
            .replace(/^google\//, '')
            .replace(/^groq\//, '')
            .replace(/^xai\//, '')
            .replace(/^openrouter\//, '')
            .replace(/^requesty\//, '');

        // Convert to title case
        formatted = formatted
            .split(/[-._]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');

        // Handle special cases
        formatted = formatted
            .replace(/Gpt/g, 'GPT')
            .replace(/Claude/g, 'Claude')
            .replace(/Gemini/g, 'Gemini')
            .replace(/Llama/g, 'Llama')
            .replace(/Grok/g, 'Grok')
            .replace(/Gemma/g, 'Gemma')
            .replace(/Mixtral/g, 'Mixtral');

        return formatted;
    }

    /**
     * Get model names from database with fallback to known names
     */
    static async getModelNamesFromDatabase(): Promise<Map<string, string>> {
        try {
            const result = await db
                .select({
                    modelId: modelPricing.modelId,
                })
                .from(modelPricing)
                .where(eq(modelPricing.isActive, true))
                .groupBy(modelPricing.modelId);

            const modelNamesMap = new Map<string, string>();

            for (const row of result) {
                const displayName = this.getDisplayName(row.modelId);
                modelNamesMap.set(row.modelId, displayName);
            }

            return modelNamesMap;
        } catch (error) {
            console.error('[ModelNameService] Error fetching model names from database:', error);
            return new Map();
        }
    }

    /**
     * Get all known model names
     */
    static getAllKnownModels(): string[] {
        return Object.keys(KNOWN_MODEL_NAMES);
    }

    /**
     * Get model provider from model ID
     */
    static getProvider(modelId: string): string {
        if (modelId.includes('/')) {
            return modelId.split('/')[0];
        }

        // Try to determine provider from model ID patterns
        if (modelId.startsWith('gpt-')) return 'openai';
        if (modelId.startsWith('claude-')) return 'anthropic';
        if (modelId.startsWith('gemini-')) return 'google';
        if (modelId.startsWith('llama-') || modelId.startsWith('mixtral-') || modelId.startsWith('gemma-')) return 'groq';
        if (modelId.startsWith('grok-')) return 'xai';

        return 'unknown';
    }

    /**
     * Check if a model is from a specific provider
     */
    static isFromProvider(modelId: string, provider: string): boolean {
        return this.getProvider(modelId) === provider;
    }

    /**
     * Get model family (e.g., GPT, Claude, Gemini, etc.)
     */
    static getModelFamily(modelId: string): string {
        const displayName = this.getDisplayName(modelId);

        if (displayName.includes('GPT')) return 'GPT';
        if (displayName.includes('Claude')) return 'Claude';
        if (displayName.includes('Gemini')) return 'Gemini';
        if (displayName.includes('Llama')) return 'Llama';
        if (displayName.includes('Grok')) return 'Grok';
        if (displayName.includes('Gemma')) return 'Gemma';
        if (displayName.includes('Mixtral')) return 'Mixtral';

        return 'Other';
    }
}

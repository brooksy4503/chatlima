import {
    LEGACY_MODEL_ALIASES,
    normalizeModelId,
    getModelProviderPrefix,
} from '@/lib/models/normalize-model-id';

describe('normalize-model-id', () => {
    it('maps legacy bare IDs to prefixed provider paths', () => {
        expect(normalizeModelId('gpt-5-nano')).toBe('openai/gpt-5-nano');
        expect(normalizeModelId('claude-3-7-sonnet')).toBe('anthropic/claude-3-7-sonnet-20250219');
        expect(normalizeModelId('qwen-qwq')).toBe('groq/qwen-qwq-32b');
        expect(normalizeModelId('grok-3-mini')).toBe('xai/grok-3-mini');
    });

    it('leaves prefixed IDs unchanged', () => {
        expect(normalizeModelId('openai/gpt-4.1-mini')).toBe('openai/gpt-4.1-mini');
    });

    it('returns provider prefix from normalized IDs', () => {
        expect(getModelProviderPrefix('gpt-5-nano')).toBe('openai');
        expect(getModelProviderPrefix('openrouter/google/gemini-2.5-flash')).toBe('openrouter');
    });

    it('keeps legacy aliases in sync with migrations', () => {
        expect(Object.keys(LEGACY_MODEL_ALIASES)).toEqual(
            expect.arrayContaining(['gpt-5-nano', 'claude-3-7-sonnet', 'qwen-qwq', 'grok-3-mini'])
        );
    });
});

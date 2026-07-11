jest.mock('@ai-sdk/openai', () => ({
    createOpenAI: jest.fn(() => jest.fn((modelId: string) => ({ provider: 'openai', modelId }))),
}));

jest.mock('@ai-sdk/anthropic', () => ({
    createAnthropic: jest.fn(() => jest.fn((modelId: string) => ({ provider: 'anthropic', modelId }))),
}));

jest.mock('@ai-sdk/groq', () => ({
    createGroq: jest.fn(() => jest.fn((modelId: string) => ({ provider: 'groq', modelId }))),
}));

jest.mock('@ai-sdk/xai', () => ({
    createXai: jest.fn(() => jest.fn((modelId: string) => ({ provider: 'xai', modelId }))),
}));

jest.mock('@openrouter/ai-sdk-provider', () => ({
    createOpenRouter: jest.fn(() => jest.fn((modelId: string) => ({ provider: 'openrouter', modelId }))),
}));

jest.mock('@requesty/ai-sdk', () => ({
    createRequesty: jest.fn(() => jest.fn((modelId: string) => ({ provider: 'requesty', modelId }))),
}));

import { getLanguageModelWithKeys } from '@/ai/providers';

describe('getLanguageModelWithKeys direct provider routing', () => {
    const apiKeys = {
        OPENAI_API_KEY: 'sk-openai',
        ANTHROPIC_API_KEY: 'sk-ant',
        GROQ_API_KEY: 'gsk-groq',
        XAI_API_KEY: 'xai-key',
    };

    it('routes openai/ prefixed models to OpenAI client', () => {
        const model = getLanguageModelWithKeys('openai/gpt-4.1-mini', apiKeys) as {
            provider: string;
            modelId: string;
        };
        expect(model.provider).toBe('openai');
        expect(model.modelId).toBe('gpt-4.1-mini');
    });

    it('routes anthropic/ prefixed models to Anthropic client', () => {
        const model = getLanguageModelWithKeys(
            'anthropic/claude-sonnet-4-20250514',
            apiKeys
        ) as { provider: string; modelId: string };
        expect(model.provider).toBe('anthropic');
        expect(model.modelId).toBe('claude-sonnet-4-20250514');
    });

    it('routes groq/ prefixed models to Groq client', () => {
        const model = getLanguageModelWithKeys('groq/llama-3.3-70b-versatile', apiKeys) as {
            provider: string;
            modelId: string;
        };
        expect(model.provider).toBe('groq');
        expect(model.modelId).toBe('llama-3.3-70b-versatile');
    });

    it('routes xai/ prefixed models to xAI client', () => {
        const model = getLanguageModelWithKeys('xai/grok-4', apiKeys) as {
            provider: string;
            modelId: string;
        };
        expect(model.provider).toBe('xai');
        expect(model.modelId).toBe('grok-4');
    });
});

import {
    createOpenAiCompatibleParser,
    parseAnthropicModels,
} from '@/lib/models/direct-provider-parsers';

describe('direct-provider-parsers', () => {
    describe('createOpenAiCompatibleParser', () => {
        const parseOpenAi = createOpenAiCompatibleParser({
            providerName: 'OpenAI',
            idPrefix: 'openai',
        });

        it('parses OpenAI-style model lists with prefixed IDs', () => {
            const models = parseOpenAi({
                data: [
                    { id: 'gpt-4.1-mini' },
                    { id: 'text-embedding-3-small' },
                ],
            });

            expect(models).toHaveLength(1);
            expect(models[0]).toMatchObject({
                id: 'openai/gpt-4.1-mini',
                provider: 'OpenAI',
                supportsWebSearch: false,
            });
        });

        it('throws on invalid response shape', () => {
            expect(() => parseOpenAi({ models: [] })).toThrow(
                'Invalid OpenAI API response format'
            );
        });
    });

    describe('parseAnthropicModels', () => {
        it('parses Anthropic model lists with prefixed IDs', () => {
            const models = parseAnthropicModels({
                data: [
                    {
                        id: 'claude-sonnet-4-20250514',
                        display_name: 'Claude Sonnet 4',
                    },
                ],
            });

            expect(models).toHaveLength(1);
            expect(models[0]).toMatchObject({
                id: 'anthropic/claude-sonnet-4-20250514',
                provider: 'Anthropic',
                name: 'Claude Sonnet 4',
                supportsWebSearch: false,
            });
        });

        it('throws on invalid response shape', () => {
            expect(() => parseAnthropicModels({ models: [] })).toThrow(
                'Invalid Anthropic API response format'
            );
        });
    });
});

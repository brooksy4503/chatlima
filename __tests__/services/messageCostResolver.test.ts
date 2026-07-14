import { resolveMessageCost, authoritativeRowCost } from '@/lib/services/messageCostResolver';

describe('messageCostResolver', () => {
    describe('resolveMessageCost', () => {
        it('uses OpenRouter response total_cost when present', () => {
            const result = resolveMessageCost({
                inputTokens: 1000,
                outputTokens: 500,
                modelId: 'openrouter/openai/gpt-4o',
                provider: 'openrouter',
                providerResponse: {
                    usage: { total_cost: 0.0123 },
                },
            });

            expect(result.actualCost).toBe(0.0123);
            expect(result.costSource).toBe('openrouter_response');
        });

        it('falls back to estimated cost when no provider actual', () => {
            const result = resolveMessageCost({
                inputTokens: 1000,
                outputTokens: 500,
                modelId: 'openrouter/openai/gpt-4o',
                provider: 'openrouter',
            });

            expect(result.actualCost).toBeNull();
            expect(result.estimatedCost).toBeGreaterThanOrEqual(0);
            expect(result.costSource).toBe('estimated');
        });

        it('stores zero actual cost for free OpenRouter models', () => {
            const result = resolveMessageCost({
                inputTokens: 100,
                outputTokens: 50,
                modelId: 'openrouter/meta-llama/llama-3.2-3b-instruct:free',
                provider: 'openrouter',
            });

            expect(result.actualCost).toBe(0);
            expect(result.costSource).toBe('openrouter_response');
        });
    });

    describe('authoritativeRowCost', () => {
        it('prefers actualCost over estimatedCost', () => {
            expect(authoritativeRowCost('0.05', '0.01')).toBe(0.05);
        });

        it('falls back to estimatedCost when actual is null', () => {
            expect(authoritativeRowCost(null, '0.02')).toBe(0.02);
        });
    });
});

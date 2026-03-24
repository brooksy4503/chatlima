import { canUserChat, hasProviderByokForModel } from '@/lib/services/accessGateService';

describe('accessGateService', () => {
    describe('hasProviderByokForModel', () => {
        it('matches BYOK by selected model provider', () => {
            expect(hasProviderByokForModel('openai/gpt-4.1', { OPENAI_API_KEY: 'sk-test' })).toBe(true);
            expect(hasProviderByokForModel('anthropic/claude-3-7-sonnet', { ANTHROPIC_API_KEY: 'sk-test' })).toBe(true);
            expect(hasProviderByokForModel('groq/llama-3.3', { GROQ_API_KEY: 'gsk-test' })).toBe(true);
            expect(hasProviderByokForModel('xai/grok-3-mini', { XAI_API_KEY: 'xai-test' })).toBe(true);
            expect(hasProviderByokForModel('openrouter/qwen/qwen-turbo', { OPENROUTER_API_KEY: 'sk-or-test' })).toBe(true);
            expect(hasProviderByokForModel('requesty/alibaba/qwen-turbo', { REQUESTY_API_KEY: 'rq-test' })).toBe(true);
        });

        it('does not allow cross-provider BYOK', () => {
            expect(hasProviderByokForModel('openai/gpt-4.1', { OPENROUTER_API_KEY: 'sk-or-test' })).toBe(false);
        });
    });

    describe('canUserChat', () => {
        const flagsOn = { billingEnforced: true, allowByokBypass: true };

        it('allows any user when billing is not enforced', () => {
            const result = canUserChat({
                isAnonymous: true,
                hasPaidSubscription: false,
                selectedModel: 'openai/gpt-4.1',
                apiKeys: {},
                flags: { billingEnforced: false, allowByokBypass: false }
            });

            expect(result.allowed).toBe(true);
            expect(result.reason).toBe('ALLOWED');
        });

        it('allows paid subscribers', () => {
            const result = canUserChat({
                isAnonymous: false,
                hasPaidSubscription: true,
                selectedModel: 'openai/gpt-4.1',
                apiKeys: {},
                flags: flagsOn
            });

            expect(result.allowed).toBe(true);
        });

        it('allows provider-matched BYOK when bypass is on', () => {
            const result = canUserChat({
                isAnonymous: false,
                hasPaidSubscription: false,
                selectedModel: 'requesty/alibaba/qwen-turbo',
                apiKeys: { REQUESTY_API_KEY: 'rq-test' },
                flags: flagsOn
            });

            expect(result.allowed).toBe(true);
        });

        it('blocks unsubscribed users without provider-matched BYOK', () => {
            const result = canUserChat({
                isAnonymous: false,
                hasPaidSubscription: false,
                selectedModel: 'openai/gpt-4.1',
                apiKeys: { OPENROUTER_API_KEY: 'sk-or-test' },
                flags: flagsOn
            });

            expect(result.allowed).toBe(false);
            expect(result.reason).toBe('PAYWALL_BYOK_REQUIRED');
        });
    });
});


import { type AccessPolicyFlags } from '@/lib/config/access-policy';

const providerKeyMap: Record<string, string> = {
    openai: 'OPENAI_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    groq: 'GROQ_API_KEY',
    xai: 'XAI_API_KEY',
    openrouter: 'OPENROUTER_API_KEY',
    requesty: 'REQUESTY_API_KEY',
};

export const getProviderApiKeyName = (modelId: string): string | null => {
    const provider = modelId.split('/')[0];
    return providerKeyMap[provider] || null;
};

export const hasProviderByokForModel = (modelId: string, apiKeys: Record<string, string> = {}): boolean => {
    const keyName = getProviderApiKeyName(modelId);
    if (!keyName) return false;
    const value = apiKeys[keyName];
    return Boolean(value && value.trim().length > 0);
};

export interface CanUserChatInput {
    isAnonymous: boolean;
    hasPaidSubscription: boolean;
    selectedModel: string;
    apiKeys: Record<string, string>;
    flags: AccessPolicyFlags;
}

export interface CanUserChatResult {
    allowed: boolean;
    reason: 'ALLOWED' | 'PAYWALL_SUBSCRIPTION_REQUIRED' | 'PAYWALL_BYOK_REQUIRED';
}

export const canUserChat = (input: CanUserChatInput): CanUserChatResult => {
    const { isAnonymous, hasPaidSubscription, selectedModel, apiKeys, flags } = input;

    if (!flags.billingEnforced) {
        return { allowed: true, reason: 'ALLOWED' };
    }

    if (hasPaidSubscription) {
        return { allowed: true, reason: 'ALLOWED' };
    }

    if (flags.allowByokBypass && hasProviderByokForModel(selectedModel, apiKeys)) {
        return { allowed: true, reason: 'ALLOWED' };
    }

    // Keep reason explicit for product analytics/support; anonymous users fail the same paid-or-BYOK rule.
    return {
        allowed: false,
        reason: isAnonymous ? 'PAYWALL_SUBSCRIPTION_REQUIRED' : 'PAYWALL_BYOK_REQUIRED',
    };
};


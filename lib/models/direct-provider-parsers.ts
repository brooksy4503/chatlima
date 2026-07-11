import type { ModelInfo } from '@/lib/types/models';

export interface OpenAiCompatibleParserOptions {
    providerName: string;
    idPrefix: string;
    isChatModel?: (modelId: string) => boolean;
}

const DEFAULT_NON_CHAT_PATTERNS = [
    /^text-embedding/,
    /^embedding/,
    /^tts-/,
    /^whisper/,
    /^dall-e/,
    /^gpt-image/,
    /^audio-/,
    /^omni-moderation/,
    /^davinci/,
    /^babbage/,
    /^computer-use/,
    /^sora/,
];

export function defaultIsChatModel(modelId: string): boolean {
    const id = modelId.toLowerCase();
    return !DEFAULT_NON_CHAT_PATTERNS.some((pattern) => pattern.test(id));
}

function inferCapabilities(modelId: string): string[] {
    const id = modelId.toLowerCase();
    const capabilities: string[] = [];

    if (id.includes('vision') || id.includes('4o') || id.includes('image')) {
        capabilities.push('Vision');
    }
    if (
        id.includes('reason') ||
        id.includes('thinking') ||
        id.includes('o1') ||
        id.includes('o3') ||
        id.includes('o4') ||
        id.includes('r1') ||
        id.includes('qwq') ||
        id.includes('grok')
    ) {
        capabilities.push('Reasoning');
    }
    if (id.includes('code') || id.includes('coder')) {
        capabilities.push('Coding');
    }
    if (id.includes('fast') || id.includes('flash') || id.includes('mini') || id.includes('nano')) {
        capabilities.push('Fast');
    }
    if (capabilities.length === 0) {
        capabilities.push('General Purpose');
    }

    return capabilities;
}

function formatDisplayName(providerName: string, modelId: string): string {
    const readable = modelId
        .split(/[-_/]/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    return `${providerName} ${readable}`.trim();
}

export function createOpenAiCompatibleParser(
    options: OpenAiCompatibleParserOptions
): (data: unknown) => ModelInfo[] {
    const { providerName, idPrefix, isChatModel = defaultIsChatModel } = options;

    return (data: unknown): ModelInfo[] => {
        const payload = data as { data?: Array<{ id?: string; owned_by?: string }> };
        if (!payload?.data || !Array.isArray(payload.data)) {
            throw new Error(`Invalid ${providerName} API response format`);
        }

        return payload.data
            .filter((model) => {
                const modelId = model.id?.trim();
                return Boolean(modelId && isChatModel(modelId));
            })
            .map((model): ModelInfo => {
                const modelId = model.id!.trim();
                const id = `${idPrefix}/${modelId}`;
                const capabilities = inferCapabilities(modelId);

                return {
                    id,
                    provider: providerName,
                    name: formatDisplayName(providerName, modelId),
                    description: `${formatDisplayName(providerName, modelId)} via ${providerName}`,
                    capabilities,
                    premium: false,
                    vision: capabilities.includes('Vision'),
                    status: 'available',
                    lastChecked: new Date(),
                    enabled: true,
                    supportsWebSearch: false,
                    supportsToolCalling: true,
                    supportsTemperature: true,
                    supportsMaxTokens: true,
                    supportsSystemInstruction: true,
                    apiVersion: modelId,
                };
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    };
}

export function parseAnthropicModels(data: unknown): ModelInfo[] {
    const payload = data as { data?: Array<{ id?: string; display_name?: string }> };
    if (!payload?.data || !Array.isArray(payload.data)) {
        throw new Error('Invalid Anthropic API response format');
    }

    return payload.data
        .filter((model) => Boolean(model.id?.trim()))
        .map((model): ModelInfo => {
            const modelId = model.id!.trim();
            const id = `anthropic/${modelId}`;
            const capabilities = inferCapabilities(modelId);
            const displayName = model.display_name || formatDisplayName('Anthropic', modelId);

            return {
                id,
                provider: 'Anthropic',
                name: displayName,
                description: `${displayName} via Anthropic`,
                capabilities,
                premium: modelId.includes('opus'),
                vision: modelId.includes('vision') || modelId.includes('sonnet') || modelId.includes('opus'),
                status: 'available',
                lastChecked: new Date(),
                enabled: true,
                supportsWebSearch: false,
                supportsToolCalling: true,
                supportsTemperature: true,
                supportsMaxTokens: true,
                supportsSystemInstruction: true,
                apiVersion: modelId,
            };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
}

/** Bare legacy IDs mapped to prefixed provider/model paths. */
export const LEGACY_MODEL_ALIASES: Record<string, string> = {
    'gpt-5-nano': 'openai/gpt-5-nano',
    'claude-3-7-sonnet': 'anthropic/claude-3-7-sonnet-20250219',
    'qwen-qwq': 'groq/qwen-qwq-32b',
    'grok-3-mini': 'xai/grok-3-mini',
};

export function normalizeModelId(modelId: string): string {
    return LEGACY_MODEL_ALIASES[modelId] ?? modelId;
}

export function getModelProviderPrefix(modelId: string): string | null {
    const normalized = normalizeModelId(modelId);
    const prefix = normalized.split('/')[0];
    return prefix || null;
}

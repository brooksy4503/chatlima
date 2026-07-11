// Client-safe constants that can be imported by client components

// Model migrations for backwards compatibility
export const MODEL_MIGRATIONS = [
    {
        oldId: 'openrouter/anthropic/claude-3.5-sonnet-old',
        newId: 'openrouter/anthropic/claude-3.5-sonnet',
        reason: 'renamed' as const,
        automaticMigration: true,
    },
    {
        oldId: 'gpt-5-nano',
        newId: 'openai/gpt-5-nano',
        reason: 'moved' as const,
        automaticMigration: true,
    },
    {
        oldId: 'claude-3-7-sonnet',
        newId: 'anthropic/claude-3-7-sonnet-20250219',
        reason: 'moved' as const,
        automaticMigration: true,
    },
    {
        oldId: 'qwen-qwq',
        newId: 'groq/qwen-qwq-32b',
        reason: 'moved' as const,
        automaticMigration: true,
    },
    {
        oldId: 'grok-3-mini',
        newId: 'xai/grok-3-mini',
        reason: 'moved' as const,
        automaticMigration: true,
    },
];

// Cache configuration constants
export const CACHE_CONFIG = {
    modelListTTL: 10 * 60 * 1000,      // 10 minutes
    modelDetailsTTL: 60 * 60 * 1000,   // 1 hour  
    providerHealthTTL: 30 * 1000,      // 30 seconds
    forceRefreshKey: 'force-refresh',   // Admin override
}; 
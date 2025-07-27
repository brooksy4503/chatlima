// Client-safe constants that can be imported by client components

// Model migrations for backwards compatibility
export const MODEL_MIGRATIONS = [
    {
        oldId: 'openrouter/anthropic/claude-3.5-sonnet-old',
        newId: 'openrouter/anthropic/claude-3.5-sonnet',
        reason: 'renamed' as const,
        automaticMigration: true,
    },
    // Add more migrations as needed
];

// Cache configuration constants
export const CACHE_CONFIG = {
    modelListTTL: 10 * 60 * 1000,      // 10 minutes
    modelDetailsTTL: 60 * 60 * 1000,   // 1 hour  
    providerHealthTTL: 30 * 1000,      // 30 seconds
    forceRefreshKey: 'force-refresh',   // Admin override
}; 
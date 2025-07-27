import { ModelMigration } from '@/lib/types/models';
import { MODEL_MIGRATIONS } from './provider-configs';

// Extended migration data with more real-world scenarios
export const EXTENDED_MODEL_MIGRATIONS: ModelMigration[] = [
    ...MODEL_MIGRATIONS,

    // OpenRouter model migrations
    {
        oldId: 'openrouter/anthropic/claude-3.5-sonnet-old',
        newId: 'openrouter/anthropic/claude-3.5-sonnet',
        reason: 'renamed',
        automaticMigration: true,
    },
    {
        oldId: 'openrouter/openai/gpt-4-turbo',
        newId: 'openrouter/openai/gpt-4.1',
        reason: 'renamed',
        automaticMigration: true,
    },
    {
        oldId: 'openrouter/google/gemini-pro',
        newId: 'openrouter/google/gemini-2.5-pro',
        reason: 'moved',
        automaticMigration: true,
    },

    // Requesty model migrations
    {
        oldId: 'requesty/anthropic/claude-3-sonnet',
        newId: 'requesty/anthropic/claude-3.5-sonnet',
        reason: 'moved',
        automaticMigration: true,
    },
    {
        oldId: 'requesty/openai/gpt-4-turbo',
        newId: 'requesty/openai/gpt-4.1',
        reason: 'renamed',
        automaticMigration: true,
    },

    // Deprecated models (no automatic migration)
    {
        oldId: 'openrouter/anthropic/claude-2',
        newId: 'openrouter/anthropic/claude-3.5-sonnet',
        reason: 'deprecated',
        automaticMigration: false,
    },
    {
        oldId: 'openrouter/openai/gpt-3.5-turbo',
        newId: 'openrouter/openai/gpt-4.1-mini',
        reason: 'deprecated',
        automaticMigration: false,
    },
];

// Migration utilities
export class ModelMigrationManager {
    private migrations: ModelMigration[];
    private notificationCallbacks: Array<(migration: ModelMigration, type: 'auto' | 'manual') => void> = [];

    constructor(migrations: ModelMigration[] = EXTENDED_MODEL_MIGRATIONS) {
        this.migrations = migrations;
    }

    /**
     * Find migration for a given model ID
     */
    findMigration(oldModelId: string): ModelMigration | null {
        return this.migrations.find(m => m.oldId === oldModelId) || null;
    }

    /**
     * Get all migrations from a specific model ID
     */
    getMigrationChain(oldModelId: string): ModelMigration[] {
        const chain: ModelMigration[] = [];
        let currentId = oldModelId;
        let depth = 0;
        const maxDepth = 10; // Prevent infinite loops

        while (depth < maxDepth) {
            const migration = this.findMigration(currentId);
            if (!migration) break;

            chain.push(migration);
            currentId = migration.newId;
            depth++;
        }

        return chain;
    }

    /**
     * Get the final migration target for a model ID
     */
    getFinalMigrationTarget(oldModelId: string): { modelId: string; migrations: ModelMigration[] } {
        const chain = this.getMigrationChain(oldModelId);
        const finalId = chain.length > 0 ? chain[chain.length - 1].newId : oldModelId;

        return {
            modelId: finalId,
            migrations: chain,
        };
    }

    /**
     * Check if a model can be automatically migrated
     */
    canAutoMigrate(oldModelId: string): boolean {
        const chain = this.getMigrationChain(oldModelId);
        return chain.length > 0 && chain.every(m => m.automaticMigration);
    }

    /**
     * Perform migration with available models validation
     */
    migrateModel(
        oldModelId: string,
        availableModelIds: string[],
        forceAutoMigration = false
    ): {
        success: boolean;
        newModelId: string;
        migrations: ModelMigration[];
        message?: string;
        requiresUserAction?: boolean;
    } {
        const { modelId: finalId, migrations } = this.getFinalMigrationTarget(oldModelId);

        // If no migration exists, check if the model is still available
        if (migrations.length === 0) {
            if (availableModelIds.includes(oldModelId)) {
                return {
                    success: true,
                    newModelId: oldModelId,
                    migrations: [],
                    message: 'Model is still available',
                };
            } else {
                return {
                    success: false,
                    newModelId: oldModelId,
                    migrations: [],
                    message: 'Model is no longer available and no migration path exists',
                    requiresUserAction: true,
                };
            }
        }

        // Check if final target is available
        if (!availableModelIds.includes(finalId)) {
            return {
                success: false,
                newModelId: oldModelId,
                migrations,
                message: `Migration target "${finalId}" is not available`,
                requiresUserAction: true,
            };
        }

        // Check if auto migration is allowed
        const canAuto = this.canAutoMigrate(oldModelId);
        if (!canAuto && !forceAutoMigration) {
            return {
                success: false,
                newModelId: finalId,
                migrations,
                message: 'Migration requires user confirmation due to breaking changes',
                requiresUserAction: true,
            };
        }

        // Perform the migration
        const migrationType = canAuto ? 'auto' : 'manual';
        this.notifyMigration(migrations[migrations.length - 1], migrationType);

        return {
            success: true,
            newModelId: finalId,
            migrations,
            message: `Successfully migrated from "${oldModelId}" to "${finalId}"`,
        };
    }

    /**
     * Find suggested alternative models when migration fails
     */
    findAlternatives(
        unavailableModelId: string,
        availableModelIds: string[],
        preferredProviders?: string[]
    ): string[] {
        // Extract provider and model type from the unavailable model
        const parts = unavailableModelId.split('/');
        const provider = parts[0];
        const modelName = parts.slice(1).join('/').toLowerCase();

        const alternatives: Array<{ id: string; score: number }> = [];

        for (const availableId of availableModelIds) {
            let score = 0;
            const availableParts = availableId.split('/');
            const availableProvider = availableParts[0];
            const availableModel = availableParts.slice(1).join('/').toLowerCase();

            // Prefer same provider
            if (availableProvider === provider) {
                score += 3;
            }

            // Prefer preferred providers
            if (preferredProviders?.includes(availableProvider)) {
                score += 2;
            }

            // Similar model names
            if (availableModel.includes(modelName.split('-')[0]) || modelName.includes(availableModel.split('-')[0])) {
                score += 2;
            }

            // Common model patterns
            if (modelName.includes('claude') && availableModel.includes('claude')) score += 2;
            if (modelName.includes('gpt') && availableModel.includes('gpt')) score += 2;
            if (modelName.includes('gemini') && availableModel.includes('gemini')) score += 2;
            if (modelName.includes('llama') && availableModel.includes('llama')) score += 2;

            // Capability patterns
            if (modelName.includes('sonnet') && availableModel.includes('sonnet')) score += 1;
            if (modelName.includes('haiku') && availableModel.includes('haiku')) score += 1;
            if (modelName.includes('opus') && availableModel.includes('opus')) score += 1;
            if (modelName.includes('mini') && availableModel.includes('mini')) score += 1;
            if (modelName.includes('turbo') && availableModel.includes('turbo')) score += 1;

            if (score > 0) {
                alternatives.push({ id: availableId, score });
            }
        }

        return alternatives
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(alt => alt.id);
    }

    /**
     * Register notification callback
     */
    onMigration(callback: (migration: ModelMigration, type: 'auto' | 'manual') => void): void {
        this.notificationCallbacks.push(callback);
    }

    /**
     * Notify about migration
     */
    private notifyMigration(migration: ModelMigration, type: 'auto' | 'manual'): void {
        this.notificationCallbacks.forEach(callback => {
            try {
                callback(migration, type);
            } catch (error) {
                console.error('Migration notification callback failed:', error);
            }
        });
    }

    /**
     * Get migration statistics
     */
    getStatistics(): {
        totalMigrations: number;
        autoMigrations: number;
        manualMigrations: number;
        deprecatedMigrations: number;
        providers: Record<string, number>;
    } {
        const stats = {
            totalMigrations: this.migrations.length,
            autoMigrations: 0,
            manualMigrations: 0,
            deprecatedMigrations: 0,
            providers: {} as Record<string, number>,
        };

        for (const migration of this.migrations) {
            if (migration.automaticMigration) {
                stats.autoMigrations++;
            } else {
                stats.manualMigrations++;
            }

            if (migration.reason === 'deprecated') {
                stats.deprecatedMigrations++;
            }

            // Count by provider
            const provider = migration.oldId.split('/')[0];
            stats.providers[provider] = (stats.providers[provider] || 0) + 1;
        }

        return stats;
    }
}

// Singleton instance
export const migrationManager = new ModelMigrationManager();

// Convenience functions
export const findMigration = (oldModelId: string) => migrationManager.findMigration(oldModelId);
export const canAutoMigrate = (oldModelId: string) => migrationManager.canAutoMigrate(oldModelId);
export const migrateModel = (oldModelId: string, availableModelIds: string[], forceAutoMigration = false) =>
    migrationManager.migrateModel(oldModelId, availableModelIds, forceAutoMigration);
export const findAlternatives = (unavailableModelId: string, availableModelIds: string[], preferredProviders?: string[]) =>
    migrationManager.findAlternatives(unavailableModelId, availableModelIds, preferredProviders);

// Notification helpers
export function notifyUserOfMigration(migration: ModelMigration, type: 'auto' | 'manual' = 'auto') {
    const message = type === 'auto'
        ? `Model automatically migrated: ${migration.oldId} → ${migration.newId} (${migration.reason})`
        : `Model migration completed: ${migration.oldId} → ${migration.newId} (${migration.reason})`;

    console.info(message);

    // Could show a toast notification here in the future
    if (typeof window !== 'undefined' && 'Notification' in window) {
        // Future: Show browser notification for important migrations
    }
}

export function notifyUserOfInvalidModel(modelId: string, alternatives?: string[]) {
    let message = `Invalid model "${modelId}" replaced with default model`;

    if (alternatives && alternatives.length > 0) {
        message += `. Suggested alternatives: ${alternatives.slice(0, 2).join(', ')}`;
    }

    console.warn(message);

    // Could show a toast notification here in the future
}

// Migration testing utilities (for development)
export function testMigrations() {
    console.group('🔄 Model Migration Tests');

    const testCases = [
        'openrouter/anthropic/claude-3.5-sonnet-old',
        'openrouter/openai/gpt-4-turbo',
        'requesty/anthropic/claude-3-sonnet',
        'invalid-model-id',
    ];

    const mockAvailableModels = [
        'openrouter/anthropic/claude-3.5-sonnet',
        'openrouter/openai/gpt-4.1',
        'requesty/anthropic/claude-3.5-sonnet',
        'openrouter/google/gemini-2.5-flash',
    ];

    for (const testCase of testCases) {
        console.group(`Testing: ${testCase}`);

        const migration = findMigration(testCase);
        console.log('Migration found:', migration);

        const result = migrateModel(testCase, mockAvailableModels);
        console.log('Migration result:', result);

        if (!result.success) {
            const alternatives = findAlternatives(testCase, mockAvailableModels);
            console.log('Suggested alternatives:', alternatives);
        }

        console.groupEnd();
    }

    console.log('Migration statistics:', migrationManager.getStatistics());
    console.groupEnd();
} 
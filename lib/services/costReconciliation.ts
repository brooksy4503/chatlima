import { db } from '@/lib/db';
import { tokenUsageMetrics } from '@/lib/db/schema';
import { and, eq, isNull, gt, desc } from 'drizzle-orm';
import { OpenRouterCostTracker } from './openrouterCostTracker';

export class CostReconciliationService {
    /**
     * Best-effort reconciliation for missing actual_cost values for OpenRouter records.
     * Limits execution time via caller; this function itself limits rows to process.
     */
    static async reconcileRecentMissingActualCosts(params?: { limit?: number; maxAgeHours?: number; apiKeyOverride?: string }): Promise<{ processed: number; updated: number }> {
        const limit = params?.limit ?? 5;
        const maxAgeHours = params?.maxAgeHours ?? 48;

        const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);

        // Fetch a small batch of recent rows missing actual_cost but having a generationId we can query
        const rows = await db
            .select({
                id: tokenUsageMetrics.id,
                userId: tokenUsageMetrics.userId,
                chatId: tokenUsageMetrics.chatId,
                messageId: tokenUsageMetrics.messageId,
                metadata: tokenUsageMetrics.metadata,
            })
            .from(tokenUsageMetrics)
            .where(
                and(
                    eq(tokenUsageMetrics.provider, 'openrouter'),
                    isNull(tokenUsageMetrics.actualCost),
                    gt(tokenUsageMetrics.createdAt, cutoff)
                )
            )
            .orderBy(desc(tokenUsageMetrics.createdAt))
            .limit(limit);

        let processed = 0;
        let updated = 0;

        for (const row of rows) {
            processed += 1;
            const generationId: string | undefined = (row.metadata as any)?.generationId;
            if (!generationId) continue;

            try {
                const result = await OpenRouterCostTracker.fetchActualCost(generationId, params?.apiKeyOverride);
                if (result.actualCost !== null) {
                    const existingMetadata = (row.metadata as any) || {};

                    await db
                        .update(tokenUsageMetrics)
                        .set({
                            actualCost: result.actualCost.toString(),
                            updatedAt: new Date(),
                            metadata: {
                                ...existingMetadata,
                                actualCostUpdatedAsync: true,
                                asyncUpdateProcessedAt: new Date().toISOString(),
                                asyncUpdateGenerationId: generationId,
                            },
                        })
                        .where(
                            and(
                                eq(tokenUsageMetrics.id, row.id)
                            )
                        );

                    updated += 1;
                }
            } catch (err) {
                // Swallow errors to keep best-effort behavior
                console.warn('[CostReconciliationService] Failed to reconcile row', row.id, err);
            }
        }

        return { processed, updated };
    }
}

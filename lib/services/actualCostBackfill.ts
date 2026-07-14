import { db } from '@/lib/db';
import { tokenUsageMetrics } from '@/lib/db/schema';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { OpenRouterCostTracker } from './openrouterCostTracker';

export interface ActualCostBackfillOptions {
    limit?: number;
    dryRun?: boolean;
}

export interface ActualCostBackfillResult {
    scanned: number;
    updated: number;
    skipped: number;
    failed: number;
    dryRun: boolean;
}

function readGenerationId(metadata: unknown): string | undefined {
    if (!metadata || typeof metadata !== 'object') {
        return undefined;
    }
    const record = metadata as Record<string, unknown>;
    const candidates = [
        record.generationId,
        record.asyncUpdateGenerationId,
    ];
    for (const candidate of candidates) {
        if (typeof candidate === 'string' && candidate.length > 0) {
            return candidate;
        }
    }
    return undefined;
}

/**
 * Backfill missing actualCost values via OpenRouter /generation API.
 * Intended for cron/script use — not admin page loads.
 */
export class ActualCostBackfillService {
    static async backfillMissingActualCosts(
        options: ActualCostBackfillOptions = {}
    ): Promise<ActualCostBackfillResult> {
        const limit = options.limit ?? 100;
        const dryRun = options.dryRun ?? false;

        const candidates = await db
            .select()
            .from(tokenUsageMetrics)
            .where(
                and(
                    eq(tokenUsageMetrics.provider, 'openrouter'),
                    eq(tokenUsageMetrics.status, 'completed'),
                    isNull(tokenUsageMetrics.actualCost),
                    sql`${tokenUsageMetrics.metadata}->>'generationId' IS NOT NULL OR ${tokenUsageMetrics.metadata}->>'asyncUpdateGenerationId' IS NOT NULL`
                )
            )
            .limit(limit);

        const result: ActualCostBackfillResult = {
            scanned: candidates.length,
            updated: 0,
            skipped: 0,
            failed: 0,
            dryRun,
        };

        for (const row of candidates) {
            const generationId = readGenerationId(row.metadata);
            if (!generationId) {
                result.skipped++;
                continue;
            }

            try {
                const fetched = await OpenRouterCostTracker.fetchActualCost(generationId);
                if (fetched.actualCost === null) {
                    result.skipped++;
                    continue;
                }

                if (!dryRun) {
                    const existingMetadata =
                        row.metadata && typeof row.metadata === 'object'
                            ? (row.metadata as Record<string, unknown>)
                            : {};

                    await db
                        .update(tokenUsageMetrics)
                        .set({
                            actualCost: fetched.actualCost.toString(),
                            updatedAt: new Date(),
                            metadata: {
                                ...existingMetadata,
                                costSource: 'openrouter_generation',
                                actualCostUpdatedAsync: true,
                                asyncUpdateProcessedAt: new Date().toISOString(),
                                asyncUpdateGenerationId: generationId,
                            },
                        })
                        .where(eq(tokenUsageMetrics.id, row.id));
                }

                result.updated++;
            } catch {
                result.failed++;
            }
        }

        return result;
    }
}

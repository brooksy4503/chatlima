#!/usr/bin/env npx tsx
/**
 * Backfill missing OpenRouter actualCost values via /generation API.
 *
 * Usage:
 *   pnpm db:backfill-actual-costs
 *   pnpm db:backfill-actual-costs -- --limit 50 --dry-run
 */

import { ActualCostBackfillService } from '../lib/services/actualCostBackfill';

async function main() {
    const args = process.argv.slice(2);
    const limitArg = args.find((arg) => arg.startsWith('--limit='));
    const limit = limitArg ? parseInt(limitArg.split('=')[1] ?? '100', 10) : 100;
    const dryRun = args.includes('--dry-run');

    console.log(`[backfill-actual-costs] Starting (limit=${limit}, dryRun=${dryRun})`);

    const result = await ActualCostBackfillService.backfillMissingActualCosts({
        limit,
        dryRun,
    });

    console.log('[backfill-actual-costs] Result:', result);

    if (result.failed > 0) {
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error('[backfill-actual-costs] Fatal error:', error);
    process.exit(1);
});

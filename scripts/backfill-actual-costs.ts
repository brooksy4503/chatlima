#!/usr/bin/env tsx
/**
 * Backfill missing OpenRouter actualCost values via /generation API.
 *
 * Usage:
 *   pnpm db:backfill-actual-costs
 *   pnpm db:backfill-actual-costs -- --limit=50 --dry-run
 *   NODE_ENV=production pnpm db:backfill-actual-costs  # uses .env.production.local
 */

import './setup-neon';
import { config } from 'dotenv';
import path from 'path';

function loadEnv(): void {
    if (process.env.NODE_ENV === 'production') {
        config({ path: path.join(process.cwd(), '.env.production.local') });
        config({ path: path.join(process.cwd(), '.env.production') });
        return;
    }

    config({ path: path.join(process.cwd(), '.env.local') });
    config();
}

function maskDatabaseUrl(url: string): string {
    try {
        const parsed = new URL(url);
        return `${parsed.protocol}//${parsed.hostname}${parsed.pathname ? '/…' : ''}`;
    } catch {
        return '(unparseable DATABASE_URL)';
    }
}

function parseLimit(args: string[]): number {
    const limitFlagIndex = args.findIndex((arg) => arg === '--limit');
    if (limitFlagIndex !== -1 && args[limitFlagIndex + 1]) {
        return parseInt(args[limitFlagIndex + 1] ?? '100', 10);
    }

    const limitArg = args.find((arg) => arg.startsWith('--limit='));
    if (limitArg) {
        return parseInt(limitArg.split('=')[1] ?? '100', 10);
    }

    return 100;
}

loadEnv();

if (!process.env.DATABASE_URL) {
    const hint =
        process.env.NODE_ENV === 'production'
            ? 'Run: vercel env pull .env.production.local --environment=production'
            : 'Ensure DATABASE_URL is set in .env.local';
    console.error(`[backfill-actual-costs] DATABASE_URL not found. ${hint}`);
    process.exit(1);
}

const envLabel = process.env.NODE_ENV === 'production' ? 'production' : 'development';
console.log(
    `[backfill-actual-costs] ${envLabel} database: ${maskDatabaseUrl(process.env.DATABASE_URL)}`
);

async function main() {
    const args = process.argv.slice(2);
    const limit = parseLimit(args);
    const dryRun = args.includes('--dry-run');

    if (!dryRun && !process.env.OPENROUTER_API_KEY) {
        console.error(
            '[backfill-actual-costs] OPENROUTER_API_KEY not found. Set it in .env.local (or skip dry-run only).'
        );
        process.exit(1);
    }

    console.log(`[backfill-actual-costs] Starting (limit=${limit}, dryRun=${dryRun})`);

    const { ActualCostBackfillService } = await import('../lib/services/actualCostBackfill');

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

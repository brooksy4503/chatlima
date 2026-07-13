#!/usr/bin/env tsx

/**
 * Backfill parent_message_id and active_leaf_message_id for legacy linear chats.
 *
 * Usage:
 *   pnpm db:backfill-parents              # dev (.env.local)
 *   pnpm db:backfill-parents -- --dry-run # dev dry-run
 *   pnpm db:backfill-parents:prod         # production (.env.production.local)
 *   pnpm db:backfill-parents:prod -- --dry-run
 *
 * Production prerequisites:
 *   vercel env pull .env.production.local --environment=production
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

loadEnv();

if (!process.env.DATABASE_URL) {
  const hint =
    process.env.NODE_ENV === 'production'
      ? 'Run: vercel env pull .env.production.local --environment=production'
      : 'Ensure DATABASE_URL is set in .env.local';
  console.error(`DATABASE_URL not found. ${hint}`);
  process.exit(1);
}

const envLabel = process.env.NODE_ENV === 'production' ? 'production' : 'development';
console.log(`[backfill-parents] ${envLabel} database: ${maskDatabaseUrl(process.env.DATABASE_URL)}`);

async function start() {
  const dryRun = process.argv.includes('--dry-run');
  const { ConversationPersistenceService } = await import(
    '../lib/services/conversationPersistence'
  );

  if (dryRun) {
    const { db } = await import('../lib/db');
    const allChats = await db.query.chats.findMany({ columns: { id: true } });
    console.log(`Would backfill parent chains for ${allChats.length} chat(s).`);
    return;
  }

  console.log('Backfilling conversation parent chains...');
  const count = await ConversationPersistenceService.backfillAllChatsParentChains();
  console.log(`Done. Processed ${count} chat(s).`);
}

start().catch((error) => {
  console.error('Backfill failed:', error);
  process.exit(1);
});

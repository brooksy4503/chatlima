#!/usr/bin/env tsx

/**
 * Backfill parent_message_id and active_leaf_message_id for legacy linear chats.
 *
 * Usage:
 *   pnpm db:backfill-parents              # run backfill for all chats
 *   pnpm db:backfill-parents -- --dry-run # count chats only
 */

import './setup-neon';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.join(process.cwd(), '.env.local') });
config();

async function start() {
  const dryRun = process.argv.includes('--dry-run');
  const { ConversationPersistenceService } = await import(
    '../lib/services/conversationPersistence'
  );

  if (dryRun) {
    const { db } = await import('../lib/db');
    const { chats } = await import('../lib/db/schema');
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

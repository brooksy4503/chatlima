# Message-Level Model Attribution Plan

## Problem statement

Today Chatlima lets users switch models before each send, but the message UI does not show which model produced each response (or which model was selected when a user message was sent). This makes mixed-model conversations hard to audit and review.

## Goals

1. Show model used per assistant message in chat UI.
2. Show model context per user message (the model selected at send-time).
3. Preserve historical accuracy even if the user switches models later.
4. Keep API + DB changes backward-compatible.

## Current state (from code)

- `messages` table stores: `id, chatId, role, parts, hasWebSearch, webSearchContextSize, createdAt`.
- No model metadata exists on `messages`.
- `token_usage_metrics` already stores `messageId, modelId, provider`, but:
  - it is optimized for usage/cost tracking,
  - `messageId` can be nullable,
  - and it is not currently joined into chat retrieval for UI rendering.
- Chat retrieval endpoint (`GET /api/chats/[id]`) returns messages from `getChatById` without model attribution fields.

## Design options

### Option A — Derive from `token_usage_metrics` only (no message schema changes)

- Join assistant message rows to `token_usage_metrics` by `messageId`.
- Infer user message model from nearest following assistant message.

**Pros:** no new message columns.
**Cons:** inference is brittle, extra joins, missing data when usage record absent/delayed.

### Option B — Add model snapshot fields directly to `messages` (**recommended**)

Add immutable, per-message snapshot fields to `messages`:
- `model_id` (nullable text)
- `model_provider` (nullable text)
- `model_display_name` (nullable text, optional but useful for stable UX)

Write these at message creation time for both `user` and `assistant` rows.

**Pros:** reliable, simple fetch path, no inference, works even if usage tracking fails.
**Cons:** requires migration + write-path updates.

## Recommended approach

Use **Option B**, with optional backfill from `token_usage_metrics`.

---

## Implementation plan

## Phase 1 — Data model changes

1. Update Drizzle schema (`lib/db/schema.ts`):
   - Add nullable columns to `messages`:
     - `modelId: text('model_id')`
     - `modelProvider: text('model_provider')`
     - `modelDisplayName: text('model_display_name')`
2. Add index for query efficiency:
   - `idx_messages_chat_id_created_at` already implied by access pattern; if not present, add composite or keep existing ordering path.
3. Create migration SQL + drizzle metadata (next migration after current latest).

### Notes
- Keep fields nullable for old records and tool/system rows.
- No destructive changes.

## Phase 2 — Write-path updates

1. Update message conversion/save path in `lib/chat-store.ts`:
   - Extend `AIMessage`/`DBMessage`/`UIMessage` types to carry optional model fields.
   - In `convertToDBMessages(...)`, accept model context and write to each message row.
2. In `app/api/chat/route.ts` on finish:
   - Build model snapshot once from `selectedModel`:
     - `model_id = selectedModel`
     - `model_provider = selectedModel.split('/')[0]`
     - `model_display_name` from model catalog lookup if available; fallback to model ID.
   - Apply to newly persisted user+assistant messages in this turn.
3. Keep token tracking untouched (still writes to `token_usage_metrics`).

### Edge handling
- If provider/model parse fails, keep null-safe fallback (`model_id = selectedModel`, provider nullable).
- Tool messages can keep null model fields.

## Phase 3 — Read-path/API response

1. Ensure `getChatById` and `convertToUIMessages` expose model fields in returned message objects.
2. Keep API backward-compatible by adding optional properties only.

## Phase 4 — UI rendering

1. Update `components/message.tsx` and related message typings:
   - Render a small metadata chip per message:
     - User message: `Sent with <model>`
     - Assistant message: `<model>`
2. Styling:
   - Subtle text (e.g., muted, xs), non-intrusive under/above bubble.
3. Handle old messages gracefully:
   - If no model metadata, show nothing or `Model unknown` behind feature flag.

## Phase 5 — Historical backfill (optional but recommended)

1. One-off script/API job:
   - Backfill assistant `messages.model_id/model_provider` from `token_usage_metrics` by `message_id`.
   - Backfill user rows by copying model from the next assistant turn in the same chat where safe.
2. Mark uncertain inferred backfills carefully (either leave null or log only).

## Phase 6 — Testing

### Unit/integration
- `convertToDBMessages` persists model fields.
- `GET /api/chats/[id]` returns model fields.
- Migration applies cleanly on existing DB.

### E2E
1. Start chat with Model A, send message, switch to Model B, send message.
2. Verify first pair shows Model A, second pair shows Model B.
3. Reload page and verify persistence.

## Phase 7 — Rollout strategy

1. Ship migration + backend writes first.
2. Ship UI rendering next.
3. Run optional backfill.
4. Add small observability check (percentage of new messages with non-null `model_id`).

---

## Proposed file touch list (implementation phase)

- `lib/db/schema.ts`
- `drizzle/*.sql` + `drizzle/meta/*`
- `lib/chat-store.ts`
- `app/api/chat/route.ts`
- `components/message.tsx`
- `components/messages.tsx` (typing pass-through if required)
- `app/api/chats/[id]/route.ts` (only if explicit shaping is needed)
- tests under `__tests__`/`tests`

## Risks and mitigations

1. **Risk:** Existing messages have no model metadata.
   - **Mitigation:** nullable fields + optional backfill.
2. **Risk:** Drift between `messages.model_id` and `token_usage_metrics.modelId`.
   - **Mitigation:** treat `messages.*` as UI source of truth; keep usage table for billing/analytics.
3. **Risk:** UI clutter.
   - **Mitigation:** compact chip style and hide when data missing.

## Acceptance criteria

- In a conversation where model changes between turns, each displayed message clearly indicates the model at the time it was sent/generated.
- Data persists across reload and retrieval from DB.
- Old chats remain readable without errors.
- No regression in message send/stream behavior.

---

## Recommendation summary

Proceed with **message-level model snapshot fields in `messages`** plus UI chips. This is the most reliable and maintainable path, and avoids fragile inference from usage metrics alone.
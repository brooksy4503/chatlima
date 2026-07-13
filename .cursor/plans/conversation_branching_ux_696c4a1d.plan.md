---
name: Conversation Branching UX
overview: Implement immutable same-chat response branches for regenerate and edit/resubmit, explicit fork-to-new-chat, and stable model attribution on every assistant response. First replace ChatLima’s linear replace-all persistence with one canonical conversation-tree model so the UI features do not add special-case branching to the existing 1,440-line chat component.
todos:
  - id: tree-contract
    content: Add and migrate the minimal parent-edge/active-leaf conversation model with pure path selectors
    status: completed
  - id: atomic-persistence
    content: Replace branch-sensitive full-history replacement with atomic, idempotent conversation operations
    status: completed
  - id: operation-api
    content: Route regenerate, edit/resubmit, active-leaf selection, and fork through typed authenticated APIs
    status: completed
  - id: client-decomposition
    content: Extract chat session lifecycle and add a dedicated branch controller before wiring UI behavior
    status: completed
  - id: message-controls
    content: Implement accessible regenerate, edit/resubmit, fork, and version-navigation controls
    status: completed
  - id: model-metrics
    content: Persist canonical model snapshots and link per-message token usage for every assistant label
    status: completed
  - id: secondary-views
    content: Make compare, sharing, export, projects, and SPEC branch-aware and run full verification
    status: completed
isProject: false
---

# Conversation Branching and Model Attribution

## Confirmed behavior
- **Regenerate** creates a new assistant sibling under the same user message, keeps prior responses, selects the new version, and charges as a new model invocation.
- **Edit and resubmit** creates a new user sibling at that point, preserves the original suffix on its original branch, then generates a new assistant response.
- A compact `‹ 2 / 3 ›` pager switches versions and persists the selected path across reloads/devices.
- **Fork to new chat** copies only the visible path through the selected message; it does not copy hidden sibling branches. The fork opens immediately and inherits the source project association.
- Every assistant response shows its immutable model display name beside that response’s input/output token metrics. Historical messages with unknown attribution omit the label.

## 1. Establish one conversation-tree contract
- Extend [`lib/db/schema.ts`](lib/db/schema.ts) and generate a reviewed Drizzle migration:
  - `messages.parentMessageId` as the only graph edge.
  - `chats.activeLeafMessageId` as the canonical selected path.
  - indexes for `(chat_id, parent_message_id)`, `(chat_id, created_at)`, and the existing compare grouping access pattern.
- Backfill existing linear chats transactionally. Historical compare turns become one user parent with assistant siblings rather than an incorrect assistant-to-assistant chain.
- Keep `comparisonTurnId`; compare remains a presentation/grouping concern layered over the same tree rather than a second branch system.
- Add a typed [`lib/chat/conversationTree.ts`](lib/chat/conversationTree.ts) containing pure `buildPathToLeaf`, sibling/version lookup, branch validation, and fork-path remapping. This is the sole path-selection implementation used by UI, APIs, compare, shares, and exports.
- Do not add branch IDs, mutable `superseded` flags, or generic graph wrappers: parent edge plus active leaf is sufficient and materially simpler.

## 2. Replace replace-all persistence with atomic tree operations
- Retire branch-sensitive use of the current `DELETE + INSERT` flow in [`lib/chat-store.ts`](lib/chat-store.ts). Introduce a focused conversation persistence service with explicit operations: append a turn, append an assistant variant, append an edited user branch, select a leaf, and copy a path into a fork.
- Each operation must verify chat ownership and parent membership, insert immutable nodes, and update `activeLeafMessageId` in one transaction. Use attempt IDs/idempotency so duplicate stream-finalization callbacks cannot create duplicate variants.
- Update [`lib/chat/chatStreamFinalizer.ts`](lib/chat/chatStreamFinalizer.ts), [`lib/chat/executeChatStream.ts`](lib/chat/executeChatStream.ts), and compare persistence to call that service rather than reconstructing and replacing the complete transcript.
- Build model context server-side from the validated active ancestor path. Do not trust a client-provided full transcript as branch authority.
- Keep provisional streaming messages client-side; commit a new active leaf only when a structurally valid assistant response exists. Stopped partial responses may be persisted as usable responses, while failed empty placeholders are discarded and the previous leaf remains active.

## 3. Add narrow operation APIs
- Extend the typed request boundary in [`lib/chat/chatRequest.ts`](lib/chat/chatRequest.ts) with a discriminated operation contract for `continue`, `regenerate`, and `edit-resubmit`, carrying the required anchor/parent IDs and an attempt ID.
- Route all three through the existing authentication, model validation, credit preflight, tool configuration, streaming, persistence, and usage-accounting pipeline in [`app/api/chat/route.ts`](app/api/chat/route.ts); avoid separate duplicated generation implementations.
- Add authenticated endpoints for selecting an active leaf and `POST /api/chats/[id]/fork`. Fork creation atomically creates the chat, remaps copied message/parent IDs, sets the new active leaf, and copies project membership without exposing source-chat provenance publicly.
- Make every actual regeneration/edit generation follow existing billing rules. Hidden branches retain their historical usage; chat totals continue to include every paid attempt.

## 4. Decompose the client before adding feature branches
- First extract the existing AI SDK session/sync/stop/error lifecycle from the 1,440-line [`components/chat.tsx`](components/chat.tsx) into [`hooks/useChatSession.ts`](hooks/useChatSession.ts), preserving behavior with focused tests.
- Add [`hooks/useConversationBranches.ts`](hooks/useConversationBranches.ts) as the sole client controller for active-path projection, sibling navigation, regenerate, edit/resubmit, fork, optimistic selection, rollback, and query invalidation.
- Keep [`components/chat.tsx`](components/chat.tsx) as composition/layout. Do not scatter `if (regenerate/edit/fork)` checks through its existing submit, compare, error-recovery, and persistence paths.
- Reuse the pure tree selectors for both regular and compare timelines so switching branches cannot accidentally include hidden siblings in model context.

## 5. Add focused, mobile-safe message controls
- Create small dedicated components rather than expanding [`components/message.tsx`](components/message.tsx): a message action menu, inline user-message editor, and branch pager.
- Assistant actions: regenerate with the currently selected model, optionally retry with the original model, fork, copy. User actions: edit/resubmit, fork, copy.
- Editing an earlier prompt clearly states that a new branch will be created; preserve its attachments and quoted content unless the user removes them.
- Disable mutations for the in-flight path, retain accessible tap targets, avoid hover-only/long-press-only interactions, and keep branch paging usable beside code blocks and text-selection quoting.

## 6. Finish canonical model and token attribution
- Reuse the existing `messages.modelId/modelProvider/modelDisplayName` columns and centralize snapshot creation in one helper shared by normal chat, compare, regenerate, edit/resubmit, and fork writes.
- Update stream finalization and token tracking so each usage record receives the final assistant `messageId`; do not infer ordinary attribution from nullable usage rows.
- Wire per-message metrics from [`lib/tokenTracking.ts`](lib/tokenTracking.ts) through [`hooks/useChatTokenMetrics.ts`](hooks/useChatTokenMetrics.ts), and render the stable model label next to input/output tokens for every assistant response via [`components/assistant-action-bar.tsx`](components/assistant-action-bar.tsx).
- Preserve the existing chat-total usage chip separately. Older rows with null model attribution remain cleanly unlabeled; no risky inferred backfill is required for launch.

## 7. Make secondary views branch-correct
- `GET /api/chats/[id]` returns the graph plus active leaf while preserving a convenient active-path projection for existing consumers.
- Sharing and PDF export use the selected active path only; immutable share snapshots include model metadata and the selected leaf. JSON/full-tree export can remain a later enhancement.
- Ensure title generation, project chats, compare promotion, web search, MCP/tool parts, image generation, file attachments, stop/recovery, and text-selection quoting continue to work on the selected path.
- Update [`SPEC.md`](SPEC.md) sections 3.2, 8.1, 9, and 16 to document the schema, branch semantics, API contracts, billing behavior, model attribution, and removal of “conversation branching” from the future roadmap.

## Verification
- Unit-test tree path selection, sibling ordering, invalid/cross-chat parents, edit/regenerate branch construction, compare-tree composition, migration/backfill, and fork ID remapping.
- Integration-test atomic persistence, ownership checks, idempotent finalization, active-leaf restoration, token `messageId` linkage, billing for every invocation, and failure rollback.
- Component/E2E-test regenerate, edited earlier prompt, branch paging after reload, fork from user versus assistant message, model switching across branches, mobile action access, compare promotion, share/PDF active-path output, and legacy linear chats.
- Run focused tests throughout, then `pnpm lint`, `pnpm test:unit`, `pnpm build`, and the relevant Playwright chat suite. Report any known pre-existing failures separately.
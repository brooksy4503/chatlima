# Chat Stream Resilience Research

Date: 2026-05-06

## Goal

Make ChatLima chat generation resilient when the user leaves, refreshes, navigates away, loses network, or the browser/mobile app sleeps while an assistant response is streaming.

This document records the research and options. It is intentionally not an implementation plan; see a separate plan document for specific coding steps.

## Current ChatLima streaming architecture

ChatLima currently uses:

- Next.js 15 App Router.
- AI SDK `ai@4.3.9` and `@ai-sdk/react@1.2.9`.
- Client entry point: `components/chat.tsx`.
  - Uses `useChat({ id, initialMessages, body, experimental_throttle: 500 })`.
  - Calls `originalStop()` for manual stop and some error-recovery flows.
  - Redirects a new chat to `/chat/:generatedChatId` in the client `onFinish` handler.
- Server entry point: `app/api/chat/route.ts`.
  - Uses `streamText(openRouterPayload)`.
  - Returns `result.toDataStreamResponse({ sendReasoning: true, getErrorMessage })`.
  - Creates the chat row before streaming when needed.
  - Saves messages primarily in the `streamText(...).onFinish` callback.
  - Tracks token usage and cost after message save.

Current gaps:

- No active stream tracking on `chats`.
- No resumable stream storage.
- No Redis/resumable-stream package integration.
- No partial assistant message persistence while streaming.
- No obvious server-side `onStop`/`onAbort` persistence path despite client comments suggesting one.

## Main failure mode

If the user refreshes, leaves the page, navigates away, closes the tab, loses network, or the device sleeps while a response is streaming:

1. The browser-side stream breaks.
2. The request may abort or backpressure may stop the LLM stream.
3. Because message persistence is tied mainly to `onFinish`, the assistant response may never be saved.
4. Returning to the chat can show a missing, incomplete, or confusing conversation state.

The product requirement is at least:

> If I leave the page, do not lose the chat.

A stronger later requirement may be:

> If I return while generation is still active, reconnect to the live stream or see current progress.

## Option 1: Minimum viable resilience with server-side `consumeStream`

Use AI SDK v4's `StreamTextResult.consumeStream()` to consume the model stream server-side even if the client disconnects.

Expected behavior:

1. User sends a message.
2. Browser receives streamed tokens normally.
3. User leaves or refreshes the page.
4. Server continues consuming the model response.
5. `onFinish` runs.
6. The assistant response and token usage are saved.
7. When the user returns, the completed response loads from the database.

Pros:

- Smallest change.
- Compatible with current AI SDK v4 install.
- No Redis required.
- No AI SDK v5 migration required.
- Directly addresses the most painful failure: lost responses after disconnect.
- Keeps current `useChat` structure.

Cons:

- Not true live stream resumption.
- If the user returns before the model finishes, they may not see progress unless additional status/partial persistence is added.
- Server continues spending tokens after disconnect.
- Needs careful distinction between accidental disconnect and deliberate user stop/cancel.
- Still bounded by route/function max duration.

Best for:

- Fast production hardening.
- Making chats eventually complete and persist after disconnect.

Recommendation:

- Do this first.
- Treat manual Stop differently from page disconnect.
- Consider adding instrumentation/logging so aborted client streams and server-finished generations are observable.

## Option 2: DB-backed generation state and partial snapshots

Add durable state around generation, e.g. assistant message/generation statuses:

- `queued`
- `streaming`
- `completed`
- `failed`
- `cancelled`

Possible flow:

1. Before model generation, save the user message.
2. Create a placeholder assistant message or generation record with `streaming` status.
3. During generation, persist partial assistant text every N tokens or every 500-1000ms.
4. On finish, mark it `completed`.
5. On failure/abort/cancel, mark it `failed` or `cancelled`.
6. On page load, if the latest assistant response is `streaming`, show a durable UI state such as “Still generating…” and refetch/poll.

Pros:

- Much better reload UX than Option 1 alone.
- User can see partial progress after refresh.
- Works with current AI SDK v4.
- Uses existing Postgres/Neon infrastructure instead of introducing Redis.
- Makes failures explicit instead of silent.

Cons:

- Requires schema changes.
- More database writes; writes must be batched/throttled.
- Still not true stream resumption.
- Needs cleanup for stale `streaming` records left by crashes/timeouts.

Best for:

- Making ChatLima feel reliable without a major architecture rewrite.

Recommendation:

- Do after Option 1 if a polished user experience is needed.
- Avoid token-by-token DB writes; batch updates.

## Option 3: Official AI SDK resumable streams with Redis

Use the AI SDK “Chatbot Resume Streams” pattern.

The current AI SDK docs describe:

- `useChat({ resume: true })`.
- A `GET /api/chat/[id]/stream` endpoint.
- Storing an `activeStreamId` per chat.
- Redis-backed `resumable-stream` storage.
- Reconnecting to an active UI stream after page reload.

Pros:

- Best “keep streaming after refresh” UX.
- User can reconnect to the same live stream.
- Multiple clients can observe the same stream.
- Official AI SDK direction.

Cons:

- ChatLima currently uses AI SDK v4-era APIs. The installed `@ai-sdk/react` type definitions do not expose the newer transport/resume API shown in current docs.
- Likely requires AI SDK v5 migration or a careful compatibility spike.
- Requires Redis.
- Requires new resume endpoint.
- Requires active stream persistence.
- Official docs warn stream resumption is not compatible with abort/stop behavior. Closing/reloading or calling `stop()` can interfere with resumption.
- ChatLima currently exposes stop functionality, so product semantics must be decided.

Best for:

- True live stream resumption.
- Long-running generations where users may refresh or switch devices.

Recommendation:

- Good target, but not the first move.
- Treat as a larger migration/spike after the minimum resilience fix.

## Option 4: Durable background job or worker architecture

Move generation out of the request/response lifecycle.

Possible flow:

1. `/api/chat` creates a generation job.
2. A worker/background task runs the LLM call.
3. The worker persists tokens/status to DB or Redis.
4. The client subscribes via SSE/WebSocket/realtime channel.
5. Reconnect loads durable state from storage and resumes from last seen token/event.

Possible tools:

- Trigger.dev streams.
- Inngest Realtime / Durable Endpoints.
- BullMQ + Redis.
- Custom worker + Redis Streams.
- Vercel `waitUntil` / Next.js `after` for lighter background continuation, though this is less durable than a true queue.

Pros:

- Most robust long-term architecture.
- Page lifecycle no longer controls generation.
- Supports retry, observability, cancellation, reconciliation, and recovery.
- Better for agent/tool workflows, MCP, web search, long responses, and multi-step tasks.
- Decouples billing/token accounting from frontend stream lifetime.

Cons:

- Largest refactor.
- More infrastructure and operational complexity.
- Requires careful idempotency and cancellation design.
- May require a custom bridge to the current `useChat` UI or moving away from `useChat`.

Best for:

- Serious long-running agent workflows.
- High reliability requirements.
- Workloads where responses are more like jobs than simple HTTP requests.

Recommendation:

- Best eventual architecture if ChatLima becomes a serious agent platform.
- Probably overkill for the immediate “leaving page loses chat” issue.

## Option 5: Non-streaming background finalization fallback

Start generation in the background, show a durable “generating” state, and poll/refetch until the final assistant message exists.

Pros:

- Simple mental model.
- Very resilient across reloads.
- Easy to build with DB status fields.

Cons:

- Loses token streaming as the primary UX.
- Feels slower and less competitive with ChatGPT/Claude-style interfaces.

Best for:

- Fallback mode.
- Very long jobs where completion matters more than live streaming.

Recommendation:

- Useful fallback, not the main chat path.

## Practical recommendation

Use a phased approach.

### Phase 1: Make chats eventually complete after disconnect

Implement Option 1: server-side stream consumption.

Goal:

- If the user leaves the page, the assistant response still finishes and saves.
- Returning to the chat later shows the completed answer.

Critical design point:

- Distinguish accidental disconnect from deliberate user Stop.
- Leaving the page should usually continue generation.
- Clicking Stop should cancel generation and persist an explicit cancelled/partial state, not silently keep spending tokens.

### Phase 2: Add durable message/generation status

Implement Option 2.

Goal:

- Refresh mid-stream shows an honest state such as “Still generating…” or partial content.
- Failed generations are visible and retryable.
- No more silent disappearing assistant responses.

### Phase 3: Choose long-term architecture

Choose one based on product direction:

- If ChatLima remains mostly direct model chat: AI SDK resumable streams + Redis.
- If ChatLima becomes an agent/tool workflow platform: durable background jobs + realtime stream.

## Ranking

1. Best immediate fix: `consumeStream`.
2. Best near-term product UX: `consumeStream` plus DB `streaming/completed/failed/cancelled` state.
3. Best live resume UX: AI SDK v5 resumable streams plus Redis.
4. Best long-term agent architecture: durable jobs plus realtime stream.
5. Simplest fallback: non-streaming background generation plus polling.

## References consulted

- AI SDK UI: Chatbot Message Persistence — recommends storing `useChat` message format and using `consumeStream()` so generation can finish after client disconnect.
- AI SDK UI: Chatbot Resume Streams — describes `resume: true`, active stream IDs, Redis, and resume endpoints.
- AI SDK troubleshooting: Abort breaks resumable streams — warns resumable streams are not compatible with abort/stop behavior.
- AI SDK troubleshooting: onFinish not called when stream is aborted — describes using stream consumption so finish/abort handling runs.
- Next.js `after` docs — background work after responses via `waitUntil`, subject to platform duration limits.
- Vercel waitUntil / Fluid Compute docs — background work and longer-running function constraints.
- SSE reconnection patterns — `Last-Event-ID`, replay missed events, Redis/pubsub or persistent event stores.
- Trigger.dev and Inngest realtime/streaming docs — durable task streams and frontend reconnect patterns.

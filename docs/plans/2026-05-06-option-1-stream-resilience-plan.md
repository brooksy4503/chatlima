# Option 1 Chat Stream Resilience Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Ensure ChatLima assistant responses still complete and persist when the browser stream disconnects because the user refreshes, navigates away, closes the tab, loses network, or mobile sleeps.

**Architecture:** Keep the current Next.js App Router + AI SDK v4 `useChat` architecture. Add server-side stream consumption around the existing `streamText()` result so the model stream continues to completion after accidental client disconnects, allowing the existing `onFinish` persistence/token accounting path to run. Do not add Redis, resumable stream endpoints, schema changes, or a worker queue in this option.

**Tech Stack:** Next.js 15 App Router, AI SDK `ai@4.3.9`, `@ai-sdk/react@1.2.9`, Jest, TypeScript, existing `app/api/chat/route.ts` streaming route.

---

## Scope

### In scope

- Use AI SDK v4 `result.consumeStream()` to keep server-side stream processing alive after client disconnect.
- Preserve the existing `result.toDataStreamResponse({ sendReasoning: true, getErrorMessage })` response behavior.
- Preserve existing `onFinish` message persistence and token/cost tracking behavior.
- Add minimal observability for server-side stream continuation failures.
- Add unit coverage for the small helper/wrapper that starts background consumption.
- Manually verify accidental disconnect behavior.

### Out of scope

- Redis.
- AI SDK v5 migration.
- True token-level stream resume after reload.
- Database schema changes.
- Partial assistant message persistence.
- Durable background jobs/workers.
- Rebuilding the frontend chat UI.

## Current relevant files

- `app/api/chat/route.ts`
  - Imports `streamText` from `ai`.
  - Exports `maxDuration = 300`.
  - Calls `const result = streamText(openRouterPayload);` around line 1731.
  - Returns `result.toDataStreamResponse({ sendReasoning: true, getErrorMessage })` around line 1733.
  - Persists assistant messages mainly through the `streamText(...).onFinish` handler built earlier in the route.
- `components/chat.tsx`
  - Wraps AI SDK `originalStop()` in a custom `stop()` callback around lines 525-545.
  - Current comments assume a server-side stop persistence path exists, but no clear `onStop`/`onAbort` route path was found.
- `package.json`
  - Unit test command: `pnpm test:unit`.
  - TypeScript/Next build command: `pnpm build`.

## Design decisions

1. **Use `consumeStream()` immediately after `streamText()`.**
   - This follows the AI SDK v4 persistence guidance.
   - It ensures the stream is consumed server-side independent of whether the HTTP response consumer disappears.

2. **Do not await `consumeStream()` before returning the streaming response.**
   - Awaiting it would defeat streaming by blocking the response until completion.
   - The route should start consumption and return the streaming response immediately.

3. **Handle `consumeStream()` errors separately from client stream errors.**
   - A consume error should be logged.
   - It should not throw after the response has already been returned.

4. **Do not change manual Stop behavior in this option unless verification proves it is required.**
   - Manual Stop currently calls `originalStop()` in `components/chat.tsx`.
   - The product decision is: accidental disconnect should continue generation; deliberate Stop should not silently keep spending tokens.
   - Because AI SDK v4 client stop semantics may abort the request at the same network layer as a page disconnect, this plan treats Stop behavior as an explicit verification point and documents any observed issue.

5. **Keep implementation small enough to revert easily.**
   - One route helper plus one call site is the intended code change.

---

## Task 1: Add a small helper to start non-blocking server-side stream consumption

**Objective:** Create a small exported helper in the chat route that starts `consumeStream()` without awaiting it and logs failures safely.

**Files:**

- Modify: `app/api/chat/route.ts:54-59` for helper placement near module-level constants, or near the stream response code if preferred.
- Test: `__tests__/api/chat-stream-consumption.test.ts`

**Step 1: Write failing tests**

Create `__tests__/api/chat-stream-consumption.test.ts`:

```ts
import { startBackgroundStreamConsumption } from '@/app/api/chat/route';

describe('startBackgroundStreamConsumption', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    jest.useRealTimers();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    jest.clearAllMocks();
  });

  it('starts consumeStream without awaiting completion', async () => {
    let resolveConsume!: () => void;
    const consumeStream = jest.fn(() => new Promise<void>((resolve) => {
      resolveConsume = resolve;
    }));

    startBackgroundStreamConsumption({ consumeStream }, 'chat-123');

    expect(consumeStream).toHaveBeenCalledTimes(1);

    resolveConsume();
    await Promise.resolve();
  });

  it('logs consumeStream failures instead of throwing', async () => {
    const error = new Error('consume failed');
    const consumeStream = jest.fn().mockRejectedValue(error);

    expect(() => {
      startBackgroundStreamConsumption({ consumeStream }, 'chat-123');
    }).not.toThrow();

    await Promise.resolve();
    await Promise.resolve();

    expect(console.error).toHaveBeenCalledWith(
      '[Chat chat-123] Background stream consumption failed:',
      error,
    );
  });

  it('does nothing when consumeStream is unavailable', () => {
    expect(() => {
      startBackgroundStreamConsumption({}, 'chat-123');
    }).not.toThrow();

    expect(console.error).not.toHaveBeenCalled();
  });
});
```

**Step 2: Run the focused test and verify failure**

Run:

```bash
pnpm test:unit -- __tests__/api/chat-stream-consumption.test.ts --runInBand
```

Expected:

- FAIL because `startBackgroundStreamConsumption` does not exist yet.

**Step 3: Add the minimal helper**

In `app/api/chat/route.ts`, add this near the top-level helper/constant area, after `export const maxDuration = 300;`:

```ts
type ConsumableStreamResult = {
    consumeStream?: () => PromiseLike<void> | void;
};

export function startBackgroundStreamConsumption(
    result: ConsumableStreamResult,
    chatId: string,
): void {
    if (typeof result.consumeStream !== 'function') {
        return;
    }

    Promise.resolve()
        .then(() => result.consumeStream?.())
        .catch((error) => {
            console.error(`[Chat ${chatId}] Background stream consumption failed:`, error);
        });
}
```

Notes:

- The helper is exported only to make it directly testable.
- Keep the type intentionally narrow so this does not depend on AI SDK internal type names.
- Do not import new packages.

**Step 4: Run the focused test and verify pass**

Run:

```bash
pnpm test:unit -- __tests__/api/chat-stream-consumption.test.ts --runInBand
```

Expected:

- PASS.

**Step 5: Commit**

```bash
git add app/api/chat/route.ts __tests__/api/chat-stream-consumption.test.ts
git commit -m "test: cover background stream consumption helper"
```

---

## Task 2: Start background consumption for chat streams before returning the response

**Objective:** Call the helper immediately after `streamText()` so server-side consumption continues even if the browser disconnects.

**Files:**

- Modify: `app/api/chat/route.ts:1731-1733`
- Test: `__tests__/api/chat-stream-consumption.test.ts`

**Step 1: Add/extend the unit test first**

In `__tests__/api/chat-stream-consumption.test.ts`, add a test that documents the call-site contract without importing the whole route handler:

```ts
it('documents the route call-site contract: consume first, return response separately', async () => {
  const events: string[] = [];
  const result = {
    consumeStream: jest.fn(async () => {
      events.push('consume-started');
    }),
    toDataStreamResponse: jest.fn(() => {
      events.push('response-created');
      return new Response('stream');
    }),
  };

  startBackgroundStreamConsumption(result, 'chat-123');
  const response = result.toDataStreamResponse();

  await Promise.resolve();

  expect(response).toBeInstanceOf(Response);
  expect(result.consumeStream).toHaveBeenCalledTimes(1);
  expect(result.toDataStreamResponse).toHaveBeenCalledTimes(1);
  expect(events).toContain('consume-started');
  expect(events).toContain('response-created');
});
```

Run:

```bash
pnpm test:unit -- __tests__/api/chat-stream-consumption.test.ts --runInBand
```

Expected:

- PASS once Task 1 exists.
- This is a documentation-style unit test; the route itself is too large and dependency-heavy for a lightweight isolated test.

**Step 2: Add the route call site**

Change this block in `app/api/chat/route.ts`:

```ts
const result = streamText(openRouterPayload);

return result.toDataStreamResponse({
```

To:

```ts
const result = streamText(openRouterPayload);
startBackgroundStreamConsumption(result, id);

return result.toDataStreamResponse({
```

**Step 3: Run the focused test**

Run:

```bash
pnpm test:unit -- __tests__/api/chat-stream-consumption.test.ts --runInBand
```

Expected:

- PASS.

**Step 4: Type-check/build the route integration**

Run:

```bash
pnpm build
```

Expected:

- Build succeeds.
- If unrelated existing build failures occur, capture them in the implementation notes with full error output.

**Step 5: Commit**

```bash
git add app/api/chat/route.ts __tests__/api/chat-stream-consumption.test.ts
git commit -m "fix: keep chat streams consuming after disconnect"
```

---

## Task 3: Verify accidental disconnect does not lose the assistant response

**Objective:** Manually prove that refreshing/leaving the page while a response is streaming still results in a saved assistant response after completion.

**Files:**

- No code changes expected.
- Optional documentation update: `docs/chat-stream-resilience-research.md` or PR notes only.

**Step 1: Start the dev server**

Before starting, check port 3000:

```bash
lsof -ti:3000
```

If a process ID is returned, do not kill it blindly. Decide whether it is the existing dev server you want to use.

Start the app:

```bash
pnpm dev
```

Expected:

- Dev server starts on `http://localhost:3000`.
- Required environment variables must already be present; if not, stop and document the missing variables.

**Step 2: Create a long streaming response**

In the UI, send a prompt that takes long enough to refresh during streaming, for example:

```text
Write a detailed 1500-word comparison of SSE, WebSockets, and Redis Streams for AI chat applications. Use headings and examples.
```

Expected:

- Assistant begins streaming.

**Step 3: Refresh during streaming**

While text is still streaming:

- Refresh the browser tab, or
- Navigate away from the chat page, then come back after 30-60 seconds.

Expected:

- The original visible stream stops in the browser, because this option does not implement live resume.
- Server logs should not show an unhandled rejection from `consumeStream()`.
- After model completion time, reloading the chat should show the assistant response persisted in the database.

**Step 4: Verify persistence from the UI**

Reload the chat URL.

Expected:

- The assistant message appears in the conversation after completion.
- The chat is not empty/missing the assistant response.
- Token usage/cost tracking behavior remains as before.

**Step 5: Commit manual verification notes if useful**

If you create a short verification note, commit it separately:

```bash
git add docs/chat-stream-resilience-research.md
git commit -m "docs: record chat disconnect verification"
```

If no docs changed, no commit is needed.

---

## Task 4: Verify manual Stop behavior and decide whether Option 1 needs a guard

**Objective:** Ensure the Stop button does not unintentionally keep expensive generations running when the user deliberately cancels.

**Files:**

- Inspect/possibly modify: `components/chat.tsx:525-545`
- Inspect/possibly modify: `app/api/chat/route.ts:1731-1733`
- Test: only add tests if a code guard is needed.

**Step 1: Manual Stop test**

Start a long response and click the Stop button in the ChatLima UI.

Expected desired product behavior:

- Deliberate Stop should stop generation and avoid unnecessary token spend.
- If partial assistant content is saved today, preserve that behavior.
- If no partial content is saved today, do not invent partial persistence in Option 1.

**Step 2: Observe server behavior**

Watch server logs after clicking Stop.

Possible outcomes:

1. `consumeStream()` also stops/fails because the underlying request aborts.
   - Good enough for Option 1.
   - Log any expected abort-style error more gently if it is noisy.
2. `consumeStream()` keeps running to completion after Stop.
   - This violates the manual Stop requirement.
   - Add a follow-up guard before merging Option 1.

**Step 3: If Stop keeps running, add an explicit cancellation signal**

Only do this if verification shows it is necessary.

Minimal approach:

- Add a request body flag such as `clientIntent?: 'send' | 'stop'` only if the existing client flow can reliably send it.
- Prefer not to add schema/database state in Option 1.
- If reliable Stop distinction requires bigger changes, pause and update this plan rather than smuggling Option 2 into Option 1.

**Step 4: Document the outcome**

Add a note to the PR description or implementation notes:

- Accidental refresh/navigate behavior.
- Manual Stop behavior.
- Whether any follow-up is needed.

**Step 5: Commit only if code/docs changed**

```bash
git status --short
git add <changed-files>
git commit -m "fix: preserve manual stop behavior with background streams"
```

---

## Task 5: Run regression checks

**Objective:** Verify the minimal change did not break chat route compilation or existing chat UI tests.

**Files:**

- No expected code changes.

**Step 1: Run focused unit test**

```bash
pnpm test:unit -- __tests__/api/chat-stream-consumption.test.ts --runInBand
```

Expected:

- PASS.

**Step 2: Run existing chat component tests**

```bash
pnpm test:unit -- __tests__/components/chat.test.tsx --runInBand
```

Expected:

- PASS, unless there are documented pre-existing fake timer timeouts.

**Step 3: Run build**

```bash
pnpm build
```

Expected:

- PASS.

**Step 4: Optional basic UI smoke test**

Only run if local environment and browser deps are ready:

```bash
npx playwright test --project=basic-ui-chrome --config=playwright.basic.config.ts
```

Expected:

- PASS.

**Step 5: Commit any final docs/test fixes**

```bash
git status --short
git add <changed-files>
git commit -m "chore: verify chat stream resilience"
```

---

## Acceptance criteria

- Browser refresh/navigation during assistant streaming does not prevent the final assistant message from being saved.
- Existing live streaming UX remains unchanged while the page stays connected.
- No Redis or new infrastructure is introduced.
- No database schema changes are introduced.
- Existing `onFinish` persistence/token tracking still runs for successful completions.
- `consumeStream()` failures are logged without causing unhandled promise rejections.
- Manual Stop behavior is explicitly tested and documented before merge.
- Focused Jest test for background consumption helper passes.
- `pnpm build` passes or unrelated pre-existing failures are documented.

## Risks and mitigations

### Risk: double-consuming the stream changes client streaming behavior

Mitigation:

- AI SDK guidance supports `consumeStream()` with stream responses for persistence.
- Verify live streaming manually before merge.

### Risk: manual Stop keeps generating in the background

Mitigation:

- Explicit manual Stop verification task.
- If observed, add a small guard or pause for design review.

### Risk: serverless duration still cuts off long generations

Mitigation:

- This option improves ordinary disconnects but remains bounded by `maxDuration = 300` and platform limits.
- Longer durable jobs belong to Option 4.

### Risk: route unit tests are hard because `app/api/chat/route.ts` has many module-level dependencies

Mitigation:

- Test the exported helper directly.
- Use manual verification for the full route behavior.
- Avoid large test harness work in Option 1.

## Implementation notes for the coder

- Keep changes minimal.
- Do not add dependencies.
- Do not alter the frontend unless manual Stop verification proves it is necessary.
- Do not add DB fields or migrations.
- Do not implement Redis/resumable streams here.
- If you discover that `consumeStream()` is unavailable or has a different signature in `ai@4.3.9`, stop and update the plan before coding further.

# Plan 001: Remove dead, IDOR-vulnerable `/api/chats/migrate` route

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 813aa2c..HEAD -- app/api/chats/migrate/route.ts lib/auth.ts`
> If either file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `813aa2c`, 2026-07-20

## Why this matters

`app/api/chats/migrate/route.ts` lets any signed-in user POST `{ localUserId: "<victim>" }`
and reassign **every chat belonging to that user** to themselves — full
chat-history theft across the tenant, no ownership or session binding of the
`localUserId`. The handler trusts the client-supplied ID verbatim:

```ts
// app/api/chats/migrate/route.ts:35-46  (current, vulnerable)
const { localUserId } = parsedBody;
const result = await db
  .update(chats)
  .set({ userId: authenticatedUserId })
  .where(eq(chats.userId, localUserId))   // localUserId comes straight from the body
  .returning({ updatedId: chats.id });
```

Crucially, **this route has zero callers**. A repo-wide grep for `chats/migrate`
returns only the route file itself — no client fetch, no server action, no
`app/actions.ts` reference. The real anonymous→authenticated chat migration
already happens server-side inside Better Auth's account-link hook in
`lib/auth.ts` (the preset-migration block at `lib/auth.ts:181-192` shows the
same pattern, run from verified session context, not a client-supplied ID).

So this is dead, dangerous surface. The fix is to delete it. (A hardening
fallback is documented under "Escape hatches" in case the operator knows of an
external/internal caller this audit couldn't see.)

## Current state

- `app/api/chats/migrate/route.ts` — the vulnerable route (61 lines, POST only).
  Imports `auth`, `db`, `chats`, `eq`, `z`. Validates a body schema, reads
  `localUserId` from the body, runs the unscoped `UPDATE chats SET userId =
  authenticatedUserId WHERE userId = localUserId`, returns a count.
- `lib/auth.ts:181-192` — the **legitimate** migration path: inside Better
  Auth's anonymous→authenticated link hook, presets are migrated using the
  verified `anonymousUser.user.id` from the session, not a client-supplied
  value. Chat migration (if present) belongs here, not behind a public route.
- **Callers**: none found. `grep -rn "chats/migrate" lib app components hooks __tests__`
  returns only the route's own file.

### Repo conventions to match

- API route handlers are thin and delegate auth to `AuthMiddleware.requireAuth`
  / `requireAdmin` in `lib/middleware/auth.ts`. They are unit-tested by directly
  importing the exported handler and calling it with a constructed
  `NextRequest` — see the structural pattern at
  `__tests__/api/chats/[id]/active-leaf.test.ts:1-80` (`@jest-environment node`,
  `jest.mock('@/lib/auth', ...)`, invoke `PATCH(new NextRequest(...), {params})`).
- When removing a route, the convention is simply to delete the file — there is
  no central route registry to update (Next.js App Router auto-discovers).

## Commands you will need

| Purpose   | Command                          | Expected on success |
|-----------|----------------------------------|---------------------|
| Lint      | `pnpm lint`                      | exit 0              |
| Typecheck | `pnpm exec tsc --noEmit`         | exit 0, no errors   |
| Unit tests| `pnpm test:unit:ci`              | exit 0, all pass    |
| Build     | `pnpm build`                     | exit 0              |

## Scope

**In scope** (the only files you should modify):
- `app/api/chats/migrate/route.ts` — **delete**
- `__tests__/api/chats/migrate.test.ts` — **create** (regression test asserting
  the endpoint is gone; prevents accidental re-introduction)

**Out of scope** (do NOT touch):
- `lib/auth.ts` — the legitimate server-side migration hook already does the
  right thing; do not refactor it here.
- Any other `app/api/chats/**` route. Other by-ID routes already enforce
  `eq(*.userId, userId)` ownership; they are out of scope and verified clean.
- The `users`/`chats` schema or any Drizzle migration.

## Git workflow

- Branch: `advisor/001-remove-chats-migrate-route`
- Delete the route in one commit, add the test in a second. Message style is
  conventional commits (repo convention) — e.g.
  `fix(security): remove IDOR-vulnerable /api/chats/migrate route`.
- Do NOT push or open a PR unless the operator instructs it.

## Steps

### Step 1: Delete the vulnerable route

Delete the entire file `app/api/chats/migrate/route.ts` (and remove the now-empty
`app/api/chats/migrate/` directory).

**Verify**: `ls app/api/chats/migrate 2>&1` → `No such file or directory`
(or the directory is absent from `ls app/api/chats/`).

### Step 2: Add a regression test asserting the endpoint no longer exists

Create `__tests__/api/chats/migrate.test.ts`. The test asserts that a POST to
the deleted route path returns 404 (route gone), guarding against silent
re-introduction. Follow the structure of
`__tests__/api/chats/[id]/active-leaf.test.ts`.

Because the App Router route handler is gone, the cleanest assertion is that
importing it fails to compile / the handler export is absent. Use this shape:

```ts
/**
 * @jest-environment node
 *
 * Regression guard: the /api/chats/migrate route was removed because it let
 * any authenticated user steal every chat belonging to an arbitrary
 * localUserId (IDOR). This test fails if the route is re-introduced without
 * ownership checks.
 */
describe('removed /api/chats/migrate route', () => {
  it('is no longer exported (route deleted)', async () => {
    let imported: unknown = undefined;
    try {
      // Dynamic import so the test compiles even though the file is gone.
      const mod = await import('@/app/api/chats/migrate/route');
      imported = mod;
    } catch {
      imported = undefined;
    }
    // The route module must not exist and must not export a POST handler.
    expect(imported).toBeUndefined();
  });
});
```

**Verify**: `pnpm test:unit:ci -- migrate.test.ts` → 1 passed, 0 failed.

### Step 3: Confirm the legitimate migration path still exists

Confirm `lib/auth.ts` still contains the server-side migration logic (unchanged
by this plan). This is a read-only sanity check — do not modify `lib/auth.ts`.

**Verify**: `grep -n "anonymousUser.user.id" lib/auth.ts` → matches at the
existing preset-migration block (~line 181-192). Confirms anonymous→authenticated
migration is handled server-side.

## Test plan

- New test: `__tests__/api/chats/migrate.test.ts` — asserts the route module is
  gone (covers: accidental re-introduction of the IDOR).
- Pattern to model after: `__tests__/api/chats/[id]/active-leaf.test.ts`
  (`@jest-environment node`, jest.mock of `@/lib/auth`).
- Verification: `pnpm test:unit:ci` → all pass, including the new test.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `ls app/api/chats/migrate 2>&1` shows the directory is gone
- [ ] `grep -rn "chats/migrate" lib app components hooks __tests__` returns no
      references other than the new test file (which references it as the
      *removed* target)
- [ ] `pnpm exec tsc --noEmit` exits 0
- [ ] `pnpm lint` exits 0
- [ ] `pnpm test:unit:ci` exits 0; the new `migrate.test.ts` exists and passes
- [ ] `pnpm build` exits 0
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The code at `app/api/chats/migrate/route.ts` doesn't match the excerpt above
  (it has drifted — someone may have already started hardening it).
- You find a **caller** of `/api/chats/migrate` anywhere in the repo
  (`grep -rn "chats/migrate"` beyond the route itself and the new test). If a
  real caller exists, deletion will break it — switch to the "Escape hatches"
  fallback below and report.
- `lib/auth.ts` no longer contains the server-side migration block at
  `~line 181` (`anonymousUser.user.id`) — the legitimate path may have moved,
  and deletion could remove the only migration path.
- `pnpm build` fails after deletion for a reason that traces back to this route
  being imported somewhere you didn't expect.

## Escape hatches

If a legitimate caller of `/api/chats/migrate` is discovered (STOP condition
above), **do not delete**. Instead harden in place:

1. Remove `localUserId` from the request body entirely.
2. Source the anonymous-source user id from the **verified session** (the Better
   Auth anonymous session being upgraded), never from the request body.
3. Reject any `localUserId` that maps to a non-anonymous user.
4. Add a test asserting a user cannot migrate another user's chats by supplying
   a foreign ID.

Report which path you took in the PR description.

## Maintenance notes

- This route was added in commit `8f9b461` ("feat: enhance authentication and
  chat management features", 2025-10-30) and never wired to a caller. If someone
  later needs anonymous→authenticated chat migration from the client, it must
  go through the `lib/auth.ts` account-link hook (server-side, session-verified),
  **not** a public route.
- A reviewer should confirm via `grep -rn "chats/migrate"` that no new caller
  sneaks in alongside this deletion.

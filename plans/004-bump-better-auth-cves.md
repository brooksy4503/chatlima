# Plan 004: Bump `better-auth` to fix two critical CVEs

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 813aa2c..HEAD -- package.json pnpm-lock.yaml lib/auth.ts auth-schema.ts`
> If any changed, compare the "Current state" excerpts against the live code
> before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: security / migration
- **Planned at**: commit `813aa2c`, 2026-07-20

## Why this matters

`better-auth` is pinned at `1.2.7` (`package.json:92`, lockfile confirms exact
`1.2.7`). `pnpm audit --prod` reports **two critical advisories** against it:

1. **GHSA-xg6x-h9c9-2m83** — Two-Factor Authentication Bypass via Premature
   Session Caching (`session.cookieCache`). Fixed in `>=1.4.9`.
2. **GHSA-pw9m-5jxm-xr6h** — OAuth refresh-token replay via missing client
   authentication on `oidc-provider` and `mcp` plugins. Fixed in `>=1.6.11`.

Both are directly reachable: `lib/auth.ts:1` imports `betterAuth`, every
`requireAuth`/`requireAdmin` check goes through `auth.api.getSession`, and the
MCP plugin surface is in use (`@polar-sh/better-auth` at `lib/auth.ts:7` depends
on better-auth's plugin/runtime). The 2FA-bypass advisory weakens every auth
check in the app; the OAuth-replay advisory is especially relevant because the
app already has MCP OAuth flows (see Plan 003).

The fix is a patch-version bump within 1.x to `>=1.6.11` (covers both
advisories). `better-auth` follows semver within 1.x; this is not a major
migration.

## Current state

### Versions (from `pnpm-lock.yaml` + `pnpm list`)

- `better-auth`: `1.2.7` (pinned `^1.2.7` at `package.json:92`)
- `@better-auth/cli`: `1.2.7` (pinned `^1.2.7` at `package.json:130`)

### Both advisories

- `pnpm audit --prod` output (verified during audit):
  - `better-auth <1.4.9` → 2FA bypass (GHSA-xg6x-h9c9-2m83), patched `>=1.4.9`
  - `better-auth <1.6.11` → OAuth refresh-token replay (GHSA-pw9m-5jxm-xr6h),
    patched `>=1.6.11`
- Target: `>=1.6.11` satisfies both.

### Auth surface that must keep working after the bump

- `lib/auth.ts` — `betterAuth({...})` config. Key blocks to preserve:
  - `drizzleAdapter` with `schema.sessions`/etc. at `:119`
  - `session:` block at `:129-135` — `expiresIn: 30 days`, `fields.token: "sessionToken"` (column mapping)
  - `socialProviders.google` with `onAccountCreated` at `:137+` (sets `messageLimit: 20`)
  - Polar plugin at `:280` (`webhooks.secret`, `onSubscriptionCreated`, etc.)
  - anonymous plugin (`better-auth/plugins`)
- `app/api/auth/[...betterauth]/route.ts:2` — `toNextJsHandler` from `better-auth/next-js`.
- `lib/middleware/auth.ts:17` — `auth.api.getSession({ headers })`.
- `app/api/auth/sign-in/anonymous/route.ts` — anonymous sign-in.

### Schema files (must not require a migration)

- `auth-schema.ts` — `user`, `session`, `account`, `verification` tables. The
  `session.token` → `sessionToken` column is mapped in config (`lib/auth.ts:132`).
  Confirm post-bump that `better-auth` does not require new columns (it should
  not for a 1.2→1.6 bump, but Step 3 verifies).

### Conventions

- Dependency bumps are done with `pnpm` (lockfile is `pnpm-lock.yaml`).
- Verification gate: `pnpm lint` + `pnpm test:unit:ci` + `pnpm build` (matches
  `scripts/pre-push-check.sh`).
- The repo already has a `@better-auth/cli` dev dependency for migrations —
  run `pnpm exec @better-auth/cli migrate` or `pnpm exec @better-auth/cli generate`
  if the CLI reports schema drift after the bump (Step 3).

## Commands you will need

| Purpose          | Command                                        | Expected on success |
|------------------|------------------------------------------------|---------------------|
| Inspect version  | `pnpm list better-auth @better-auth/cli`       | shows current       |
| Bump             | `pnpm add better-auth@^1.6.11`                 | exit 0              |
| Bump CLI         | `pnpm add -D @better-auth/cli@^1.6.11`         | exit 0              |
| Audit            | `pnpm audit --prod`                            | no better-auth advisories |
| Typecheck        | `pnpm exec tsc --noEmit`                       | exit 0              |
| Unit tests       | `pnpm test:unit:ci`                            | exit 0              |
| Build            | `pnpm build`                                   | exit 0              |

## Scope

**In scope** (the only files you should modify):
- `package.json` — bump `better-auth` and `@better-auth/cli` to `^1.6.11`
  (done via `pnpm add`, not by hand-editing).
- `pnpm-lock.yaml` — updated by `pnpm add`.
- `auth-schema.ts` and/or a new Drizzle migration — **only if** the bumped
  `better-auth` CLI reports a required schema change (Step 3). Do not generate
  one speculatively.

**Out of scope** (do NOT touch):
- `lib/auth.ts` config logic — the bump should not require config changes
  within 1.x. If a deprecation warning appears, note it in the PR but do not
  refactor here; open a follow-up.
- `@polar-sh/better-auth` (`^0.1.1`) — it peer-depends on `better-auth` and
  will resolve to the new version automatically. Do not bump it unless its
  peerDep range rejects `1.6.11` (Step 2 STOP condition covers this).
- Any auth *behavior* (session expiry, anonymous limits, OAuth). This is a
  security patch, not a refactor.

## Git workflow

- Branch: `advisor/004-bump-better-auth-cves`
- Single commit after both `pnpm add`s and any required migration. Message:
  `fix(security): bump better-auth to 1.6.11 (2FA bypass + OAuth replay CVEs)`.
- Do NOT push or open a PR unless the operator instructs it.

## Steps

### Step 1: Record the pre-bump baseline

Capture the current state so you can prove nothing regressed:

```bash
pnpm list better-auth @better-auth/cli   # expect 1.2.7 / 1.2.7
pnpm exec tsc --noEmit && echo "tsc OK (pre-bump)"
pnpm test:unit:ci 2>&1 | tail -20        # record pass/fail baseline
```

Record the test count. Any pre-existing failures must still fail the same way
post-bump — the bump should not introduce *new* failures.

**Verify**: you have a written record of (a) current versions, (b) tsc result,
(c) test pass/fail counts.

### Step 2: Bump both packages

```bash
pnpm add better-auth@^1.6.11
pnpm add -D @better-auth/cli@^1.6.11
```

**Verify**:
- `pnpm list better-auth @better-auth/cli` → both report a version `>=1.6.11`
  (the resolved version may be higher within `^1.6.11`; that's fine).
- `pnpm audit --prod` → no advisories whose `Paths` start with `.>better-auth`.
  (Other advisories like `jspdf`, `form-data` may still appear — those are out
  of scope for this plan; do not chase them here.)

### Step 3: Check for required schema changes

The bumped CLI may detect that the DB schema is out of sync with the new
better-auth version:

```bash
pnpm exec @better-auth/cli generate 2>&1 | tee /tmp/ba-generate.log
```

- If the CLI reports **no changes** / "already in sync" → do nothing further
  for schema. Proceed to Step 4.
- If it proposes changes to `auth-schema.ts` → review the diff carefully. Apply
  it, then run `pnpm db:generate` to create a Drizzle migration under
  `drizzle/`. **Do not** run `pnpm db:migrate` (the operator applies migrations
  to production; your job is to produce the migration file).

**Verify**: either `/tmp/ba-generate.log` says no changes, OR a new migration
file exists under `drizzle/` and `auth-schema.ts` matches what the CLI generated.

### Step 4: Typecheck and build

```bash
pnpm exec tsc --noEmit
pnpm build
```

**Verify**: both exit 0. If `tsc` reports type errors in `lib/auth.ts`,
`lib/middleware/auth.ts`, or `app/api/auth/**`, that indicates a breaking
API change in the bump — see STOP conditions.

### Step 5: Run the unit suite and compare to baseline

```bash
pnpm test:unit:ci 2>&1 | tail -30
```

**Verify**:
- Exit 0 (or the same set of pre-existing failures as the Step 1 baseline —
  no *new* failures).
- Specifically the auth-touching tests, if any, still pass:
  `pnpm test:unit:ci -- auth` (grep your test dir for auth-related suites).

### Step 6: Smoke-check the auth surface (manual reasoning)

Without running the dev server, confirm by reading that these still hold:

- `lib/auth.ts:129-135` `session` block — `expiresIn` and `fields.token` mapping
  unchanged.
- `lib/auth.ts:280` Polar webhook config — `secret` field still accepted.
- `lib/middleware/auth.ts:17` — `auth.api.getSession({ headers })` call shape
  unchanged.

If any of these would need to change for `1.6.11`, STOP and report.

## Test plan

This plan is a dependency bump; it does not add new tests. The verification is:

- `pnpm exec tsc --noEmit` → exit 0 (types still align with the new version).
- `pnpm test:unit:ci` → no new failures vs the Step 1 baseline.
- `pnpm build` → exit 0 (the Next.js build compiles the auth surface).

The existing auth/session tests (if any) and the chat-seam tests
(`__tests__/lib/chatStateSeams.test.ts`) serve as regression coverage; they
exercise the session-dependent code paths.

A follow-up plan should add characterization tests for the money/auth path
(see the audit's "no tests for `lib/polar.ts`" finding) — out of scope here.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `pnpm list better-auth` reports a version `>=1.6.11`
- [ ] `pnpm list @better-auth/cli` reports a version `>=1.6.11`
- [ ] `pnpm audit --prod` shows no advisories whose path starts with `.>better-auth`
- [ ] `pnpm exec tsc --noEmit` exits 0
- [ ] `pnpm lint` exits 0
- [ ] `pnpm test:unit:ci` exits 0 (or matches the Step 1 baseline with no new failures)
- [ ] `pnpm build` exits 0
- [ ] If `@better-auth/cli generate` proposed schema changes, a new migration
      exists under `drizzle/` and `auth-schema.ts` reflects them; if not,
      `auth-schema.ts` is unchanged.
- [ ] No files outside the in-scope list are modified (`git status` — expect
      `package.json`, `pnpm-lock.yaml`, and possibly `auth-schema.ts` + a
      `drizzle/*.sql` migration only).
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `pnpm add better-auth@^1.6.11` fails to resolve, or resolves to a version
  `<1.6.11` (the advisory fix line). Report the resolved version.
- `@polar-sh/better-auth@^0.1.1` peer-dep range rejects `better-auth@1.6.11`
  (peer warning/ error during install). The Polar plugin may need a concurrent
  bump — report and ask; do not bump `@polar-sh/better-auth` speculatively.
- `pnpm exec @better-auth/cli generate` proposes **breaking** schema changes
  (dropped columns, renamed tables, non-additive migrations). Do not apply;
  report the proposal. Additive column additions are fine to apply.
- `pnpm exec tsc --noEmit` reports errors in auth-touching files that indicate
  a real API change (not just a deprecation). This bumps the plan from S to
  M/L — report the errors and ask before continuing.
- The bumped version introduces a runtime config requirement (e.g. a new
  mandatory field in the `session` or `socialProviders.google` block). Report
  and ask.
- `pnpm test:unit:ci` shows **new** failures (not present in the Step 1
  baseline) in auth/session/chat tests.

## Maintenance notes

- After landing, the operator should redeploy and verify in staging: Google
  OAuth sign-in, anonymous sign-in, anonymous→authenticated account linking
  (the `lib/auth.ts:181` preset-migration block), and a Polar webhook
  delivery (the webhook signature path the `>=1.6.11` advisory concerns).
- The audit also flagged (separately, Plan 003) that `lib/auth.ts:281`
  `POLAR_WEBHOOK_SECRET || ''` fails open. That is a different finding; this
  plan does **not** fix it. Consider landing the fail-closed change alongside
  this bump since both touch the auth surface.
- Watch the `@polar-sh/better-auth` changelog — its `0.1.x` line is old and
  may itself need a bump to stay compatible with newer `better-auth` releases.
  Out of scope here; flag as follow-up.
- A reviewer should confirm `pnpm audit --prod` is clean for the
  `.>better-auth` path and that no schema migration was silently skipped.

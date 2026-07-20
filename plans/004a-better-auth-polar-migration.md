# Plan 004a: Migrate `better-auth` + `@polar-sh/better-auth` + `@polar-sh/sdk` to fix two critical CVEs

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 813aa2c..HEAD -- package.json pnpm-lock.yaml lib/auth.ts lib/polar.ts auth-schema.ts lib/auth-client.ts app/api/auth/[...betterauth]/route.ts`
> If any changed, compare the "Current state" excerpts against the live code
> before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: security / migration
- **Planned at**: commit `813aa2c`, 2026-07-20

> **Supersedes Plan 004** (BLOCKED). The original plan scoped this as an S-effort
> dependency bump and explicitly excluded `@polar-sh/better-auth` from scope.
> Execution proved that assumption wrong: every `@polar-sh/better-auth` version
> ≤ 1.8.0 fails to load under `better-auth@1.6.x` (it imports
> `createAuthEndpoint` from `"better-auth/plugins"`, which moved to
> `"better-auth/api"` in 1.6.x), and from plugin 1.4.0 the `polarPlugin()`
> config API was rewritten from flat to modular form. So the bump is a real
> multi-package migration with code changes to `lib/auth.ts`. This plan absorbs
> that scope. The decision to apply `messageLimit: 20` to **all** signups (not
> Google-only) was confirmed by the operator during planning.

## Why this matters

`better-auth` is pinned at `1.2.7`. `pnpm audit --prod` reports two **critical**
advisories against it:

1. **GHSA-xg6x-h9c9-2m83** — Two-Factor Authentication Bypass via Premature
   Session Caching. Fixed in `>=1.4.9`.
2. **GHSA-pw9m-5jxm-xr6h** — OAuth refresh-token replay via missing client
   authentication on `oidc-provider` and `mcp` plugins. Fixed in `>=1.6.11`.

Both are directly reachable (`lib/auth.ts:1`, every `requireAuth`/`requireAdmin`
via `auth.api.getSession`, MCP plugin surface in use). Closing both requires
`better-auth >=1.6.11`, which in turn requires migrating the Polar plugin.

A prior execution attempt (Plan 004) proved:
- `better-auth 1.2.7 → 1.6.23` resolves **both CVEs** (verified: zero
  advisories with a `.>better-auth` direct path post-bump).
- The blocker is purely the Polar plugin integration: `@polar-sh/better-auth@0.1.1`
  fails to load under 1.6.x.
- The unit suite stays green during the break because it mocks `lib/auth.ts` —
  the **build is the authoritative signal**, not the tests.

## Current state

### Versions (verified)

| Package | Current | Target | Why |
|---|---|---|---|
| `better-auth` | `^1.2.7` (resolves 1.2.7) | `^1.6.11` | Fixes both CVEs |
| `@better-auth/cli` (dev) | `^1.2.7` (resolves 1.4.21) | leave as-is | CLI resolves user-installed better-auth via bare specifiers; 1.4.21 is compatible with 1.6.x runtime (verified) |
| `@polar-sh/better-auth` | `^0.1.1` | `1.8.4` | Lowest source-compatible version is **1.8.1** (fixed the `createAuthEndpoint` import path); 1.8.4 is latest. All versions ≤1.8.0 are broken under 1.6.x. |
| `@polar-sh/sdk` | `^0.32.13` | `^0.47.0` | Required by plugin 1.8.4. Every app call site in `lib/polar.ts` and `lib/auth.ts` is verified source-compatible (see "SDK call-site compatibility" below). |

### Polar plugin API change (the bulk of the code work)

The flat config in `lib/auth.ts:255-421`:

```ts
polarPlugin({
    client: polarClient,
    createCustomerOnSignUp: false,
    enableCustomerPortal: true,
    checkout: {
        enabled: true,
        products: [ /* { productId, slug }[] */ ],
        successUrl: process.env.SUCCESS_URL,
        errorUrl: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/checkout/error?reason=failed` : '/checkout/error?reason=failed',
    },
    webhooks: {
        secret: process.env.POLAR_WEBHOOK_SECRET || '',
        onPayload: async (payload) => { /* ... */ },
        onSubscriptionCreated: async (payload) => { /* ... body ... */ },
        onOrderCreated: async (payload) => { /* ... */ },
        onSubscriptionCanceled: async (payload) => { /* ... body ... */ },
        onSubscriptionRevoked: async (payload) => { /* ... body ... */ },
    },
})
```

becomes the **modular** form (plugin 1.4.0+, verified against 1.8.4 types at
`node_modules/@polar-sh/better-auth/dist/client.d.ts`):

```ts
polarPlugin({
    client: polarClient,
    createCustomerOnSignUp: false,
    use: [
        checkout({
            products: [ /* same { productId, slug }[] */ ],
            successUrl: process.env.SUCCESS_URL,
            // NOTE: CheckoutOptions has no `enabled` and no `errorUrl`.
            // `errorUrl` becomes `returnUrl` (the post-cancellation URL) or is dropped.
            // See Step 4 for the decision.
        }),
        portal(),  // replaces `enableCustomerPortal: true`
        webhooks({
            secret: process.env.POLAR_WEBHOOK_SECRET || '',
            // The five handler bodies (onPayload, onSubscriptionCreated,
            // onOrderCreated, onSubscriptionCanceled, onSubscriptionRevoked)
            // port VERBATIM — only the nesting changed. The handler option
            // names are identical in WebhooksOptions (1.8.4).
            onPayload: async (payload) => { /* ...unchanged body... */ },
            onSubscriptionCreated: async (payload) => { /* ...unchanged body... */ },
            onOrderCreated: async (payload) => { /* ...unchanged body... */ },
            onSubscriptionCanceled: async (payload) => { /* ...unchanged body... */ },
            onSubscriptionRevoked: async (payload) => { /* ...unchanged body... */ },
        }),
    ],
})
```

Key facts (verified against 1.8.4 type definitions):
- `PolarOptions` requires `use: PolarPlugins` where
  `type PolarPlugins = [PolarPlugin, ...PolarPlugin[]]` (at least one).
- `WebhooksOptions` (`client.d.ts:289`) has `secret: string` (required) and the
  exact same handler names: `onPayload`, `onSubscriptionCreated`,
  `onOrderCreated`, `onSubscriptionCanceled`, `onSubscriptionRevoked`, plus
  many more (all optional).
- `CheckoutOptions` (`client.d.ts:453`) has `products`, `successUrl`,
  `returnUrl`, `authenticatedUsersOnly`, `theme`. **No `enabled`, no `errorUrl`.**
- `portal({ returnUrl?, theme? })` (`client.d.ts:46-53`) replaces
  `enableCustomerPortal: true`; both args optional.
- Webhook handler `payload` types are now typed SDK models
  (`WebhookSubscriptionCreatedPayload`, etc.), but the app's existing
  `payload.data as any` casts still work — keep them to minimize churn.

### `socialProviders.google.onAccountCreated` removal

`onAccountCreated` was removed from `GoogleOptions` in 1.6.x. The replacement
is a top-level `databaseHooks.user.create.after` hook. The operator confirmed
`messageLimit: 20` should apply to **all signups** (not Google-only), so no
provider-inspection in the hook body is needed.

Current code at `lib/auth.ts:141-155`:

```ts
socialProviders: {
    google: {
        ...getGoogleOAuthConfig(),
        onAccountCreated: async ({ user }: { user: any }) => {
            // ... sets metadata.messageLimit = 20 ...
            await db.update(schema.users)
                .set({ metadata: { ...user.metadata, messageLimit: 20 } })
                .where(eq(schema.users.id, user.id));
            return user;
        }
    },
},
```

becomes (drop `onAccountCreated` from the google provider; add a sibling
`databaseHooks` at the `betterAuth({...})` top level):

```ts
socialProviders: {
    google: {
        ...getGoogleOAuthConfig(),
    },
},
databaseHooks: {
    user: {
        create: {
            after: async (user) => {
                await db.update(schema.users)
                    .set({ metadata: { ...(user.metadata as any || {}), messageLimit: 20 } })
                    .where(eq(schema.users.id, user.id));
            },
        },
    },
},
```

Use `.after` (fire-and-forget, returns void) — equivalent to the old hook's
behavior. Do NOT use `.before` (it returns `{ data }` that replaces the insert).

### What stays unchanged (verified stable across 1.2 → 1.6)

- `lib/auth.ts:1-3` imports (`betterAuth`, `drizzleAdapter`, `anonymous`) — stable.
- `lib/auth.ts:113-126` `drizzleAdapter(db, { provider: "pg", schema })` — stable.
- `lib/auth.ts:127` `secret` — stable.
- `lib/auth.ts:129-135` `session: { expiresIn, fields: { token: "sessionToken" } }` — stable.
- `lib/auth.ts:136` `trustedOrigins` — stable (array form still valid).
- `lib/auth.ts:159-254` `anonymous({ emailDomainName, onLinkAccount })` — **stable**, including the preset-migration `onLinkAccount` body that uses `anonymousUser.user.id`. Do not touch.
- `lib/auth-client.ts:3,4` (`createAuthClient`, `anonymousClient`) — stable.
- `app/api/auth/[...betterauth]/route.ts:2` `toNextJsHandler` — stable.
- `lib/middleware/auth.ts:17` `auth.api.getSession({ headers })` — stable.

### SDK call-site compatibility (verified against `@polar-sh/sdk@0.47.0`)

Every `polarClient.*` call in `lib/polar.ts` and `lib/auth.ts` is
source-compatible with the SDK bump — no call-site changes required:
- `events.ingest({ events: [{ name, customerId, metadata }] })` — `lib/polar.ts:55`
- `customers.getStateExternal({ externalId })` — `lib/polar.ts:107,486,509,527`
- `meters.get({ id })` — `lib/polar.ts:138`
- `customerMeters.list({ customerId })` — `lib/polar.ts:192`
- `customers.getExternal({ externalId })` — `lib/polar.ts:255`, `lib/auth.ts:210`
- `customers.list({ email, limit })` — `lib/polar.ts:279`
- `customers.update({ id, customerUpdate: { externalId } })` — `lib/polar.ts:355`
- `customers.updateExternal({ externalId, customerUpdateExternalID: {...} })` — `lib/polar.ts:389`, `lib/auth.ts:216`
- `customers.create({ email, name, externalId, metadata })` — `lib/polar.ts:400`, `lib/auth.ts:228`
- `customers.get({ id })` — `lib/auth.ts:307,351,390`

### Repo conventions to match

- Dependency changes via `pnpm add` (lockfile is `pnpm-lock.yaml`).
- Verification gate matches `scripts/pre-push-check.sh`: `pnpm lint` +
  `pnpm test:unit:ci` + `pnpm build`.
- Code style in `lib/auth.ts`: 4-space indent, double quotes for strings in the
  existing config (match it), `console.log`/`console.error` for diagnostics.
- Tests mock `@/lib/auth` with `jest.mock('@/lib/auth', () => ({ auth: { api: { getSession: jest.fn() } } }))` — see
  `__tests__/api/chats/[id]/active-leaf.test.ts:9-15` for the pattern.

## Commands you will need

| Purpose          | Command                                        | Expected on success |
|------------------|------------------------------------------------|---------------------|
| Inspect version  | `pnpm list better-auth @polar-sh/better-auth @polar-sh/sdk @better-auth/cli` | shows versions |
| Bump runtime     | `pnpm add better-auth@^1.6.11 @polar-sh/better-auth@1.8.4 @polar-sh/sdk@^0.47.0` | exit 0 |
| Audit            | `pnpm audit --prod`                            | no `.>better-auth` advisories |
| Typecheck        | `pnpm exec tsc --noEmit`                       | no NEW errors vs baseline |
| Unit tests       | `pnpm test:unit:ci`                            | exit 0, no new failures |
| Build            | `pnpm build`                                   | same baseline outcome (pre-existing AUTH_SECRET failure OK; NEW failure is not) |
| Schema check     | `pnpm exec @better-auth/cli generate`          | "already in sync" OR proposes additive-only changes |

## Scope

**In scope** (the only files you should modify):
- `package.json` + `pnpm-lock.yaml` — the three version bumps (via `pnpm add`).
- `lib/auth.ts` — two edits:
  1. Restructure `polarPlugin({...})` from flat to modular `use: [checkout(), portal(), webhooks()]` (lines ~255-421).
  2. Move `onAccountCreated` → top-level `databaseHooks.user.create.after`; remove the `onAccountCreated` key from `socialProviders.google` (lines ~137-157).
- `__tests__/api/chats/[id]/active-leaf.test.ts`, `__tests__/api/chats/[id]/export-pdf.test.ts`, `__tests__/api/chat-route-web-search.test.ts` — update the `getSession` mock signature if the new better-auth `getSession` type no longer matches `jest.fn()`. Three files, same pattern.
- `auth-schema.ts` + new `drizzle/*.sql` migration — **only if** `@better-auth/cli generate` reports a required schema change (Step 3). Do not generate speculatively.

**Out of scope** (do NOT touch):
- `lib/polar.ts` — SDK call sites verified compatible; no changes needed.
- `lib/middleware/auth.ts` — `auth.api.getSession` call shape unchanged.
- The `POLAR_WEBHOOK_SECRET || ''` fail-open behavior at the (new) `webhooks({ secret: ... })` site — that's audit finding #16, a separate plan. Keep the `|| ''` as-is here to avoid scope creep; note it in the commit message.
- Any auth *behavior* changes beyond what the bump requires. This is a security migration, not a refactor.
- `@polar-sh/better-auth` test coverage — out of scope; the existing chat-seam tests exercise the session-dependent paths.

## Git workflow

- Branch: `advisor/004a-better-auth-polar-migration`
- Commits, one per logical unit, conventional style:
  1. `fix(security): bump better-auth, @polar-sh/better-auth, @polar-sh/sdk for CVE fixes`
  2. `refactor(auth): migrate polarPlugin to modular use:[...] form`
  3. `refactor(auth): move google onAccountCreated to databaseHooks.user.create.after`
  4. (if needed) `chore(auth): update getSession test mocks for better-auth 1.6`
  5. (if needed) `feat(db): add better-auth schema migration`
- Do NOT push or open a PR unless the operator instructs it.

## Steps

### Step 1: Record the pre-bump baseline

In the worktree, before any change:

```bash
pnpm list better-auth @polar-sh/better-auth @polar-sh/sdk @better-auth/cli
pnpm exec tsc --noEmit 2>&1 | tee /tmp/tsc-baseline.log | tail -3
echo "BASELINE TSC ERROR COUNT: $(grep -c ': error TS' /tmp/tsc-baseline.log)"
pnpm test:unit:ci 2>&1 | tail -6
pnpm build 2>&1 | tail -5  # expect "Missing AUTH_SECRET" — record as baseline
```

Record: (a) current versions, (b) tsc error COUNT (baseline is ~35, all pre-existing in `__tests__/lib/*` and `lib/services/__tests__/*`), (c) test pass count, (d) build baseline failure.

**Verify**: you have written baseline numbers. The post-migration tsc count must equal this baseline (zero new errors). The post-migration build must fail for the same root cause (AUTH_SECRET) or succeed — never a *new* failure.

### Step 2: Bump the three packages

```bash
pnpm add better-auth@^1.6.11 @polar-sh/better-auth@1.8.4 @polar-sh/sdk@^0.47.0
```

**Verify**:
- `pnpm list better-auth @polar-sh/better-auth @polar-sh/sdk` →
  `better-auth` ≥1.6.11, `@polar-sh/better-auth` =1.8.4, `@polar-sh/sdk` ≥0.47.0.
- `pnpm audit --prod` → no advisories with `Paths` starting `.>better-auth`
  (transitive `better-sqlite3`/`defu`/`drizzle-kit` advisories may remain —
  out of scope).
- `pnpm exec tsc --noEmit 2>&1 | grep -c ': error TS'` → count will be higher
  than baseline RIGHT NOW (the polar plugin config + onAccountCreated are
  still the old shape). That's expected; Steps 3-5 fix it. Do NOT commit yet.

### Step 3: Check for required schema changes

```bash
pnpm exec @better-auth/cli generate 2>&1 | tee /tmp/ba-generate.log
```

- If "already in sync" / no changes → proceed to Step 4. `auth-schema.ts` stays untouched.
- If it proposes **additive** changes (new nullable columns / new tables) → apply to `auth-schema.ts`, run `pnpm db:generate` to create a `drizzle/*.sql` migration. **Do not** run `pnpm db:migrate`.
- If it proposes **breaking** changes (dropped columns, renames) → STOP condition.

**Verify**: `/tmp/ba-generate.log` reviewed; either no-op or an additive migration exists under `drizzle/`.

### Step 4: Migrate `polarPlugin(...)` to modular form

Edit `lib/auth.ts`. Replace the entire `polarPlugin({...})` block (currently lines ~255-421) with the modular form shown in "Current state" above. Rules:

- **Handler bodies port verbatim.** Copy the body of each of `onPayload`, `onSubscriptionCreated`, `onOrderCreated`, `onSubscriptionCanceled`, `onSubscriptionRevoked` unchanged into the new `webhooks({...})` sub-plugin. Do not rewrite the DB logic inside them.
- **`checkout`**: drop `enabled: true` (not in `CheckoutOptions`). Move `products` and `successUrl` as-is. For `errorUrl`: `CheckoutOptions` has no `errorUrl`; the closest is `returnUrl`. **Decision:** drop `errorUrl` for now and rely on Polar's default cancellation behavior, OR set `returnUrl` to the same `/checkout/error?reason=failed` value if you want to preserve the post-cancel landing page. Prefer `returnUrl` to preserve behavior — note the choice in the commit message.
- **`portal()`**: replace `enableCustomerPortal: true` with `portal()` in the `use` array. No args needed (both optional).
- **`createCustomerOnSignUp: false`**: keep as a top-level `PolarOptions` field (it stays at the outer object, not inside `use`).
- **`secret`**: keep `process.env.POLAR_WEBHOOK_SECRET || ''` (the fail-open behavior is finding #16, out of scope here).

The structure:

```ts
polarPlugin({
    client: polarClient,
    createCustomerOnSignUp: false,
    use: [
        checkout({
            products: [
                { productId: process.env.POLAR_PRODUCT_ID || '', slug: 'ai-usage' },
                ...(process.env.POLAR_PRODUCT_ID_YEARLY ? [{
                    productId: process.env.POLAR_PRODUCT_ID_YEARLY,
                    slug: 'ai-usage-yearly',
                }] : [])
            ],
            successUrl: process.env.SUCCESS_URL,
            returnUrl: process.env.NEXT_PUBLIC_APP_URL
                ? `${process.env.NEXT_PUBLIC_APP_URL}/checkout/error?reason=failed`
                : '/checkout/error?reason=failed',
        }),
        portal(),
        webhooks({
            secret: process.env.POLAR_WEBHOOK_SECRET || '',
            onPayload: async (payload) => { /* VERBATIM body from current onPayload */ },
            onSubscriptionCreated: async (payload) => { /* VERBATIM */ },
            onOrderCreated: async (payload) => { /* VERBATIM */ },
            onSubscriptionCanceled: async (payload) => { /* VERBATIM */ },
            onSubscriptionRevoked: async (payload) => { /* VERBATIM */ },
        }),
    ],
}),
```

**Verify**:
- `grep -n "enableCustomerPortal\|checkout: {" lib/auth.ts` → no matches (flat keys gone).
- `grep -n "use: \[" lib/auth.ts` → present in the polar block.
- `grep -n "portal()" lib/auth.ts` → present.
- `pnpm exec tsc --noEmit 2>&1 | grep "lib/auth.ts"` → the `lib/auth.ts:255` BetterAuthPlugin error should now be gone (the polar plugin loads correctly). The `lib/auth.ts:141` onAccountCreated error may still be present — Step 5 fixes it.

### Step 5: Migrate `onAccountCreated` → `databaseHooks.user.create.after`

Edit `lib/auth.ts`:
1. In `socialProviders.google`, **remove** the `onAccountCreated` key (keep `...getGoogleOAuthConfig()`).
2. Add a **sibling** `databaseHooks` at the `betterAuth({...})` top level (same nesting level as `socialProviders`, `plugins`, `session`):

```ts
databaseHooks: {
    user: {
        create: {
            after: async (user) => {
                await db.update(schema.users)
                    .set({
                        metadata: {
                            ...(user.metadata as any || {}),
                            messageLimit: 20, // 20 messages per day for authenticated users
                        },
                    })
                    .where(eq(schema.users.id, user.id));
            },
        },
    },
},
```

Semantics decision (confirmed by operator): this fires for ALL user creations (Google, email/password if added later, etc.), not Google-only. That's acceptable and simpler than provider-inspection.

**Verify**:
- `grep -n "onAccountCreated" lib/auth.ts` → no matches.
- `grep -n "databaseHooks" lib/auth.ts` → present.
- `pnpm exec tsc --noEmit 2>&1 | grep "lib/auth.ts"` → zero errors in `lib/auth.ts`.

### Step 6: Update `getSession` test mocks (if needed)

The better-auth 1.6.x `getSession` signature is more heavily generic, which can make `jest.fn()` mocks fail the type cast. Check:

```bash
pnpm exec tsc --noEmit 2>&1 | grep "getSession\|active-leaf\|export-pdf\|chat-route-web-search"
```

If you see TS2352 "Conversion of type ... to type 'Mock<any, any, any>' may be a mistake" in any of:
- `__tests__/api/chats/[id]/active-leaf.test.ts`
- `__tests__/api/chats/[id]/export-pdf.test.ts`
- `__tests__/api/chat-route-web-search.test.ts`

…then update the mock. The minimal fix is to cast through `unknown`:

```ts
const mockGetSession = auth.api.getSession as unknown as jest.Mock;
```

Apply to each affected file. If a file has multiple `as jest.Mock` casts on `auth.api.*`, update all consistently. Do not change what the mocks *return* — only the cast.

If `tsc` shows NO such errors, skip this step and note it.

**Verify**: `pnpm exec tsc --noEmit 2>&1 | grep -c ': error TS'` → count equals the Step 1 baseline (zero new errors).

### Step 7: Full verification

```bash
pnpm exec tsc --noEmit 2>&1 | grep -c ': error TS'   # must equal baseline count
pnpm lint                                            # exit 0
pnpm test:unit:ci 2>&1 | tail -8                     # exit 0, no new failures vs baseline
pnpm build 2>&1 | tail -10                           # same outcome as baseline (AUTH_SECRET OK; new failure NOT)
```

**Verify** (all must hold):
- tsc error count == Step 1 baseline count.
- `pnpm lint` exit 0.
- `pnpm test:unit:ci` exit 0 (the same 585 pass / 20 skip baseline; no new failures).
- `pnpm build` has the SAME outcome as baseline. If the baseline failed only on `Missing AUTH_SECRET` and the post-migration build fails for a DIFFERENT reason that traces to auth/polar, that's a STOP condition.

### Step 8: Smoke-check the auth surface (read-only reasoning)

Confirm by reading `lib/auth.ts`:
- `session:` block at `:129-135` — `expiresIn` and `fields.token` mapping unchanged.
- `anonymous({ emailDomainName, onLinkAccount })` — untouched, body intact.
- `socialProviders.google` — only `...getGoogleOAuthConfig()`, no `onAccountCreated`.
- `databaseHooks.user.create.after` — present at top level.
- `polarPlugin({ client, createCustomerOnSignUp, use: [...] })` — modular form.
- All five webhook handler bodies present and unchanged from the pre-migration versions.

## Test plan

This plan is a migration; it does not add new tests. Verification is regression-based:

- `pnpm exec tsc --noEmit` → zero new errors vs baseline.
- `pnpm test:unit:ci` → no new failures vs baseline (the existing chat-seam tests at `__tests__/lib/chatStateSeams.test.ts` exercise session-dependent paths).
- `pnpm build` → same outcome as baseline.
- The green test suite is NOT sufficient evidence on its own (tests mock `lib/auth.ts`). The build + tsc are the authoritative signals — that's why the prior Plan 004 attempt blocked on build even with a green suite.

A follow-up plan should add characterization tests for `lib/polar.ts` and the webhook handlers (audit finding: "no tests for `lib/polar.ts`") — out of scope here.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `pnpm list better-auth` reports `>=1.6.11`
- [ ] `pnpm list @polar-sh/better-auth` reports `1.8.4` (or `>=1.8.1`)
- [ ] `pnpm list @polar-sh/sdk` reports `>=0.47.0`
- [ ] `pnpm audit --prod` shows no advisories whose path starts with `.>better-auth`
- [ ] `grep -n "onAccountCreated" lib/auth.ts` returns no matches
- [ ] `grep -n "databaseHooks" lib/auth.ts` returns a match
- [ ] `grep -n "enableCustomerPortal\|checkout: {\|webhooks: {" lib/auth.ts` returns no matches in the polarPlugin block (flat keys gone)
- [ ] `grep -n "use: \[" lib/auth.ts` returns a match in the polarPlugin block
- [ ] The five webhook handler names (`onPayload`, `onSubscriptionCreated`, `onOrderCreated`, `onSubscriptionCanceled`, `onSubscriptionRevoked`) are all present inside the new `webhooks({...})`
- [ ] `pnpm exec tsc --noEmit` error count equals the Step 1 baseline (zero new errors)
- [ ] `pnpm lint` exits 0
- [ ] `pnpm test:unit:ci` exits 0 (no new failures vs baseline)
- [ ] `pnpm build` outcome matches baseline (no NEW failure tracing to auth/polar)
- [ ] If `@better-auth/cli generate` proposed schema changes, an additive migration exists under `drizzle/`; otherwise `auth-schema.ts` is unchanged
- [ ] No files outside the in-scope list are modified (`git status` — expect `package.json`, `pnpm-lock.yaml`, `lib/auth.ts`, possibly the 3 test files, possibly `auth-schema.ts` + a `drizzle/*.sql`)
- [ ] `plans/README.md` status row updated (SKIP — reviewer maintains index)

## STOP conditions

Stop and report back (do not improvise) if:

- `pnpm add better-auth@^1.6.11 @polar-sh/better-auth@1.8.4 @polar-sh/sdk@^0.47.0` fails to resolve, or resolves to versions outside the targets. Report the resolved versions.
- `@polar-sh/better-auth@1.8.4` has a peer-dep range that rejects `better-auth@1.6.11` or `@polar-sh/sdk@0.47.0` (install error or unmet peer warning). Report.
- `pnpm exec @better-auth/cli generate` proposes **breaking** schema changes (dropped columns, renames, non-additive). Report; do not apply.
- The `polarPlugin` modular API in 1.8.4 differs from what's documented in "Current state" (e.g., `WebhooksOptions` is missing one of the five handler names, or `portal()` requires args). Report the actual type shape.
- After Step 4+5, `pnpm exec tsc --noEmit` reports errors in `lib/auth.ts` that indicate a *new* API change beyond `polarPlugin` and `onAccountCreated` (e.g., `session.fields` rejected, `anonymous.onLinkAccount` signature changed). Report the errors; do not refactor further.
- The `getSession` mock fix in Step 6 doesn't fully resolve the test type errors (i.e., there are *other* better-auth type changes cascading into the tests beyond the mock signature). Report the remaining errors.
- `pnpm build` post-migration fails for a reason that traces to auth/polar and is NOT the pre-existing `Missing AUTH_SECRET` baseline. Report the new failure.
- `pnpm test:unit:ci` shows **new** failures (not in the Step 1 baseline) in auth/session/chat tests.

## Maintenance notes

- **The green unit suite is not sufficient evidence.** Tests mock `lib/auth.ts`, so they don't exercise the real better-auth plugin loading path. The build + tsc are authoritative. A prior attempt (Plan 004) shipped a green suite alongside a broken build — do not repeat that mistake.
- **Finding #16 (POLAR_WEBHOOK_SECRET fails open) is intentionally NOT fixed here** — the `|| ''` is preserved at the new `webhooks({ secret: ... })` site to keep scope tight. Land #16 as a separate one-liner plan after this one merges.
- **Pre-existing inconsistency (NOT caused by this migration):** `lib/auth.ts:132` maps `session.fields.token: "sessionToken"`, but `auth-schema.ts:17` defines the column as `token`. This may mean session-token reads/writes are misaligned. Flagged by the investigation; worth a separate look but explicitly out of scope here.
- **`@better-auth/cli` was left at `^1.2.7`** (resolves to 1.4.21). It works with 1.6.x runtime because it imports better-auth symbols via bare specifiers that resolve to the user-installed version. An optional cosmetic bump to `^1.4.21` is fine but unnecessary.
- **After landing**, the operator MUST redeploy and verify in staging: Google OAuth sign-in (new user → confirm `messageLimit: 20` is set on the `users.metadata`), anonymous sign-in, anonymous→authenticated account linking (preset-migration block), a Polar checkout flow (monthly + yearly), and a Polar webhook delivery (subscription.created → confirm `hasSubscription`/`subscriptionType` metadata is set). The webhook handler bodies are ported verbatim, but their *wiring* changed — that's the highest-risk surface to smoke-test.
- **Reviewer focus:** (1) the five webhook handler bodies are byte-identical to the pre-migration versions (only nesting changed); (2) `databaseHooks.user.create.after` fires for all signups as intended; (3) `checkout.returnUrl` (the renamed `errorUrl`) preserves the post-cancel landing behavior.

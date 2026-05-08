# Better Auth Best-Practices Remediation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Bring ChatLima's Better Auth integration closer to current Better Auth best practices while preserving the existing Google OAuth, anonymous-user, Polar billing, and admin flows.

**Architecture:** Keep auth centralized in `lib/auth.ts`, keep Better Auth's Next.js route mounted at `app/api/auth/[...betterauth]/route.ts`, and make small, testable changes around configuration, origins, schema drift, logging, and webhook hardening. Avoid rewrites; prefer conservative changes that reduce security/configuration risk.

**Tech Stack:** Next.js 15 App Router, TypeScript, Better Auth, Drizzle ORM, PostgreSQL/Neon, Polar billing, Google OAuth.

---

## Context

This plan follows a read-only auth review performed on 2026-05-08. The review found that ChatLima's auth setup is functional and broadly follows Better Auth's expected integration pattern:

- `lib/auth.ts` centralizes Better Auth configuration.
- `app/api/auth/[...betterauth]/route.ts` correctly exports `GET` and `POST` via `toNextJsHandler(auth.handler)`.
- Server routes generally use `auth.api.getSession({ headers })`.
- Drizzle adapter is configured with explicit Better Auth table mapping.
- Google OAuth, anonymous users, Polar billing, and DB-backed admin checks are in place.

The main gaps are configuration drift, overly broad trusted origins, stale generated schema, verbose sensitive logging, and webhook secret handling.

## Non-goals

- Do not replace Better Auth.
- Do not redesign billing or credits.
- Do not remove anonymous auth unless billing policy requires it separately.
- Do not alter database tables without a migration and explicit verification.
- Do not upgrade Better Auth in the same PR as the config hardening unless the team chooses a dedicated upgrade window.

## Current findings to address

1. `sessionMaxAge` in `lib/auth.ts` is likely ignored; Better Auth expects `session.expiresIn`.
2. `baseURL` / `BETTER_AUTH_URL` is not explicitly configured.
3. `trustedOrigins` includes broad `https://*.vercel.app`.
4. `auth-schema.ts` is stale and diverges from `lib/db/schema.ts`.
5. Better Auth plugin imports use aggregate plugin paths.
6. Auth secret uses `AUTH_SECRET`, not the Better Auth standard `BETTER_AUTH_SECRET`, and length is not validated.
7. Auth/session/webhook logging may leak sensitive data in production logs.
8. Custom anonymous sign-in forwarding route can drift from Better Auth endpoint behavior.
9. Polar webhook secret falls back to an empty string.

---

## Task 1: Fix session expiry configuration

**Objective:** Make the intended 30-day session expiry use Better Auth's current `session.expiresIn` option instead of the likely ignored top-level `sessionMaxAge`.

**Files:**

- Modify: `lib/auth.ts`
- Test/inspect: `node_modules/better-auth/dist/shared/*.d.ts` only if API confirmation is needed

**Steps:**

1. In `lib/auth.ts`, remove the top-level `sessionMaxAge` option.
2. Add `expiresIn: 30 * 24 * 60 * 60` inside the existing `session` object.
3. Preserve the existing field mapping:

```ts
session: {
  expiresIn: 30 * 24 * 60 * 60,
  fields: {
    token: "sessionToken",
  },
},
```

4. Run:

```bash
pnpm exec tsc --noEmit --pretty false
```

**Expected:** No new auth-related type errors. Existing unrelated test type errors may remain unless fixed separately.

5. Manually verify that `SPEC.md` still matches the intended 30-day session expiry.

**Commit suggestion:**

```bash
git add lib/auth.ts
git commit -m "fix(auth): use Better Auth session expiry option"
```

---

## Task 2: Add explicit Better Auth base URL strategy

**Objective:** Stop relying on request inference for Better Auth's base URL, especially for OAuth callback and trusted-origin stability.

**Files:**

- Modify: `lib/auth.ts`
- Modify: `.env.example` if present, otherwise project docs that list env vars (`AGENTS.md`, `CLAUDE.md`, or `SPEC.md`)

**Steps:**

1. Add a small helper in `lib/auth.ts` that resolves the base URL from env:

```ts
const getAuthBaseURL = () => {
  if (process.env.BETTER_AUTH_URL) {
    return process.env.BETTER_AUTH_URL;
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  return process.env.NODE_ENV === "production"
    ? "https://www.chatlima.com"
    : "http://localhost:3000";
};
```

2. Add this to the Better Auth config:

```ts
baseURL: getAuthBaseURL(),
```

3. Add `BETTER_AUTH_URL` to environment documentation.

4. Verify production deploy config has:

```bash
BETTER_AUTH_URL=https://www.chatlima.com
```

5. Run:

```bash
pnpm exec tsc --noEmit --pretty false
```

**Expected:** No new auth-related type errors.

**Commit suggestion:**

```bash
git add lib/auth.ts AGENTS.md CLAUDE.md SPEC.md
git commit -m "fix(auth): configure explicit Better Auth base URL"
```

Only stage the docs files actually modified.

---

## Task 3: Narrow trusted origins

**Objective:** Reduce CSRF/OAuth trust surface by replacing the global Vercel wildcard with tighter project/environment-specific origins.

**Files:**

- Modify: `lib/auth.ts`

**Steps:**

1. In `getTrustedOrigins`, keep explicit stable origins:

```ts
const origins = [
  "http://localhost:3000",
  "https://www.chatlima.com",
  "https://preview.chatlima.com",
];
```

2. Keep explicit deployment origins from environment:

```ts
if (process.env.VERCEL_URL) {
  origins.push(`https://${process.env.VERCEL_URL}`);
}

if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
  origins.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
}
```

3. Remove this broad origin:

```ts
origins.push("https://*.vercel.app");
```

4. If previews require wildcard support, replace it with a project-scoped pattern only after confirming ChatLima's exact Vercel preview hostname pattern.

5. Run:

```bash
pnpm exec tsc --noEmit --pretty false
```

6. Test OAuth in:

- Local dev: `http://localhost:3000`
- Production: `https://www.chatlima.com`
- One real Vercel preview deployment

**Commit suggestion:**

```bash
git add lib/auth.ts
git commit -m "fix(auth): narrow trusted origins"
```

---

## Task 4: Standardize and validate auth secret env handling

**Objective:** Support Better Auth's standard `BETTER_AUTH_SECRET` while preserving backward compatibility with the existing `AUTH_SECRET` deploy secret.

**Files:**

- Modify: `lib/auth.ts`
- Modify: environment docs (`AGENTS.md`, `CLAUDE.md`, `SPEC.md`) as needed

**Steps:**

1. Add a helper:

```ts
const getAuthSecret = () => {
  const secret = process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("Missing BETTER_AUTH_SECRET or AUTH_SECRET environment variable");
  }

  if (secret.length < 32) {
    throw new Error("Better Auth secret must be at least 32 characters");
  }

  return secret;
};
```

2. Replace direct secret checks and config usage:

```ts
secret: getAuthSecret(),
```

3. Update docs to say:

- Preferred: `BETTER_AUTH_SECRET`
- Backward-compatible fallback: `AUTH_SECRET`
- Generate with: `openssl rand -base64 32`

4. Confirm production secrets include at least one valid value.

5. Run:

```bash
pnpm exec tsc --noEmit --pretty false
```

**Commit suggestion:**

```bash
git add lib/auth.ts AGENTS.md CLAUDE.md SPEC.md
git commit -m "fix(auth): standardize Better Auth secret handling"
```

---

## Task 5: Redact sensitive auth and webhook logging

**Objective:** Remove or gate logs that may expose sessions, users, cookies, headers, OAuth tokens, or webhook signatures.

**Files:**

- Modify: `lib/auth.ts`
- Modify: `app/admin/page.tsx`
- Modify: `app/api/auth/polar/route.ts`
- Optionally modify/create a logging utility if the project already has one suitable for redaction

**Steps:**

1. Replace full session/user logs in `app/admin/page.tsx` with minimal status logs or remove them entirely:

```ts
console.log("Admin page - Session present:", Boolean(session?.user?.id));
```

2. In `lib/auth.ts`, remove full `anonymousUser` and `newUser` JSON logs from `onLinkAccount`.

3. Replace with minimal IDs only:

```ts
console.log("Linking anonymous user to authenticated user", {
  anonymousId: anonymousUser.user?.id,
  newUserId: newUser.user?.id,
});
```

4. In `app/api/auth/polar/route.ts`, remove full body/header logging. If this route is only diagnostic, consider deleting it after confirming the real plugin webhook path is `app/api/auth/polar/webhooks/route.ts`.

5. If retaining diagnostics, redact sensitive headers:

```ts
const safeHeaders = Array.from(req.headers.entries()).filter(
  ([key]) => !["authorization", "cookie", "set-cookie", "polar-webhook-signature"].includes(key.toLowerCase())
);
```

6. Run:

```bash
pnpm exec tsc --noEmit --pretty false
```

**Commit suggestion:**

```bash
git add lib/auth.ts app/admin/page.tsx app/api/auth/polar/route.ts
git commit -m "fix(auth): redact sensitive auth logs"
```

---

## Task 6: Require Polar webhook secret in production

**Objective:** Avoid silently using an empty webhook secret in production.

**Files:**

- Modify: `lib/auth.ts`
- Modify: environment docs as needed

**Steps:**

1. Add helper:

```ts
const getPolarWebhookSecret = () => {
  const secret = process.env.POLAR_WEBHOOK_SECRET;

  if (process.env.NODE_ENV === "production" && !secret) {
    throw new Error("Missing POLAR_WEBHOOK_SECRET environment variable in production");
  }

  return secret || "";
};
```

2. Replace:

```ts
secret: process.env.POLAR_WEBHOOK_SECRET || "",
```

with:

```ts
secret: getPolarWebhookSecret(),
```

3. Add `POLAR_WEBHOOK_SECRET` to required production environment documentation.

4. Confirm Vercel/production has the secret configured before deployment.

5. Run:

```bash
pnpm exec tsc --noEmit --pretty false
```

**Commit suggestion:**

```bash
git add lib/auth.ts AGENTS.md CLAUDE.md SPEC.md
git commit -m "fix(auth): require Polar webhook secret in production"
```

---

## Task 7: Reconcile or remove stale generated auth schema

**Objective:** Prevent future migrations from being generated from a stale `auth-schema.ts` that diverges from the runtime Drizzle schema.

**Files:**

- Inspect: `auth-schema.ts`
- Inspect: `lib/db/schema.ts`
- Modify: either `auth-schema.ts` or documentation explaining it is historical/do-not-use

**Steps:**

1. Decide whether `auth-schema.ts` is still used by the team.
2. If unused, remove it or rename it to make it clearly historical.
3. If used, regenerate using Better Auth CLI after current plugins are configured:

```bash
npx @better-auth/cli@latest generate --config ./lib/auth.ts
```

4. Compare generated fields against `lib/db/schema.ts`. Pay special attention to:

- `emailVerified` vs `email_verified`
- `createdAt` vs `created_at`
- `expiresAt` vs `expires_at`
- `sessionToken` vs `token`
- `userId` vs `user_id`
- anonymous plugin fields

5. Do not apply generated migrations blindly. Create a deliberate Drizzle migration only if the real DB schema needs to change.

6. Run:

```bash
pnpm exec tsc --noEmit --pretty false
```

**Commit suggestion:**

```bash
git add auth-schema.ts lib/db/schema.ts drizzle/
git commit -m "chore(auth): reconcile Better Auth generated schema"
```

Only stage files actually changed.

---

## Task 8: Switch Better Auth plugin imports to dedicated paths

**Objective:** Follow Better Auth tree-shaking guidance by importing plugins from dedicated paths where available for the installed version.

**Files:**

- Modify: `lib/auth.ts`
- Modify: `lib/auth-client.ts`

**Steps:**

1. Confirm the installed Better Auth version exposes the dedicated anonymous plugin paths.
2. Replace aggregate imports if supported:

```ts
import { anonymous } from "better-auth/plugins/anonymous";
import { anonymousClient } from "better-auth/client/plugins/anonymous";
```

3. If the installed version does not expose these exact paths, defer this task until the Better Auth upgrade task.

4. Run:

```bash
pnpm exec tsc --noEmit --pretty false
```

5. Smoke test anonymous sign-in locally.

**Commit suggestion:**

```bash
git add lib/auth.ts lib/auth-client.ts
git commit -m "chore(auth): use dedicated Better Auth plugin imports"
```

---

## Task 9: Reduce custom anonymous endpoint drift

**Objective:** Keep the billing-enforcement behavior while minimizing manual forwarding logic around Better Auth's anonymous endpoint.

**Files:**

- Inspect/modify: `app/api/auth/sign-in/anonymous/route.ts`
- Inspect: Better Auth anonymous plugin docs for current hook/middleware options

**Steps:**

1. Confirm why the custom route exists: it blocks anonymous sign-in when `BILLING_ENFORCED === "true"`.
2. Check whether Better Auth endpoint hooks can block `/sign-in/anonymous` before the anonymous plugin executes.
3. If hooks can support this cleanly, move the guard into `lib/auth.ts` using Better Auth middleware/hooks.
4. If not, keep the custom route but simplify it:

- No extra success logs in production.
- No body/error dumps that may leak request details.
- Add tests that assert `BILLING_ENFORCED=true` returns `403`.
- Add tests that assert normal anonymous sign-in is still forwarded.

5. Run targeted tests if available, then type-check:

```bash
pnpm exec tsc --noEmit --pretty false
```

**Commit suggestion:**

```bash
git add app/api/auth/sign-in/anonymous/route.ts __tests__/
git commit -m "fix(auth): harden anonymous sign-in gate"
```

---

## Task 10: Plan and execute a separate Better Auth upgrade

**Objective:** Upgrade Better Auth from the currently installed `^1.2.7` line to the latest stable version in a dedicated PR after config hardening is complete.

**Files:**

- Modify: `package.json`
- Modify: lockfile
- Potentially modify: `lib/auth.ts`, `lib/auth-client.ts`, generated schema/migrations

**Steps:**

1. Check the latest version:

```bash
npm view better-auth version
```

2. Review Better Auth changelog/migration notes between the current installed version and latest.
3. Upgrade in a dedicated branch:

```bash
pnpm add better-auth@latest @better-auth/cli@latest
```

4. Re-run schema generation after all plugins are configured:

```bash
npx @better-auth/cli@latest generate --config ./lib/auth.ts
```

5. Run:

```bash
pnpm exec tsc --noEmit --pretty false
pnpm test:unit
```

6. Smoke test:

- Google sign-in
- Anonymous sign-in
- Anonymous-to-Google account linking
- Admin page access
- Credits endpoint
- Polar checkout and webhook flow in sandbox

**Commit suggestion:**

```bash
git add package.json pnpm-lock.yaml package-lock.json lib/auth.ts lib/auth-client.ts auth-schema.ts drizzle/
git commit -m "chore(auth): upgrade Better Auth"
```

Only stage files that actually changed.

---

## Verification checklist for the full remediation

- [ ] `session.expiresIn` is used and `sessionMaxAge` is gone.
- [ ] `BETTER_AUTH_URL` or explicit `baseURL` is configured for production.
- [ ] `trustedOrigins` no longer trusts all `*.vercel.app` deployments.
- [ ] Auth secret is at least 32 chars and supports `BETTER_AUTH_SECRET`.
- [ ] Production requires `POLAR_WEBHOOK_SECRET`.
- [ ] Auth/session/webhook logs do not include full session objects, cookies, authorization headers, webhook signatures, OAuth tokens, or full webhook bodies.
- [ ] `auth-schema.ts` is either reconciled or clearly removed/deprecated.
- [ ] Anonymous auth still works when billing enforcement is disabled.
- [ ] Anonymous auth returns `403` when `BILLING_ENFORCED=true`.
- [ ] Google OAuth sign-in still works locally and in production.
- [ ] Anonymous-to-Google linking migrates presets as before.
- [ ] Admin routes require DB-confirmed admin status.
- [ ] Credits and Polar checkout still work.

## Suggested implementation order

1. Task 1: Session expiry option.
2. Task 4: Secret env handling.
3. Task 6: Polar webhook secret.
4. Task 5: Sensitive log redaction.
5. Task 2: Explicit base URL.
6. Task 3: Trusted origin narrowing.
7. Task 7: Auth schema reconciliation.
8. Task 8: Dedicated plugin imports.
9. Task 9: Anonymous endpoint hardening.
10. Task 10: Better Auth upgrade in a separate PR.

## Notes from current type-check baseline

A review-time type-check was run with:

```bash
pnpm exec tsc --noEmit --pretty false
```

It reported existing non-auth test type errors:

- `AccessPolicyFlags` test objects missing newer web-fetch fields.
- `WebFetchError` test mocks missing `status`, `name`, and `message`.

Treat those as existing baseline issues unless they are fixed separately. Auth remediation should not introduce new type errors.

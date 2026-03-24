# Pricing & Access Gating Plan

## Goal

Update ChatLima pricing/access so that:

1. Monthly subscription changes from **$10/month** to **$9/month**.
2. Existing **$10/year** plan is **archived**.
3. New **$90/year** plan is introduced.
4. **Free tier is removed** (hard block), including:
   - anonymous users
   - signed-in Google users without paid access
5. Users with their own **OpenRouter API key** can still use chat without paid subscription (existing BYOK behavior remains).
6. Feature control is moved behind **environment-variable-driven gating** for future on/off control.

---

## Current-state findings (from codebase scan)

- Billing/subscription integration appears tied to **Polar** in code (`/api/auth/checkout/*`, subscription helpers, envs like `POLAR_PRODUCT_ID`, `POLAR_PRODUCT_ID_YEARLY`).
- Plan slugs currently used in UI:
  - monthly: `ai-usage`
  - yearly: `free-models-unlimited`
- Access logic is distributed across multiple places, notably:
  - `app/api/chat/route.ts`
  - `app/api/models/route.ts`
  - `lib/services/chatCreditValidationService.ts`
  - preset validation routes (`app/api/presets/*`)
  - anonymous sign-in flow (`components/auth/AnonymousAuth.tsx`, `app/api/auth/sign-in/anonymous/route.ts`)
- UI and docs still describe current free/anonymous and old yearly messaging:
  - `app/upgrade/page.tsx`
  - `app/faq/page.tsx`
  - `README.md`, `SPEC.md`

---

## Product behavior target

### Access decision rules (target)

A user can chat **only if** one of the following is true:

1. User has an active paid subscription (monthly or yearly), or
2. User has valid BYOK for OpenRouter (`OPENROUTER_API_KEY` in user key store) and BYOK bypass is enabled.

Otherwise: hard block with upgrade/paywall message.

### Free tier removal

- Anonymous users: blocked from chat by default (unless explicit future flag says otherwise).
- Google-authenticated users without paid subscription: blocked from chat by default.
- Daily free message path should be disabled when enforcement is on.

---

## Proposed environment variables

Add centralized feature flags (defaults shown for target launch):

```bash
# Master paywall enforcement
BILLING_ENFORCED=true

# Allow users with their own OpenRouter key to bypass paid plan requirement
ALLOW_OPENROUTER_BYPASS=true

# Anonymous access controls
ALLOW_ANONYMOUS_ACCESS=false
ALLOW_ANONYMOUS_CHAT=false

# Non-subscriber authenticated users
ALLOW_NON_SUBSCRIBER_GOOGLE_CHAT=false
```

### Notes

- `BILLING_ENFORCED=false` should effectively revert to legacy behavior.
- Keep these flags checked in one shared helper to avoid logic drift.

---

## Dashboard/Billing changes (non-code)

> You noted these need to be done in dashboard; this plan assumes Polar/admin dashboard updates are part of rollout.

1. Update monthly plan pricing from **$10 → $9** (same plan slug if possible).
2. Archive old yearly plan (**$10/year**).
3. Create new yearly plan (**$90/year**) and map to yearly product env (`POLAR_PRODUCT_ID_YEARLY` or replacement).
4. Confirm checkout slugs still match app routes (or update app slugs accordingly).
5. Verify webhooks and metadata mapping still identify `monthly` vs `yearly` correctly.

---

## Implementation plan (code)

## Phase 1 — Centralize access policy

Create a single source of truth, e.g.:

- `lib/config/access-policy.ts` (env parsing)
- `lib/services/accessGateService.ts` (decision engine)

Primary helper:

- `canUserChat({ isAnonymous, isSubscribed, subscriptionType, hasOpenRouterByok, flags }) => { allowed, reason, action }`

This helper will be consumed by all server routes that currently enforce access.

## Phase 2 — Enforce server-side gating

Apply centralized checks to:

1. `app/api/chat/route.ts`
   - early block before model execution when disallowed
2. `app/api/models/route.ts`
   - return only allowed models or explicit paywalled response state
3. `app/api/presets/*`
   - prevent saving/validating presets that imply blocked usage paths
4. `app/api/usage/messages/route.ts` and related usage surfaces
   - reflect paywall state instead of free-usage assumptions

## Phase 3 — Anonymous flow hard-block

1. Disable auto-anonymous sign-in path when paywall is active:
   - `components/auth/AnonymousAuth.tsx`
   - `app/api/auth/sign-in/anonymous/route.ts` handling/guards
2. Ensure anonymous sessions cannot start chats when `ALLOW_ANONYMOUS_CHAT=false`.

## Phase 4 — BYOK bypass preservation

1. Keep existing user API key detection for OpenRouter.
2. Ensure access gate explicitly allows non-subscribers with valid OpenRouter BYOK when `ALLOW_OPENROUTER_BYPASS=true`.
3. Ensure billing/credit deduction paths do not incorrectly block BYOK users.

## Phase 5 — Upgrade and pricing UI refresh

Update:

- `app/upgrade/page.tsx`
- checkout button defaults (`components/checkout-button.tsx`)
- copy in `app/faq/page.tsx`

Changes:

- Monthly shown as **$9/month**.
- Yearly shown as **$90/year**.
- Remove references implying free anonymous/default chat access.
- Clarify BYOK exception path.

## Phase 6 — Tests and safeguards

Add/update tests for access matrix:

1. Anonymous + no subscription + no BYOK → blocked
2. Google user + no subscription + no BYOK → blocked
3. Google user + no subscription + BYOK + bypass on → allowed
4. Subscribed user (monthly/yearly) → allowed
5. `BILLING_ENFORCED=false` → legacy behavior path

Target tests:

- `__tests__/services/*` for policy helper
- route-level tests for `/api/chat`, `/api/models`
- existing anonymous/security tests to align with new policy

---

## Rollout sequence

1. Ship code with flags and set `BILLING_ENFORCED=false` initially.
2. Configure dashboard plans (9/month, archive 10/year, create 90/year).
3. Set/verify product IDs and checkout slug mapping.
4. Enable `BILLING_ENFORCED=true` in staging; run matrix tests.
5. Production enablement:
   - turn on enforcement
   - monitor auth failures, chat-block events, checkout conversion, webhook health
6. If needed, quick rollback via `BILLING_ENFORCED=false`.

---

## Risks & mitigations

1. **Logic split across routes**
   - Mitigation: central helper + shared error/reason codes.
2. **Mismatch between dashboard plan IDs and app slugs**
   - Mitigation: pre-launch verification checklist + smoke test checkout.
3. **Unexpected lockout of legitimate users**
   - Mitigation: feature-flag rollback, clear user messaging, logging on deny reasons.
4. **Anonymous/session edge cases**
   - Mitigation: explicit tests for anonymous sign-in and chat attempts.

---

## Open items to confirm during implementation

1. Whether old yearly subscribers are grandfathered or migrated manually to new $90/year plan.
2. Whether yearly plan still means “free-models-only” or changes to match monthly capability.
3. Final env var names (adopt above or align with existing project naming conventions).
4. Whether checkout slug names remain unchanged or should be updated for clarity.

---

## Deliverables

1. New plan doc: `docs/pricing-access-gating-plan.md` (this file)
2. Follow-up implementation PR(s):
   - access policy centralization
   - route enforcement updates
   - UI pricing and copy updates
   - test updates
   - docs refresh (`README.md`, `SPEC.md`)

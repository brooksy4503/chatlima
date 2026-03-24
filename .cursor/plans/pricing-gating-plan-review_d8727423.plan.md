---
name: pricing-gating-plan-review
overview: Validate and tighten the existing pricing/access gating plan with provider-complete BYOK behavior, simplified env flags, and concrete file-level implementation steps aligned to current code paths.
todos:
  - id: update-byok-scope
    content: Revise plan to provider-matched BYOK bypass for all supported providers
    status: completed
  - id: simplify-flags
    content: Reduce proposed env flags to BILLING_ENFORCED and ALLOW_BYOK_BYPASS
    status: completed
  - id: yearly-semantic-fix
    content: Update plan to yearly-equals-monthly capability model and remove yearly-free-model assumptions
    status: completed
  - id: anonymous-hardblock-paths
    content: Add explicit plan steps for disabling AnonymousAuth and anonymous sign-in route when enforced
    status: completed
  - id: models-gating-parity
    content: Add plan step to align /api/models BYOK filtering with all provider keys
    status: completed
  - id: tests-observability
    content: Expand test matrix and add deny-reason instrumentation recommendations
    status: completed
isProject: false
---

# Pricing Access Plan Corrections

## What to Correct in Current Plan

- Expand BYOK bypass scope from OpenRouter-only to provider-matched BYOK for all supported providers, matching current chat path behavior and your decision:
  - `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GROQ_API_KEY`, `XAI_API_KEY`, `OPENROUTER_API_KEY`, `REQUESTY_API_KEY`.
- Update yearly plan target behavior to **equivalent access to monthly** (your selected direction), which means removing existing “yearly = unlimited free models only” assumptions.
- Remove daily free-message fallback assumptions from gating when billing enforcement is on (current logic still falls back heavily to daily limits).

## Minimal Env-Var Design (avoid overcomplication)

Use only 2 new flags:

- `BILLING_ENFORCED=true`
- `ALLOW_BYOK_BYPASS=true`

And keep existing billing vars unchanged:

- `POLAR_PRODUCT_ID` (monthly)
- `POLAR_PRODUCT_ID_YEARLY` (yearly)
- existing checkout slugs can remain (`ai-usage`, `free-models-unlimited`) unless you want a cosmetic rename.

Do **not** add extra flags like `ALLOW_ANONYMOUS_ACCESS`, `ALLOW_ANONYMOUS_CHAT`, `ALLOW_NON_SUBSCRIBER_GOOGLE_CHAT` unless you explicitly need independent toggles; they are redundant under a strict paid-or-BYOK gate.

## Code Areas to Align

- Central access policy helper:
  - [lib/services/chatCreditValidationService.ts](/Users/garthscaysbrook/Code/chatlima/lib/services/chatCreditValidationService.ts)
  - [app/api/chat/route.ts](/Users/garthscaysbrook/Code/chatlima/app/api/chat/route.ts)
- Model-list gating BYOK parity (currently OpenRouter/Requesty-focused):
  - [app/api/models/route.ts](/Users/garthscaysbrook/Code/chatlima/app/api/models/route.ts)
- Anonymous auto-signin hard-block when billing enforced:
  - [app/providers.tsx](/Users/garthscaysbrook/Code/chatlima/app/providers.tsx)
  - [components/auth/AnonymousAuth.tsx](/Users/garthscaysbrook/Code/chatlima/components/auth/AnonymousAuth.tsx)
  - [app/api/auth/sign-in/anonymous/route.ts](/Users/garthscaysbrook/Code/chatlima/app/api/auth/sign-in/anonymous/route.ts)
- Subscription semantics updates for yearly=monthly capability:
  - [lib/auth.ts](/Users/garthscaysbrook/Code/chatlima/lib/auth.ts)
  - [lib/polar.ts](/Users/garthscaysbrook/Code/chatlima/lib/polar.ts)
  - [app/api/usage/messages/route.ts](/Users/garthscaysbrook/Code/chatlima/app/api/usage/messages/route.ts)
- Pricing/UI and copy consistency:
  - [app/upgrade/page.tsx](/Users/garthscaysbrook/Code/chatlima/app/upgrade/page.tsx)
  - [components/checkout-button.tsx](/Users/garthscaysbrook/Code/chatlima/components/checkout-button.tsx)
  - [app/faq/page.tsx](/Users/garthscaysbrook/Code/chatlima/app/faq/page.tsx)
  - [SPEC.md](/Users/garthscaysbrook/Code/chatlima/SPEC.md)

## Additional Suggestions

- Keep plan slugs stable for rollout safety; only change product IDs/prices in Polar first.
- Add explicit deny reasons in API responses (`PAYWALL_SUBSCRIPTION_REQUIRED`, `PAYWALL_BYOK_REQUIRED`) for cleaner UX analytics and support.
- Add metrics counters for blocked-chat attempts by reason and BYOK-provider usage; this is important right after enforcement flip.
- Add regression tests for provider-matched BYOK matrix (not just OpenRouter/Requesty).

## Rollout Order

1. Ship gating code paths with `BILLING_ENFORCED=false`.
2. Update Polar prices/products (`$9/mo`, new `$90/yr`) and map env product IDs.
3. Verify checkout for both slugs without changing slug names.
4. Enable `BILLING_ENFORCED=true` in staging and run access matrix tests.
5. Enable in production; monitor deny reasons + checkout conversion + webhook processing.
6. Roll back instantly by setting `BILLING_ENFORCED=false` if needed.

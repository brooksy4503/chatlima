# AGENTS.md

## Cursor Cloud specific instructions

### Application Overview

This is a Next.js 15 (App Router + Turbopack) AI chatbot with PostgreSQL (Neon Serverless), Better Auth, Polar billing, and 300+ AI models via OpenRouter/Requesty/Anthropic/OpenAI/Groq/XAI. See `README.md` for full feature details.

### Source of Truth and Regression Prevention

`SPEC.md` is the source of truth for product behavior, architecture, database schema, API contracts, AI provider behavior, credit/billing rules, and MCP support.

Before implementing features, refactors, or architectural changes:
- Consult `SPEC.md` for the affected area before editing.
- Identify existing behavior that must be preserved.
- Do not remove or simplify existing features unless the user explicitly asks for that.
- If the requested change conflicts with `SPEC.md`, stop and flag the conflict before editing.
- After significant behavior changes, update `SPEC.md` in the same change.

High-risk areas require extra care: authentication, anonymous usage limits, subscriptions and credits, chat persistence, message streaming, model/provider routing, API key handling, MCP tools, file upload/readers, and admin flows.

### Plan Execution (multi-step features)

When implementing work from `.cursor/plans/*.plan.md` or other multi-step feature plans, follow `.cursor/rules/plan-execution.mdc`.

Key requirements:
- Implement **one plan step at a time**; do not batch the whole plan in one session unless the user explicitly approves each gate.
- Respect plan sequencing (e.g. extract/refactor before feature UI; tests before marking a step done).
- Do not mark plan todos `completed` without tests run, behavior verified, and no dead/unwired code left behind.
- For chat persistence, streaming, schema, billing, or client/server sync: add **seam tests** (refetch vs in-memory state, stale DB, streaming guards), not only pure-function unit tests.
- Stop and report after each gate with verification output; wait for user confirmation before the next step.

Recommended prompt for large features:

> Implement **only the first plan todo**. Stop when tests pass and report manual verification steps. Do not start the next todo until I confirm.

### Regression testing and CI

See [`docs/REGRESSION_TESTING.md`](docs/REGRESSION_TESTING.md) for the full guide.

- **CI gate (PR + main)**: `.github/workflows/ci.yml` runs `pnpm lint`, `pnpm test:unit:ci`, `pnpm build`, and Playwright basic/branching specs.
- **Stable unit suite**: `pnpm test:unit:ci` uses `jest.config.ci.js` (lib, services, API, chat seam tests). Full `pnpm test:unit` still includes component suites with pre-existing failures.
- **Chat seam regressions**: extend `__tests__/lib/chatStateSeams.test.ts` when fixing client ↔ DB ↔ stream sync bugs.
- **Local pre-push** (one-time setup): `git config core.hooksPath .githooks && chmod +x .githooks/pre-push scripts/pre-push-check.sh` — then `git push` runs `pnpm pre-push`, or run `pnpm pre-push` manually.
- **PR checklist**: `.github/pull_request_template.md`

### Running the Dev Server

```bash
pnpm dev          # starts on port 3000
pnpm dev:fresh    # clears .next cache first
```

Always check port 3000 is free before starting (`lsof -ti:3000`). See `.cursor/rules/dev-server-check.mdc` for details.

### Required Environment Variables

The app will crash on startup without these (all injected via secrets):
- `DATABASE_URL`, `AUTH_SECRET`, `POLAR_ACCESS_TOKEN`, `POLAR_PRODUCT_ID`, `SUCCESS_URL`
- At least one AI provider key (e.g. `OPENROUTER_API_KEY`, `REQUESTY_API_KEY`)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID_DEV`, `GOOGLE_CLIENT_SECRET_DEV` (for dev OAuth)

### Lint / Test / Build Commands

See `CLAUDE.md` and `package.json` scripts for the full list. Key commands:

- **Lint**: `pnpm lint`
- **Build**: `pnpm build`
- **Unit tests (CI/stable)**: `pnpm test:unit:ci`
- **Unit tests (full)**: `pnpm test:unit` (Jest — some pre-existing component test failures)
- **Pre-push gate**: `pnpm pre-push` (lint + test:unit:ci + build)
- **E2E basic UI**: `pnpm test:basic -- --project=basic-ui-chrome`
- **E2E CI smoke**: `pnpm test:ci:e2e`
- **E2E anonymous**: `pnpm test:anonymous` (sends real AI requests, takes time)
- **Playwright browsers**: run `pnpm test:install-browsers` once before the first E2E run (uses the repo's Playwright version — do not use `npx playwright install`, which can hang on macOS or fetch a mismatched browser build)

### Gotchas

- The app uses `@neondatabase/serverless` for PostgreSQL. The `DATABASE_URL` must be a valid Neon connection string. Standard Postgres URLs also work.
- Google OAuth config throws at module load time in dev if `NEXT_PUBLIC_GOOGLE_CLIENT_ID_DEV` / `GOOGLE_CLIENT_SECRET_DEV` are missing.
- `POLAR_PRODUCT_ID_YEARLY` is only a warning if missing (non-fatal).
- Jest unit tests use `fakeTimers: { enableGlobally: true }` and `next/babel` transform. Some test suites have pre-existing timeout failures.
- `pnpm install` may warn about ignored build scripts (esbuild, sharp, etc.). These are safe to ignore — esbuild works via platform-specific optional deps.
- `playwright install` / `npx playwright install` can hang during browser zip extraction on macOS. Use `pnpm test:install-browsers` instead (`scripts/install-playwright-browsers.mjs`).

### Package Source Lookup (opensrc)

Before writing code that calls these packages, fetch the real source so you're working against the actual API, not stale memory:

```bash
opensrc path ai              # Vercel AI SDK (highest hallucination risk — fast-moving)
opensrc path @ai-sdk/openai
opensrc path @ai-sdk/anthropic
opensrc path zod             # Schema validation
opensrc path next            # Next.js App Router
```

Read the relevant files before writing imports, function calls, or tool definitions. Cached at `~/.opensrc/` after first fetch.

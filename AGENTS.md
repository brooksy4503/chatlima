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
- **Unit tests**: `pnpm test:unit` (Jest — some pre-existing timeout failures with fake timers)
- **E2E basic UI**: `npx playwright test --project=basic-ui-chrome --config=playwright.basic.config.ts`
- **E2E anonymous**: `pnpm test:anonymous` (sends real AI requests, takes time)
- **Playwright browsers**: must run `npx playwright install --with-deps chromium` before first test run

### Gotchas

- The app uses `@neondatabase/serverless` for PostgreSQL. The `DATABASE_URL` must be a valid Neon connection string. Standard Postgres URLs also work.
- Google OAuth config throws at module load time in dev if `NEXT_PUBLIC_GOOGLE_CLIENT_ID_DEV` / `GOOGLE_CLIENT_SECRET_DEV` are missing.
- `POLAR_PRODUCT_ID_YEARLY` is only a warning if missing (non-fatal).
- Jest unit tests use `fakeTimers: { enableGlobally: true }` and `next/babel` transform. Some test suites have pre-existing timeout failures.
- `pnpm install` may warn about ignored build scripts (esbuild, sharp, etc.). These are safe to ignore — esbuild works via platform-specific optional deps.

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

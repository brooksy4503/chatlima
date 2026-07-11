---
name: Refresh compare pages
overview: Replace the stale curated `PREBUILT_COMPARISONS` list with today’s top OpenRouter frontier and open-weight models (from Artificial Analysis + live OpenRouter catalog), so `/compare` and the sitemap ship current high-intent vs pages.
todos:
  - id: roster-replace
    content: Replace PREBUILT_COMPARISONS in lib/models/model-priority.ts with ~28 AA/OpenRouter frontier + OSS pairs
    status: completed
  - id: slug-providers
    content: Add moonshotai and qwen to slug-utils providerMap
    status: completed
  - id: tests-spec
    content: Update model-priority tests + SPEC.md §8.6; verify all IDs exist on OpenRouter
    status: completed
isProject: false
---

# Refresh SEO compare pages for top OpenRouter models

## Context

Compare pages are **not** auto-generated for every model. They come from the curated list in [`lib/models/model-priority.ts`](lib/models/model-priority.ts) (`PREBUILT_COMPARISONS`), which feeds:

- [`app/compare/page.tsx`](app/compare/page.tsx) — index links
- [`app/compare/[slug]/page.tsx`](app/compare/[slug]/page.tsx) — `generateStaticParams`
- [`app/sitemap.xml/route.ts`](app/sitemap.xml/route.ts) — sitemap entries

Several current pairs already reference **missing** OpenRouter IDs (`x-ai/grok-4`, `google/gemini-3.1-flash`, `xiaomi/mimo-v2-flash:free`, `allenai/olmo-3.1-32b-think:free`, etc.).

**Scope decision:** OpenRouter only (no Requesty). Keep existing ID style (`provider/model`, not `openrouter/provider/model`) so slug URLs stay short; [`resolveModelFromSlug`](lib/models/resolve-model.ts) already maps those to catalog IDs prefixed with `openrouter/`.

## Source roster (verified on OpenRouter API today)

**Frontier / high intelligence (AA):**
- `anthropic/claude-fable-5`
- `openai/gpt-5.6-sol-pro`, `openai/gpt-5.6-sol`
- `anthropic/claude-opus-4.8`
- `openai/gpt-5.5-pro`, `openai/gpt-5.4-pro`
- `google/gemini-3.1-pro-preview`, `google/gemini-3.5-flash`
- `anthropic/claude-sonnet-4.6`
- `x-ai/grok-4.5`
- `openai/gpt-5.3-codex`

**Open-weight / OSS (AA open leaderboard):**
- `z-ai/glm-5.2`
- `minimax/minimax-m3`
- `deepseek/deepseek-v4-pro`, `deepseek/deepseek-v4-flash`
- `moonshotai/kimi-k2.6`
- `xiaomi/mimo-v2.5-pro`
- `nvidia/nemotron-3-ultra-550b-a55b` (+ `:free`)
- `qwen/qwen3.5-397b-a17b`
- `google/gemma-4-31b-it` (+ `:free`)
- `openai/gpt-oss-120b` (+ `:free`)
- `mistralai/devstral-2512`

## New comparison pairs (~28)

Replace the entire `PREBUILT_COMPARISONS` array with pairs covering:

1. **Frontier vs frontier** — Fable / Sol Pro / Opus 4.8 / Gemini 3.1 Pro / GPT-5.4 Pro / Grok 4.5
2. **Frontier vs open** — e.g. Fable vs GLM-5.2, Sol Pro vs MiniMax-M3, Gemini Pro vs GLM-5.2
3. **Open vs open** — GLM-5.2 vs MiniMax-M3 / DeepSeek V4 Pro / Kimi K2.6 / Qwen3.5 397B; DeepSeek V4 Pro vs Flash; MiMo vs GLM
4. **Fast / coding** — Gemini 3.5 Flash vs Grok 4.5; GPT-5.3 Codex vs Sonnet 4.6; Devstral vs Codex
5. **Free OSS SEO** — gpt-oss-120b:free vs gemma-4-31b:free; nemotron-ultra:free vs gpt-oss:free

Exact pair list will be written into `PREBUILT_COMPARISONS` during implementation (same shape: `{ model1Id, model2Id, reason }`).

## Supporting code fixes

1. **[`lib/models/slug-utils.ts`](lib/models/slug-utils.ts)** — add `moonshotai` and `qwen` to `providerMap` so slug↔id round-trips work for new providers.
2. **[`__tests__/lib/model-priority.test.ts`](__tests__/lib/model-priority.test.ts)** — update any hardcoded old pair IDs (e.g. `gpt-5.2-pro` / `claude-opus-4.6`) to new flagship pairs; keep slug uniqueness / `-vs-` assertions.
3. **[`SPEC.md`](SPEC.md) §8.6** — note that prebuilt comparisons are curated from Artificial Analysis + OpenRouter availability (frontier + open-weight), refreshed periodically; OpenRouter IDs only.

## Verification

- One-shot check: every `PREBUILT` ID exists on `https://openrouter.ai/api/v1/models` (script or shell).
- `pnpm test:unit -- __tests__/lib/model-priority.test.ts` (and slug-utils tests if present).
- Optional: `scripts/test-seo-pages.ts` against a few new `/compare/...` slugs if the dev server is up.

No Requesty IDs. No new page templates — only the curated list + slug provider support + docs/tests.
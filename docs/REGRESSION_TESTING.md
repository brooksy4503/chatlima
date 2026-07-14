# Regression testing workflow

This repo uses automated gates plus manual scenarios to catch regressions before merge.

## Quick reference

| When | Command |
|------|---------|
| First-time Playwright setup | `pnpm test:install-browsers` |
| During feature work (fast) | `pnpm test:unit:ci` |
| Chat / branching changes | `pnpm test:unit:ci -- --testPathPatterns=chatStateSeams` |
| Before push (local gate) | `pnpm pre-push` |
| Full local unit suite | `pnpm test:unit` (includes component tests; some suites are currently flaky) |
| UI smoke | `pnpm test:basic -- --project=basic-ui-chrome` |
| Branching UI (mocked API) | `pnpm test:basic -- --project=branching-ui-chrome` |
| CI E2E gate (both projects) | `pnpm test:ci:e2e` |
| Lint + build | `pnpm lint && pnpm build` |

## CI (GitHub Actions)

On every PR and push to `main`, [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) runs:

1. **Lint** — `pnpm lint`
2. **Unit tests (CI suite)** — `pnpm test:unit:ci` via [`jest.config.ci.js`](../jest.config.ci.js)
3. **Build** — `pnpm build`
4. **Playwright** — basic UI + conversation branching specs (`pnpm test:ci:e2e`)

The CI unit suite intentionally **excludes pre-existing flaky component tests**. Lib, service, API, and seam tests must pass for merge.

### Optional: real E2E against your backend

CI uses placeholder env vars so the app can boot. For richer E2E, add GitHub Actions secrets matching your `.env.local` (at minimum `DATABASE_URL`, `AUTH_SECRET`, Polar keys, and an AI provider key) and update the workflow `env` block to reference `${{ secrets.* }}`.

## Local pre-push hook

One-time setup:

```bash
git config core.hooksPath .githooks
chmod +x .githooks/pre-push scripts/pre-push-check.sh
```

After that, every `git push` runs:

```bash
pnpm lint
pnpm test:unit:ci
pnpm build
```

**Docs-only pushes are skipped automatically** when every changed file matches `*.md`, `docs/**`, `releases/**`, or `.cursor/**`. GitHub Actions uses the same path rules in `.github/workflows/ci.yml`. `pnpm pre-push` always runs the full suite when invoked manually.

Run manually anytime:

```bash
pnpm pre-push
```

To skip temporarily (emergency only):

```bash
git push --no-verify
```

## Chat seam tests

High-risk sync bugs are guarded in [`__tests__/lib/chatStateSeams.test.ts`](../__tests__/lib/chatStateSeams.test.ts):

- Stale DB refetch vs in-memory edit branch
- Local transcript ahead of DB after stream finish
- Branch adoption only when active leaf matches
- Regenerate sibling edges during streaming merge
- Server-owned continue path authority

**Add a case here** whenever you fix a client ↔ DB ↔ stream race.

## Active-leaf API integration test

[`__tests__/api/chats/[id]/active-leaf.test.ts`](../__tests__/api/chats/[id]/active-leaf.test.ts) exercises the real route handler (mocked auth + persistence):

- Auth required
- Assistant sibling switch returns correct active path
- User sibling resolves to deepest leaf
- Invalid selection returns 400

This is the non-mocked regression test for branch paging persistence.

## Manual chat scenario checklist

Run these after chat persistence or branching changes:

- [ ] New chat → first message → reload
- [ ] Regenerate assistant → pager → reload preserves selection
- [ ] Edit earlier user message → new branch → original branch still reachable
- [ ] Switch user sibling → correct assistant descendant shown
- [ ] Fork mid-conversation → hidden siblings not copied
- [ ] Streaming → refetch does not clobber in-memory branch
- [ ] Compare, share, export still match `SPEC.md`

## PR checklist

Pull requests use [`.github/pull_request_template.md`](../.github/pull_request_template.md). Fill in the regression checklist before requesting review.

## Agent / plan workflow

Multi-step features must follow [`.cursor/rules/plan-execution.mdc`](../.cursor/rules/plan-execution.mdc):

> Implement **only the first plan todo**. Stop when tests pass and report manual verification steps. Do not start the next todo until I confirm.

Recommended verification after each plan gate:

```bash
pnpm test:unit:ci -- --testPathPatterns="<area-you-touched>"
pnpm lint
pnpm build
```

## Known gaps

- Full `pnpm test:unit` still has failing **component** suites (React 19 / ESM transform issues). CI uses the stable subset until those are fixed.
- Playwright branching specs mock API responses — they validate UI wiring, not live persistence. Use seam tests + manual checklist + active-leaf API test for persistence regressions.
- **Playwright browser install:** use `pnpm test:install-browsers`, not `npx playwright install`. The stock Playwright installer can hang during zip extraction on macOS; the repo script uses `fetch` + `unzip` instead.

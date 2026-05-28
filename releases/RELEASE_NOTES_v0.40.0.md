# 🚀 ChatLima v0.40.0 - OpenRouter Agentic Web Search (AI SDK v6)

## 🎯 What's New

- **OpenRouter agentic web search** — web search now uses OpenRouter server tools (`openrouter:web_search`, `openrouter:web_fetch`) instead of the deprecated `:online` suffix and `web_search_options` plugin pattern.
- **AI SDK v6 upgrade** — chat streaming, message handling, and tool invocation are updated for AI SDK v6 and `@openrouter/ai-sdk-provider` 2.x.
- **Smarter web search billing** — credits are charged based on actual web search invocation count rather than a flat per-request assumption.
- **Improved reasoning display** — reasoning models show clearer tag-based and native reasoning extraction in the chat UI.
- **Google/Gemini tool compatibility** — tool schemas are sanitized at resolution time so Gemini and Vertex models no longer fail on `$schema` fields in tool definitions.
- **Codex worktree env sync** — new `pnpm env:sync` script copies local env files into Codex worktrees for faster dev setup.

## 🔧 Technical Implementation

- Upgraded AI SDK packages and `@openrouter/ai-sdk-provider` to v2.x.
- Refactored web search into `lib/services/chatWebSearchService.ts` and `lib/services/openRouterWebSearchRouteSetup.ts` for clearer route integration and tool-calling model gating.
- Extracted message persistence logic into `lib/chat-message-persistence.ts` and shared utilities in `lib/message-utils.ts`.
- Added `lib/google-model-tools.ts` to strip `$schema` from tool input schemas without mutating tool objects.
- Updated `app/api/chat/route.ts`, `components/chat.tsx`, and `components/message.tsx` for AI SDK v6 `UIMessage` structure, tool invocation labels, and citation display.
- Enhanced reasoning middleware in `ai/providers.ts` with tag-based and native reasoning extraction.
- Added architecture flow documentation in `docs/architecture/` (flow explorer HTML + flows JSON).
- Added `scripts/sync-env-local.sh` and `pnpm env:sync` / `pnpm dev:codex` scripts.
- Expanded unit test coverage:
  - `__tests__/api/chat-route-web-search.test.ts`
  - `lib/services/__tests__/openRouterWebSearchRouteSetup.test.ts`
  - `lib/services/__tests__/chatWebSearchService.test.ts`
  - `__tests__/lib/message-utils.test.ts`
  - `__tests__/lib/chat-message-persistence.test.ts`
  - `lib/__tests__/google-model-tools.test.ts`

## 🛡️ Security & Privacy

- No new required environment variables for production.
- No database migrations required.
- Web search billing remains credit-gated with pre-check validation before requests.
- Tool schema sanitization is applied at resolution time only — no changes to stored user data.

## 📈 Benefits

### For Users
- More reliable web search with live indicators, citation display, and clearer tool invocation labels.
- Better reasoning model output visibility in the chat UI.
- Google/Gemini models work correctly with MCP and function tools enabled.
- Web search costs reflect actual usage rather than flat per-request charges.

### For Platform Operators
- Modern OpenRouter integration aligned with current API patterns (agentic tools vs deprecated plugins).
- Expanded test coverage makes future AI SDK and provider changes safer to ship.
- Architecture flow docs improve onboarding for contributors.

### For Developers
- AI SDK v6 patterns established across chat route, components, and services.
- Clear separation between web search setup, message persistence, and route handling.
- Codex worktree env sync reduces friction when working across multiple checkouts.

## 🔄 Migration Notes

### No Breaking Changes for End Users
Existing chats, accounts, billing, and model integrations continue to work. Web search behaviour is improved but the globe toggle UX is unchanged.

### Provider Behaviour Changes
- OpenRouter web search now uses agentic server tools when the feature flag / route setup enables them.
- Legacy `:online` suffix and `web_search_options` plugin paths remain supported as fallbacks where applicable.
- AI SDK v6 message format is used internally — persisted messages follow the updated `UIMessage` part structure.

### For Developers
- Run `pnpm install` after pulling — dependency versions have changed significantly.
- No new required environment variables.
- No database migrations.
- Optional: run `pnpm env:sync` to copy env files into Codex worktrees.

## 🚀 Deployment

### Standard Deployment Process

```bash
pnpm test:unit
pnpm build
npm version minor -m "chore: release v%s"
git push origin main --tags
```

### Automatic Deployment
Pushing `main` automatically triggers production deployment via Vercel GitHub integration.

### Pre-Deployment Checklist
- [x] Unit tests passing: `1472 passed`, `20 skipped`, `62 passed suites`
- [x] PR #33 merged to main
- [x] Release notes generated and reviewed
- [x] Version bump and tag prepared for `v0.40.0`

## 📊 Changes Summary

### Key Files Added
- `lib/services/openRouterWebSearchRouteSetup.ts`
- `lib/chat-message-persistence.ts`
- `lib/message-utils.ts`
- `lib/google-model-tools.ts`
- `scripts/sync-env-local.sh`
- `docs/architecture/flow-explorer.html`
- `docs/architecture/flows.json`

### Key Files Modified
- `app/api/chat/route.ts`
- `components/chat.tsx`
- `components/message.tsx`
- `lib/services/chatWebSearchService.ts`
- `ai/providers.ts`
- `package.json` / `pnpm-lock.yaml`

### Commits Included
- `fc8a231` — Merge pull request #33: OpenRouter agentic web search tools (AI SDK v6)
- `88fc10e` — Update dependencies and enhance message handling
- `33bfab9` — Enhance message processing and synchronization in chat components
- `2c14290` — Refactor reasoning middleware and enhance message handling
- `5f8455f` — Enhance web search functionality and message handling
- `c5de94a` — fix: strip $schema from Google model tool schemas without mutating tools
- `63e7e73` — Add env sync script for Codex worktrees

### Statistics
- **63 files changed** since `v0.39.0`
- **8,062 insertions**, **1,746 deletions**
- **Enhancement**: OpenRouter Agentic Web Search and AI SDK v6 Migration

---

**Full Changelog**: [v0.39.0...v0.40.0](https://github.com/brooksy4503/chatlima/compare/v0.39.0...v0.40.0)

## 🎉 What's Next

Future work can build on this release by extending agentic tool support to additional OpenRouter capabilities, further stream persistence improvements, and deeper architecture documentation for the chat pipeline.

# 🚀 ChatLima v0.43.0 - BYOK, Branching & Usage UI

## 🎯 What's New

- **Conversation branching** — regenerate assistant replies, edit and resubmit earlier messages, switch between sibling branches, and fork mid-conversation while preserving the full tree.
- **Direct BYOK support** — bring your own keys for OpenAI, Anthropic, Groq, and xAI with direct provider routing when keys are configured.
- **Provider chip filters** — filter the model picker by provider with BYOK-aware chips for faster model selection.
- **Usage UI refresh** — compact sidebar credit meter, per-message usage in a Grok-style action bar, and clearer consumed-vs-remaining credit display.
- **Yearly Polar credits** — unified yearly subscription credit handling with improved sidebar refresh after each turn.
- **Text selection quote** — highlight text in a response and quote it directly into the composer.
- **Project linking in composer** — link chats to projects from the composer toolbar without leaving the conversation.
- **OpenRouter :free models** — shown as zero-credit in the picker and billing surfaces.
- **Admin dashboard simplification** — streamlined to Overview, Users, and Ops tabs.

## 🔧 Technical Implementation

- Conversation graph: `parent_message_id` branching, active-leaf resolution, `mergeGraphMessages`, fork API, and production backfill script (`scripts/backfill-conversation-parents.ts`).
- New E2E coverage in `tests/conversation-branching.spec.ts`; Playwright config split into shared modules and reliable browser install script.
- Direct BYOK routing in `ai/providers.ts` with AI SDK `ModelMessage` conversion fixes for stream payloads.
- Provider chip filters in `components/model-picker-provider-chips.tsx` with BYOK detection.
- Usage UI: TanStack Query credit refetch, optimistic sidebar updates, message action bar metrics, and unified token extraction on AI SDK `totalUsage`.
- Billing fixes: OpenRouter `server_tool_use_details` for web search credit debits when usage metadata is missed.
- SEO: refreshed prebuilt compare pages, improved SERP titles, and related-model card cleanup.
- Database: dropped unused limit tables; Drizzle snapshot chain healed (#36).
- CI/docs: updated AGENTS.md, regression testing guide, pre-push hook path fix, and plan-execution rules.

## 🛡️ Security & Privacy

- BYOK keys continue to be stored client-side / per-user; direct routing only activates when the user supplies their own key.
- Branching and fork APIs respect existing chat ownership checks.
- Admin dashboard simplification removes unused surfaces without changing auth gates.
- No new required environment variables.

## 📈 Benefits

### For Users
- Explore multiple reply paths without losing earlier versions — edit, regenerate, and compare branches in one chat.
- Use your own API keys with supported providers for more control and potentially lower cost.
- See credit usage where it matters: sidebar meter, composer, and per-message action bar.
- Quote selected text into follow-up prompts with one click.

### For Platform Operators
- Web search billing is more reliable when OpenRouter omits standard usage fields.
- Yearly subscription credits align with monthly handling.
- Production backfill command repairs legacy chats missing parent links.

### For Developers
- Chat state modularized: message conversion, graph merge, active-leaf resolution, and seam tests for refetch/stream sync.
- Playwright install no longer hangs on macOS (`pnpm test:install-browsers`).
- SPEC.md and architecture docs updated for branching contracts and BYOK routing.

## 🔄 Migration Notes

### Database / Backfill (Recommended for Production)
Apply migrations and backfill legacy conversation parents if upgrading from pre-branching data:

```bash
pnpm db:migrate
pnpm backfill:conversation-parents   # production — review script README first
```

### No Breaking API Changes
Existing chat, compare, billing, and auth flows continue to work. Branching adds optional `parent_message_id` on messages; legacy linear chats remain valid.

## 🚀 Deployment

### Standard Deployment Process

```bash
pnpm db:migrate
pnpm build
git push origin main --tags
```

### Automatic Deployment
Pushing `main` automatically triggers production deployment via Vercel GitHub integration.

### Pre-Deployment Checklist
- [x] Feature merged to main
- [x] `pnpm test:unit:ci` passes
- [x] Production build passes
- [ ] Run `pnpm db:migrate` on production database
- [ ] Run conversation-parent backfill if legacy chats need repair
- [ ] Monitor Vercel deployment dashboard
- [ ] Verify branching, BYOK, and usage UI on production after deploy

## 📊 Changes Summary

### Key Areas Added/Modified
- `components/chat.tsx`, `hooks/useChatSession.ts`, `hooks/useConversationBranches.ts`
- `lib/chat/mergeGraphMessages.ts`, `lib/chat/messageConversion.ts`, `lib/chatStateSeams.ts`
- `ai/providers.ts`, `components/model-picker-provider-chips.tsx`
- `app/api/chats/[id]/fork/route.ts`, `app/api/chats/[id]/active-leaf/route.ts`
- Usage/billing: `lib/tokenTracking.ts`, credit sidebar components, Polar integration
- `tests/conversation-branching.spec.ts`, Playwright shared config, `scripts/install-playwright-browsers.mjs`
- Admin dashboard refactor, SEO compare pages, SPEC.md updates

### Commits Since v0.42.0
56 commits — conversation branching, BYOK, provider filters, usage UI, billing fixes, SEO, admin simplification, and CI/docs improvements.

---

**Full Changelog**: [v0.42.0...v0.43.0](https://github.com/brooksy4503/chatlima/compare/v0.42.0...v0.43.0)

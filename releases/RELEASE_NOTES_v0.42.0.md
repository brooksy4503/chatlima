# 🚀 ChatLima v0.42.0 - Model Comparison Mode

## 🎯 What's New

- **Model comparison mode** — send one prompt to 2–3 models side-by-side and compare responses in a stacked timeline within the same chat.
- **Compare model picker** — pick and manage comparison models with a dedicated UI bar and per-model response cards.
- **Clipboard image paste** — paste images from the clipboard directly into the attach file panel for faster uploads.
- **Compare history persistence** — comparison turns are saved with model metadata so you can revisit past side-by-side results.

## 🔧 Technical Implementation

- Added `POST /api/compare` with NDJSON streaming (`model-start`, `text-delta`, `model-finish`, `model-error`, `turn-complete`).
- New compare UI: `CompareModeBar`, `CompareModelPicker`, `CompareTimeline`, `CompareResponseCard`, `ComparisonTurnGroup`.
- Extracted chat stream execution into `lib/chat/executeChatStream.ts`; compare orchestration in `lib/chat/compareOrchestrator.ts`.
- Added `CompareProvider` context and `useCompareOrchestrator` hook for client-side compare state.
- Database migration `0044_message_compare_columns.sql` adds `model_id`, `model_provider`, `model_display_name`, and `comparison_turn_id` to messages.
- Fixed AI SDK v6 compatibility by casting DB message parts to `UIMessage` parts when loading chat history.
- Added unit tests for compare history, model priority, file upload (clipboard paste), and chat store.

## 🛡️ Security & Privacy

- Compare mode respects existing credit validation and daily free-tier limits (one increment per compare turn).
- No new required environment variables.
- Compare mode disables MCP, web search, image generation, presets, and file attachments to reduce attack surface in v1.

## 📈 Benefits

### For Users
- Evaluate multiple models on the same prompt without switching chats or retyping.
- See model names and responses grouped by turn for easy side-by-side review.
- Paste screenshots or images from the clipboard without hunting for files.

### For Platform Operators
- Compare usage is credit-gated per model with explicit turn-level billing.
- Compare turns persist in the database for support and analytics.

### For Developers
- Chat route logic is further modularized (`executeChatStream`, compare orchestrator).
- SPEC.md documents compare API contract, disabled features, and message schema extensions.

## 🔄 Migration Notes

### Database Migration Required
Run migrations before or after deploy:

```bash
pnpm db:migrate
```

This applies `0044_message_compare_columns.sql` (adds nullable compare columns to `messages`).

### Compare Mode Limitations (v1)
- Text-only — no file attachments, MCP, web search, image generation, or presets in compare mode.

### No Breaking API Changes
Existing chat, billing, and auth flows continue to work unchanged.

## 🚀 Deployment

### Standard Deployment Process

```bash
pnpm db:migrate   # apply compare columns migration
pnpm build
git push origin main --tags
```

### Automatic Deployment
Pushing `main` automatically triggers production deployment via Vercel GitHub integration.

### Pre-Deployment Checklist
- [x] Feature merged to main
- [x] Production build passes
- [ ] Run `pnpm db:migrate` on production database
- [ ] Monitor Vercel deployment dashboard
- [ ] Verify compare mode on production after deploy

## 📊 Changes Summary

### Key Areas Added/Modified
- **Compare feature**: API route, orchestrator, UI components, context, policy
- **Chat refactor**: Stream execution extracted from monolithic route
- **File upload**: Clipboard paste support
- **Database**: Message compare columns migration
- **Tests**: Compare history, model priority, file upload, chat store

### Commits Since v0.41.0
- feat: add model comparison mode for side-by-side multi-model chat
- refactor(compare): simplify orchestration and remove redundant helpers
- fix: cast DB message parts to UIMessage parts for AI SDK v6 compat
- Add clipboard image paste to attach file panel
- test: add unit tests for lib/models/model-priority.ts
- docs: add package source lookup instructions to AGENTS.md
- docs: add /feature-release Cursor command for release workflow

---

**Full Changelog**: [v0.41.0...v0.42.0](https://github.com/brooksy4503/chatlima/compare/v0.41.0...v0.42.0)

# 🚀 ChatLima v0.41.0 - Marketing Site, Image Generation & Chat Refactor

## 🎯 What's New

- **Marketing homepage** — new public landing experience with ChatLima moved to `/chat` for a clearer product/marketing split.
- **Image generation** — generate images in chat with model selection, cost visibility, download support, and credit-based billing integration.
- **MarketingShell layout** — consistent marketing layout and accessibility improvements across homepage, pricing, and related pages.
- **OpenRouter Fusion support** — Fusion and meta-router models work in chat with dedicated 50-credit-per-message billing.
- **MiniMax M3 presets** — preset manager support for MiniMax M3 with updated max-token handling.
- **Smarter sign-in redirects** — Google OAuth sign-in returns users to their intended page after authentication.
- **Cyberpunk theme fixes** — code blocks and tables are readable again in the cyberpunk theme.
- **Clearer pricing copy** — credit-based plan usage messaging is easier to understand on marketing and billing surfaces.

## 🔧 Technical Implementation

- Decomposed `POST /api/chat` into modular `lib/chat/*` services for stream setup, finalization, and route orchestration.
- Added client-side message persistence and improved chat stream finalization with `createdAt` on AI/chat UI messages.
- Introduced image generation tool handling, model validation, cost integration, and UI components (`image-modal`, textarea cost visibility).
- Added marketing routes and `MarketingShell` component; integrated across multiple pages for shared layout/SEO structure.
- Extended chat routing for OpenRouter Fusion/meta-router model IDs and billing pre-checks.
- Updated `docs/architecture/flows.json`, flow explorer, `SPEC.md`, and README for subscription tiers, credit pricing, and the chat refactor.
- CI: Neon PR branch schema push is now non-interactive.
- Dev: added `docs:flows` script and Codex worktree setup helpers.

## 🛡️ Security & Privacy

- No new required environment variables for production.
- No database migrations required.
- Image generation and Fusion model usage remain credit-gated with pre-check validation.
- Auth redirect support preserves intended destination without exposing sensitive state.

## 📈 Benefits

### For Users
- A polished marketing site explains ChatLima before sign-in; chat lives at a dedicated `/chat` URL.
- Generate images directly in conversation with transparent cost handling.
- Fusion/meta-router models are usable without routing errors.
- Cyberpunk theme users get readable markdown tables and code blocks.
- Sign-in no longer drops users on a generic page after OAuth.

### For Platform Operators
- Modular chat pipeline is easier to maintain and extend.
- Fusion billing is explicit (50 credits/message) rather than ambiguous token-based estimates.
- Marketing and product surfaces are separated for better SEO and onboarding.

### For Developers
- `lib/chat/*` modules clarify responsibilities previously buried in the monolithic chat route.
- Architecture flow docs and SPEC updates reflect the refactored chat pipeline.
- Expanded type safety for image generation models and API key provider checks.

## 🔄 Migration Notes

### URL Change
- The main chat UI is now at **`/chat`**. Bookmarks or integrations pointing at `/` for chat should be updated.

### No Breaking API Changes
Existing chats, accounts, billing, and provider integrations continue to work.

### For Developers
- Run `pnpm install` after pulling.
- No new required environment variables.
- No database migrations.
- Review `SPEC.md` and `docs/architecture/flows.json` for updated chat architecture.

## 🚀 Deployment

### Standard Deployment Process

```bash
pnpm test:unit
pnpm build
git push origin main --tags
```

### Automatic Deployment
Pushing `main` automatically triggers production deployment via Vercel GitHub integration.

### Pre-Deployment Checklist
- [x] Feature branches merged to main
- [x] Release notes generated for `v0.41.0`
- [x] Version bump and tag prepared for `v0.41.0`

## 📊 Changes Summary

### Key Areas Added
- Marketing homepage and `/chat` route split
- Image generation tool pipeline and UI
- `lib/chat/*` modular chat services
- `MarketingShell` shared layout component
- OpenRouter Fusion / meta-router chat support

### Key Areas Modified
- `app/api/chat/route.ts` → decomposed into `lib/chat/*`
- Marketing pages, auth sign-in flow, preset manager
- Billing/credit handling for Fusion models
- Cyberpunk markdown rendering (tables, code blocks)
- `SPEC.md`, README, architecture flow docs

### Commits Included (since v0.40.0)
- Marketing homepage and `/chat` route move (PR #35)
- Chat route quality refactor (PR #34)
- Image generation capabilities end-to-end
- MarketingShell integration and accessibility
- MiniMax M3 preset support
- OpenRouter Fusion chat + 50-credit billing
- Cyberpunk theme markdown fixes
- Auth redirect support
- Pricing copy improvements

### Statistics
- **114 files changed** since `v0.40.0`
- **29 non-merge commits**
- **Enhancement**: Marketing site, image generation, and chat architecture refactor

---

**Full Changelog**: [v0.40.0...v0.41.0](https://github.com/brooksy4503/chatlima/compare/v0.40.0...v0.41.0)

## 🎉 What's Next

Future work can extend landing-page SEO, deepen image generation model coverage, and build on the modular chat pipeline for additional OpenRouter capabilities.

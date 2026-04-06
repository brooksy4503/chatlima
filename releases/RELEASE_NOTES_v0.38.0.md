# 🚀 ChatLima v0.38.0 - Projects, Access Gating, Web Fetch & Settings

## 🎯 What's New

This release delivers **first-class Projects** for organizing chats and files, **subscription and BYOK access rules** for premium models, a **native URL fetch** capability for the assistant, a **unified settings sheet** with tabs, and broad improvements to the **model picker**, **API key management**, and **SEO comparison pages**.

### 📁 Projects

- **Project APIs and chat linking**: Create and manage projects, link chats to projects, and inject project context into conversations.
- **Project-first flows**: Start chats from a project and keep project context aligned as you work.
- **Sidebar and detail UI**: Project section in the sidebar with project detail sheets and improved navigation; layout and overflow fixes for long file names and mobile.
- **Bug fix**: Corrected malformed project file URLs when resolving `read_file` for project attachments.

### 💳 Model access (subscription & BYOK)

- **Access gating**: Premium or restricted models respect subscription status and bring-your-own-key (BYOK) rules.
- **Clearer UX for anonymous users**: Sign-in and upgrade affordances in the chat sidebar; access dialog explains premium models and subscription benefits.

### 🌐 Web fetch (URL tool)

- **Native URL fetch**: The assistant can fetch and work with content from URLs, with streamlined HTML parsing and extraction in the web fetch pipeline.

### ⚙️ Settings & keys

- **Settings sheet**: Replaces the older settings dropdown with a tabbed settings sheet for API keys, MCP, preferences, and related options.
- **API key manager**: Improved handling, storage events, and coordination with model context so keys and availability stay in sync.
- **Model picker**: Better loading and error states, availability checks aligned with API key validation, and smoother selection when models are blocked or loading.

### 🔎 SEO & routing

- **Comparison pages**: Updated flagship model lineup on SEO comparison pages.
- **Slugs**: Multi-word provider names work correctly when mapping slugs to model IDs.

### 📄 Files & data

- **CSV and Excel**: Stronger parsing for spreadsheets used with uploads and file-backed workflows.
- **Specification & docs**: Application spec and README/CLAUDE updates (including settings panel documentation); AGENTS.md and dev-environment housekeeping.

### 🧪 Quality

- **PDF utilities**: Expanded tests for markdown and text handling in PDF rendering.
- **TypeScript**: `tsconfig` updated to include declaration files in compilation where appropriate.

## 🔧 Technical Implementation

- **Projects**: New and updated routes and services for project CRUD, chat–project association, and context injection; integrated into chat components and sidebar (`feat(projects)` / project PR merge).
- **Billing & access**: Server and client logic for gating model use by plan and BYOK; hooks in chat UI for upgrade and sign-in paths.
- **Web fetch**: `web-fetch` feature and `webFetchService` refactor for extraction and HTML parsing; chat route/tooling wired for native URL fetch.
- **Settings UI**: Sidebar refactor from dropdown to sheet-based settings with tab navigation.
- **Model picker / API keys**: `model-context` and `api-key-manager` updates for storage events, availability, and validation.
- **Tooling / DX**: `AGENTS.md`, removal of snapshot-managed Cursor env file where superseded, PDF test coverage, `tsconfig` fix.

## 🛡️ Security & Privacy

- Access gating reduces unintended use of high-cost or restricted models without an appropriate plan or user-supplied keys.
- Web fetch should only retrieve URLs exposed through the product’s normal tool flow; review deployment CORS and allowlists as you extend fetch behavior.

## 📈 Benefits

- **Projects** give users a clearer way to group work, files, and threads.
- **Transparent access rules** align model choice with subscription and keys, with fewer confusing failures at send time.
- **URL fetch** supports research and summarization workflows without manual copy-paste.
- **Settings** are easier to scan and maintain in one place.

## 🔄 Migration Notes

- **Environment**: No new required env vars are introduced solely by this release summary; follow existing docs for Blob, auth, and AI keys. If you customize web fetch or project storage, confirm production secrets and feature flags.
- **Database**: If your deployment uses project-related migrations, run the usual Drizzle migrate flow (`pnpm db:migrate`) after deploy when migrations are present in the branch.
- **Breaking changes**: None called out for typical chat usage; behavior changes mainly around **which models are selectable** under gating rules.

## 🚀 Deployment

- Build: `pnpm build`
- Tests: `pnpm lint`, Playwright as configured (`pnpm test:basic`, etc.); install browsers for E2E if needed.
- Push `main` with tags triggers production deployment via GitHub/Vercel when integrated.

---

**Full Changelog**: [v0.37.0...v0.38.0](https://github.com/brooksy4503/chatlima/compare/v0.37.0...v0.38.0)

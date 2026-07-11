# ChatLima - Full Application Specification

**Version:** 0.40.0  
**Last Updated:** June 2026

---

## 1. Executive Summary

ChatLima is a feature-rich, MCP-powered AI chatbot application with multi-model support, advanced tool integration, and a comprehensive credit/billing system. Built on Next.js 15 with the App Router, it provides seamless access to 300+ AI models through dynamic provider integration while offering anonymous usage, Google OAuth authentication, and a tiered subscription model via Polar.

### Key Differentiators
- **Dynamic Model Loading**: Real-time fetching from OpenRouter and Requesty APIs
- **Model Context Protocol (MCP)**: Full MCP 1.20.2 support with OAuth 2.1 authorization
- **Flexible Authentication**: Google OAuth; optional anonymous access when `BILLING_ENFORCED=false` (10 msg/day)
- **Dual Subscription Tiers**: Monthly ($9/mo, ~1,000 Polar credits/month) and Yearly ($90/yr, high usage allowance); full model catalog on both plans
- **Credit-tier pricing**: Per-message cost 1–30 credits by model (Economy → Ultra), shown in model picker—not separate “free vs premium” product tiers
- **Multi-Provider AI**: OpenAI, Anthropic, Groq, XAI, OpenRouter, Requesty

---

## 2. Technical Architecture

### 2.1 Core Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15.3.8 with App Router & Turbopack |
| Runtime | React 19.1.0 |
| Language | TypeScript 5.8.3 |
| Database | PostgreSQL with Drizzle ORM 0.42.0 |
| Authentication | Better Auth 1.2.7 |
| Payments | Polar SDK 0.32.13 |
| AI SDK | Vercel AI SDK 6.0.191 |
| MCP | @modelcontextprotocol/sdk 1.20.2 |
| Styling | Tailwind CSS 4.1.4 with shadcn/ui |
| Testing | Playwright (E2E) + Jest (Unit) |

### 2.2 Directory Structure

```
chatlima/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── auth/            # Better Auth endpoints
│   │   ├── chat/            # Main chat API
│   │   ├── credits/         # Credit management
│   │   ├── presets/         # Preset CRUD
│   │   ├── models/          # Dynamic model fetching
│   │   ├── favorites/       # Favorite models
│   │   ├── upload-files/    # Multipart upload → Vercel Blob
│   │   ├── projects/        # Project CRUD, files, and project chats
│   │   ├── admin/           # Admin endpoints
│   │   └── ...
│   ├── (marketing)/         # Public landing page at `/`
│   ├── (app)/chat/          # New-chat app entry at `/chat`
│   ├── (app)/chat/[id]/     # Saved chat page
│   ├── models/              # SEO model pages
│   ├── compare/             # Model comparison
│   ├── upgrade/             # Subscription upgrade
│   ├── auth/sign-in/        # Google OAuth sign-in entry
│   ├── admin/               # Admin dashboard
│   └── ...
├── components/               # React components
│   ├── ui/                  # shadcn/ui primitives
│   ├── auth/                # Auth components
│   ├── admin/               # Admin components
│   ├── token-metrics/       # Usage analytics
│   ├── marketing-shell.tsx  # Shared shell for marketing, faq, upgrade, models, compare pages
│   ├── file-upload.tsx      # Upload UI (drag-drop, picker)
│   ├── file-preview.tsx    # Preview for images & document metadata
│   ├── preset-manager.tsx, preset-selector.tsx
│   ├── image-*.tsx         # image-upload, preview, generated-image, modal for gen tool results
│   └── ...
├── lib/                      # Shared utilities
│   ├── chat/                # Modular chat pipeline (chatRequest, chatPreflight, buildChatStreamPlan, chatStreamFinalizer, chatTools, prepareMessagesForModel, systemInstruction, reasoningModels, streamTokenUsage, createErrorResponse) — refactored out of the former 2k-line /api/chat/route.ts
│   ├── db/                  # Database config & schema
│   ├── services/            # Business logic services (chat* + chatImageGenerationService, dailyMessageUsageService, costCalculation, projectContext, etc.)
│   ├── models/              # Model fetching & config
│   ├── context/             # React contexts (model, mcp, preset, auth, web-search, image-generation)
│   ├── hooks/               # Shared custom hooks (useProjects, useChats, etc.)
│   ├── config/              # Access policy, feature flags
│   ├── constants/           # Image gen models, etc.
│   ├── types/               # Shared TS types
│   ├── utils/               # Logging, json repair, pagination, etc.
│   ├── auth.ts              # Better Auth config
│   ├── polar.ts             # Polar integration
│   ├── file-upload.ts       # Upload validation & Blob helpers
│   ├── file-reader/         # PDF, CSV, Excel, text parsers (read_file tool)
│   ├── browser-storage.ts   # Browser storage utilities
│   └── ...
├── ai/                       # AI provider config
│   └── providers.ts         # Multi-provider setup
├── hooks/                    # Custom React hooks
├── drizzle/                  # Database migrations
├── tests/                    # Playwright tests
└── scripts/                  # Utility scripts
```

### 2.3 Service-Oriented Architecture

The application uses specialized services for maintainability:

| Service | Responsibility |
|---------|---------------|
| `chatAuthenticationService` | User authentication & session management |
| `chatCreditValidationService` | Credit checks & subscription validation |
| `chatDatabaseService` | Chat & message persistence |
| `chatMCPServerService` | MCP server connection & tool management |
| `chatMessageProcessingService` | Message parsing & formatting |
| `chatModelValidationService` | Model availability & capability checks |
| `chatTokenTrackingService` | Token usage & cost tracking |
| `chatWebSearchService` | Web search integration |
| `chatImageGenerationService` | Image gen toggle validation, tool registration, OpenRouter image model invocation + Blob upload |
| `webFetchService` | Native URL fetch, SSRF-safe validation, and content extraction |
| `projectContext` | Project instructions and file context for linked chats |
| `dailyMessageUsageService` | Enforces anonymous (10/day) and free Google (20/day) limits when billing not enforced |
| `openRouterWebSearchRouteSetup` | Chooses agentic vs legacy :online web search path based on flags |

---

## 3. Database Schema

### 3.1 Core Tables

#### Users (`user`)
```typescript
{
  id: string (nanoid)
  name: string?
  email: string (unique)
  emailVerified: boolean?
  image: string?
  isAnonymous: boolean (default: false)
  role: string (default: "user")
  isAdmin: boolean (default: false)
  metadata: json?
  defaultPresetId: string?
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### Accounts (`account`)
```typescript
{
  id: string (nanoid)
  userId: string (FK → users)
  providerId: string          // "google", "anonymous"
  accountId: string
  providerType: string?       // "oauth", etc.
  accessToken: string?
  refreshToken: string?
  accessTokenExpiresAt: timestamp?
  tokenType: string?
  scope: string?
  idToken: string?
  sessionState: string?
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### Sessions (`session`)
```typescript
{
  id: string (nanoid)
  sessionToken: string (unique)
  userId: string (FK → users)
  expiresAt: timestamp
  ipAddress: string?
  userAgent: string?
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 3.2 Chat System

#### Chats (`chats`)
```typescript
{
  id: string (nanoid)
  userId: string (FK → users)
  title: string (default: "New Chat")
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### Messages (`messages`)
```typescript
{
  id: string (nanoid)
  chatId: string (FK → chats, cascade delete)
  role: string                // "user", "assistant", "tool"
  parts: json                 // MessagePart[]
  hasWebSearch: boolean?
  webSearchContextSize: string? // "low", "medium", "high"
  modelId: string?              // model used for this message (assistant) or compare set
  modelProvider: string?
  modelDisplayName: string?
  comparisonTurnId: string?     // groups user + N assistant rows from one compare send
  createdAt: timestamp
}
```

### 3.3 Presets System

#### Presets (`presets`)
```typescript
{
  id: string (nanoid)
  userId: string (FK → users, cascade delete)
  name: string                // 1-100 chars
  modelId: string
  systemInstruction: string   // 10-4000 chars
  temperature: integer        // 0-2000 (stored * 1000)
  maxTokens: integer          // 1-200000
  webSearchEnabled: boolean?
  webSearchContextSize: string?
  apiKeyPreferences: json?
  isDefault: boolean?
  shareId: string? (unique)
  visibility: string          // "private", "shared"
  version: integer?
  createdAt: timestamp
  updatedAt: timestamp
  deletedAt: timestamp?
}
```

### 3.4 Usage Tracking

#### Token Usage Metrics (`token_usage_metrics`)
```typescript
{
  id: string (nanoid)
  userId: string (FK → users)
  chatId: string (FK → chats)
  messageId: string? (FK → messages)
  modelId: string
  provider: string
  inputTokens: integer
  outputTokens: integer
  totalTokens: integer
  estimatedCost: numeric(13,9)
  actualCost: numeric(13,9)?
  currency: string (default: "USD")
  processingTimeMs: integer?
  timeToFirstTokenMs: integer?
  tokensPerSecond: numeric(10,2)?
  streamingStartTime: timestamp?
  status: string              // "pending", "processing", "completed", "failed"
  errorMessage: string?
  metadata: json?
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### Daily Message Usage (`daily_message_usage`)
```typescript
{
  id: string (nanoid)
  userId: string (FK → users)
  date: date                  // YYYY-MM-DD UTC
  messageCount: integer       // Max 1000
  isAnonymous: boolean
  lastMessageAt: timestamp?
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 3.5 Sharing System

#### Chat Shares (`chat_shares`)
```typescript
{
  id: string (nanoid)
  chatId: string (FK → chats)
  ownerUserId: string (FK → users)
  shareId: string (unique, 20-64 chars)
  status: string              // "active", "revoked"
  visibility: string          // "unlisted"
  snapshotJson: json
  viewCount: integer
  createdAt: timestamp
  revokedAt: timestamp?
}
```

### 3.6 Projects System

#### Projects (`projects`)
```typescript
{
  id: string (nanoid)
  userId: string (FK → users, cascade delete)
  name: string                // 1-100 chars, unique per user
  instructions: string        // <= 8000 chars
  createdAt: timestamp
  updatedAt: timestamp
  deletedAt: timestamp?
}
```

#### Project Files (`project_files`)
```typescript
{
  id: string (nanoid)
  projectId: string (FK → projects, cascade delete)
  filepath: string?
  url: string?
  filename: string
  mimeType: string?
  size: integer?
  createdAt: timestamp
}
```

#### Chat Projects (`chat_projects`)
```typescript
{
  chatId: string (PK, FK → chats, cascade delete)
  projectId: string (FK → projects, cascade delete)
  attachedAt: timestamp
}
```

### 3.7 Billing & Polar Integration

#### Polar Usage Events (`polar_usage_events`)
```typescript
{
  id: string (nanoid)
  userId: string (FK → users)
  polarCustomerId: string?
  eventName: string
  eventPayload: json
  createdAt: timestamp
}
```

### 3.8 Other Tables

- `favorite_models` - User's favorited models
- `preset_usage` - Preset usage tracking
- `model_pricing` - Model pricing data
- `daily_token_usage` - Aggregated daily token usage
- `usage_limits` - User/model usage limits
- `cleanup_execution_logs` - User cleanup audit
- `cleanup_config` - Cleanup system config
- `verification` - Auth verification tokens

---

## 4. Authentication System

### 4.1 Authentication Providers

| Provider | Use Case |
|----------|----------|
| **Google OAuth** | Primary authentication (production & dev configs) |
| **Anonymous** | Guest access with unique tracking |

### 4.2 User Tiers & Limits

| User Type | App daily message cap | Polar credits | Features |
|-----------|------------------------|---------------|----------|
| Anonymous (`BILLING_ENFORCED=false`) | 10/day | None | OpenRouter `:free` models only unless BYOK |
| Signed-in, no subscription (`BILLING_ENFORCED=false`) | 20/day | None | `:free` models; web search needs credits |
| Signed-in, no subscription (`BILLING_ENFORCED=true`) | Blocked | None | Requires subscription or BYOK (`accessGateService`) |
| Monthly subscriber ($9/mo) | High / credit-gated | ~1,000 credits/month (Polar meter) | Full catalog; cost 1–30 credits/msg by model tier |
| Yearly subscriber ($90/yr) | Credit-gated (same as monthly) | ~12,000 credits/year (Polar meter) | Full catalog; cost 1–30 credits/msg by model tier |
| BYOK (any enforced mode) | Bypasses subscription gate when `ALLOW_BYOK_BYPASS=true` | N/A | Provider-billed; ChatLima credits skipped for that provider |

### 4.3 Anonymous User Flow

1. User visits site → Better Auth creates anonymous account
2. Unique email generated: `{id}@anonymous.chatlima.com`
3. 10 messages/day limit enforced
4. On Google OAuth sign-in → account linking triggers:
   - Presets migrated to new account
   - Polar customer created
   - Limit increased to 20/day

### 4.4 Session Management

- Session max age: 30 days
- Trusted origins: localhost, chatlima.com, preview.chatlima.com, *.vercel.app
- Session token stored in `sessionToken` column

---

## 5. AI Provider Integration

### 5.1 Supported Providers

| Provider | Client Library | Models |
|----------|---------------|--------|
| OpenAI | `@ai-sdk/openai` | GPT-4.1 series, GPT-4O |
| Anthropic | `@ai-sdk/anthropic` | Claude 4, Claude 3.5/3.7 |
| Groq | `@ai-sdk/groq` | Llama, Qwen models |
| XAI | `@ai-sdk/xai` | Grok 3, Grok 4 |
| OpenRouter | `@openrouter/ai-sdk-provider` | 300+ models dynamically |
| Requesty | `@requesty/ai-sdk` | Alternative model access |

### 5.2 Dynamic Model Loading

Models are fetched in real-time from:
- **OpenRouter API**: `/api/v1/models`
- **Requesty API**: `/v1/models`

**Caching Strategy:**
- Model list: 10-minute TTL
- Model details: 1-hour TTL
- Provider health: 30-second TTL
- Smart filtering of blocked/deprecated models

### 5.3 Model ID Format

```
{provider}/{model-path}

Examples:
- openrouter/google/gemini-2.5-flash
- requesty/anthropic/claude-3.7-sonnet
- openai/gpt-4.1-mini
- anthropic/claude-3-7-sonnet
```

### 5.4 API Key Management

- Environment variables for server defaults
- LocalStorage for user-provided keys
- Runtime override support
- Per-preset key preferences

### 5.5 Reasoning Model Support

Special middleware for models with thinking capabilities:
- DeepSeek R1 series
- Claude with extended thinking
- Grok 3 Mini with reasoning
- MiniMax M2 series

### 5.6 OpenRouter Meta-Router Models

OpenRouter models whose API id is under the `openrouter/*` namespace (e.g. **Fusion**, **Auto Router**, **Free Router**) orchestrate their own server-side tools (`openrouter:web_search`, `openrouter:web_fetch`, multi-model deliberation). ChatLima catalog IDs therefore appear as `openrouter/openrouter/fusion` (ChatLima `openrouter/` prefix + OpenRouter API id `openrouter/fusion`).

For these models, `buildChatStreamPlan` **disables**:
- Client/MCP tools (`read_file`, `web_fetch`, MCP)
- OpenRouter agentic web-search and image-generation server tools
- Multi-step `streamText` (`stopWhen: stepCountIs(20)`)

Fusion runs a panel of models in parallel, then a judge synthesizes the answer (30–90s typical). Streaming may emit only `OPENROUTER PROCESSING` keepalives until the final text deltas arrive.

---

## 6. Model Context Protocol (MCP)

### 6.1 MCP Support

- **Protocol Version**: MCP 1.20.2
- **Transport Types**: SSE, stdio, HTTP Streamable
- **OAuth Version**: OAuth 2.1

### 6.2 MCP Server Configuration

```typescript
interface MCPServerConfig {
  url: string;
  type: 'sse' | 'stdio' | 'streamable-http';
  command?: string;         // For stdio
  args?: string[];
  env?: KeyValuePair[];
  headers?: KeyValuePair[];
  useOAuth?: boolean;
  id?: string;
  oauthTokens?: {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    token_type?: string;
  };
}
```

### 6.3 OAuth Flow for MCP

1. User enables "Use OAuth Authentication"
2. Clicks "Authorize" → redirect to server's OAuth endpoint
3. User authenticates on external server
4. Callback to `/oauth/callback` with auth code
5. Tokens exchanged and stored in localStorage
6. Automatic token refresh on expiry

### 6.4 Popular MCP Servers

- **Composio** - Search, code interpreter
- **Zapier MCP** - Zapier tool access
- **CogniMemo** - Memory management (requires OAuth)
- Custom stdio servers via npx/python3

---

## 7. Credit & Billing System

### 7.1 Subscription Plans

| Plan | Price | Polar allocation | Model Access |
|------|-------|------------------|--------------|
| Monthly | $9/month | ~1,000 credits/month on the Polar meter (usage-based, not a flat per-message counter) | Full catalog while credits remain |
| Yearly | $90/year | ~12,000 credits/year on the Polar meter (same credit rules as monthly) | Full catalog while credits remain |

**Product vocabulary:** User-facing copy uses **credit tiers** (Free / Economy / Standard / Pro / Frontier / Ultra). The internal `model.premium` flag and OpenRouter `:free` suffix inform tier calculation. Canonical zero-cost detection: `isOpenRouterFreeModel()` (`openrouter/` prefix + `:free` suffix) in `lib/utils/creditCostCalculator.ts`.

### 7.2 Credit Cost Tiers

Based on model pricing ($/M tokens). Labels in `lib/utils/creditTierLabels.ts`:

| Tier (user-facing) | Pricing range ($/M tokens) | Credits/message |
|--------------------|----------------------------|-----------------|
| Economy | &lt;$3/M input (paid low-cost models) | 1 |
| Free (OpenRouter `:free`) | $0/M (OpenRouter free tier) | 0 |
| Standard | ~$3–15/M | 2 |
| Pro | ~$15–50/M | 5 |
| Frontier | ~$50–100/M | 15 |
| Ultra | $100+/M | 30 |

### 7.3 Special Feature Costs

| Feature | Cost |
|---------|------|
| Web Search (agentic, default) | 5 credits × invocation count (billed after stream from tool steps or `server_tool_use.web_search_requests`) |
| Web Search (legacy `:online` plugin) | Flat 5 credits per request when web search was enabled (not per invocation) |
| Image Generation (Chatlima `image_generation` tool backed by OpenRouter image-output models) | Model-specific: `openai/gpt-5-image` = 25 credits/image; `openai/gpt-5-image-mini` = 10 credits/image (allowlisted models only; Settings dropdown) |
| OpenRouter Fusion (`openrouter/openrouter/fusion`) | **50 credits/message** — multi-model panel + judge; OpenRouter lists variable pricing (`-1`) so tier calc would otherwise default to 1 credit |

Web search billing is skipped when the user supplies their own OpenRouter API key (BYOK). Image generation billing follows the same BYOK rule.

### 7.4 Polar Integration

**Configuration:**
- Sandbox mode by default (`POLAR_SERVER_ENV` for production)
- Products configured via `POLAR_PRODUCT_ID` and `POLAR_PRODUCT_ID_YEARLY`
- Customer portal enabled
- Webhook handling for subscription events

**Webhook Events Handled:**
- `subscription.created` → Set subscription type in user metadata
- `subscription.canceled` → Clear subscription metadata
- `subscription.revoked` → Clear subscription metadata
- `order.created` → Log for audit

### 7.5 Credit Validation Flow

1. Access gate when `BILLING_ENFORCED=true`: active subscription (monthly or yearly) or BYOK for model provider (`accessGateService`)
2. Check Polar credits for non-BYOK requests (monthly and yearly use the same meter)
3. When billing not enforced: fall back to daily message limit (10 anonymous / 20 authenticated) and `:free`-only without credits
4. Block on negative credits; block when `actualCredits < requiredCredits` for selected model tier
5. Web search (if requested): require signed-in user, OpenRouter model with `supportsWebSearch`, and either ≥5 credits or BYOK OpenRouter key (`ChatWebSearchService` + `ChatCreditValidationService`)

**Usage persistence:** Each completed turn writes `metadata.creditsConsumed` on `token_usage_metrics` (`lib/services/directTokenTracking.ts`). Token counts for completed turns come from a single resolver in `lib/chat/streamTokenUsage.ts` (`resolveStreamTokenUsage`), which prefers Vercel AI SDK combined usage (`event.totalUsage` / `event.usage` across all tool/MCP steps). When provider usage is unavailable, char-based estimates are stored with `metadata.usageSource: 'estimated'`. Per-chat aggregates expose `totalCreditsConsumed` via `TokenTrackingService.getChatTokenUsage`.

---

## 8. Features

### 8.1 Chat Features

- **Streaming Responses**: Real-time AI response streaming with visual indicators. While a response is streaming, the message list auto-scrolls to keep the latest content in view. Auto-scroll pauses if the user scrolls more than 100px away from the bottom and resumes when they return. Expand/collapse of reasoning sections does not trigger auto-scroll.
- **Chat message list scrolling** (implementation):
  - **`components/messages.tsx`**: Owns the scrollable message list (`h-full min-h-0 overflow-y-auto`). During `streaming` or `submitted` status, passes a `scrollTrigger` (message count + latest message text length) to the scroll hook so in-place token updates scroll the view without DOM structure changes.
  - **`lib/hooks/use-scroll-to-bottom.tsx`**: `useScrollToBottom(scrollTrigger?)` scrolls the message container via `container.scrollTo()`. New messages use smooth scroll (`MutationObserver` on `childList`); streaming updates use instant scroll (React effect on `scrollTrigger`). Ignores mutations inside reasoning expand/collapse sections (`.motion-div`).
  - **`components/chat.tsx`**: Main content wrapper uses `overflow-hidden` when messages are shown so only `Messages` handles vertical scrolling (avoids nested scroll containers that break auto-scroll).
- **Dual-Path File Upload**: Up to 5 files per message, 30 MB max per file. Images (JPEG, PNG, WebP) sent as base64 for vision; documents (PDF, CSV, Excel) and text/code files uploaded to Vercel Blob and exposed to the AI via a `read_file` tool (content parsed on demand). Parser limits: Excel 1,000 rows/sheet, CSV 10,000 rows.
- **Web Search** (OpenRouter models only; globe toggle in composer):
  - **Eligibility**: Signed-in users with ≥5 Polar credits, or BYOK `OPENROUTER_API_KEY`. Anonymous users are blocked. Model must be `openrouter/...` with `supportsWebSearch: true` in the catalog.
  - **Client**: `webSearch: { enabled, contextSize }` sent on every `POST /api/chat` from `WebSearchProvider` (localStorage) or active preset overrides.
  - **Agentic path (default, `OPENROUTER_AGENTIC_WEB_TOOLS_ENABLED=true`)**: OpenRouter `web_search` server tool merged into `streamText` tools; model may invoke search 0+ times (`stopWhen: stepCountIs(20)`). System prompt instructs cite-with-markdown-links. Citations from `url_citation` annotations; `hasWebSearch` set when invocations or citations detected.
  - **Legacy path (`OPENROUTER_AGENTIC_WEB_TOOLS_ENABLED=false`)**: Model ID rewritten to `:online` variant plus `web_search_options.search_context_size` from context size (`low` / `medium` / `high`).
  - **No automatic fallback**: When agentic tools are enabled globally, unsupported or failed agentic setup disables web search for that request; legacy `:online` is not used unless the env flag is `false`.
  - **UI**: Live “Searching the web” indicator during stream; tool cards and `Citations` component; optional follow-up suggestion to disable search to save credits.
  - See §7.3 for billing; implementation in `chatWebSearchService`, `openRouterWebSearchRouteSetup`, `lib/chat/*` (buildChatStreamPlan etc), `app/api/chat/route.ts` (thin orchestrator).
- **Image Generation** (OpenRouter models only; ImagePlus toggle in composer):
  - **Eligibility**: Signed-in users with ≥5 Polar credits, or BYOK `OPENROUTER_API_KEY`. Anonymous users are blocked. Model must be `openrouter/...` with tool-calling support (`supportsToolCalling` or `Tools` capability in catalog).
  - **Client**: `imageGeneration: { enabled, quality, aspectRatio, outputFormat, model }` sent on every `POST /api/chat` from `ImageGenerationProvider` (localStorage). Defaults configurable in Settings → Preferences.
  - **Image tool**: Chatlima merges an app-executed `image_generation` tool into `streamText` when the toggle is on; the chat model decides when to invoke. When the user message clearly requests image creation and the chat model supports explicit `tool_choice`, step 0 forces `image_generation`; Qwen3/QwQ thinking models skip forced `tool_choice` (Alibaba rejects it in thinking mode) and rely on system-prompt guidance instead. The tool calls the configured OpenRouter image-output model with `modalities: ["image", "text"]`, extracts `message.images[]`, uploads generated data URLs to Blob when configured, and returns `{ status, imageUrl }` for persistence/rendering.
  - **UI**: ImagePlus toggle between attach and web search; live “Generating image” tool card; generated images rendered inline with click-to-expand/download. Estimated cost shown when toggle is on.
  - See §7.3 for billing; implementation in `chatImageGenerationService`, `openrouter-image-generation-tool`, `lib/chat/*` (buildChatStreamPlan, chatTools, chatStreamFinalizer), `app/api/chat/route.ts` (thin).
- **Native Web Fetch**: First-party `web_fetch` tool for reading public URLs directly in chat with extraction + truncation controls
- **Code Detection**: Auto-wrap pasted code in markdown blocks
- **Text selection quote (Add to chat)**: Highlight text in the message list to show an **Add to chat** toolbar. Selected text appears as a dismissible chip above the composer (same stack as file previews). On send, the quote is prepended to the user message as a markdown blockquote (`> line` per line), then the user's typed question; quote-only follow-ups are allowed. One quote at a time; works in normal and compare timelines. No API/schema change.
- **Smart Title Generation**: Dynamic model selection for conversation titles. Default OpenRouter title model is `openrouter/openai/gpt-5-nano` (override via `TITLE_GENERATION_MODEL_ID` or `OPENROUTER_TITLE_MODEL`). Title generation starts in parallel when a new chat begins streaming and is persisted before the chat save completes.
- **Per-chat usage chip (Chat A)**: When the chat is idle (`status === "ready"`) and the last message is from the assistant, a thin Grok-style action bar renders under that message (`components/assistant-action-bar.tsx`): icon-only copy on the left, expandable usage pill on the right (`components/token-metrics/ChatUsageChip.tsx`). Collapsed pill: compact totals (`tokens · credits · msgs`; credits omitted when zero). Expanded: popover with input/output token breakdown, credits consumed in this chat, message count. No dollar amounts. Data from `hooks/useChatTokenMetrics.ts` → `GET /api/token-usage?chatId=…`; credits summed from `token_usage_metrics.metadata.creditsConsumed` per turn (`lib/tokenTracking.ts` `totalCreditsConsumed`).
- **Sidebar credit balance pill (Sidebar A)**: Expanded sidebar shows a compact Usage meter from Polar (`components/credit-balance-pill.tsx`): label `Usage`, a left-to-right bar for **used** percentage (green → amber → red by threshold), and a short summary (`{percent}%` for subscribers, `{used}/{limit}` for free/anonymous). Full detail lives in a hover/focus tooltip — subscribers: `{remaining} remaining · {used} used of {allowance} credits`; free/anonymous: `{used} used · {remaining} remaining today`. Allowance constants in `lib/constants.ts`; balance from `useAuth().usageData.credits`.

### 8.2 Presets System

**Built-in Templates:**
- **Coding**: Advanced Code Architect, DeepSeek V3 Expert, Kimi K2 Coder
- **Analysis**: DeepSeek R1 Reasoner, Grok 4 Analyst, Gemini Data Scientist
- **Writing**: Claude Technical Writer, Gemini Content Creator
- **General**: Executive Assistant, Learning Tutor

**Preset Configuration:**
- Model selection
- System instruction (10-4000 chars)
- Temperature (0.0-2.0)
- Max tokens (1-200k)
- Web search toggle
- API key preferences

### 8.3 Projects System

- Create and manage authenticated user projects from the sidebar.
- Store project-level instructions and files.
- Link a chat to one project at a time via a composer toolbar control (folder icon in the input action bar).
- Create new chats inside a project.
- Inject linked project context into chat prompts.

### 8.4 Image & File Processing

- **Images**: Drag-and-drop upload, clipboard image paste while the attach panel is open (composer-scoped), client-side validation and compression, preview with full-screen modal, metadata (dimensions, size), detail level (low/high/auto).
- **Documents**: File preview component for images and document metadata; client-side validation for type and size before upload. Document content is fetched and parsed only when the AI calls the `read_file` tool.

### 8.5 PDF Export & Sharing

- One-click PDF download
- Professional formatting with branding
- Full markdown support
- Social sharing (Twitter, Facebook, LinkedIn)
- Direct link copying

### 8.6 SEO Features

- Public landing page at `/`; the chat app starts at `/chat`
- Dynamic model pages at `/model/[slug]`
- Model detail chat CTAs deep-link to `/chat?model=<modelId>`
- Model comparison at `/compare/[slug]`
- Auto-generated sitemap
- Structured data for models
- Homepage structured data for the software application and visible FAQ content

---

## 9. API Reference

### 9.1 Core Endpoints

#### Chat API
```
POST /api/chat
- Main chat endpoint with streaming
- Request body includes webSearch: { enabled: boolean, contextSize: "low" | "medium" | "high" } and imageGeneration: { enabled, quality, aspectRatio, outputFormat, model }
- Handles MCP tools, OpenRouter web search (agentic or legacy :online), Chatlima image_generation tool backed by OpenRouter image-output models, native web_fetch, images (base64), file references (Blob URLs)
- Integrates read_file tool for uploaded documents and web_fetch tool for URL extraction
- **Persistence**: Client history (excluding in-flight assistant placeholder) is saved before streaming starts; assistant messages are saved in awaited `uiOnFinish` after waiting up to 6s for `streamText` metadata (image URLs, tool steps). `saveMessages` uses a DB transaction (delete + insert). Stream-finish fallback persistence runs via Next.js `after()`.

#### Compare API (Model Comparison — Stacked Turns, v1 text-only)
```
POST /api/compare
- Compare one prompt across 2–3 models sequentially
- Request: { chatId, messages, compareModels[], comparisonTurnId, userMessageId, apiKeys }
- Response: application/x-ndjson stream with events:
  model-start, text-delta, model-finish, model-error, turn-complete, error
- Credits: validated per model; daily free-tier usage incremented once per compare turn
- Disabled in compare mode: MCP, web search, image generation, presets, file attachments
- Messages persist model_id, model_provider, model_display_name, comparison_turn_id on each row
```

#### Upload API
```
POST /api/upload-files
- Multipart upload; stores files in Vercel Blob Storage
- Returns blob URLs for use in chat (documents); images may be sent inline as base64
```

#### Models API
```
GET /api/models
- Returns all available models with metadata

POST /api/models
- Clears provider model cache for one provider or all providers

GET /api/models/[modelId]/credit-cost
- Returns credit cost for specific model
```

#### Chats API
```
GET /api/chats
- List user's chats

GET /api/chats/[id]
- Get specific chat

PATCH /api/chats/[id]
- Update chat metadata

DELETE /api/chats/[id]
- Delete chat

GET /api/chats/[id]/export-pdf
- Export chat as PDF

POST /api/chats/[id]/share
- Create shareable link

GET /api/chats/[id]/share
- Get share state for chat

DELETE /api/chats/[id]/share
- Revoke shareable link

GET /api/chats/shared/[shareId]
- Get shared chat

GET /api/chats/[id]/project
PUT /api/chats/[id]/project
DELETE /api/chats/[id]/project
- Get, attach, or detach the project linked to a chat
```

#### Projects API
```
GET /api/projects
POST /api/projects
GET /api/projects/[id]
PATCH /api/projects/[id]
DELETE /api/projects/[id]
GET /api/projects/[id]/files
POST /api/projects/[id]/files
DELETE /api/projects/[id]/files/[fileId]
POST /api/projects/[id]/chats
```

#### Presets API
```
GET /api/presets
POST /api/presets
GET /api/presets/[id]
PUT /api/presets/[id]
DELETE /api/presets/[id]
POST /api/presets/[id]/set-default
DELETE /api/presets/[id]/set-default
POST /api/presets/[id]/share
DELETE /api/presets/[id]/share
GET /api/presets/shared/[shareId]
POST /api/presets/validate
```

#### Favorites API
```
GET /api/favorites/models
POST /api/favorites/models/[modelId]
DELETE /api/favorites/models/[modelId]
```

#### Usage API
```
GET /api/usage/messages
GET /api/usage/summary
GET /api/usage/cost
GET /api/usage/token
GET /api/usage/export
GET /api/token-usage
GET /api/cost-analytics
GET /api/cost-calculate
POST /api/cost-calculate
```

#### Credits API
```
GET /api/credits
- Get user's remaining credits

GET /api/limits/usage
PUT /api/limits/usage
- Get or update user usage limit configuration
```

#### Admin API
```
GET /api/admin/users
GET /api/admin/system-stats
POST /api/admin/set-admin
GET /api/admin/models
GET /api/admin/model-analytics
POST /api/admin/sync-pricing
GET /api/admin/logging-health
GET /api/admin/usage-limits
POST /api/admin/usage-limits
PUT /api/admin/usage-limits/[id]
DELETE /api/admin/usage-limits/[id]
GET /api/admin/check-status
GET /api/admin/test-pricing-sync
POST /api/admin/test-pricing-sync

# User Cleanup
GET /api/admin/cleanup-users/preview
POST /api/admin/cleanup-users/execute
GET /api/admin/cleanup-users/execute
GET /api/admin/cleanup-users/logs
GET /api/admin/cleanup-users/count-only
GET /api/admin/cleanup-users/health
GET /api/admin/cleanup-users/schedule
POST /api/admin/cleanup-users/schedule
GET /api/admin/cleanup-users/emergency-disable
POST /api/admin/cleanup-users/emergency-disable
```

#### Configuration & System APIs
```
GET /api/provider-config
PUT /api/provider-config
GET /api/pricing/models
PUT /api/pricing/models
GET /api/version
POST /api/create-polar-customer
GET /api/portal
GET /api/mcp/oauth/proxy
POST /api/mcp/oauth/proxy
```

### 9.2 Authentication Endpoints

```
POST /api/auth/sign-in/anonymous
GET /api/auth/[...betterauth]
POST /api/auth/[...betterauth]
GET /api/auth/polar
POST /api/auth/polar
GET /api/auth/polar/webhooks
POST /api/auth/polar/webhooks
```

---

## 10. Admin Dashboard

### 10.1 Features

- User management
- System statistics
- Model analytics
- Pricing synchronization
- Logging health monitoring
- Usage limits management
- User cleanup controls

### 10.2 User Cleanup System

**Purpose:** Remove inactive anonymous users for database optimization

**Configuration:**
- Threshold days (default: 45)
- Batch size (default: 50)
- Notification settings

**Execution:**
- Manual via admin dashboard
- Scheduled via Vercel cron
- Audit logs maintained

---

## 11. Environment Variables

### 11.1 Required

```bash
DATABASE_URL=                  # PostgreSQL/Neon connection string
AUTH_SECRET=                    # Better Auth secret
POLAR_ACCESS_TOKEN=             # Polar API token
POLAR_PRODUCT_ID=              # Monthly plan product ID
SUCCESS_URL=                   # Checkout success URL
```

### 11.2 Authentication

```bash
# Production
NEXT_PUBLIC_GOOGLE_CLIENT_ID_PROD=
GOOGLE_CLIENT_SECRET_PROD=

# Development
NEXT_PUBLIC_GOOGLE_CLIENT_ID_DEV=
GOOGLE_CLIENT_SECRET_DEV=
```

### 11.3 Polar Configuration

```bash
POLAR_SERVER_ENV=              # "production" or "sandbox"
POLAR_PRODUCT_ID_YEARLY=       # Yearly plan product ID
POLAR_WEBHOOK_SECRET=          # Webhook verification
```

### 11.4 AI Provider API Keys

```bash
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GROQ_API_KEY=
XAI_API_KEY=
OPENROUTER_API_KEY=
REQUESTY_API_KEY=

# Access gating feature flags
BILLING_ENFORCED=false
ALLOW_BYOK_BYPASS=true
OPENROUTER_AGENTIC_WEB_TOOLS_ENABLED=true

# Native web fetch feature flags
NATIVE_WEB_FETCH_ENABLED=false
NATIVE_WEB_FETCH_MAX_CHARS=30000
NATIVE_WEB_FETCH_TIMEOUT_MS=12000
NATIVE_WEB_FETCH_MAX_BYTES=5000000
NATIVE_WEB_FETCH_MAX_REDIRECTS=5
NATIVE_WEB_FETCH_SITE_MODE_ENABLED=false
NATIVE_WEB_FETCH_SITE_MODE_MAX_PAGES=20
NATIVE_WEB_FETCH_SITE_MODE_DEPTH=2
```

### 11.5 Optional

```bash
NEXT_PUBLIC_APP_URL=           # App URL for callbacks
NEXT_PUBLIC_APP_TITLE=         # App title
PREVIEW_DOMAIN=                # Custom preview domain
NGROK_DOMAIN=                  # Ngrok for local dev
BLOB_READ_WRITE_TOKEN=         # Vercel Blob Storage (for document uploads)
BLOB_PUBLIC_URL=               # Optional Blob public base URL
NEXT_PUBLIC_BLOB_URL=          # Optional public Blob base URL fallback
TITLE_GENERATION_MODEL_ID=     # Global title-generation model override (default: openrouter/openai/gpt-5-nano)
OPENROUTER_TITLE_MODEL=        # Provider-specific title model override (default: openrouter/openai/gpt-5-nano)
REQUESTY_TITLE_MODEL=          # Provider-specific title model override (default: requesty/openai/gpt-5-nano)
OPENAI_TITLE_MODEL=
ANTHROPIC_TITLE_MODEL=
GROQ_TITLE_MODEL=
XAI_TITLE_MODEL=
POLAR_PRODUCT_ID_MONTHLY_ALIASES= # Optional comma-separated legacy product IDs
POLAR_PRODUCT_ID_YEARLY_ALIASES=  # Optional comma-separated legacy product IDs
VERBOSE_LOGGING=false
```

---

## 12. Deployment

### 12.1 Build Commands

```bash
pnpm dev          # Development with Turbopack
pnpm build        # Production build with Turbopack
pnpm start        # Start production server
pnpm lint         # ESLint
```

### 12.2 Database Commands

```bash
pnpm db:generate  # Generate Drizzle migration
pnpm db:migrate   # Run migrations
pnpm db:push      # Push schema directly
pnpm db:studio    # Open Drizzle Studio
```

### 12.3 Testing Commands

```bash
pnpm test         # Playwright tests (local)
pnpm test:ui      # Tests with UI
pnpm test:unit    # Jest unit tests
pnpm test:anonymous  # Anonymous user tests
```

### 12.4 Deployment Platform

- **Primary**: Vercel
- **Database**: Neon PostgreSQL (serverless)
- **Max Duration**: 300 seconds (Hobby plan)

---

## 13. Security Considerations

### 13.1 Authentication Security

- Better Auth with session tokens
- 30-day session expiry
- Secure cookie settings
- CSRF protection via SameSite

### 13.2 API Key Security

- Environment variables for defaults
- No server-side logging of keys
- Show/hide toggle in UI
- Per-request key validation

### 13.3 Credit System Security

- Tamper-proof daily message tracking
- Atomic database operations
- Negative balance prevention
- Subscription type validation

### 13.4 Data Privacy

- Client-side image processing; images sent as base64, not stored on server
- Document uploads stored in Vercel Blob with timestamp-based unique names to avoid collisions
- Document content parsed only when the AI uses the `read_file` tool
- Anonymous user support
- User data cleanup system

---

## 14. Performance Optimization

### 14.1 Caching

- Model list: 10-minute TTL
- Model details: 1-hour TTL
- Provider health: 30-second TTL
- Credit cache per request

### 14.2 Database Optimization

- Indexed queries on frequently accessed columns
- Composite indexes for common query patterns
- Cascade deletes for referential integrity

### 14.3 Frontend Optimization

- Turbopack for fast builds
- React Query for data fetching
- Streaming responses with auto-scroll during generation (`useScrollToBottom`)
- Lazy loading for heavy components

---

## 15. Monitoring & Observability

### 15.1 Logging

- Structured logging with performant utilities
- Request boundary tracking
- Performance metrics
- Error tracking

### 15.2 Health Checks

- `/api/version` - Application version
- Admin logging health dashboard
- Provider health monitoring

### 15.3 Analytics

- Vercel Analytics integration
- Model usage tracking
- Cost analytics
- User behavior metrics

---

## 16. Future Roadmap

### 16.1 Planned Features

- [ ] Additional OAuth providers (GitHub, Microsoft)
- [ ] Voice input/output
- [ ] Conversation branching
- [ ] Team/organization support
- [ ] Custom model fine-tuning integration
- [ ] Advanced analytics dashboard
- [ ] API access for subscribers

### 16.2 Known Limitations

- No offline support (requires internet)
- Images stored temporarily during chat
- Some models may have rate limits
- Web search requires a signed-in user, an OpenRouter model with web-search support, and either ≥5 Polar credits or a BYOK OpenRouter API key (not tied to subscription status alone)
- Whole-site web fetch mode is gated behind a disabled-by-default flag

---

## 17. License

Apache License 2.0

---

## 18. Acknowledgments

- Original project by [Zaid Mukaddam](https://github.com/zaidmukaddam/scira-mcp-chat)
- Built with [Vercel AI SDK](https://sdk.vercel.ai)
- Powered by [Model Context Protocol](https://modelcontextprotocol.io)
- UI components from [shadcn/ui](https://ui.shadcn.com)

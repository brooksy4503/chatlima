# ChatLima - Full Application Specification

**Version:** 0.37.0  
**Last Updated:** February 2026

---

## 1. Executive Summary

ChatLima is a feature-rich, MCP-powered AI chatbot application with multi-model support, advanced tool integration, and a comprehensive credit/billing system. Built on Next.js 15 with the App Router, it provides seamless access to 300+ AI models through dynamic provider integration while offering anonymous usage, Google OAuth authentication, and a tiered subscription model via Polar.

### Key Differentiators
- **Dynamic Model Loading**: Real-time fetching from OpenRouter and Requesty APIs
- **Model Context Protocol (MCP)**: Full MCP 1.20.2 support with OAuth 2.1 authorization
- **Flexible Authentication**: Anonymous users (10 msg/day) + Google OAuth (20 msg/day)
- **Dual Subscription Tiers**: Monthly ($10/mo, 1,000 messages) and Yearly ($10/yr, unlimited free models)
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
| AI SDK | Vercel AI SDK 4.3.9 |
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
│   │   ├── admin/           # Admin endpoints
│   │   └── ...
│   ├── chat/[id]/           # Chat page
│   ├── models/              # SEO model pages
│   ├── compare/             # Model comparison
│   ├── upgrade/             # Subscription upgrade
│   ├── admin/               # Admin dashboard
│   └── ...
├── components/               # React components
│   ├── ui/                  # shadcn/ui primitives
│   ├── auth/                # Auth components
│   ├── admin/               # Admin components
│   ├── token-metrics/       # Usage analytics
│   ├── file-upload.tsx      # Upload UI (drag-drop, picker)
│   ├── file-preview.tsx    # Preview for images & document metadata
│   └── ...
├── lib/                      # Shared utilities
│   ├── db/                  # Database config & schema
│   ├── services/            # Business logic services
│   ├── models/              # Model fetching & config
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

The application uses 8 specialized services for maintainability:

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

### 3.6 Billing & Polar Integration

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

### 3.7 Other Tables

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

| User Type | Daily Messages | Monthly Credits | Features |
|-----------|---------------|-----------------|----------|
| Anonymous | 10 | None | Basic models only |
| Free Google | 20 | None | Standard models |
| Monthly Subscriber ($10/mo) | 1,000/month | Credit-based | All models |
| Yearly Subscriber ($10/yr) | Unlimited | Free models only | Free-tier models |

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
- Model list: 1-hour TTL
- Model details: 24-hour TTL
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

| Plan | Price | Messages | Model Access |
|------|-------|----------|--------------|
| Monthly | $10/month | 1,000/month | All models |
| Yearly | $10/year | Unlimited | Free models only |

### 7.2 Credit Cost Tiers

Based on model pricing ($/M tokens):

| Pricing Range | Credits/Message |
|---------------|-----------------|
| Free/Standard (<$3/M) | 1 |
| Premium ($3-15/M) | 2 |
| High Premium ($15-50/M) | 5 |
| Very High Premium ($50-100/M) | 15 |
| Ultra Premium ($100+/M) | 30 |

### 7.3 Special Feature Costs

| Feature | Cost |
|---------|------|
| Web Search | 5 credits/search |

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

1. Check for yearly subscription (unlimited free models)
2. Check Polar credits for authenticated users
3. Fall back to daily message limit
4. Block on negative credits

---

## 8. Features

### 8.1 Chat Features

- **Streaming Responses**: Real-time AI response streaming with visual indicators
- **Dual-Path File Upload**: Up to 5 files per message, 30 MB max per file. Images (JPEG, PNG, WebP) sent as base64 for vision; documents (PDF, CSV, Excel) and text/code files uploaded to Vercel Blob and exposed to the AI via a `read_file` tool (content parsed on demand). Parser limits: Excel 1,000 rows/sheet, CSV 10,000 rows.
- **Web Search**: Premium web search via OpenRouter with citations
- **Code Detection**: Auto-wrap pasted code in markdown blocks
- **Smart Title Generation**: Dynamic model selection for conversation titles

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

### 8.3 Image & File Processing

- **Images**: Drag-and-drop upload, client-side validation and compression, preview with full-screen modal, metadata (dimensions, size), detail level (low/high/auto).
- **Documents**: File preview component for images and document metadata; client-side validation for type and size before upload. Document content is fetched and parsed only when the AI calls the `read_file` tool.

### 8.4 PDF Export & Sharing

- One-click PDF download
- Professional formatting with branding
- Full markdown support
- Social sharing (Twitter, Facebook, LinkedIn)
- Direct link copying

### 8.5 SEO Features

- Dynamic model pages at `/model/[slug]`
- Model comparison at `/compare/[slug]`
- Auto-generated sitemap
- Structured data for models

---

## 9. API Reference

### 9.1 Core Endpoints

#### Chat API
```
POST /api/chat
- Main chat endpoint with streaming
- Handles MCP tools, web search, images (base64), file references (Blob URLs)
- Integrates read_file tool for uploaded documents
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

GET /api/models/[modelId]/credit-cost
- Returns credit cost for specific model
```

#### Chats API
```
GET /api/chats
- List user's chats

POST /api/chats
- Create new chat

GET /api/chats/[id]
- Get specific chat

DELETE /api/chats/[id]
- Delete chat

GET /api/chats/[id]/export-pdf
- Export chat as PDF

POST /api/chats/[id]/share
- Create shareable link

GET /api/chats/shared/[shareId]
- Get shared chat
```

#### Presets API
```
GET /api/presets
POST /api/presets
GET /api/presets/[id]
PUT /api/presets/[id]
DELETE /api/presets/[id]
POST /api/presets/[id]/set-default
POST /api/presets/[id]/share
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
```

#### Credits API
```
GET /api/credits
- Get user's remaining credits
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

# User Cleanup
GET /api/admin/cleanup-users/preview
POST /api/admin/cleanup-users/execute
GET /api/admin/cleanup-users/logs
POST /api/admin/cleanup-users/emergency-disable
```

### 9.2 Authentication Endpoints

```
POST /api/auth/sign-in/anonymous
GET /api/auth/[...betterauth]
POST /api/auth/polar
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
```

### 11.5 Optional

```bash
NEXT_PUBLIC_APP_URL=           # App URL for callbacks
NEXT_PUBLIC_APP_TITLE=         # App title
PREVIEW_DOMAIN=                # Custom preview domain
NGROK_DOMAIN=                  # Ngrok for local dev
BLOB_READ_WRITE_TOKEN=         # Vercel Blob Storage (for document uploads)
```

---

## 12. Deployment

### 12.1 Build Commands

```bash
npm run dev          # Development with Turbopack
npm run build        # Production build with Turbopack
npm run start        # Start production server
npm run lint         # ESLint
```

### 12.2 Database Commands

```bash
npm run db:generate  # Generate Drizzle migration
npm run db:migrate   # Run migrations
npm run db:push      # Push schema directly
npm run db:studio    # Open Drizzle Studio
```

### 12.3 Testing Commands

```bash
npm run test         # Playwright tests (local)
npm run test:ui      # Tests with UI
npm run test:unit    # Jest unit tests
npm run test:anonymous  # Anonymous user tests
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

- Model list: 1-hour TTL
- Model details: 24-hour TTL
- Credit cache per request

### 14.2 Database Optimization

- Indexed queries on frequently accessed columns
- Composite indexes for common query patterns
- Cascade deletes for referential integrity

### 14.3 Frontend Optimization

- Turbopack for fast builds
- React Query for data fetching
- Streaming responses
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
- Web search requires subscription

---

## 17. License

Apache License 2.0

---

## 18. Acknowledgments

- Original project by [Zaid Mukaddam](https://github.com/zaidmukaddam/scira-mcp-chat)
- Built with [Vercel AI SDK](https://sdk.vercel.ai)
- Powered by [Model Context Protocol](https://modelcontextprotocol.io)
- UI components from [shadcn/ui](https://ui.shadcn.com)

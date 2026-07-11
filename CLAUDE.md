# CLAUDE.md

This file provides guidance to Claude Code and other AI coding agents when working with code in this repository. Keep this file aligned with `AGENTS.md` and `.cursor/rules/`.

## Source of Truth and Regression Prevention

**SPEC.md is the source of truth for this application's architecture.**

Before implementing features or making architectural changes:
1. Consult `SPEC.md` to ensure alignment with documented product behavior, architecture, database schema, API contracts, AI provider behavior, credit/billing rules, and MCP support.
2. Identify existing behavior that must be preserved before editing.
3. Do not remove or simplify existing features unless the user explicitly asks for that.
4. If a change would deviate from the spec, flag it for discussion before editing.
5. After implementing significant behavior changes, update `SPEC.md` to keep it current.

Key sections to reference:
- Section 3: Database Schema (before schema changes)
- Section 5: AI Provider Integration (before adding providers)
- Section 7: Credit & Billing System (before modifying billing)
- Section 9: API Reference (before adding/modifying endpoints)

High-risk areas require extra care: authentication, anonymous usage limits, subscriptions and credits, chat persistence, message streaming, model/provider routing, API key handling, MCP tools, file upload/readers, and admin flows.

## Development Commands

### Build and Development
```bash
pnpm dev          # Start development server with turbopack
pnpm build        # Build production bundle with turbopack
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

### Testing
```bash
pnpm test         # Run Playwright tests (local config)
pnpm test:ui      # Run tests with UI
pnpm test:debug   # Run tests in debug mode
pnpm test:headed  # Run tests in headed mode
pnpm test:anonymous  # Run anonymous user tests
```

### Database Operations
```bash
pnpm db:generate  # Generate Drizzle schema
pnpm db:migrate   # Run database migrations
pnpm db:push      # Push schema to database
pnpm db:studio    # Open Drizzle Studio
```

### Utilities
```bash
pnpm pricing:analysis  # Analyze OpenRouter pricing with tsx
```

## Architecture Overview

### Core Technologies
- **Framework**: Next.js 15 with App Router and Turbopack
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with Google OAuth and anonymous users
- **Payments**: Polar integration for credit system
- **AI**: Multiple providers (OpenRouter, Anthropic, OpenAI, Groq, X AI, Requesty)
- **UI**: Tailwind CSS with shadcn/ui components
- **Testing**: Playwright for E2E testing

### Key Architecture Patterns

#### Authentication Flow
- Better Auth handles both Google OAuth and anonymous users
- Anonymous users get 10 messages/day, Google users get 20
- Credit system overrides daily limits for paid users
- User linking from anonymous to authenticated accounts

#### AI Integration
- Multiple AI providers with unified interface in `ai/providers.ts`
- Model Context Protocol (MCP) support for external tools
- Dynamic API key management with runtime overrides
- Credit validation prevents negative balance

#### Database Schema
- Main schema in `lib/db/schema.ts` with Drizzle ORM
- Better Auth schema integrated with custom user tables
- Chat/message storage with JSON parts for flexibility
- Polar usage events tracking

#### Credit System
- Polar integration for billing and subscription management
- Credit-based usage with real-time validation
- Automatic customer creation and management
- Usage tracking for billing accuracy

### Directory Structure

#### Core Application
- `app/` - Next.js App Router pages and API routes
- `components/` - React components (shadcn/ui based)
- `lib/` - Shared utilities, database, and authentication
- `hooks/` - Custom React hooks
- `ai/` - AI provider configurations and utilities

#### API Routes
- `app/api/auth/` - Authentication endpoints
- `app/api/chat/` - Chat functionality
- `app/api/credits/` - Credit management
- `app/api/polar/` - Polar webhooks and integration

#### Database
- `drizzle/` - Database migrations and schema snapshots
- `lib/db/` - Database configuration and schema definitions

#### Development
- `tests/` - Playwright E2E tests
- `scripts/` - Development and analysis scripts
- `.cursor/rules/` - Cursor IDE workflow rules

### Key Files

#### Authentication
- `lib/auth.ts` - Better Auth configuration with Google OAuth
- `auth-schema.ts` - Auth schema definitions
- `lib/auth-client.ts` - Client-side auth utilities

#### Database
- `lib/db/schema.ts` - Main database schema with Drizzle
- `drizzle.config.ts` - Drizzle configuration

#### AI & Chat
- `ai/providers.ts` - AI provider configurations
- `lib/chat-store.ts` - Chat state management
- `lib/openrouter-utils.ts` - OpenRouter utilities

#### UI Components
- `components/chat.tsx` - Main chat interface
- `components/message.tsx` - Message display
- `components/model-picker.tsx` - AI model selection
- `components/settings-sheet.tsx` - Unified settings panel with horizontal tabs
- `components/settings/` - Settings tab components (API Keys, MCP Servers, Provider Health, Preferences)
- `components/mcp-server-manager.tsx` - MCP server management
- `components/api-key-manager.tsx` - API key management with embedded mode support
- `components/api-key-manager.tsx` - API key management with embedded mode support

### Environment Configuration

#### Required Environment Variables
- `AUTH_SECRET` - Better Auth secret
- `POLAR_ACCESS_TOKEN` - Polar API token
- `POLAR_PRODUCT_ID` - Polar product ID
- `SUCCESS_URL` - Checkout success URL
- `POLAR_SERVER_ENV` - "production" or "sandbox"

#### OAuth Configuration
- Production: `NEXT_PUBLIC_GOOGLE_CLIENT_ID_PROD`, `GOOGLE_CLIENT_SECRET_PROD`
- Development: `NEXT_PUBLIC_GOOGLE_CLIENT_ID_DEV`, `GOOGLE_CLIENT_SECRET_DEV`

### Development Workflow

#### Feature Development
- Stay on the current branch unless the user asks to create or switch branches
- Feature-branch naming and setup live in `.cursor/rules/feature-branch-creation-workflow.mdc` — use only when the user requests a new branch
- Use `vercel deploy` for preview testing (never `--prod` on features)
- Follow conventional commit messages when committing
- Test thoroughly before merging

#### Database Changes
1. Modify schema in `lib/db/schema.ts`
2. Run `npm run db:generate` to create migration
3. Run `npm run db:migrate` to apply changes
4. Test with `npm run db:studio`

#### Testing
- Use Playwright for E2E testing
- Test both anonymous and authenticated user flows
- Test credit system and payment flows
- Run `npm run test:anonymous` for anonymous user tests

### Common Development Tasks

#### Adding New AI Provider
1. Add provider config to `ai/providers.ts`
2. Update model picker in `components/model-picker.tsx`
3. Test with credit system integration

#### Database Schema Updates
1. Update `lib/db/schema.ts`
2. Generate migration with `npm run db:generate`
3. Review migration in `drizzle/` directory
4. Apply with `npm run db:migrate`

#### New API Endpoints
1. Create in `app/api/` following existing patterns
2. Add authentication checks for protected routes
3. Include credit validation for paid features
4. Test with both anonymous and authenticated users

### Security Considerations
- All API keys stored in environment variables
- Credit validation prevents negative balances
- User data protection with anonymous usage support
- Secure authentication with Better Auth
- CORS configuration for trusted origins

### Performance Optimization
- Turbopack for fast development builds
- Database query optimization with Drizzle
- Token usage tracking for cost optimization
- Real-time pricing analysis tools available
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Development
```bash
npm run dev          # Start development server with turbopack
npm run build        # Build production bundle with turbopack
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Testing
```bash
npm run test         # Run Playwright tests (local config)
npm run test:ui      # Run tests with UI
npm run test:debug   # Run tests in debug mode
npm run test:headed  # Run tests in headed mode
npm run test:anonymous  # Run anonymous user tests
```

### Database Operations
```bash
npm run db:generate  # Generate Drizzle schema
npm run db:migrate   # Run database migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
```

### Utilities
```bash
npm run pricing:analysis  # Analyze OpenRouter pricing with tsx
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
- `components/mcp-server-manager.tsx` - MCP server management

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
Follow `.cursor/rules/` workflow:
1. Create feature branch using standardized naming
2. Use `vercel deploy` for preview testing (never `--prod` on features)
3. Follow conventional commit messages
4. Test thoroughly before merging

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
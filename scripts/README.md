# Scripts Directory

This directory contains utility scripts for development, maintenance, and testing tasks for the ChatLima project.

## 📁 Script Categories

### 🧹 Anonymous User Cleanup System
A comprehensive system for managing inactive anonymous users with multiple implementation phases.

### 🔄 Model Endpoint Testing
Tools for testing and monitoring API model endpoints to ensure reliability.

### 💰 Cost Analysis & Tracking
Scripts for analyzing pricing, tracking token usage, and managing cost optimization.

### 🔧 Database & Migration Tools
Utilities for database operations, migrations, and data integrity.

### 🧪 Testing & Validation
Various testing scripts for API endpoints, security, and system components.

### ⚙️ Development Utilities
Helper scripts for development workflow and maintenance tasks.

---

## 📝 Complete Script List

### Anonymous User Cleanup System

#### `cleanup-anonymous-users.ts` ✨ Main CLI Script
**Phase 2 implementation** - Command-line interface for cleaning up inactive anonymous users.

**Features:**
- Multiple execution modes (preview, interactive, automated)
- Safety validations and confirmations  
- Enhanced logging and error handling
- Configurable thresholds and batch sizes

**Usage:**
```bash
# Preview mode (safe, read-only)
pnpm exec tsx scripts/cleanup-anonymous-users.ts --preview

# Interactive mode with prompts
pnpm exec tsx scripts/cleanup-anonymous-users.ts --interactive

# Automated execution (requires --confirm for safety)
pnpm exec tsx scripts/cleanup-anonymous-users.ts --days=45 --batch-size=25 --confirm
```

#### `run-cleanup.sh` 🛡️ Wrapper Script
Bash wrapper providing easy-to-use interface with built-in safety checks and color-coded output.

**Usage:**
```bash
./scripts/run-cleanup.sh preview           # Safe preview mode
./scripts/run-cleanup.sh interactive       # Interactive execution
./scripts/run-cleanup.sh execute --confirm # Direct execution
```

#### `test-cleanup-database.ts` 🗄️ Database Integration Test
Tests database tables and service functions for the cleanup system.

**Features:**
- Tests configuration read/write operations
- Validates execution logging functionality  
- Verifies logs retrieval with filtering
- Confirms historical data access

### Model Endpoint Testing

#### `test-model-endpoints.ts` 🧪 Endpoint Testing System
**Comprehensive testing system** that automatically tests every model endpoint from OpenRouter and Requesty to identify and block non-working models.

**Features:**
- Tests all models from OpenRouter and Requesty APIs
- Records failures with detailed error information
- Automatically filters blocked models during normal operation
- Tracks metadata like retry counts, last tested time, and error details
- Persistent storage in `lib/models/blocked-models.json`

**Usage:**
```bash
# Test a few models from each provider (recommended)
pnpm test:endpoints:quick

# Test all models from all providers
pnpm test:endpoints

# Test specific provider
pnpm test:endpoints:openrouter
pnpm test:endpoints:requesty

# Re-test previously blocked models
pnpm test:endpoints:retest

# View summary
pnpm test:endpoints:summary
```

**Configuration:**
- Request timeout: 30 seconds
- Rate limiting: 1 second between requests
- Max retries: 2
- Test message: "Hello" with 1 token output

### Cost Analysis & Tracking

#### `dynamic-api-pricing-analysis.ts` 💰 Pricing Analysis Tool
Fetches model data from OpenRouter and Requesty APIs and calculates estimated costs for different user types.

**Features:**
- Multi-provider support (OpenRouter and Requesty)
- Cost estimation for per-message, daily, and monthly usage
- User type analysis (anonymous vs Google vs credit users)
- Provider comparison and cost breakdown
- Real-time API data fetching

**Usage:**
```bash
npx tsx scripts/dynamic-api-pricing-analysis.ts
```

**Token Estimates:** 2,701 input + 441 output tokens per message (based on actual usage data)

#### `analyze-openrouter-data.py` 📊 OpenRouter Data Analysis
Python script that analyzes OpenRouter activity CSV to determine realistic token estimates.

**Usage:**
```bash
python scripts/analyze-openrouter-data.py /path/to/openrouter_activity.csv
```

**Features:**
- Extracts token usage statistics from real data
- Provides ChatLima-specific recommendations
- Analyzes cost per request and usage patterns
- Compares different models and pricing

#### `backfill-token-metrics.ts` 🔄 Token Metrics Recovery
Recovers missing analytics data from billing records to address critical data loss.

**Features:**
- Backfills missing `token_usage_metrics` from `polar_usage_events`
- Estimates token usage from credits consumed
- Generates synthetic but consistent identifiers
- Marks backfilled data with metadata flags

**Usage:**
```bash
pnpm exec tsx scripts/backfill-token-metrics.ts
```

#### `run-backfill.sh` 🚀 Backfill Wrapper
Bash wrapper for the token metrics backfill process with user confirmations and progress tracking.

#### `test-openrouter-cost-tracking.ts` 💸 Cost Tracking Test
Tests the OpenRouter cost tracking functionality including generation ID extraction and actual cost fetching.

#### `sync-pricing.ts` 📈 Pricing Sync
Synchronizes pricing data from provider APIs to the database.

### Database & Migration Tools

#### `test-cleanup-database.ts` 🗃️ Database Integration Test  
**Database integration testing** for cleanup system tables and operations.

**Phase 3 Database Features:**
- **`cleanup_execution_logs` table**: Complete audit trail of all cleanup operations
- **`cleanup_config` table**: System configuration with admin change tracking  
- **CleanupConfigService**: Type-safe database operations with error handling
- Full CRUD operations with advanced querying and filtering

**Testing:**
```bash
pnpm exec tsx scripts/test-cleanup-database.ts
```

#### `set-admin.ts` 👑 Admin User Setup
Sets a user as admin in the database.

**Usage:**
```bash
pnpm tsx scripts/set-admin.ts <email>
```

#### `verify-cost-tracking-fix.sql` 🔍 Cost Tracking Verification
SQL queries to verify OpenRouter cost tracking implementation and check for discrepancies.

### Testing & Validation

#### `test-phase3-endpoints.ts` 🌐 Phase 3 API Testing
**Vercel Cron integration testing** for Phase 3 cleanup system endpoints.

**Tests:**
- Schedule management endpoints (`/api/admin/cleanup-users/schedule`)
- Execution logs endpoints (`/api/admin/cleanup-users/logs`) 
- System health endpoints (`/api/admin/cleanup-users/health`)
- Execute endpoints with cron simulation

#### `test-cron-execution.ts` ⏰ Cron Simulation Test
Simulates Vercel Cron execution locally to test cleanup endpoints before production deployment.

**Features:**
- Tests both cron and manual execution modes
- Checks cron configuration
- Provides authentication guidance
- Vercel header simulation

#### `test-memory-optimization.ts` 🧠 Memory Usage Test
Tests memory optimization for cleanup system to ensure it stays within Vercel function limits.

**Features:**
- Monitors memory usage during operations
- Vercel memory limit compliance (2048 MB with 80% safety margin)
- Performance benchmarking
- Memory leak detection

#### `test-requesty-usage.ts` 🔌 Requesty API Test
Tests Requesty API and inspects token usage data for accurate cost tracking.

#### `test-security.js` 🔒 Basic Security Test
Tests basic chat API security with authentication and premium model access controls.

#### `test-security-vulnerability.js` 🚨 Security Vulnerability Test
Comprehensive security testing for the chat API to identify potential vulnerabilities.

**Tests:**
- Anonymous user with premium model access
- User with own API key (legitimate bypass)
- Anonymous user with free model access

### Development Utilities

#### `debug-polar-api.ts` 🔧 Polar API Debug Tool
Comprehensive debugging tool for Polar API connection issues.

**Features:**
- Environment variable validation
- API connectivity testing
- Customer operations testing
- Credits retrieval testing
- Token validation

**Usage:**
```bash
npx tsx scripts/debug-polar-api.ts [USER_ID]
```

#### `clear-cache.sh` 🧹 Cache Cleaner
Clears Next.js and TypeScript caches for a fresh development start.

**Usage:**
```bash
./scripts/clear-cache.sh
```

#### `get-auth-cookie.md` 🍪 Authentication Guide
Instructions for extracting authentication cookies from browser for testing admin endpoints.

---

## 🏗️ System Implementation Phases

### Phase 1: Basic Functionality ✅
Initial implementation with basic user identification and deletion capabilities.

### Phase 2: CLI Interface ✅ 
**Status:** Complete with known database connection issue

**Deliverables:**
- ✅ Complete TypeScript CLI script (`cleanup-anonymous-users.ts`)
- ✅ Bash wrapper script (`run-cleanup.sh`) 
- ✅ Enhanced logging system with verbose mode
- ✅ Multiple execution modes (preview, interactive, automated)
- ✅ Safety validations and confirmations

**Known Issue:** Database connection compatibility with Neon serverless in Node.js CLI context

### Phase 3: Vercel Cron Integration ✅
**Status:** Complete and Production Ready

**Deliverables:**
- ✅ **Vercel Cron Configuration**: Weekly automated execution (Sundays 2 AM UTC)
- ✅ **Enhanced Admin UI**: Tab-based interface (Overview, Schedule, Logs)
- ✅ **New API Endpoints**: Schedule, logs, and health monitoring
- ✅ **Monitoring System**: Real-time metrics, health scoring, and notifications
- ✅ **Database Integration**: Full audit trail and configuration persistence

**Key Features:**
- **Schedule Management**: Enable/disable automated cleanup with live status
- **Execution History**: Comprehensive logs with filtering and statistics  
- **Health Monitoring**: Real-time metrics and performance trends
- **Alert System**: Automated notifications for failures and anomalies

### Database Integration Phase ✅
**Status:** Complete - All mock data replaced with database integration

**Implementation:**
- ✅ **Database Schema**: `cleanup_execution_logs` and `cleanup_config` tables
- ✅ **Service Layer**: `CleanupConfigService` with type-safe operations
- ✅ **API Integration**: All endpoints updated to use real database storage
- ✅ **Migration Applied**: `drizzle/0039_silent_barracuda.sql`

**Features:**
- **Complete Audit Trail**: Every cleanup execution logged with metadata
- **Real-time Configuration**: Admin UI reflects actual database state  
- **Advanced Analytics**: Real trend analysis and performance metrics
- **Production Ready**: Proper error handling, validation, and optimization

---

## 🚀 Usage Guidelines

### Anonymous User Cleanup

**For Automated Production Use:**
1. Configure via Admin UI Schedule tab
2. Enable automated cleanup
3. Set appropriate thresholds (45+ days recommended)
4. Monitor via Logs tab and health endpoints

**For Manual/Testing Use:**
```bash
# Always start with preview
./scripts/run-cleanup.sh preview

# For safe interactive execution  
./scripts/run-cleanup.sh interactive

# For automated execution (use with caution)
./scripts/run-cleanup.sh execute --confirm --days=45
```

### Model Endpoint Testing

**Regular Testing Schedule:**
1. **Weekly full test**: `pnpm test:endpoints`
2. **Daily retest**: `pnpm test:endpoints:retest` 
3. **Before deployments**: `pnpm test:endpoints:quick`

### Cost Analysis

**Before Major Changes:**
```bash
# Analyze current pricing
npx tsx scripts/dynamic-api-pricing-analysis.ts

# If you have OpenRouter data
python scripts/analyze-openrouter-data.py /path/to/data.csv
```

### Security Testing

**Before Releases:**
```bash
# Test basic security
node scripts/test-security.js

# Test for vulnerabilities  
node scripts/test-security-vulnerability.js
```

---

## 🔧 Environment Requirements

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...

# API Keys (for testing/analysis)
OPENROUTER_API_KEY=sk-or-...
REQUESTY_API_KEY=rq-...

# Polar (for billing/credits)
POLAR_ACCESS_TOKEN=polar_...
POLAR_SERVER_ENV=sandbox|production
POLAR_PRODUCT_ID=...

# For testing admin endpoints
TEST_AUTH_COOKIE=your-session-cookie
```

### Development Setup

```bash
# Install dependencies
pnpm install

# Setup database
pnpm db:migrate

# Start development server
pnpm dev
```

---

## 📊 Monitoring & Health

### Vercel Cron Jobs
- **Schedule**: Weekly on Sundays at 2 AM UTC (`0 2 * * 0`)
- **Memory Limit**: 2048 MB (Hobby plan) 
- **Timeout**: 5 minutes maximum
- **Logs**: Available in Vercel dashboard

### Health Endpoints
- **Health Check**: `/api/admin/cleanup-users/health`
- **Current Config**: `/api/admin/cleanup-users/schedule`
- **Execution Logs**: `/api/admin/cleanup-users/logs`

### Performance Metrics
- **Health Score**: 0-100 based on system performance
- **Success Rate**: Percentage of successful executions
- **Processing Rate**: Users processed per minute
- **Alert Conditions**: Failures, high deletion counts, long execution times

---

## 🔒 Security Features

### Access Control
- **Admin-only Access**: All cleanup endpoints require admin role
- **Input Validation**: All parameters validated and sanitized
- **SQL Injection Prevention**: Drizzle ORM provides protection
- **Authentication Required**: Session-based authentication for all operations

### Audit Trail
- **Configuration Changes**: All admin actions tracked with attribution
- **Execution Logging**: Complete history of all cleanup operations
- **Error Tracking**: Detailed failure information for debugging
- **Timestamp Tracking**: All operations include precise timing data

### Safety Measures
- **Minimum Age Protection**: Never deletes users < 7 days old
- **Confirmation Requirements**: Multiple confirmations for destructive operations
- **Dry Run Mode**: Preview capabilities without data modification
- **Batch Processing**: Configurable limits to prevent system overload

---

## 🛠️ Troubleshooting

### Common Issues

**Database Connection Errors:**
- Verify `DATABASE_URL` in `.env.local`
- Check Neon database status and credentials
- Ensure migrations are applied: `pnpm db:migrate`

**API Key Issues:**
- Verify keys are set in environment variables
- Check key permissions and quotas
- Test keys with minimal requests first

**Cron Job Issues:**
- Verify Vercel plan limits (Hobby vs Pro)
- Check `vercel.json` configuration
- Monitor Vercel function logs

**Memory Issues:**
- Run memory optimization test: `pnpm exec tsx scripts/test-memory-optimization.ts`
- Adjust batch sizes if needed
- Monitor Vercel function metrics

### Debug Commands

```bash
# Test database connectivity
pnpm exec tsx scripts/test-cleanup-database.ts

# Test API endpoints
pnpm exec tsx scripts/test-phase3-endpoints.ts

# Test memory usage
pnpm exec tsx scripts/test-memory-optimization.ts

# Debug Polar API
npx tsx scripts/debug-polar-api.ts [USER_ID]
```

---

## 📚 Documentation

- **Anonymous User Cleanup Plan**: `docs/anonymous-user-cleanup-plan.md`
- **Authentication Guide**: `scripts/get-auth-cookie.md`
- **API Documentation**: Admin UI provides interactive testing
- **Database Schema**: See migration files in `drizzle/`

---

**Status:** All major systems implemented and production-ready ✅

**Last Updated:** Database Integration Phase - August 2025
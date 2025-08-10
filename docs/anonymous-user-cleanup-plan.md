# Anonymous User Cleanup Feature Implementation Plan

## Executive Summary

This document outlines the implementation plan for a feature to automatically clean up inactive anonymous users in the ChatLima application. With 1220+ users (mostly one-time anonymous users), this feature will improve database performance, reduce storage costs, and maintain data hygiene while providing administrative control and safety measures.

**Recommended Approach**: Hybrid Admin Dashboard + Vercel Cron Jobs (Option 5 - Modified)

## Current System Analysis

### Anonymous User Structure
- **Database Field**: `users.isAnonymous` (boolean)
- **Email Pattern**: `temp-{randomId}@anonymous.chatlima.com`
- **Current Count**: 1220 users (majority are inactive anonymous users)
- **Related Data**: chats, messages, sessions, tokenUsageMetrics, etc.

### Activity Tracking Mechanisms
- `chats.updatedAt` - Most recent chat activity
- `sessions.updatedAt` - Most recent session activity  
- `tokenUsageMetrics.createdAt` - Most recent API usage
- `users.createdAt` - Account creation date

### Existing Infrastructure
- **Admin Dashboard**: 6-tab admin interface with robust authentication
- **Script Infrastructure**: TypeScript scripts in `/scripts` directory
- **API Patterns**: Consistent admin API structure with proper auth
- **Database**: Drizzle ORM with PostgreSQL (Neon)

## Implementation Options Analysis

### Option 1: Admin Dashboard Integration ⭐⭐⭐⭐
**Implementation**: Add cleanup section to existing admin dashboard

**Pros**:
- Seamless integration with existing admin UI
- Visual feedback and confirmation dialogs
- Manual control with preview/dry-run capabilities
- Easy monitoring and audit trails
- Follows established admin patterns

**Cons**:
- Requires manual intervention
- No automatic scheduling capability

### Option 2: Standalone CLI Script ⭐⭐⭐
**Implementation**: TypeScript script with command-line interface

**Pros**:
- Lightweight and focused
- Can be run manually or via cron
- Easy to test and debug
- Version controlled parameters

**Cons**:
- Requires server/terminal access
- No visual interface
- Manual execution required

### Option 3: Vercel Cron Jobs ⭐⭐⭐⭐
**Implementation**: Automated scheduling via Vercel's cron functionality

**Pros**:
- Native Vercel integration
- Reliable scheduling (no infrastructure management)
- Configurable via `vercel.json`
- Automatic execution during low-traffic hours

**Cons**:
- Limited by Vercel plan (Hobby: 2 jobs/day, Pro: 40 jobs)
- Less granular control over timing
- Requires careful error handling

### Option 4: API Endpoint + External Schedulers ⭐⭐⭐
**Implementation**: HTTP API triggered by external services

**Pros**:
- Platform-agnostic scheduling
- Easy monitoring via HTTP status
- Integration with external monitoring tools

**Cons**:
- Dependency on external services
- Additional API security considerations

### Option 5: Hybrid Approach ⭐⭐⭐⭐⭐ **[RECOMMENDED]**
**Implementation**: Admin dashboard + Vercel Cron automation

**Features**:
- Admin dashboard for manual control and configuration
- Vercel Cron for automated scheduling
- Configurable schedules with enable/disable toggle
- Real-time monitoring and logs in admin panel
- Manual override and emergency controls

## Vercel Serverless Limitations & Solutions

### ❌ Internal Schedulers Not Supported
**Problem**: `setTimeout`/`setInterval` don't work in Vercel's serverless environment
- Serverless functions are stateless and short-lived
- No persistent background processes
- Functions terminate after request completion

### ✅ Vercel Cron Jobs Solution
**Implementation**: Use Vercel's native cron functionality

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/admin/cleanup-users/execute",
      "schedule": "0 2 * * *"  // Daily at 2 AM UTC
    }
  ]
}
```

**Plan Limits**:
- **Hobby**: 2 cron jobs, once daily execution
- **Pro**: 40 cron jobs, unlimited invocations  
- **Enterprise**: 100 cron jobs, unlimited invocations

**Function Limits**:
```json
// vercel.json
{
  "functions": {
    "api/admin/cleanup-users/*.js": {
      "memory": 3009,
      "maxDuration": 30
    }
  }
}
```

## Activity Determination Logic

### User Activity Definition
A user is considered **active** if they have ANY of the following within the threshold period:

```typescript
interface UserActivity {
  lastChatActivity: Date;      // chats.updatedAt
  lastSessionActivity: Date;   // sessions.updatedAt  
  lastTokenUsage: Date;        // tokenUsageMetrics.createdAt
  accountCreated: Date;        // users.createdAt
}

// Activity Check Logic
const isUserActive = (user: UserActivity, thresholdDays: number = 30): boolean => {
  const threshold = new Date(Date.now() - (thresholdDays * 24 * 60 * 60 * 1000));
  const minimumAge = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)); // 7 days
  
  return (
    user.accountCreated > minimumAge || // Never delete users < 7 days old
    user.lastChatActivity > threshold ||
    user.lastSessionActivity > threshold ||
    user.lastTokenUsage > threshold
  );
};
```

### Safety Checks
- ✅ **Minimum Age**: Never delete users < 7 days old
- ✅ **Activity Verification**: Check ALL activity tables
- ✅ **Relationship Integrity**: Handle foreign key dependencies
- ✅ **Soft Delete Option**: Mark as deleted before hard deletion
- ✅ **Batch Processing**: Process in small batches (50-100 users)
- ✅ **Rollback Capability**: Maintain deletion logs for recovery

## Pros and Cons of Deleting Anonymous Users

### ✅ Advantages

**Database Performance**:
- Reduced table sizes improve query performance
- Faster joins and index operations
- Lower memory usage for database operations

**Storage Optimization**:
- Reduced storage costs (especially important with 1220+ users)
- Faster backup and migration operations
- Improved database maintenance windows

**Data Hygiene**:
- Cleaner user metrics and analytics
- More accurate active user counts
- Reduced noise in admin dashboards and reports

**Privacy & Compliance**:
- Aligns with GDPR "right to be forgotten"
- Demonstrates responsible data stewardship
- Reduces retention of unused personal data

**Security Benefits**:
- Smaller attack surface (fewer accounts to compromise)
- Eliminates orphaned sessions and tokens
- Cleaner audit logs and access patterns

### ❌ Disadvantages

**Data Loss Risks**:
- Permanent loss of user interaction patterns
- Irreversible deletion of potentially valuable analytics
- Lost opportunity to analyze user conversion funnels

**Business Intelligence Impact**:
- Reduced historical behavior data for ML/AI analysis
- Lost insights into user journey patterns
- Impact on growth metrics and trend analysis

**User Experience Issues**:
- Returning users (30+ days later) lose their chat history
- Broken share links from deleted users
- Potential frustration for occasional users

**Technical Complexity**:
- Cascading deletes across related tables
- Risk of breaking referential integrity
- Complex testing and rollback scenarios

## Recommended Implementation Plan

### Phase 1: Admin Dashboard Foundation (Week 1-2)
**Objective**: Build manual control interface

**Deliverables**:
- `components/admin/AdminUserCleanup.tsx` - Admin UI component
- `app/api/admin/cleanup-users/preview/route.ts` - Preview endpoint
- `app/api/admin/cleanup-users/execute/route.ts` - Manual execution endpoint

**Features**:
- Preview mode showing deletion candidates
- Configurable inactivity threshold (default: 45 days)
- Batch size configuration (default: 50 users)
- Safety confirmations and progress indicators
- Detailed logging and audit trails

### Phase 2: CLI Script Capability (Week 2-3)
**Objective**: Enable command-line execution

**Deliverables**:
- `scripts/cleanup-anonymous-users.ts` - CLI script
- `scripts/run-cleanup.sh` - Wrapper script
- Enhanced logging and error handling

**Features**:
```bash
# Preview mode
pnpm exec tsx scripts/cleanup-anonymous-users.ts --preview --days=30

# Interactive confirmation
pnpm exec tsx scripts/cleanup-anonymous-users.ts --interactive

# Automated execution
pnpm exec tsx scripts/cleanup-anonymous-users.ts --days=45 --batch-size=50
```

### Phase 3: Vercel Cron Integration (Week 3-4)
**Objective**: Automated scheduling

**Deliverables**:
- Updated `vercel.json` with cron configuration
- Enhanced admin UI for schedule management
- Monitoring and notification systems

**Configuration**:
```json
{
  "crons": [
    {
      "path": "/api/admin/cleanup-users/execute",
      "schedule": "0 2 * * 0"  // Weekly on Sundays at 2 AM UTC
    }
  ],
  "functions": {
    "api/admin/cleanup-users/*.js": {
      "memory": 3009,
      "maxDuration": 30
    }
  }
}
```

### Phase 4: Advanced Features (Week 4-5)
**Objective**: Production-ready enhancements

**Deliverables**:
- Soft delete implementation
- Advanced monitoring and alerting
- Recovery and rollback capabilities
- Performance optimization

## File Structure

```
├── components/admin/
│   └── AdminUserCleanup.tsx           # Main admin UI component
├── app/api/admin/cleanup-users/
│   ├── preview/route.ts               # Preview deletion candidates
│   ├── execute/route.ts               # Execute cleanup
│   ├── schedule/route.ts              # Schedule management
│   └── logs/route.ts                  # Cleanup history/logs
├── scripts/
│   ├── cleanup-anonymous-users.ts     # CLI script
│   └── run-cleanup.sh                 # Shell wrapper
├── lib/services/
│   └── userCleanupService.ts          # Core cleanup logic
└── docs/
    └── anonymous-user-cleanup-plan.md # This document
```

## Configuration Options

### Environment Variables
```bash
# Cleanup Configuration
CLEANUP_ENABLED=true
CLEANUP_THRESHOLD_DAYS=45
CLEANUP_BATCH_SIZE=50
CLEANUP_DRY_RUN=false

# Safety Settings
CLEANUP_MIN_AGE_DAYS=7
CLEANUP_SOFT_DELETE=true
CLEANUP_RETENTION_DAYS=30
```

### Admin Dashboard Settings
- **Inactivity Threshold**: 30-90 days (default: 45)
- **Batch Size**: 25-100 users (default: 50)
- **Schedule**: Daily/Weekly/Monthly options
- **Safety Mode**: Soft delete vs hard delete toggle

## Monitoring and Alerting

### Metrics to Track
- Number of users deleted per execution
- Execution duration and performance
- Error rates and failure scenarios
- Storage space reclaimed
- Database performance improvements

### Alert Conditions
- ❌ Cleanup execution failures
- ⚠️ Unusually high deletion counts (>10% of anonymous users)
- ⚠️ Long execution times (>5 minutes)
- ✅ Successful cleanup completion notifications

### Logging Requirements
```typescript
interface CleanupLog {
  id: string;
  executedAt: Date;
  executedBy: 'admin' | 'cron' | 'script';
  usersCounted: number;
  usersDeleted: number;
  thresholdDays: number;
  batchSize: number;
  durationMs: number;
  status: 'success' | 'error' | 'partial';
  errorMessage?: string;
  deletedUserIds: string[];
}
```

## Risk Mitigation

### Data Protection
- **Soft Delete First**: Mark as deleted, hard delete later
- **Backup Before Deletion**: Export user data before cleanup
- **Rollback Window**: 30-day recovery period
- **Audit Trail**: Complete logging of all deletions

### Performance Protection
- **Batch Processing**: Limit concurrent operations
- **Rate Limiting**: Prevent database overload
- **Off-Peak Scheduling**: Run during low-traffic hours
- **Circuit Breaker**: Stop on repeated failures

### Operational Protection
- **Manual Override**: Emergency stop capability
- **Preview Mode**: Always test before execution
- **Staged Rollout**: Start with small batches
- **Monitoring**: Real-time status tracking

## Success Metrics

### Performance Improvements
- Database query performance improvement: Target 10-20%
- Storage reduction: Estimated 20-30% with current user base
- Backup/restore time reduction: Target 15-25%

### Operational Benefits
- Reduced admin dashboard noise
- More accurate user analytics
- Improved data compliance posture
- Automated maintenance workflow

## Conclusion

The hybrid approach combining admin dashboard control with Vercel Cron automation provides the optimal balance of:

- **Safety**: Manual oversight with automated safety checks
- **Efficiency**: Automated execution with minimal admin overhead  
- **Flexibility**: Configurable thresholds and scheduling options
- **Monitoring**: Comprehensive logging and alerting
- **Scalability**: Handles current 1220+ users and future growth

This implementation will significantly improve database performance and data hygiene while maintaining full administrative control and safety measures.

---

**Document Version**: 1.0  
**Last Updated**: August 2025  
**Author**: Development Team  
**Status**: Ready for Implementation

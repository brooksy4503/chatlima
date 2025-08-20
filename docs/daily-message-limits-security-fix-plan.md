# Daily Message Limits Security Fix - Implementation Plan

**Status**: Planning Phase  
**Priority**: High Security Issue  
**Issue**: Users can bypass daily message limits by deleting messages  
**Solution**: Implement Daily Message Usage Tracking Table (Solution 1)  

## Problem Statement

### Current Vulnerability
The current message limit system counts existing messages in the database:
```sql
SELECT COUNT(*) FROM messages 
WHERE user_id = ? AND created_at >= start_of_day AND role = 'user'
```

**Critical Flaw**: Users can delete messages to reduce the count and send more messages, effectively bypassing daily limits of 10 (anonymous) and 20 (Google users without credits).

### Impact
- ❌ **Security**: Unlimited message usage for limited users
- ❌ **Cost**: Potential abuse of API resources
- ❌ **Fairness**: System design can be easily exploited

## Solution 1: Daily Message Usage Tracking Table

### Overview
Create a dedicated `dailyMessageUsage` table that tracks daily message attempts independently of actual message existence. This approach:
- ✅ **Cannot be bypassed** by message deletion
- ✅ **Simple and performant** with optimized indexes
- ✅ **Clean architecture** - purpose-built for limits
- ✅ **Auditable** - maintains usage history

## Implementation Plan

### Phase 1: Database Schema Changes

#### 1.1 New Table Definition
```typescript
// lib/db/schema.ts
export const dailyMessageUsage = pgTable('daily_message_usage', {
  id: text('id').primaryKey().notNull().$defaultFn(() => nanoid()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: date('date').notNull(), // YYYY-MM-DD format in UTC
  messageCount: integer('message_count').default(0).notNull(),
  isAnonymous: boolean('is_anonymous').default(false).notNull(),
  lastMessageAt: timestamp('last_message_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  // Constraints
  uniqueUserDate: unique('daily_message_usage_user_date_idx').on(table.userId, table.date),
  checkMessageCountNonNegative: check('check_daily_message_usage_count_non_negative', 
    sql`${table.messageCount} >= 0`),
  checkMessageCountReasonable: check('check_daily_message_usage_count_reasonable', 
    sql`${table.messageCount} <= 1000`), // Safety limit
  
  // Indexes for performance
  userIdIdx: index('idx_daily_message_usage_user_id').on(table.userId),
  dateIdx: index('idx_daily_message_usage_date').on(table.date),
  userDateIdx: index('idx_daily_message_usage_user_date').on(table.userId, table.date),
  isAnonymousIdx: index('idx_daily_message_usage_is_anonymous').on(table.isAnonymous),
}));

// Type exports
export type DailyMessageUsage = typeof dailyMessageUsage.$inferSelect;
export type DailyMessageUsageInsert = typeof dailyMessageUsage.$inferInsert;
```

#### 1.2 Migration Strategy
```sql
-- Migration: Add daily_message_usage table
CREATE TABLE daily_message_usage (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  message_count INTEGER DEFAULT 0 NOT NULL,
  is_anonymous BOOLEAN DEFAULT false NOT NULL,
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT daily_message_usage_user_date_idx UNIQUE(user_id, date),
  CONSTRAINT check_daily_message_usage_count_non_negative CHECK (message_count >= 0),
  CONSTRAINT check_daily_message_usage_count_reasonable CHECK (message_count <= 1000)
);

-- Indexes
CREATE INDEX idx_daily_message_usage_user_id ON daily_message_usage(user_id);
CREATE INDEX idx_daily_message_usage_date ON daily_message_usage(date);
CREATE INDEX idx_daily_message_usage_user_date ON daily_message_usage(user_id, date);
CREATE INDEX idx_daily_message_usage_is_anonymous ON daily_message_usage(is_anonymous);
```

### Phase 2: Service Layer Implementation

#### 2.1 New Service: DailyMessageUsageService
```typescript
// lib/services/dailyMessageUsageService.ts
export class DailyMessageUsageService {
  /**
   * Increment daily message count for user
   * Called BEFORE creating the actual message
   */
  static async incrementDailyUsage(userId: string, isAnonymous: boolean): Promise<{
    newCount: number;
    date: string;
  }>;

  /**
   * Get current daily usage for user
   */
  static async getDailyUsage(userId: string): Promise<{
    messageCount: number;
    date: string;
    hasReachedLimit: boolean;
    limit: number;
    remaining: number;
  }>;

  /**
   * Get usage history for user (admin/analytics)
   */
  static async getUserUsageHistory(userId: string, days: number): Promise<DailyMessageUsage[]>;

  /**
   * Cleanup old usage records (automated cleanup)
   */
  static async cleanupOldUsage(daysToKeep: number): Promise<number>;
}
```

#### 2.2 Core Implementation Details
```typescript
// Key method: incrementDailyUsage
export async function incrementDailyUsage(userId: string, isAnonymous: boolean) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD in UTC
  
  // Use UPSERT pattern for atomic increment
  const result = await db
    .insert(dailyMessageUsage)
    .values({
      userId,
      date: today,
      messageCount: 1,
      isAnonymous,
      lastMessageAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [dailyMessageUsage.userId, dailyMessageUsage.date],
      set: {
        messageCount: sql`${dailyMessageUsage.messageCount} + 1`,
        lastMessageAt: new Date(),
        updatedAt: new Date(),
      },
    })
    .returning({
      messageCount: dailyMessageUsage.messageCount,
      date: dailyMessageUsage.date,
    });

  return result[0];
}
```

### Phase 3: Integration with Chat API

#### 3.1 Modified Chat API Flow
```typescript
// app/api/chat/route.ts - New flow

// 1. BEFORE creating message: Check and increment usage
const dailyUsage = await DailyMessageUsageService.getDailyUsage(userId);

if (dailyUsage.hasReachedLimit) {
  return new Response(JSON.stringify({
    error: "Daily message limit reached",
    message: `You've used ${dailyUsage.messageCount}/${dailyUsage.limit} daily messages.`,
    limit: dailyUsage.limit,
    remaining: dailyUsage.remaining,
    resetTime: "midnight UTC"
  }), { 
    status: 429, 
    headers: { "Content-Type": "application/json" } 
  });
}

// 2. Increment usage counter ATOMICALLY
const newUsage = await DailyMessageUsageService.incrementDailyUsage(userId, isAnonymous);

// 3. Proceed with message creation (existing flow)
// If message creation fails, the counter has still been incremented
// This prevents retrying the same message multiple times to bypass limits
```

#### 3.2 Limit Determination Logic
```typescript
// Updated limit checking logic
function getDailyMessageLimit(isAnonymous: boolean, user?: any): number {
  if (isAnonymous) return 10;
  
  // Google users without credits: check metadata override
  return (user?.metadata?.messageLimit || 20);
}
```

### Phase 4: Migration of Existing Logic

#### 4.1 Replace Current Implementations
- **Remove** message counting from `lib/auth.ts:checkMessageLimit()`
- **Remove** message counting from `lib/services/messageLimitCache.ts`
- **Update** all references to use new `DailyMessageUsageService`

#### 4.2 Backward Compatibility
During transition period:
1. **Dual tracking**: Count both existing messages AND new usage table
2. **Gradual migration**: Move users to new system progressively
3. **Fallback logic**: If usage table missing, fall back to old method

### Phase 5: Data Migration

#### 5.1 Populate Historical Data
```typescript
// Migration script: backfill-daily-usage.ts
async function backfillDailyUsage() {
  // For each user with messages in last 30 days:
  // 1. Count messages per day
  // 2. Create daily_message_usage records
  // 3. Ensure counts match current usage patterns
}
```

#### 5.2 Validation Script
```typescript
// Validation: compare old vs new counting methods
async function validateMigration() {
  const users = await getAllActiveUsers();
  
  for (const user of users) {
    const oldCount = await getMessageCountOldWay(user.id);
    const newCount = await getMessageCountNewWay(user.id);
    
    if (oldCount !== newCount) {
      console.warn(`Mismatch for user ${user.id}: old=${oldCount}, new=${newCount}`);
    }
  }
}
```

## Security Considerations

### 1. Race Condition Prevention
```typescript
// Use database-level atomic operations
await db.transaction(async (tx) => {
  // 1. Check limit
  const usage = await getDailyUsage(userId, tx);
  if (usage.hasReachedLimit) throw new Error('Limit reached');
  
  // 2. Increment atomically
  await incrementDailyUsage(userId, isAnonymous, tx);
  
  // 3. Create message
  await createMessage(messageData, tx);
});
```

### 2. Input Validation
- ✅ **User ID validation**: Ensure valid format and existence
- ✅ **Date validation**: Use UTC dates consistently
- ✅ **Limit validation**: Reasonable upper bounds (1000 messages/day)

### 3. Abuse Prevention
- ✅ **Rate limiting**: Still enforce per-minute limits
- ✅ **Audit logging**: Track unusual usage patterns
- ✅ **Monitoring**: Alert on suspicious activity

## Performance Considerations

### 1. Database Performance
- **Indexed queries**: All lookups use optimized indexes
- **Partitioning**: Consider partitioning by date for large datasets
- **Cleanup**: Automated removal of old records (30-90 days)

### 2. Caching Strategy
```typescript
// Optional: Redis cache for current day usage
const cacheKey = `daily_usage:${userId}:${today}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// Fallback to database
const usage = await getDailyUsageFromDB(userId);
await redis.setex(cacheKey, 3600, JSON.stringify(usage));
```

### 3. Monitoring Metrics
- Query performance on `daily_message_usage` table
- Cache hit rates (if implemented)
- Daily usage distribution patterns

## Testing Strategy

### 1. Unit Tests
```typescript
// Test cases
describe('DailyMessageUsageService', () => {
  test('increments usage correctly');
  test('enforces daily limits');
  test('handles concurrent requests');
  test('resets at midnight');
  test('distinguishes anonymous vs authenticated users');
});
```

### 2. Integration Tests
- **API endpoint testing**: Chat API with new limits
- **Database integrity**: Foreign key constraints
- **Migration testing**: Data consistency during transition

### 3. Load Testing
- **Concurrent usage**: Multiple users hitting limits simultaneously
- **High volume**: Simulate peak usage scenarios
- **Edge cases**: Midnight boundary conditions

## Rollout Plan

### Phase 1: Development & Testing (Week 1)
- [ ] Implement database schema changes
- [ ] Create `DailyMessageUsageService`
- [ ] Write comprehensive tests
- [ ] Performance benchmarking

### Phase 2: Staging Deployment (Week 2)
- [ ] Deploy to staging environment
- [ ] Run migration scripts
- [ ] Validate data consistency
- [ ] Load testing

### Phase 3: Production Migration (Week 3)
- [ ] **Low-traffic deployment**: Deploy during off-peak hours
- [ ] **Gradual rollout**: Enable for 10% of users initially
- [ ] **Monitoring**: Watch for errors/performance issues
- [ ] **Full deployment**: Roll out to all users

### Phase 4: Cleanup (Week 4)
- [ ] Remove old message counting logic
- [ ] Archive old usage data
- [ ] Documentation updates
- [ ] Performance optimization

## Monitoring & Alerting

### Key Metrics
1. **Usage patterns**: Daily message distribution
2. **Error rates**: Failed increment operations
3. **Performance**: Query response times
4. **Abuse detection**: Unusual usage spikes

### Alerts
- Database connection errors
- Migration inconsistencies  
- Unusual usage patterns
- Performance degradation

## Backup & Recovery

### Data Protection
- **Regular backups**: Include `daily_message_usage` table
- **Point-in-time recovery**: Ability to restore to specific timestamps
- **Data retention**: Keep usage history for 90 days

### Rollback Plan
If issues arise:
1. **Immediate**: Disable new logic, revert to old counting
2. **Short-term**: Fix issues while maintaining service
3. **Long-term**: Re-deploy after thorough testing

## Success Criteria

### Primary Goals
- ✅ **Security**: Message limits cannot be bypassed by deletion
- ✅ **Performance**: No significant impact on API response times
- ✅ **Reliability**: 99.9% uptime during migration
- ✅ **Data integrity**: No lost usage data

### Acceptance Tests
1. User cannot exceed daily limits by deleting messages
2. Limits reset properly at midnight UTC
3. Anonymous (10) and Google (20) limits enforced correctly
4. System handles concurrent requests without race conditions
5. Migration completes without data loss

---

## Implementation Checklist

- [ ] **Database schema** designed and reviewed
- [ ] **Migration scripts** created and tested
- [ ] **Service layer** implemented with full test coverage  
- [ ] **API integration** updated and validated
- [ ] **Performance testing** completed successfully
- [ ] **Security review** passed
- [ ] **Documentation** updated
- [ ] **Monitoring** configured
- [ ] **Rollback plan** prepared and tested
- [ ] **Production deployment** scheduled and executed

**Estimated Timeline**: 3-4 weeks  
**Risk Level**: Medium (database migration required)  
**Impact**: High (closes critical security vulnerability)

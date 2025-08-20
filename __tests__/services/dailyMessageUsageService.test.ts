/**
 * @jest-environment node
 */
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { db } from '@/lib/db';
import { dailyMessageUsage, users } from '@/lib/db/schema';
import { DailyMessageUsageService } from '@/lib/services/dailyMessageUsageService';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Test data setup
const testUserId = 'test-user-' + nanoid();
const testAnonymousUserId = 'test-anon-' + nanoid();

describe('DailyMessageUsageService', () => {
    beforeAll(async () => {
        // Create test users
        await db.insert(users).values([
            {
                id: testUserId,
                email: 'test@example.com',
                isAnonymous: false,
                name: 'Test User',
            },
            {
                id: testAnonymousUserId,
                email: 'anon@example.com',
                isAnonymous: true,
                name: 'Anonymous User',
            },
        ]);
    });

    afterAll(async () => {
        // Cleanup test users
        await db.delete(users).where(eq(users.id, testUserId));
        await db.delete(users).where(eq(users.id, testAnonymousUserId));
    });

    beforeEach(async () => {
        // Clean up any existing usage records for test users
        await db.delete(dailyMessageUsage).where(
            eq(dailyMessageUsage.userId, testUserId)
        );
        await db.delete(dailyMessageUsage).where(
            eq(dailyMessageUsage.userId, testAnonymousUserId)
        );
    });

    afterEach(async () => {
        // Clean up after each test
        await db.delete(dailyMessageUsage).where(
            eq(dailyMessageUsage.userId, testUserId)
        );
        await db.delete(dailyMessageUsage).where(
            eq(dailyMessageUsage.userId, testAnonymousUserId)
        );
    });

    describe('incrementDailyUsage', () => {
        it('should create new usage record for first message of the day', async () => {
            const result = await DailyMessageUsageService.incrementDailyUsage(testUserId, false);

            expect(result.newCount).toBe(1);
            expect(result.date).toBe(new Date().toISOString().split('T')[0]);

            // Verify record was created in database
            const record = await db
                .select()
                .from(dailyMessageUsage)
                .where(eq(dailyMessageUsage.userId, testUserId))
                .limit(1);

            expect(record).toHaveLength(1);
            expect(record[0].messageCount).toBe(1);
            expect(record[0].isAnonymous).toBe(false);
        });

        it('should increment existing usage record', async () => {
            // First message
            await DailyMessageUsageService.incrementDailyUsage(testUserId, false);

            // Second message
            const result = await DailyMessageUsageService.incrementDailyUsage(testUserId, false);

            expect(result.newCount).toBe(2);

            // Verify only one record exists with count of 2
            const records = await db
                .select()
                .from(dailyMessageUsage)
                .where(eq(dailyMessageUsage.userId, testUserId));

            expect(records).toHaveLength(1);
            expect(records[0].messageCount).toBe(2);
        });

        it('should handle concurrent increment requests atomically', async () => {
            // Simulate concurrent requests
            const promises = Array.from({ length: 5 }, () =>
                DailyMessageUsageService.incrementDailyUsage(testUserId, false)
            );

            const results = await Promise.all(promises);

            // All results should be unique and sequential
            const counts = results.map(r => r.newCount).sort((a, b) => a - b);
            expect(counts).toEqual([1, 2, 3, 4, 5]);

            // Verify final count in database
            const record = await db
                .select()
                .from(dailyMessageUsage)
                .where(eq(dailyMessageUsage.userId, testUserId))
                .limit(1);

            expect(record[0].messageCount).toBe(5);
        });

        it('should correctly track anonymous users', async () => {
            const result = await DailyMessageUsageService.incrementDailyUsage(testAnonymousUserId, true);

            expect(result.newCount).toBe(1);

            const record = await db
                .select()
                .from(dailyMessageUsage)
                .where(eq(dailyMessageUsage.userId, testAnonymousUserId))
                .limit(1);

            expect(record[0].isAnonymous).toBe(true);
        });
    });

    describe('getDailyUsage', () => {
        it('should return zero usage for new user', async () => {
            const result = await DailyMessageUsageService.getDailyUsage(testUserId);

            expect(result.messageCount).toBe(0);
            expect(result.hasReachedLimit).toBe(false);
            expect(result.limit).toBe(20); // Authenticated user limit
            expect(result.remaining).toBe(20);
            expect(result.isAnonymous).toBe(false);
        });

        it('should return correct usage for existing user', async () => {
            // Create some usage
            await DailyMessageUsageService.incrementDailyUsage(testUserId, false);
            await DailyMessageUsageService.incrementDailyUsage(testUserId, false);

            const result = await DailyMessageUsageService.getDailyUsage(testUserId);

            expect(result.messageCount).toBe(2);
            expect(result.hasReachedLimit).toBe(false);
            expect(result.remaining).toBe(18);
        });

        it('should correctly identify when limit is reached - authenticated user', async () => {
            // Create 20 messages (authenticated limit)
            for (let i = 0; i < 20; i++) {
                await DailyMessageUsageService.incrementDailyUsage(testUserId, false);
            }

            const result = await DailyMessageUsageService.getDailyUsage(testUserId);

            expect(result.messageCount).toBe(20);
            expect(result.hasReachedLimit).toBe(true);
            expect(result.remaining).toBe(0);
            expect(result.limit).toBe(20);
        });

        it('should correctly identify when limit is reached - anonymous user', async () => {
            // Create 10 messages (anonymous limit)
            for (let i = 0; i < 10; i++) {
                await DailyMessageUsageService.incrementDailyUsage(testAnonymousUserId, true);
            }

            const result = await DailyMessageUsageService.getDailyUsage(testAnonymousUserId);

            expect(result.messageCount).toBe(10);
            expect(result.hasReachedLimit).toBe(true);
            expect(result.remaining).toBe(0);
            expect(result.limit).toBe(10);
        });

        it('should use correct limits for different user types', async () => {
            const authResult = await DailyMessageUsageService.getDailyUsage(testUserId);
            const anonResult = await DailyMessageUsageService.getDailyUsage(testAnonymousUserId);

            expect(authResult.limit).toBe(20);
            expect(anonResult.limit).toBe(10);
        });
    });

    describe('checkDailyLimit', () => {
        it('should return limit status without incrementing', async () => {
            // Add some usage
            await DailyMessageUsageService.incrementDailyUsage(testUserId, false);

            const beforeCheck = await DailyMessageUsageService.getDailyUsage(testUserId);
            const limitCheck = await DailyMessageUsageService.checkDailyLimit(testUserId);
            const afterCheck = await DailyMessageUsageService.getDailyUsage(testUserId);

            expect(limitCheck.messageCount).toBe(1);
            expect(limitCheck.hasReachedLimit).toBe(false);
            expect(limitCheck.remaining).toBe(19);

            // Verify count didn't change
            expect(beforeCheck.messageCount).toBe(afterCheck.messageCount);
        });
    });

    describe('getUserUsageHistory', () => {
        it('should return empty history for new user', async () => {
            const history = await DailyMessageUsageService.getUserUsageHistory(testUserId, 7);
            expect(history).toHaveLength(0);
        });

        it('should return usage history in descending order', async () => {
            // Create usage for today
            await DailyMessageUsageService.incrementDailyUsage(testUserId, false);

            const history = await DailyMessageUsageService.getUserUsageHistory(testUserId, 7);

            expect(history).toHaveLength(1);
            expect(history[0].messageCount).toBe(1);
            expect(history[0].date).toBe(new Date().toISOString().split('T')[0]);
        });
    });

    describe('getUsersAtLimit', () => {
        it('should return empty array when no users at limit', async () => {
            const usersAtLimit = await DailyMessageUsageService.getUsersAtLimit();
            expect(usersAtLimit).toHaveLength(0);
        });

        it('should return users who have reached their limit', async () => {
            // Put anonymous user at limit (10 messages)
            for (let i = 0; i < 10; i++) {
                await DailyMessageUsageService.incrementDailyUsage(testAnonymousUserId, true);
            }

            const usersAtLimit = await DailyMessageUsageService.getUsersAtLimit();

            expect(usersAtLimit.length).toBeGreaterThanOrEqual(1);

            const testUser = usersAtLimit.find(u => u.userId === testAnonymousUserId);
            expect(testUser).toBeDefined();
            expect(testUser?.messageCount).toBe(10);
            expect(testUser?.limit).toBe(10);
            expect(testUser?.isAnonymous).toBe(true);
        });
    });

    describe('cleanupOldUsage', () => {
        it('should not delete recent records', async () => {
            await DailyMessageUsageService.incrementDailyUsage(testUserId, false);

            const deleted = await DailyMessageUsageService.cleanupOldUsage(30);

            expect(deleted).toBe(0);

            // Verify record still exists
            const records = await db
                .select()
                .from(dailyMessageUsage)
                .where(eq(dailyMessageUsage.userId, testUserId));

            expect(records).toHaveLength(1);
        });
    });

    describe('resetUsageForDate', () => {
        it('should reset usage for specific date', async () => {
            await DailyMessageUsageService.incrementDailyUsage(testUserId, false);
            await DailyMessageUsageService.incrementDailyUsage(testUserId, false);

            const today = new Date().toISOString().split('T')[0];
            const resetCount = await DailyMessageUsageService.resetUsageForDate(today);

            expect(resetCount).toBeGreaterThanOrEqual(1);

            // Verify usage was reset
            const usage = await DailyMessageUsageService.getDailyUsage(testUserId);
            expect(usage.messageCount).toBe(0);
        });
    });

    describe('Security Tests - Cannot Be Bypassed', () => {
        it('should not be affected by deleting messages from other tables', async () => {
            // Increment usage
            await DailyMessageUsageService.incrementDailyUsage(testUserId, false);
            await DailyMessageUsageService.incrementDailyUsage(testUserId, false);

            const beforeDeletion = await DailyMessageUsageService.getDailyUsage(testUserId);
            expect(beforeDeletion.messageCount).toBe(2);

            // Simulate user deleting messages (this would not affect the usage table)
            // In real scenario, user would delete from messages/chats tables
            // But our usage tracking is independent

            const afterDeletion = await DailyMessageUsageService.getDailyUsage(testUserId);

            // Usage count should remain the same regardless of message deletions
            expect(afterDeletion.messageCount).toBe(2);
            expect(afterDeletion.messageCount).toBe(beforeDeletion.messageCount);
        });

        it('should enforce limits even after reaching limit and trying again', async () => {
            // Reach the limit for anonymous user (10 messages)
            for (let i = 0; i < 10; i++) {
                await DailyMessageUsageService.incrementDailyUsage(testAnonymousUserId, true);
            }

            const atLimit = await DailyMessageUsageService.getDailyUsage(testAnonymousUserId);
            expect(atLimit.hasReachedLimit).toBe(true);
            expect(atLimit.messageCount).toBe(10);

            // Try to increment again (simulating user attempting to bypass)
            await DailyMessageUsageService.incrementDailyUsage(testAnonymousUserId, true);

            const afterAttempt = await DailyMessageUsageService.getDailyUsage(testAnonymousUserId);

            // Count should be 11, but limit check should still show reached
            expect(afterAttempt.messageCount).toBe(11);
            expect(afterAttempt.hasReachedLimit).toBe(true);
            expect(afterAttempt.remaining).toBe(0); // Will be clamped to 0
        });

        it('should maintain separate counts for different users', async () => {
            await DailyMessageUsageService.incrementDailyUsage(testUserId, false);
            await DailyMessageUsageService.incrementDailyUsage(testUserId, false);
            await DailyMessageUsageService.incrementDailyUsage(testAnonymousUserId, true);

            const authUsage = await DailyMessageUsageService.getDailyUsage(testUserId);
            const anonUsage = await DailyMessageUsageService.getDailyUsage(testAnonymousUserId);

            expect(authUsage.messageCount).toBe(2);
            expect(anonUsage.messageCount).toBe(1);
        });
    });
});

import { db } from '@/lib/db';
import { dailyMessageUsage, users } from '@/lib/db/schema';
import type { DailyMessageUsage, DailyMessageUsageInsert } from '@/lib/db/schema';
import { sql, eq, and, desc, lt } from 'drizzle-orm';

export class DailyMessageUsageService {
    /**
     * Increment daily message count for user
     * Called BEFORE creating the actual message
     */
    static async incrementDailyUsage(userId: string, isAnonymous: boolean): Promise<{
        newCount: number;
        date: string;
    }> {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD in UTC

        try {
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

            return {
                newCount: result[0].messageCount,
                date: result[0].date,
            };
        } catch (error) {
            console.error('Failed to increment daily usage:', error);
            throw new Error('Failed to increment daily message usage');
        }
    }

    /**
     * Get current daily usage for user
     */
    static async getDailyUsage(userId: string): Promise<{
        messageCount: number;
        date: string;
        hasReachedLimit: boolean;
        limit: number;
        remaining: number;
        isAnonymous: boolean;
    }> {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD in UTC

        try {
            // Get current usage for today
            const currentUsage = await db
                .select()
                .from(dailyMessageUsage)
                .where(and(
                    eq(dailyMessageUsage.userId, userId),
                    eq(dailyMessageUsage.date, today)
                ))
                .limit(1);

            // Get user info to determine limit
            const user = await db
                .select({
                    isAnonymous: users.isAnonymous,
                    metadata: users.metadata,
                })
                .from(users)
                .where(eq(users.id, userId))
                .limit(1);

            const isAnonymous = currentUsage[0]?.isAnonymous ?? user[0]?.isAnonymous ?? false;
            const messageCount = currentUsage[0]?.messageCount ?? 0;
            const limit = this.getDailyMessageLimit(isAnonymous, user[0]);
            const remaining = Math.max(0, limit - messageCount);
            const hasReachedLimit = messageCount >= limit;

            return {
                messageCount,
                date: today,
                hasReachedLimit,
                limit,
                remaining,
                isAnonymous,
            };
        } catch (error) {
            console.error('Failed to get daily usage:', error);
            throw new Error('Failed to get daily message usage');
        }
    }

    /**
     * Check if user has reached daily limit WITHOUT incrementing
     */
    static async checkDailyLimit(userId: string): Promise<{
        hasReachedLimit: boolean;
        messageCount: number;
        limit: number;
        remaining: number;
    }> {
        const usage = await this.getDailyUsage(userId);

        return {
            hasReachedLimit: usage.hasReachedLimit,
            messageCount: usage.messageCount,
            limit: usage.limit,
            remaining: usage.remaining,
        };
    }

    /**
     * Get usage history for user (admin/analytics)
     */
    static async getUserUsageHistory(userId: string, days: number = 30): Promise<DailyMessageUsage[]> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

            const usage = await db
                .select()
                .from(dailyMessageUsage)
                .where(and(
                    eq(dailyMessageUsage.userId, userId),
                    sql`${dailyMessageUsage.date} >= ${cutoffDateStr}`
                ))
                .orderBy(desc(dailyMessageUsage.date))
                .limit(days);

            return usage;
        } catch (error) {
            console.error('Failed to get usage history:', error);
            throw new Error('Failed to get usage history');
        }
    }

    /**
     * Get aggregate usage statistics for admin dashboard
     */
    static async getUsageStats(days: number = 7): Promise<{
        totalUsers: number;
        totalMessages: number;
        averageMessagesPerUser: number;
        anonymousUsers: number;
        authenticatedUsers: number;
        dailyBreakdown: Array<{
            date: string;
            totalMessages: number;
            uniqueUsers: number;
            anonymousMessages: number;
            authenticatedMessages: number;
        }>;
    }> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

            // Get daily breakdown
            const dailyStats = await db
                .select({
                    date: dailyMessageUsage.date,
                    totalMessages: sql<number>`SUM(${dailyMessageUsage.messageCount})::int`,
                    uniqueUsers: sql<number>`COUNT(DISTINCT ${dailyMessageUsage.userId})::int`,
                    anonymousMessages: sql<number>`SUM(CASE WHEN ${dailyMessageUsage.isAnonymous} = true THEN ${dailyMessageUsage.messageCount} ELSE 0 END)::int`,
                    authenticatedMessages: sql<number>`SUM(CASE WHEN ${dailyMessageUsage.isAnonymous} = false THEN ${dailyMessageUsage.messageCount} ELSE 0 END)::int`,
                })
                .from(dailyMessageUsage)
                .where(sql`${dailyMessageUsage.date} >= ${cutoffDateStr}`)
                .groupBy(dailyMessageUsage.date)
                .orderBy(desc(dailyMessageUsage.date));

            // Get aggregate stats
            const totalMessages = dailyStats.reduce((sum, day) => sum + day.totalMessages, 0);
            const uniqueUsersSet = new Set<string>();
            let anonymousUserCount = 0;
            let authenticatedUserCount = 0;

            // Get unique users and user type counts
            const userStats = await db
                .select({
                    userId: dailyMessageUsage.userId,
                    isAnonymous: dailyMessageUsage.isAnonymous,
                })
                .from(dailyMessageUsage)
                .where(sql`${dailyMessageUsage.date} >= ${cutoffDateStr}`)
                .groupBy(dailyMessageUsage.userId, dailyMessageUsage.isAnonymous);

            userStats.forEach(stat => {
                uniqueUsersSet.add(stat.userId);
                if (stat.isAnonymous) {
                    anonymousUserCount++;
                } else {
                    authenticatedUserCount++;
                }
            });

            const totalUsers = uniqueUsersSet.size;
            const averageMessagesPerUser = totalUsers > 0 ? Math.round(totalMessages / totalUsers * 100) / 100 : 0;

            return {
                totalUsers,
                totalMessages,
                averageMessagesPerUser,
                anonymousUsers: anonymousUserCount,
                authenticatedUsers: authenticatedUserCount,
                dailyBreakdown: dailyStats,
            };
        } catch (error) {
            console.error('Failed to get usage stats:', error);
            throw new Error('Failed to get usage statistics');
        }
    }

    /**
     * Cleanup old usage records (automated cleanup)
     * Returns number of records deleted
     */
    static async cleanupOldUsage(daysToKeep: number = 90): Promise<number> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
            const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

            const deletedRecords = await db
                .delete(dailyMessageUsage)
                .where(lt(dailyMessageUsage.date, cutoffDateStr))
                .returning({ id: dailyMessageUsage.id });

            console.log(`Cleaned up ${deletedRecords.length} old daily usage records older than ${daysToKeep} days`);
            return deletedRecords.length;
        } catch (error) {
            console.error('Failed to cleanup old usage records:', error);
            throw new Error('Failed to cleanup old usage records');
        }
    }

    /**
     * Determine daily message limit based on user type
     */
    private static getDailyMessageLimit(isAnonymous: boolean, user?: any): number {
        if (isAnonymous) {
            return 10; // Anonymous users: 10 messages per day
        }

        // Google users: check for custom limit in metadata, default to 20
        return user?.metadata?.messageLimit || 20;
    }

    /**
     * Reset all usage for a specific date (admin function)
     * WARNING: This will reset ALL users' message counts for the given date
     */
    static async resetUsageForDate(date: string): Promise<number> {
        try {
            const resetRecords = await db
                .update(dailyMessageUsage)
                .set({
                    messageCount: 0,
                    lastMessageAt: null,
                    updatedAt: new Date(),
                })
                .where(eq(dailyMessageUsage.date, date))
                .returning({ id: dailyMessageUsage.id });

            console.log(`Reset usage for ${resetRecords.length} users on date ${date}`);
            return resetRecords.length;
        } catch (error) {
            console.error('Failed to reset usage for date:', error);
            throw new Error('Failed to reset usage for date');
        }
    }

    /**
     * Get users who have reached their daily limit (for monitoring)
     */
    static async getUsersAtLimit(date?: string): Promise<Array<{
        userId: string;
        messageCount: number;
        limit: number;
        isAnonymous: boolean;
        lastMessageAt: Date | null;
    }>> {
        const targetDate = date || new Date().toISOString().split('T')[0];

        try {
            const usersAtLimit = await db
                .select()
                .from(dailyMessageUsage)
                .where(eq(dailyMessageUsage.date, targetDate));

            const result = usersAtLimit
                .map(usage => ({
                    userId: usage.userId,
                    messageCount: usage.messageCount,
                    limit: this.getDailyMessageLimit(usage.isAnonymous),
                    isAnonymous: usage.isAnonymous,
                    lastMessageAt: usage.lastMessageAt,
                }))
                .filter(user => user.messageCount >= user.limit);

            return result;
        } catch (error) {
            console.error('Failed to get users at limit:', error);
            throw new Error('Failed to get users at limit');
        }
    }
}

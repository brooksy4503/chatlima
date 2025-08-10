import { db } from '@/lib/db';
import { users, chats, sessions, tokenUsageMetrics } from '@/lib/db/schema';
import { eq, and, or, gte, sql, lt, isNull } from 'drizzle-orm';

export interface UserActivity {
    userId: string;
    email: string;
    accountCreated: Date;
    lastChatActivity: Date | null;
    lastSessionActivity: Date | null;
    lastTokenUsage: Date | null;
    isActive: boolean;
    daysSinceLastActivity: number;
}

export interface CleanupPreview {
    totalAnonymousUsers: number;
    activeUsers: number;
    candidatesForDeletion: number;
    candidates: UserActivity[];
    thresholdDays: number;
    minimumAgeDays: number;
}

export interface CleanupResult {
    success: boolean;
    usersDeleted: number;
    deletedUserIds: string[];
    errors: string[];
    executionTimeMs: number;
    thresholdDays: number;
    batchSize: number;
}

export interface CleanupLog {
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

/**
 * Core service for anonymous user cleanup operations
 */
export class UserCleanupService {
    private static readonly DEFAULT_THRESHOLD_DAYS = 45;
    private static readonly DEFAULT_BATCH_SIZE = 50;
    private static readonly MINIMUM_AGE_DAYS = 7;

    /**
     * Determines if a user is considered active based on recent activity
     */
    static isUserActive(user: UserActivity, thresholdDays: number): boolean {
        const threshold = new Date(Date.now() - (thresholdDays * 24 * 60 * 60 * 1000));
        const minimumAge = new Date(Date.now() - (this.MINIMUM_AGE_DAYS * 24 * 60 * 60 * 1000));

        // Never delete users younger than minimum age
        if (user.accountCreated > minimumAge) {
            return true;
        }

        // Check for any recent activity
        return !!(
            (user.lastChatActivity && user.lastChatActivity > threshold) ||
            (user.lastSessionActivity && user.lastSessionActivity > threshold) ||
            (user.lastTokenUsage && user.lastTokenUsage > threshold)
        );
    }

    /**
     * Calculate days since last activity for a user
     */
    static calculateDaysSinceLastActivity(user: UserActivity): number {
        const activities = [
            user.lastChatActivity,
            user.lastSessionActivity,
            user.lastTokenUsage
        ].filter(Boolean) as Date[];

        if (activities.length === 0) {
            // No recorded activity, use account creation date
            return Math.floor((Date.now() - user.accountCreated.getTime()) / (24 * 60 * 60 * 1000));
        }

        const mostRecentActivity = new Date(Math.max(...activities.map(d => d.getTime())));
        return Math.floor((Date.now() - mostRecentActivity.getTime()) / (24 * 60 * 60 * 1000));
    }

    /**
     * Get anonymous users with their activity data using efficient SQL queries
     * @param limit Maximum number of users to return (for memory efficiency)
     * @param offset Number of users to skip (for pagination)
     */
    static async getAnonymousUsersWithActivity(
        limit: number = 1000,
        offset: number = 0
    ): Promise<UserActivity[]> {
        // Use a single query with JOINs and subqueries for efficiency
        const result = await db
            .select({
                userId: users.id,
                email: users.email,
                accountCreated: users.createdAt,
                lastChatActivity: sql<Date | null>`(
                    SELECT ${chats.updatedAt} 
                    FROM ${chats} 
                    WHERE ${chats.userId} = ${users.id} 
                    ORDER BY ${chats.updatedAt} DESC 
                    LIMIT 1
                )`,
                lastSessionActivity: sql<Date | null>`(
                    SELECT ${sessions.updatedAt} 
                    FROM ${sessions} 
                    WHERE ${sessions.userId} = ${users.id} 
                    ORDER BY ${sessions.updatedAt} DESC 
                    LIMIT 1
                )`,
                lastTokenUsage: sql<Date | null>`(
                    SELECT ${tokenUsageMetrics.createdAt} 
                    FROM ${tokenUsageMetrics} 
                    WHERE ${tokenUsageMetrics.userId} = ${users.id} 
                    ORDER BY ${tokenUsageMetrics.createdAt} DESC 
                    LIMIT 1
                )`
            })
            .from(users)
            .where(eq(users.isAnonymous, true))
            .limit(limit)
            .offset(offset)
            .orderBy(users.createdAt); // Consistent ordering for pagination

        // Transform to UserActivity objects
        return result.map(row => {
            const userActivity: UserActivity = {
                userId: row.userId,
                email: row.email,
                accountCreated: row.accountCreated,
                lastChatActivity: row.lastChatActivity,
                lastSessionActivity: row.lastSessionActivity,
                lastTokenUsage: row.lastTokenUsage,
                isActive: false, // Will be calculated below
                daysSinceLastActivity: 0, // Will be calculated below
            };

            userActivity.daysSinceLastActivity = this.calculateDaysSinceLastActivity(userActivity);
            userActivity.isActive = this.isUserActive(userActivity, this.DEFAULT_THRESHOLD_DAYS);

            return userActivity;
        });
    }

    /**
     * Get count of anonymous users for pagination
     */
    static async getAnonymousUserCount(): Promise<number> {
        const [result] = await db
            .select({ count: sql<number>`count(*)` })
            .from(users)
            .where(eq(users.isAnonymous, true));

        return result.count;
    }

    /**
     * Preview users that would be deleted with given parameters
     * @param thresholdDays Number of days of inactivity threshold
     * @param limit Maximum number of candidates to return in preview
     */
    static async previewCleanup(
        thresholdDays: number = this.DEFAULT_THRESHOLD_DAYS,
        limit: number = 100
    ): Promise<CleanupPreview> {
        // Get total count efficiently
        const totalAnonymousUsers = await this.getAnonymousUserCount();

        // Process users in batches to find candidates without loading all into memory
        const candidates: UserActivity[] = [];
        const batchSize = 500; // Process 500 users at a time
        let offset = 0;
        let activeUsers = 0;

        while (offset < totalAnonymousUsers && candidates.length < limit) {
            const batch = await this.getAnonymousUsersWithActivity(batchSize, offset);

            for (const user of batch) {
                // Recalculate activity status with the specific threshold
                const isActive = this.isUserActive(user, thresholdDays);

                if (isActive) {
                    activeUsers++;
                } else {
                    candidates.push(user);

                    // Stop if we've found enough candidates for the preview
                    if (candidates.length >= limit) {
                        break;
                    }
                }
            }

            offset += batchSize;

            // If we got less than batchSize, we've reached the end
            if (batch.length < batchSize) {
                break;
            }
        }

        // If we didn't process all users due to limit, estimate active users
        if (offset < totalAnonymousUsers) {
            // Estimate based on the ratio we've seen so far
            const processedUsers = offset;
            const remainingUsers = totalAnonymousUsers - processedUsers;
            const activeRatio = processedUsers > 0 ? activeUsers / processedUsers : 0;
            activeUsers += Math.round(remainingUsers * activeRatio);
        }

        return {
            totalAnonymousUsers,
            activeUsers,
            candidatesForDeletion: candidates.length,
            candidates: candidates
                .sort((a, b) => b.daysSinceLastActivity - a.daysSinceLastActivity)
                .slice(0, limit), // Ensure we don't exceed the limit
            thresholdDays,
            minimumAgeDays: this.MINIMUM_AGE_DAYS,
        };
    }

    /**
     * Execute cleanup of inactive anonymous users
     */
    static async executeCleanup(
        thresholdDays: number = this.DEFAULT_THRESHOLD_DAYS,
        batchSize: number = this.DEFAULT_BATCH_SIZE,
        dryRun: boolean = false
    ): Promise<CleanupResult> {
        const startTime = Date.now();
        const result: CleanupResult = {
            success: false,
            usersDeleted: 0,
            deletedUserIds: [],
            errors: [],
            executionTimeMs: 0,
            thresholdDays,
            batchSize,
        };

        try {
            // Use efficient batching to find candidates without loading all into memory
            const candidatesForDeletion: UserActivity[] = [];
            const processingBatchSize = 500; // Process users in chunks
            let offset = 0;
            const totalUsers = await this.getAnonymousUserCount();

            // Find enough candidates for deletion without overloading memory
            while (candidatesForDeletion.length < batchSize && offset < totalUsers) {
                const batch = await this.getAnonymousUsersWithActivity(processingBatchSize, offset);

                for (const user of batch) {
                    const isActive = this.isUserActive(user, thresholdDays);

                    if (!isActive) {
                        candidatesForDeletion.push(user);

                        // Stop once we have enough candidates
                        if (candidatesForDeletion.length >= batchSize) {
                            break;
                        }
                    }
                }

                offset += processingBatchSize;

                // If we got less than processingBatchSize, we've reached the end
                if (batch.length < processingBatchSize) {
                    break;
                }
            }

            // Sort by inactivity (most inactive first) and take only what we need
            const finalCandidates = candidatesForDeletion
                .sort((a, b) => b.daysSinceLastActivity - a.daysSinceLastActivity)
                .slice(0, batchSize);

            if (dryRun) {
                result.success = true;
                result.usersDeleted = finalCandidates.length;
                result.deletedUserIds = finalCandidates.map(u => u.userId);
                result.executionTimeMs = Date.now() - startTime;
                return result;
            }

            // Safety check: Ensure minimum age requirement
            const minimumAgeDate = new Date(Date.now() - (this.MINIMUM_AGE_DAYS * 24 * 60 * 60 * 1000));
            const safeCandidates = finalCandidates.filter(user =>
                user.accountCreated < minimumAgeDate
            );

            if (safeCandidates.length !== finalCandidates.length) {
                result.errors.push(
                    `Filtered out ${finalCandidates.length - safeCandidates.length} users that were too young (< ${this.MINIMUM_AGE_DAYS} days)`
                );
            }

            // Delete users in a transaction
            for (const user of safeCandidates) {
                try {
                    await db.transaction(async (tx) => {
                        // Delete in proper order due to foreign key constraints:
                        // 1. Token usage metrics
                        await tx.delete(tokenUsageMetrics).where(eq(tokenUsageMetrics.userId, user.userId));

                        // 2. Sessions
                        await tx.delete(sessions).where(eq(sessions.userId, user.userId));

                        // 3. Messages (cascade delete will handle when chats are deleted)
                        // 4. Chats
                        await tx.delete(chats).where(eq(chats.userId, user.userId));

                        // 5. Finally, the user
                        await tx.delete(users).where(eq(users.id, user.userId));
                    });

                    result.deletedUserIds.push(user.userId);
                    result.usersDeleted++;
                } catch (error) {
                    const errorMsg = `Failed to delete user ${user.userId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    result.errors.push(errorMsg);
                    console.error(errorMsg, error);
                }
            }

            result.success = result.errors.length === 0;
            result.executionTimeMs = Date.now() - startTime;

        } catch (error) {
            const errorMsg = `Cleanup execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
            result.errors.push(errorMsg);
            result.executionTimeMs = Date.now() - startTime;
            console.error(errorMsg, error);
        }

        return result;
    }

    /**
     * Get cleanup statistics and insights
     */
    static async getCleanupStats(): Promise<{
        totalUsers: number;
        anonymousUsers: number;
        oldInactiveUsers: number;
        potentialStorageSavings: string;
        lastCleanupDate?: Date;
    }> {
        // Get total user count
        const [totalUsersResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(users);

        // Get anonymous user count
        const [anonymousUsersResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(users)
            .where(eq(users.isAnonymous, true));

        // Get old inactive anonymous users (> 45 days)
        const oldThreshold = new Date(Date.now() - (45 * 24 * 60 * 60 * 1000));
        const [oldInactiveResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(users)
            .where(and(
                eq(users.isAnonymous, true),
                lt(users.updatedAt, oldThreshold)
            ));

        return {
            totalUsers: totalUsersResult.count,
            anonymousUsers: anonymousUsersResult.count,
            oldInactiveUsers: oldInactiveResult.count,
            potentialStorageSavings: `~${Math.round((oldInactiveResult.count / totalUsersResult.count) * 100)}% database size reduction`,
        };
    }
}

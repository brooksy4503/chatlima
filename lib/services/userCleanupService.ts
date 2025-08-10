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
     * Get all anonymous users with their activity data
     */
    static async getAllAnonymousUsersWithActivity(): Promise<UserActivity[]> {
        const anonymousUsers = await db
            .select({
                id: users.id,
                email: users.email,
                createdAt: users.createdAt,
            })
            .from(users)
            .where(eq(users.isAnonymous, true));

        const userActivities: UserActivity[] = [];

        for (const user of anonymousUsers) {
            // Get last chat activity
            const lastChatResult = await db
                .select({ updatedAt: chats.updatedAt })
                .from(chats)
                .where(eq(chats.userId, user.id))
                .orderBy(sql`${chats.updatedAt} DESC`)
                .limit(1);

            // Get last session activity
            const lastSessionResult = await db
                .select({ updatedAt: sessions.updatedAt })
                .from(sessions)
                .where(eq(sessions.userId, user.id))
                .orderBy(sql`${sessions.updatedAt} DESC`)
                .limit(1);

            // Get last token usage
            const lastTokenResult = await db
                .select({ createdAt: tokenUsageMetrics.createdAt })
                .from(tokenUsageMetrics)
                .where(eq(tokenUsageMetrics.userId, user.id))
                .orderBy(sql`${tokenUsageMetrics.createdAt} DESC`)
                .limit(1);

            const userActivity: UserActivity = {
                userId: user.id,
                email: user.email,
                accountCreated: user.createdAt,
                lastChatActivity: lastChatResult[0]?.updatedAt || null,
                lastSessionActivity: lastSessionResult[0]?.updatedAt || null,
                lastTokenUsage: lastTokenResult[0]?.createdAt || null,
                isActive: false, // Will be calculated below
                daysSinceLastActivity: 0, // Will be calculated below
            };

            userActivity.daysSinceLastActivity = this.calculateDaysSinceLastActivity(userActivity);
            userActivity.isActive = this.isUserActive(userActivity, this.DEFAULT_THRESHOLD_DAYS);

            userActivities.push(userActivity);
        }

        return userActivities;
    }

    /**
     * Preview users that would be deleted with given parameters
     */
    static async previewCleanup(
        thresholdDays: number = this.DEFAULT_THRESHOLD_DAYS
    ): Promise<CleanupPreview> {
        const allAnonymousUsers = await this.getAllAnonymousUsersWithActivity();

        const candidates = allAnonymousUsers.filter(user => {
            // Recalculate activity status with the specific threshold
            const isActive = this.isUserActive(user, thresholdDays);
            return !isActive;
        });

        return {
            totalAnonymousUsers: allAnonymousUsers.length,
            activeUsers: allAnonymousUsers.length - candidates.length,
            candidatesForDeletion: candidates.length,
            candidates: candidates.sort((a, b) => b.daysSinceLastActivity - a.daysSinceLastActivity),
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
            const preview = await this.previewCleanup(thresholdDays);
            const candidatesForDeletion = preview.candidates.slice(0, batchSize);

            if (dryRun) {
                result.success = true;
                result.usersDeleted = candidatesForDeletion.length;
                result.deletedUserIds = candidatesForDeletion.map(u => u.userId);
                result.executionTimeMs = Date.now() - startTime;
                return result;
            }

            // Safety check: Ensure minimum age requirement
            const minimumAgeDate = new Date(Date.now() - (this.MINIMUM_AGE_DAYS * 24 * 60 * 60 * 1000));
            const safeCandidates = candidatesForDeletion.filter(user =>
                user.accountCreated < minimumAgeDate
            );

            if (safeCandidates.length !== candidatesForDeletion.length) {
                result.errors.push(
                    `Filtered out ${candidatesForDeletion.length - safeCandidates.length} users that were too young (< ${this.MINIMUM_AGE_DAYS} days)`
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

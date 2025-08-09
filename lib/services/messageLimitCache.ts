import { db } from '@/lib/db';
import { users, messages, chats } from '@/lib/db/schema';
import { eq, and, gte, count } from 'drizzle-orm';

/**
 * Request-scoped cache for message limit checks to avoid repeated database queries
 */
export class MessageLimitCache {
    private cache = new Map<string, {
        hasReachedLimit: boolean;
        limit: number;
        remaining: number;
        credits?: number | null;
        usedCredits?: boolean;
        timestamp: number;
    }>();

    private readonly CACHE_TTL = 60000; // 1 minute cache

    /**
     * Get message limit status with caching
     */
    async checkMessageLimit(
        userId: string,
        isAnonymous: boolean = false,
        creditCache?: any
    ): Promise<{
        hasReachedLimit: boolean;
        limit: number;
        remaining: number;
        credits?: number | null;
        usedCredits?: boolean;
    }> {
        const cacheKey = `${userId}-${isAnonymous}`;
        const now = Date.now();

        // Check cache first
        const cached = this.cache.get(cacheKey);
        if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
            return {
                hasReachedLimit: cached.hasReachedLimit,
                limit: cached.limit,
                remaining: cached.remaining,
                credits: cached.credits,
                usedCredits: cached.usedCredits
            };
        }

        try {
            // 1. Check Polar credits (for authenticated users only)
            if (!isAnonymous) {
                const credits = creditCache
                    ? await creditCache.getRemainingCreditsByExternalId(userId)
                    : await (await import('@/lib/polar')).getRemainingCreditsByExternalId(userId);

                if (typeof credits === 'number') {
                    const result = this.handleCreditsResult(credits);
                    if (result !== null) {
                        this.cacheResult(cacheKey, result, now);
                        return result;
                    }
                    // If result is null (credits === 0), fall through to daily message limit
                }
            }

            // 2. If no credits (or anonymous), use daily message limit with optimized query
            const result = await this.checkDailyMessageLimit(userId, isAnonymous);
            this.cacheResult(cacheKey, result, now);
            return result;

        } catch (error) {
            console.error('Error checking message limit:', error);
            // Default to allowing messages if there's an error
            return { hasReachedLimit: false, limit: 10, remaining: 10 };
        }
    }

    private handleCreditsResult(credits: number) {
        if (credits < 0) {
            return {
                hasReachedLimit: true,
                limit: 0,
                remaining: 0,
                credits,
                usedCredits: true
            };
        }

        if (credits > 0) {
            return {
                hasReachedLimit: false,
                limit: 250,
                remaining: credits,
                credits,
                usedCredits: true
            };
        }

        // credits === 0, will fall through to daily message limit
        return null;
    }

    private async checkDailyMessageLimit(userId: string, isAnonymous: boolean) {
        // Get user info and message count in parallel for better performance
        const [user, messageCountResult] = await Promise.all([
            // Get user info
            db.query.users.findFirst({
                where: eq(users.id, userId),
                columns: { metadata: true } // Only select what we need
            }),

            // Optimized message count query - use a more efficient approach
            this.getOptimizedMessageCount(userId)
        ]);

        // Set daily limits
        let messageLimit = isAnonymous ? 10 : 20;
        if (!isAnonymous && user) {
            messageLimit = (user as any).metadata?.messageLimit || 20;
        }

        const messageCount = messageCountResult;

        return {
            hasReachedLimit: messageCount >= messageLimit,
            limit: messageLimit,
            remaining: Math.max(0, messageLimit - messageCount),
            credits: 0,
            usedCredits: false
        };
    }

    private async getOptimizedMessageCount(userId: string): Promise<number> {
        // Use a more efficient query strategy
        const now = new Date();
        const startOfDay = new Date(now.toISOString().split('T')[0] + 'T00:00:00.000Z');

        try {
            // Try to use a simpler query first - get today's chats for user
            const todaysChats = await db.query.chats.findMany({
                where: and(
                    eq(chats.userId, userId),
                    gte(chats.createdAt, startOfDay)
                ),
                columns: { id: true }
            });

            if (todaysChats.length === 0) {
                return 0; // No chats today = no messages
            }

            // Count user messages in today's chats
            const chatIds = todaysChats.map(chat => chat.id);

            // Use a more efficient IN query instead of JOIN
            const messageCount = await db.select({ count: count() })
                .from(messages)
                .where(
                    and(
                        gte(messages.createdAt, startOfDay),
                        eq(messages.role, 'user'),
                        // Use IN clause which can be more efficient than JOIN for small sets
                        ...chatIds.map(chatId => eq(messages.chatId, chatId))
                    )
                )
                .execute()
                .then(result => result[0]?.count || 0);

            return messageCount;
        } catch (error) {
            console.warn('Optimized message count failed, falling back to original query:', error);

            // Fallback to original query if optimized version fails
            const messageCount = await db.select({ count: count() })
                .from(messages)
                .innerJoin(chats, eq(chats.id, messages.chatId))
                .where(
                    and(
                        eq(chats.userId, userId),
                        gte(messages.createdAt, startOfDay),
                        eq(messages.role, 'user')
                    )
                )
                .execute()
                .then(result => result[0]?.count || 0);

            return messageCount;
        }
    }

    private cacheResult(
        cacheKey: string,
        result: any,
        timestamp: number
    ) {
        this.cache.set(cacheKey, {
            ...result,
            timestamp
        });
    }

    /**
     * Clear cache (useful for testing)
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     */
    getStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

/**
 * Factory function for creating request-scoped message limit cache
 */
export function createMessageLimitCache() {
    return new MessageLimitCache();
}

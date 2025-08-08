import { db } from '@/lib/db';
import { usageLimits } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';

export interface UsageLimit {
    id: string;
    userId?: string;
    modelId?: string;
    provider?: string;
    dailyTokenLimit: number;
    monthlyTokenLimit: number;
    dailyCostLimit: number;
    monthlyCostLimit: number;
    requestRateLimit: number;
    currency: string;
    isActive: boolean;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class UsageLimitsService {
    /**
     * Get usage limits for a specific user
     * Priority: user-specific limits > global limits > defaults
     */
    static async getUserLimits(userId: string): Promise<UsageLimit | null> {
        try {
            // First, try to get user-specific limits
            const userLimits = await db
                .select()
                .from(usageLimits)
                .where(
                    and(
                        eq(usageLimits.userId, userId),
                        eq(usageLimits.isActive, true)
                    )
                )
                .limit(1);

            if (userLimits.length > 0) {
                const limit = userLimits[0];
                return {
                    ...limit,
                    dailyCostLimit: Number(limit.dailyCostLimit),
                    monthlyCostLimit: Number(limit.monthlyCostLimit),
                } as UsageLimit;
            }

            // If no user-specific limits, return null (will use defaults)
            return null;
        } catch (error) {
            console.error('Error fetching user usage limits:', error);
            return null;
        }
    }

    /**
     * Get global usage limits (for all users)
     */
    static async getGlobalLimits(): Promise<UsageLimit | null> {
        try {
            const globalLimits = await db
                .select()
                .from(usageLimits)
                .where(
                    and(
                        isNull(usageLimits.userId),
                        isNull(usageLimits.modelId),
                        eq(usageLimits.isActive, true)
                    )
                )
                .limit(1);

            if (globalLimits.length > 0) {
                const limit = globalLimits[0];
                return {
                    ...limit,
                    dailyCostLimit: Number(limit.dailyCostLimit),
                    monthlyCostLimit: Number(limit.monthlyCostLimit),
                } as UsageLimit;
            }

            return null;
        } catch (error) {
            console.error('Error fetching global usage limits:', error);
            return null;
        }
    }

    /**
     * Get effective usage limits for a user
     * Returns user-specific limits if available, otherwise global limits, otherwise defaults
     */
    static async getEffectiveLimits(userId: string): Promise<UsageLimit> {
        // Try user-specific limits first
        const userLimits = await this.getUserLimits(userId);
        if (userLimits) {
            return userLimits;
        }

        // Try global limits
        const globalLimits = await this.getGlobalLimits();
        if (globalLimits) {
            return globalLimits;
        }

        // Return default limits if no limits are configured
        return {
            id: 'default',
            dailyTokenLimit: 50000, // 50K tokens
            monthlyTokenLimit: 1000000, // 1M tokens
            dailyCostLimit: 10, // $10
            monthlyCostLimit: 100, // $100
            requestRateLimit: 60, // 60 requests per minute
            currency: 'USD',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    /**
     * Check if a user has exceeded their usage limits
     */
    static async checkUsageLimits(
        userId: string,
        currentUsage: {
            dailyTokens: number;
            monthlyTokens: number;
            dailyCost: number;
            monthlyCost: number;
        }
    ): Promise<{
        isOverLimit: boolean;
        exceededLimits: string[];
        limits: UsageLimit;
    }> {
        const limits = await this.getEffectiveLimits(userId);
        const exceededLimits: string[] = [];

        // Check daily token limit
        if (currentUsage.dailyTokens > limits.dailyTokenLimit) {
            exceededLimits.push('daily_tokens');
        }

        // Check monthly token limit
        if (currentUsage.monthlyTokens > limits.monthlyTokenLimit) {
            exceededLimits.push('monthly_tokens');
        }

        // Check daily cost limit
        if (currentUsage.dailyCost > limits.dailyCostLimit) {
            exceededLimits.push('daily_cost');
        }

        // Check monthly cost limit
        if (currentUsage.monthlyCost > limits.monthlyCostLimit) {
            exceededLimits.push('monthly_cost');
        }

        return {
            isOverLimit: exceededLimits.length > 0,
            exceededLimits,
            limits,
        };
    }
}

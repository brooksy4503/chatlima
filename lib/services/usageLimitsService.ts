import { DailyMessageUsageService } from '@/lib/services/dailyMessageUsageService';
import { OptimizedUsageLimitsService } from '@/lib/services/optimizedUsageLimits';

export interface UsageLimitCheckResult {
    isOverLimit: boolean;
    exceededLimits: string[];
    limits: {
        dailyTokens: number;
        monthlyTokens: number;
        dailyCost: number;
        monthlyCost: number;
    };
    usage: {
        dailyTokens: number;
        monthlyTokens: number;
        dailyCost: number;
        monthlyCost: number;
    };
}

export interface DailyUsageResult {
    dailyUsage: number;
    newUsage?: number;
}

export class UsageLimitsService {
    /**
     * Check user usage limits and get current usage
     */
    static async checkUserUsageLimits(userId: string): Promise<UsageLimitCheckResult> {
        const usageLimitCheck = await OptimizedUsageLimitsService.getUserUsageAndLimits(userId);

        return {
            isOverLimit: usageLimitCheck.isOverLimit,
            exceededLimits: usageLimitCheck.exceededLimits,
            limits: {
                dailyTokens: usageLimitCheck.limits.dailyTokenLimit,
                monthlyTokens: usageLimitCheck.limits.monthlyTokenLimit,
                dailyCost: usageLimitCheck.limits.dailyCostLimit,
                monthlyCost: usageLimitCheck.limits.monthlyCostLimit,
            },
            usage: {
                dailyTokens: usageLimitCheck.dailyTokens,
                monthlyTokens: usageLimitCheck.monthlyTokens,
                dailyCost: usageLimitCheck.dailyCost,
                monthlyCost: usageLimitCheck.monthlyCost,
            }
        };
    }

    /**
     * Check if user is over usage limits
     */
    static async isOverUsageLimits(userId: string): Promise<boolean> {
        const usageCheck = await this.checkUserUsageLimits(userId);
        return usageCheck.isOverLimit;
    }

    /**
     * Get exceeded limits messages for user display
     */
    static getExceededLimitMessages(usageCheck: UsageLimitCheckResult): string[] {
        return usageCheck.exceededLimits.map(limit => {
            switch (limit) {
                case 'dailyTokens':
                    return `Daily token limit (${usageCheck.limits.dailyTokens}) exceeded`;
                case 'monthlyTokens':
                    return `Monthly token limit (${usageCheck.limits.monthlyTokens}) exceeded`;
                case 'dailyCost':
                    return `Daily cost limit ($${usageCheck.limits.dailyCost}) exceeded`;
                case 'monthlyCost':
                    return `Monthly cost limit ($${usageCheck.limits.monthlyCost}) exceeded`;
                default:
                    return `Usage limit exceeded: ${limit}`;
            }
        });
    }

    /**
     * Get daily message usage
     */
    static async getDailyUsage(userId: string): Promise<{
        messageCount: number;
        date: string;
        hasReachedLimit: boolean;
        limit: number;
        remaining: number;
        isAnonymous: boolean;
    }> {
        return await DailyMessageUsageService.getDailyUsage(userId);
    }

    /**
     * Increment daily message usage
     */
    static async incrementDailyUsage(userId: string, isAnonymous: boolean): Promise<{
        newCount: number;
        date: string;
    }> {
        return await DailyMessageUsageService.incrementDailyUsage(userId, isAnonymous);
    }

    /**
     * Check if user should be blocked due to usage limits
     */
    static async shouldBlockUser(userId: string): Promise<{
        shouldBlock: boolean;
        reason?: string;
        usageCheck?: UsageLimitCheckResult;
    }> {
        const usageCheck = await this.checkUserUsageLimits(userId);

        if (usageCheck.isOverLimit) {
            const exceededMessages = this.getExceededLimitMessages(usageCheck);
            return {
                shouldBlock: true,
                reason: exceededMessages.join(', '),
                usageCheck
            };
        }

        return {
            shouldBlock: false,
            usageCheck
        };
    }
}

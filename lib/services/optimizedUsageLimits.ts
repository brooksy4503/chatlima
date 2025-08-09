/**
 * Optimized usage limits service with batched queries and caching
 * Reduces database calls for real-time usage checking
 */

import { db } from '@/lib/db';
import { usageLimits, tokenUsageMetrics } from '@/lib/db/schema';
import { eq, and, isNull, gte, sql } from 'drizzle-orm';

export interface OptimizedUsageData {
    dailyTokens: number;
    monthlyTokens: number;
    dailyCost: number;
    monthlyCost: number;
    limits: {
        dailyTokenLimit: number;
        monthlyTokenLimit: number;
        dailyCostLimit: number;
        monthlyCostLimit: number;
    };
    isOverLimit: boolean;
    exceededLimits: string[];
}

// In-memory cache for usage limits
const LIMITS_CACHE = new Map<string, { limits: any; timestamp: number }>();
const LIMITS_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// In-memory cache for usage data
const USAGE_CACHE = new Map<string, { usage: OptimizedUsageData; timestamp: number }>();
const USAGE_CACHE_TTL = 60 * 1000; // 1 minute for real-time data

export class OptimizedUsageLimitsService {
    /**
     * Get user usage data and limits in a single optimized call
     */
    static async getUserUsageAndLimits(userId: string): Promise<OptimizedUsageData> {
        const cacheKey = userId;

        // Check cache first
        const cached = USAGE_CACHE.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < USAGE_CACHE_TTL) {
            return cached.usage;
        }

        try {
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            // Single optimized query for all usage data
            const usageResult = await db.execute(sql`
        WITH user_limits AS (
          SELECT 
            COALESCE(daily_token_limit, 50000) as daily_token_limit,
            COALESCE(monthly_token_limit, 1000000) as monthly_token_limit,
            COALESCE(daily_cost_limit, 10.0) as daily_cost_limit,
            COALESCE(monthly_cost_limit, 100.0) as monthly_cost_limit
          FROM ${usageLimits}
          WHERE user_id = ${userId} AND is_active = true
          LIMIT 1
        ),
        usage_stats AS (
          SELECT 
            COALESCE(SUM(CASE WHEN created_at >= ${startOfDay} THEN total_tokens END), 0) as daily_tokens,
            COALESCE(SUM(CASE WHEN created_at >= ${startOfMonth} THEN total_tokens END), 0) as monthly_tokens,
            COALESCE(SUM(CASE WHEN created_at >= ${startOfDay} THEN CAST(estimated_cost AS DECIMAL) END), 0) as daily_cost,
            COALESCE(SUM(CASE WHEN created_at >= ${startOfMonth} THEN CAST(estimated_cost AS DECIMAL) END), 0) as monthly_cost
          FROM ${tokenUsageMetrics}
          WHERE user_id = ${userId}
        )
        SELECT 
          ul.daily_token_limit,
          ul.monthly_token_limit,
          ul.daily_cost_limit,
          ul.monthly_cost_limit,
          us.daily_tokens,
          us.monthly_tokens,
          us.daily_cost,
          us.monthly_cost
        FROM user_limits ul
        CROSS JOIN usage_stats us
        UNION ALL
        SELECT 
          50000 as daily_token_limit,
          1000000 as monthly_token_limit,
          10.0 as daily_cost_limit,
          100.0 as monthly_cost_limit,
          us.daily_tokens,
          us.monthly_tokens,
          us.daily_cost,
          us.monthly_cost
        FROM usage_stats us
        WHERE NOT EXISTS (SELECT 1 FROM user_limits)
        LIMIT 1
      `);

            let result;
            if (usageResult.rows && usageResult.rows.length > 0) {
                const row = usageResult.rows[0] as any;
                result = {
                    dailyTokens: Number(row.daily_tokens) || 0,
                    monthlyTokens: Number(row.monthly_tokens) || 0,
                    dailyCost: Number(row.daily_cost) || 0,
                    monthlyCost: Number(row.monthly_cost) || 0,
                    limits: {
                        dailyTokenLimit: Number(row.daily_token_limit),
                        monthlyTokenLimit: Number(row.monthly_token_limit),
                        dailyCostLimit: Number(row.daily_cost_limit),
                        monthlyCostLimit: Number(row.monthly_cost_limit),
                    }
                };
            } else {
                // Fallback to defaults
                result = {
                    dailyTokens: 0,
                    monthlyTokens: 0,
                    dailyCost: 0,
                    monthlyCost: 0,
                    limits: {
                        dailyTokenLimit: 50000,
                        monthlyTokenLimit: 1000000,
                        dailyCostLimit: 10.0,
                        monthlyCostLimit: 100.0,
                    }
                };
            }

            // Check for exceeded limits
            const exceededLimits: string[] = [];
            if (result.dailyTokens > result.limits.dailyTokenLimit) exceededLimits.push('daily_tokens');
            if (result.monthlyTokens > result.limits.monthlyTokenLimit) exceededLimits.push('monthly_tokens');
            if (result.dailyCost > result.limits.dailyCostLimit) exceededLimits.push('daily_cost');
            if (result.monthlyCost > result.limits.monthlyCostLimit) exceededLimits.push('monthly_cost');

            const finalResult: OptimizedUsageData = {
                ...result,
                isOverLimit: exceededLimits.length > 0,
                exceededLimits
            };

            // Cache the result
            USAGE_CACHE.set(cacheKey, { usage: finalResult, timestamp: Date.now() });

            return finalResult;
        } catch (error) {
            console.error('Error getting optimized usage data:', error);

            // Return safe defaults on error
            return {
                dailyTokens: 0,
                monthlyTokens: 0,
                dailyCost: 0,
                monthlyCost: 0,
                limits: {
                    dailyTokenLimit: 50000, // Use proper defaults even on error
                    monthlyTokenLimit: 1000000,
                    dailyCostLimit: 10.0,
                    monthlyCostLimit: 100.0,
                },
                isOverLimit: false,
                exceededLimits: []
            };
        }
    }

    /**
     * Fast usage check with minimal database interaction
     * Uses cached data when available for sub-second responses
     */
    static async quickUsageCheck(userId: string): Promise<{ isOverLimit: boolean; exceededLimits: string[] }> {
        const data = await this.getUserUsageAndLimits(userId);
        return {
            isOverLimit: data.isOverLimit,
            exceededLimits: data.exceededLimits
        };
    }

    /**
     * Clear expired entries from cache
     */
    static cleanupCache(): void {
        const now = Date.now();

        for (const [key, value] of USAGE_CACHE.entries()) {
            if (now - value.timestamp > USAGE_CACHE_TTL) {
                USAGE_CACHE.delete(key);
            }
        }

        for (const [key, value] of LIMITS_CACHE.entries()) {
            if (now - value.timestamp > LIMITS_CACHE_TTL) {
                LIMITS_CACHE.delete(key);
            }
        }
    }

    /**
     * Invalidate cache for a specific user (call after usage updates)
     */
    static invalidateUserCache(userId: string): void {
        USAGE_CACHE.delete(userId);
    }
}

// Clean up cache every 5 minutes
setInterval(() => {
    OptimizedUsageLimitsService.cleanupCache();
}, 5 * 60 * 1000);

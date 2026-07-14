import { db } from '@/lib/db';
import { tokenUsageMetrics } from '@/lib/db/schema';
import { and, desc, eq, gte, lte } from 'drizzle-orm';
import { modelID } from '@/ai/providers';
import { authoritativeRowCost } from './messageCostResolver';
import type { AggregatedCostData, CostBreakdown } from '@/lib/types/api';

export type { AggregatedCostData, CostBreakdown };

export interface ProjectedCost {
    projectedDailyCost: number;
    projectedMonthlyCost: number;
    projectedYearlyCost: number;
    currency: string;
    basedOnPeriod: {
        days: number;
        startDate: Date;
        endDate: Date;
    };
    confidence: 'low' | 'medium' | 'high';
}

export interface UsageLimitWarning {
    isApproachingLimit: boolean;
    isOverLimit: boolean;
    currentUsage: number;
    limit: number;
    percentageUsed: number;
    projectedOverage: number;
    currency: string;
    recommendations: string[];
}

export interface UsageAggregationOptions {
    startDate?: Date;
    endDate?: Date;
    provider?: string;
    modelId?: modelID;
    currency?: string;
    /** Ignored — provider-truth aggregation has no volume discounts. */
    includeVolumeDiscounts?: boolean;
}

function emptyBreakdown(currency: string): CostBreakdown {
    return {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        inputCost: 0,
        outputCost: 0,
        subtotal: 0,
        discountAmount: 0,
        totalCost: 0,
        currency,
    };
}

function allocateInputOutputCost(
    rowCost: number,
    inputTokens: number,
    outputTokens: number
): { inputCost: number; outputCost: number } {
    const totalTokens = inputTokens + outputTokens;
    if (totalTokens <= 0 || rowCost <= 0) {
        return { inputCost: 0, outputCost: 0 };
    }
    const inputCost = rowCost * (inputTokens / totalTokens);
    return {
        inputCost,
        outputCost: rowCost - inputCost,
    };
}

function addToBreakdown(
    breakdown: CostBreakdown,
    inputTokens: number,
    outputTokens: number,
    rowCost: number
): void {
    const { inputCost, outputCost } = allocateInputOutputCost(rowCost, inputTokens, outputTokens);
    breakdown.inputTokens += inputTokens;
    breakdown.outputTokens += outputTokens;
    breakdown.totalTokens += inputTokens + outputTokens;
    breakdown.inputCost += inputCost;
    breakdown.outputCost += outputCost;
    breakdown.subtotal += rowCost;
    breakdown.totalCost += rowCost;
}

/**
 * Aggregates stored provider-truth costs from token_usage_metrics.
 * Uses COALESCE(actual_cost, estimated_cost) per row.
 */
export class UsageCostAggregationService {
    private static defaultCurrency = 'USD';

    static async getAggregatedCosts(
        userId: string,
        options: UsageAggregationOptions = {}
    ): Promise<AggregatedCostData> {
        const {
            startDate,
            endDate,
            provider,
            modelId,
            currency = this.defaultCurrency,
        } = options;

        const conditions = [
            eq(tokenUsageMetrics.userId, userId),
            eq(tokenUsageMetrics.status, 'completed'),
        ];
        if (startDate) {
            conditions.push(gte(tokenUsageMetrics.createdAt, startDate));
        }
        if (endDate) {
            conditions.push(lte(tokenUsageMetrics.createdAt, endDate));
        }
        if (provider) {
            conditions.push(eq(tokenUsageMetrics.provider, provider));
        }
        if (modelId) {
            conditions.push(eq(tokenUsageMetrics.modelId, modelId));
        }

        const records = await db.query.tokenUsageMetrics.findMany({
            where: and(...conditions),
            orderBy: desc(tokenUsageMetrics.createdAt),
        });

        let totalInputTokens = 0;
        let totalOutputTokens = 0;
        let totalInputCost = 0;
        let totalOutputCost = 0;
        let totalCost = 0;

        const breakdownByProvider: Record<string, CostBreakdown> = {};
        const breakdownByModel: Record<string, CostBreakdown> = {};
        const breakdownByDay: Record<string, CostBreakdown> = {};

        for (const record of records) {
            const rowCost = authoritativeRowCost(record.actualCost, record.estimatedCost);
            const { inputCost, outputCost } = allocateInputOutputCost(
                rowCost,
                record.inputTokens,
                record.outputTokens
            );

            totalInputTokens += record.inputTokens;
            totalOutputTokens += record.outputTokens;
            totalInputCost += inputCost;
            totalOutputCost += outputCost;
            totalCost += rowCost;

            if (!breakdownByProvider[record.provider]) {
                breakdownByProvider[record.provider] = emptyBreakdown(currency);
            }
            addToBreakdown(
                breakdownByProvider[record.provider],
                record.inputTokens,
                record.outputTokens,
                rowCost
            );

            if (!breakdownByModel[record.modelId]) {
                breakdownByModel[record.modelId] = emptyBreakdown(currency);
            }
            addToBreakdown(
                breakdownByModel[record.modelId],
                record.inputTokens,
                record.outputTokens,
                rowCost
            );

            const dateKey = record.createdAt.toISOString().split('T')[0];
            if (!breakdownByDay[dateKey]) {
                breakdownByDay[dateKey] = emptyBreakdown(currency);
            }
            addToBreakdown(
                breakdownByDay[dateKey],
                record.inputTokens,
                record.outputTokens,
                rowCost
            );
        }

        const requestCount = records.length;
        const totalTokens = totalInputTokens + totalOutputTokens;

        return {
            totalInputTokens,
            totalOutputTokens,
            totalTokens,
            totalInputCost,
            totalOutputCost,
            totalSubtotal: totalCost,
            totalDiscount: 0,
            totalCost,
            currency,
            requestCount,
            averageCostPerRequest: requestCount > 0 ? totalCost / requestCount : 0,
            averageCostPerToken: totalTokens > 0 ? totalCost / totalTokens : 0,
            breakdownByProvider,
            breakdownByModel,
            breakdownByDay,
        };
    }

    static async calculateProjectedCosts(
        userId: string,
        options: {
            periodDays?: number;
            provider?: string;
            modelId?: modelID;
            currency?: string;
        } = {}
    ): Promise<ProjectedCost> {
        const {
            periodDays = 30,
            provider,
            modelId,
            currency = this.defaultCurrency,
        } = options;

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - periodDays);

        const aggregated = await this.getAggregatedCosts(userId, {
            startDate,
            endDate,
            provider,
            modelId,
            currency,
        });

        const dailyAverageCost = aggregated.totalCost / periodDays;

        let confidence: 'low' | 'medium' | 'high' = 'medium';
        if (periodDays < 7) {
            confidence = 'low';
        } else if (periodDays >= 30 && aggregated.requestCount > 100) {
            confidence = 'high';
        }

        return {
            projectedDailyCost: dailyAverageCost,
            projectedMonthlyCost: dailyAverageCost * 30,
            projectedYearlyCost: dailyAverageCost * 365,
            currency,
            basedOnPeriod: {
                days: periodDays,
                startDate,
                endDate,
            },
            confidence,
        };
    }

    static async checkUsageLimits(
        userId: string,
        options: {
            monthlyLimit?: number;
            currency?: string;
        } = {}
    ): Promise<UsageLimitWarning> {
        const { monthlyLimit = 100, currency = this.defaultCurrency } = options;

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);

        const aggregated = await this.getAggregatedCosts(userId, {
            startDate,
            endDate,
            currency,
        });

        const currentUsage = aggregated.totalCost;
        const percentageUsed = monthlyLimit > 0 ? (currentUsage / monthlyLimit) * 100 : 0;
        const isOverLimit = currentUsage > monthlyLimit;
        const isApproachingLimit = !isOverLimit && percentageUsed >= 80;

        const recommendations: string[] = [];
        if (isOverLimit) {
            recommendations.push('Monthly usage limit exceeded. Consider upgrading your plan.');
        } else if (isApproachingLimit) {
            recommendations.push('Approaching monthly limit. Monitor usage closely.');
        }

        const daysInMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate();
        const dayOfMonth = endDate.getDate();
        const projectedMonthly =
            dayOfMonth > 0 ? (currentUsage / dayOfMonth) * daysInMonth : currentUsage;
        const projectedOverage = Math.max(0, projectedMonthly - monthlyLimit);

        return {
            isApproachingLimit,
            isOverLimit,
            currentUsage,
            limit: monthlyLimit,
            percentageUsed,
            projectedOverage,
            currency,
            recommendations,
        };
    }
}

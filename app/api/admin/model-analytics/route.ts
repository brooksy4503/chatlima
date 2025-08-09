import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, tokenUsageMetrics, modelPricing } from '@/lib/db/schema';
import { eq, sql, gte, desc, asc, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

interface ModelAnalytics {
    id: string;
    name: string;
    provider: string;
    tokensUsed: number;
    cost: number;
    requestCount: number;
    avgTotalDuration: number; // Renamed from avgResponseTime
    avgTimeToFirstToken: number; // NEW
    avgTokensPerSecond: number; // NEW
    successRate: number;
    lastUsed: string;
    usagePercentage: number;
    costPercentage: number;
    inputTokenPrice?: number;
    outputTokenPrice?: number;
}

interface ProviderAnalytics {
    name: string;
    tokensUsed: number;
    cost: number;
    requestCount: number;
    avgTotalDuration: number; // Renamed from avgResponseTime
    avgTimeToFirstToken: number; // NEW
    avgTokensPerSecond: number; // NEW
    successRate: number;
    modelCount: number;
    usagePercentage: number;
    costPercentage: number;
}

export async function GET(req: NextRequest) {
    const requestId = nanoid();

    try {
        // Check if user is authenticated and is an admin
        const session = await auth.api.getSession({ headers: req.headers });

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
                { status: 401 }
            );
        }

        // Query the database to get the user's admin status
        const userResult = await db
            .select()
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        if (userResult.length === 0) {
            return NextResponse.json(
                { error: { code: 'FORBIDDEN', message: 'User not found' } },
                { status: 403 }
            );
        }

        const user = userResult[0];
        const isAdmin = user.role === "admin" || user.isAdmin === true;

        if (!isAdmin) {
            return NextResponse.json(
                { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
                { status: 403 }
            );
        }

        // Get query parameters
        const { searchParams } = new URL(req.url);
        const timeRange = searchParams.get('timeRange') || 'month';
        const providerFilter = searchParams.get('provider') || 'all';

        // Calculate start date based on time range
        const now = new Date();
        let startDate: Date;

        switch (timeRange) {
            case 'day':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'year':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
        }

        // Get model analytics from tokenUsageMetrics
        let whereCondition = gte(tokenUsageMetrics.createdAt, startDate);

        if (providerFilter !== 'all') {
            whereCondition = and(whereCondition, eq(tokenUsageMetrics.provider, providerFilter))!;
        }

        const modelUsageData = await db
            .select({
                modelId: tokenUsageMetrics.modelId,
                provider: tokenUsageMetrics.provider,
                totalTokens: sql<number>`coalesce(sum(${tokenUsageMetrics.totalTokens}), 0)`,
                totalCost: sql<number>`coalesce(sum(coalesce(${tokenUsageMetrics.actualCost}, ${tokenUsageMetrics.estimatedCost})), 0)`,
                requestCount: sql<number>`count(*)`,
                avgTotalDuration: sql<number>`coalesce(avg(${tokenUsageMetrics.processingTimeMs}), 0) / 1000.0`,
                avgTimeToFirstToken: sql<number>`coalesce(avg(${tokenUsageMetrics.timeToFirstTokenMs}), 0) / 1000.0`,
                avgTokensPerSecond: sql<number>`coalesce(avg(${tokenUsageMetrics.tokensPerSecond}), 0)`,
                successRate: sql<number>`(count(case when ${tokenUsageMetrics.status} = 'completed' then 1 end) * 100.0) / count(*)`,
                lastUsed: sql<string>`max(${tokenUsageMetrics.createdAt})`
            })
            .from(tokenUsageMetrics)
            .where(whereCondition)
            .groupBy(tokenUsageMetrics.modelId, tokenUsageMetrics.provider)
            .orderBy(desc(sql`coalesce(sum(${tokenUsageMetrics.totalTokens}), 0)`));

        // Get pricing data
        const pricingData = await db
            .select()
            .from(modelPricing)
            .where(eq(modelPricing.isActive, true));

        // Create pricing lookup map
        const pricingMap = new Map();
        pricingData.forEach(price => {
            const key = `${price.modelId}-${price.provider}`;
            pricingMap.set(key, price);
        });

        // Calculate totals for percentages
        const totalTokens = modelUsageData.reduce((sum, model) => sum + Number(model.totalTokens), 0);
        const totalCost = modelUsageData.reduce((sum, model) => sum + Number(model.totalCost), 0);

        // Transform data to match expected interface
        const modelAnalytics: ModelAnalytics[] = modelUsageData.map(model => {
            const pricing = pricingMap.get(`${model.modelId}-${model.provider}`);
            const tokensUsed = Number(model.totalTokens);
            const cost = Number(model.totalCost);

            return {
                id: model.modelId,
                name: model.modelId.charAt(0).toUpperCase() + model.modelId.slice(1).replace(/-/g, ' '),
                provider: model.provider,
                tokensUsed,
                cost,
                requestCount: Number(model.requestCount),
                avgTotalDuration: Number(model.avgTotalDuration),
                avgTimeToFirstToken: Number(model.avgTimeToFirstToken),
                avgTokensPerSecond: Number(model.avgTokensPerSecond),
                successRate: Number(model.successRate),
                lastUsed: model.lastUsed,
                usagePercentage: totalTokens > 0 ? (tokensUsed / totalTokens) * 100 : 0,
                costPercentage: totalCost > 0 ? (cost / totalCost) * 100 : 0,
                inputTokenPrice: pricing ? Number(pricing.inputTokenPrice) : undefined,
                outputTokenPrice: pricing ? Number(pricing.outputTokenPrice) : undefined,
            };
        });

        // Get provider analytics
        const providerUsageData = await db
            .select({
                provider: tokenUsageMetrics.provider,
                totalTokens: sql<number>`coalesce(sum(${tokenUsageMetrics.totalTokens}), 0)`,
                totalCost: sql<number>`coalesce(sum(coalesce(${tokenUsageMetrics.actualCost}, ${tokenUsageMetrics.estimatedCost})), 0)`,
                requestCount: sql<number>`count(*)`,
                avgTotalDuration: sql<number>`coalesce(avg(${tokenUsageMetrics.processingTimeMs}), 0) / 1000.0`,
                avgTimeToFirstToken: sql<number>`coalesce(avg(${tokenUsageMetrics.timeToFirstTokenMs}), 0) / 1000.0`,
                avgTokensPerSecond: sql<number>`coalesce(avg(${tokenUsageMetrics.tokensPerSecond}), 0)`,
                successRate: sql<number>`(count(case when ${tokenUsageMetrics.status} = 'completed' then 1 end) * 100.0) / count(*)`,
                modelCount: sql<number>`count(distinct ${tokenUsageMetrics.modelId})`
            })
            .from(tokenUsageMetrics)
            .where(gte(tokenUsageMetrics.createdAt, startDate))
            .groupBy(tokenUsageMetrics.provider)
            .orderBy(desc(sql`coalesce(sum(${tokenUsageMetrics.totalTokens}), 0)`));

        const providerAnalytics: ProviderAnalytics[] = providerUsageData.map(provider => {
            const tokensUsed = Number(provider.totalTokens);
            const cost = Number(provider.totalCost);

            return {
                name: provider.provider.charAt(0).toUpperCase() + provider.provider.slice(1),
                tokensUsed,
                cost,
                requestCount: Number(provider.requestCount),
                avgTotalDuration: Number(provider.avgTotalDuration),
                avgTimeToFirstToken: Number(provider.avgTimeToFirstToken),
                avgTokensPerSecond: Number(provider.avgTokensPerSecond),
                successRate: Number(provider.successRate),
                modelCount: Number(provider.modelCount),
                usagePercentage: totalTokens > 0 ? (tokensUsed / totalTokens) * 100 : 0,
                costPercentage: totalCost > 0 ? (cost / totalCost) * 100 : 0,
            };
        });

        // Get model count from pricing table
        const totalModelsInPricing = await db
            .select({ count: sql<number>`count(distinct ${modelPricing.modelId})` })
            .from(modelPricing)
            .where(eq(modelPricing.isActive, true));

        return NextResponse.json({
            success: true,
            data: {
                modelAnalytics,
                providerAnalytics,
                summary: {
                    totalModelsWithUsage: modelAnalytics.length,
                    totalModelsInPricing: totalModelsInPricing[0]?.count || 0,
                    totalTokens,
                    totalCost,
                    totalRequests: modelUsageData.reduce((sum, model) => sum + Number(model.requestCount), 0),
                    avgSuccessRate: modelUsageData.length > 0
                        ? modelUsageData.reduce((sum, model) => sum + Number(model.successRate), 0) / modelUsageData.length
                        : 0,
                    avgTotalDuration: modelUsageData.length > 0
                        ? modelUsageData.reduce((sum, model) => sum + Number(model.avgTotalDuration), 0) / modelUsageData.length
                        : 0,
                    timeRange,
                    startDate: startDate.toISOString(),
                    endDate: now.toISOString()
                }
            },
        });
    } catch (error) {
        console.error('[Model Analytics API] Error:', error);
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve model analytics' } },
            { status: 500 }
        );
    }
}
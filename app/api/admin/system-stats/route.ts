import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { users, chats, messages, tokenUsageMetrics, dailyTokenUsage, modelPricing } from '@/lib/db/schema';
import { eq, and, gte, lte, sql, desc, asc } from 'drizzle-orm';
import { ModelNameService } from '@/lib/services/model-names';

export async function GET(req: NextRequest) {
    try {
        // Get headers from the request
        const headersList = await headers();

        // Convert ReadonlyHeaders to Headers
        const requestHeaders = new Headers();
        headersList.forEach((value, key) => {
            requestHeaders.set(key, value);
        });

        // Check authentication
        const session = await auth.api.getSession({ headers: requestHeaders });

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
                { status: 401 }
            );
        }

        // Check if user is admin
        const userResult = await db
            .select()
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        if (userResult.length === 0) {
            return NextResponse.json(
                { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
                { status: 404 }
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

        // Parse query parameters
        const { searchParams } = new URL(req.url);
        const timeRange = searchParams.get('timeRange') || 'month'; // day, week, month, year

        // Calculate date range
        const now = new Date();
        let startDate: Date;
        let previousStartDate: Date;

        switch (timeRange) {
            case 'day':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                previousStartDate = new Date(now.getTime() - 48 * 60 * 60 * 1000);
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
                break;
            case 'year':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                previousStartDate = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        }

        // Get total users
        const totalUsersResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(users);

        const totalUsers = Number(totalUsersResult[0]?.count || 0);

        // Get active users (users with activity in the time range)
        const activeUsersResult = await db
            .select({ count: sql<number>`count(distinct ${users.id})` })
            .from(users)
            .innerJoin(chats, eq(users.id, chats.userId))
            .where(gte(chats.updatedAt, startDate));

        const activeUsers = Number(activeUsersResult[0]?.count || 0);

        // Get total tokens and cost with real total duration calculation
        const tokenStatsResult = await db
            .select({
                totalTokens: sql<number>`coalesce(sum(${tokenUsageMetrics.totalTokens}), 0)`,
                totalCost: sql<number>`coalesce(sum(coalesce(${tokenUsageMetrics.actualCost}, ${tokenUsageMetrics.estimatedCost})), 0)`,
                requestsToday: sql<number>`coalesce(count(*), 0)`,
                avgTotalDuration: sql<number>`coalesce(avg(${tokenUsageMetrics.processingTimeMs}), 0) / 1000.0`
            })
            .from(tokenUsageMetrics)
            .where(gte(tokenUsageMetrics.createdAt, startDate));

        const totalTokens = Number(tokenStatsResult[0]?.totalTokens || 0);
        const totalCost = Number(tokenStatsResult[0]?.totalCost || 0);
        const requestsToday = Number(tokenStatsResult[0]?.requestsToday || 0);
        const avgTotalDuration = Number(tokenStatsResult[0]?.avgTotalDuration || 0);

        // Get requests this month
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const requestsThisMonthResult = await db
            .select({ count: sql<number>`coalesce(count(*), 0)` })
            .from(tokenUsageMetrics)
            .where(gte(tokenUsageMetrics.createdAt, monthStart));

        const requestsThisMonth = Number(requestsThisMonthResult[0]?.count || 0);

        // Get top models by usage with actual model names
        const topModelsResult = await db
            .select({
                modelId: tokenUsageMetrics.modelId,
                totalTokens: sql<number>`coalesce(sum(${tokenUsageMetrics.totalTokens}), 0)`,
                totalCost: sql<number>`coalesce(sum(coalesce(${tokenUsageMetrics.actualCost}, ${tokenUsageMetrics.estimatedCost})), 0)`,
                requestCount: sql<number>`count(*)`
            })
            .from(tokenUsageMetrics)
            .where(gte(tokenUsageMetrics.createdAt, startDate))
            .groupBy(tokenUsageMetrics.modelId)
            .orderBy(desc(sql`coalesce(sum(${tokenUsageMetrics.totalTokens}), 0)`))
            .limit(5);

        // Get top providers by usage
        const topProvidersResult = await db
            .select({
                provider: tokenUsageMetrics.provider,
                totalTokens: sql<number>`coalesce(sum(${tokenUsageMetrics.totalTokens}), 0)`,
                totalCost: sql<number>`coalesce(sum(coalesce(${tokenUsageMetrics.actualCost}, ${tokenUsageMetrics.estimatedCost})), 0)`,
                requestCount: sql<number>`count(*)`
            })
            .from(tokenUsageMetrics)
            .where(gte(tokenUsageMetrics.createdAt, startDate))
            .groupBy(tokenUsageMetrics.provider)
            .orderBy(desc(sql`coalesce(sum(${tokenUsageMetrics.totalTokens}), 0)`))
            .limit(5);

        // Get daily usage data
        const dailyUsageResult = await db
            .select({
                date: dailyTokenUsage.date,
                totalTokens: sql<number>`coalesce(sum(${dailyTokenUsage.totalTokens}), 0)`,
                totalCost: sql<number>`coalesce(sum(coalesce(${dailyTokenUsage.totalActualCost}, ${dailyTokenUsage.totalEstimatedCost})), 0)`
            })
            .from(dailyTokenUsage)
            .where(gte(dailyTokenUsage.date, startDate.toISOString().split('T')[0]))
            .groupBy(dailyTokenUsage.date)
            .orderBy(asc(dailyTokenUsage.date));

        // Calculate real system uptime based on successful requests vs total requests
        const uptimeResult = await db
            .select({
                totalRequests: sql<number>`coalesce(count(*), 0)`,
                successfulRequests: sql<number>`coalesce(count(*) filter (where ${tokenUsageMetrics.status} = 'completed'), 0)`
            })
            .from(tokenUsageMetrics)
            .where(gte(tokenUsageMetrics.createdAt, startDate));

        const totalRequests = Number(uptimeResult[0]?.totalRequests || 0);
        const successfulRequests = Number(uptimeResult[0]?.successfulRequests || 0);
        const systemUptime = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 99.9;

        // Calculate trend data for current vs previous period
        const previousPeriodStats = await db
            .select({
                totalTokens: sql<number>`coalesce(sum(${tokenUsageMetrics.totalTokens}), 0)`,
                totalCost: sql<number>`coalesce(sum(coalesce(${tokenUsageMetrics.actualCost}, ${tokenUsageMetrics.estimatedCost})), 0)`,
                totalUsers: sql<number>`coalesce(count(distinct ${tokenUsageMetrics.userId}), 0)`,
                activeUsers: sql<number>`coalesce(count(distinct ${users.id}), 0)`
            })
            .from(tokenUsageMetrics)
            .leftJoin(users, eq(tokenUsageMetrics.userId, users.id))
            .where(and(
                gte(tokenUsageMetrics.createdAt, previousStartDate),
                lte(tokenUsageMetrics.createdAt, startDate)
            ));

        const prevStats = previousPeriodStats[0];

        // Calculate percentage changes
        const calculatePercentageChange = (current: number, previous: number): number => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
        };

        const tokenTrend = calculatePercentageChange(totalTokens, Number(prevStats?.totalTokens || 0));
        const costTrend = calculatePercentageChange(totalCost, Number(prevStats?.totalCost || 0));
        const userTrend = calculatePercentageChange(totalUsers, Number(prevStats?.totalUsers || 0));
        const activeUserTrend = calculatePercentageChange(activeUsers, Number(prevStats?.activeUsers || 0));

        // Get model names using the ModelNameService
        const modelNamesMap = await ModelNameService.getModelNamesFromDatabase();

        // Format the response
        const systemStats = {
            totalUsers,
            activeUsers,
            totalTokens,
            totalCost,
            avgTotalDuration,
            systemUptime,
            requestsToday,
            requestsThisMonth,
            trends: {
                tokenTrend,
                costTrend,
                userTrend,
                activeUserTrend
            },
            topModels: topModelsResult.map(model => ({
                id: model.modelId,
                name: modelNamesMap.get(model.modelId) || ModelNameService.getDisplayName(model.modelId),
                usage: Number(model.totalTokens),
                cost: Number(model.totalCost),
                requestCount: Number(model.requestCount)
            })),
            topProviders: topProvidersResult.map(provider => ({
                name: provider.provider,
                usage: Number(provider.totalTokens),
                cost: Number(provider.totalCost),
                requestCount: Number(provider.requestCount)
            })),
            dailyUsage: dailyUsageResult.map(day => ({
                date: day.date,
                tokens: Number(day.totalTokens),
                cost: Number(day.totalCost)
            }))
        };

        return NextResponse.json({
            success: true,
            data: systemStats
        });

    } catch (error) {
        console.error('[AdminAPI] System stats error:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Internal server error while fetching system stats'
                }
            },
            { status: 500 }
        );
    }
} 
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { users, chats, messages, tokenUsageMetrics, dailyTokenUsage, modelPricing } from '@/lib/db/schema';
import { eq, and, gte, lte, sql, desc, asc } from 'drizzle-orm';

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

        switch (timeRange) {
            case 'day':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'year':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        // Get total users
        const totalUsersResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(users);

        const totalUsers = totalUsersResult[0]?.count || 0;

        // Get active users (users with activity in the time range)
        const activeUsersResult = await db
            .select({ count: sql<number>`count(distinct ${users.id})` })
            .from(users)
            .innerJoin(chats, eq(users.id, chats.userId))
            .where(gte(chats.updatedAt, startDate));

        const activeUsers = activeUsersResult[0]?.count || 0;

        // Get total tokens and cost
        const tokenStatsResult = await db
            .select({
                totalTokens: sql<number>`coalesce(sum(${tokenUsageMetrics.totalTokens}), 0)`,
                totalCost: sql<number>`coalesce(sum(${tokenUsageMetrics.estimatedCost}), 0)`,
                requestsToday: sql<number>`coalesce(count(*), 0)`
            })
            .from(tokenUsageMetrics)
            .where(gte(tokenUsageMetrics.createdAt, startDate));

        const totalTokens = tokenStatsResult[0]?.totalTokens || 0;
        const totalCost = tokenStatsResult[0]?.totalCost || 0;
        const requestsToday = tokenStatsResult[0]?.requestsToday || 0;

        // Get requests this month
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const requestsThisMonthResult = await db
            .select({ count: sql<number>`coalesce(count(*), 0)` })
            .from(tokenUsageMetrics)
            .where(gte(tokenUsageMetrics.createdAt, monthStart));

        const requestsThisMonth = requestsThisMonthResult[0]?.count || 0;

        // Get top models by usage
        const topModelsResult = await db
            .select({
                modelId: tokenUsageMetrics.modelId,
                totalTokens: sql<number>`coalesce(sum(${tokenUsageMetrics.totalTokens}), 0)`,
                totalCost: sql<number>`coalesce(sum(${tokenUsageMetrics.estimatedCost}), 0)`,
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
                totalCost: sql<number>`coalesce(sum(${tokenUsageMetrics.estimatedCost}), 0)`,
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
                totalCost: sql<number>`coalesce(sum(${dailyTokenUsage.totalEstimatedCost}), 0)`
            })
            .from(dailyTokenUsage)
            .where(gte(dailyTokenUsage.date, startDate.toISOString().split('T')[0]))
            .groupBy(dailyTokenUsage.date)
            .orderBy(asc(dailyTokenUsage.date));

        // Calculate average response time (mock for now - would need to track this)
        const avgResponseTime = 1.2; // Mock value - would need to track actual response times

        // Calculate system uptime (mock for now)
        const systemUptime = 99.9; // Mock value - would need to track actual uptime

        // Format the response
        const systemStats = {
            totalUsers,
            activeUsers,
            totalTokens,
            totalCost,
            avgResponseTime,
            systemUptime,
            requestsToday,
            requestsThisMonth,
            topModels: topModelsResult.map(model => ({
                id: model.modelId,
                name: model.modelId, // Would need to join with modelPricing for actual names
                usage: model.totalTokens,
                cost: model.totalCost,
                requestCount: model.requestCount
            })),
            topProviders: topProvidersResult.map(provider => ({
                name: provider.provider,
                usage: provider.totalTokens,
                cost: provider.totalCost,
                requestCount: provider.requestCount
            })),
            dailyUsage: dailyUsageResult.map(day => ({
                date: day.date,
                tokens: day.totalTokens,
                cost: day.totalCost
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
import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware } from '@/lib/middleware/auth';
import { db } from '@/lib/db';
import { users, tokenUsageMetrics } from '@/lib/db/schema';
import { eq, like, or, and, sql, gte } from 'drizzle-orm';

/**
 * GET /api/admin/users - List all users with usage breakdown
 */
export async function GET(req: NextRequest) {
    try {
        const adminResult = await AuthMiddleware.requireAdmin(req);
        if (adminResult.response) {
            return adminResult.response;
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const active = searchParams.get('active') || 'all';
        const sortBy = searchParams.get('sortBy') || 'tokensUsed';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        const offset = (page - 1) * limit;
        const userConditions = [];

        if (search) {
            userConditions.push(
                or(
                    like(users.name, `%${search}%`),
                    like(users.email, `%${search}%`)
                )
            );
        }

        const usersWithUsage = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                isAnonymous: users.isAnonymous,
                createdAt: users.createdAt,
                tokensUsed: sql<number>`COALESCE(SUM(${tokenUsageMetrics.totalTokens}), 0)`,
                cost: sql<number>`COALESCE(SUM(COALESCE(${tokenUsageMetrics.actualCost}, ${tokenUsageMetrics.estimatedCost})), 0)`,
                requestCount: sql<number>`COUNT(${tokenUsageMetrics.id})`,
                lastActive: sql<string>`MAX(${tokenUsageMetrics.createdAt})`,
            })
            .from(users)
            .leftJoin(tokenUsageMetrics, eq(users.id, tokenUsageMetrics.userId))
            .where(userConditions.length > 0 ? and(...userConditions) : undefined)
            .groupBy(users.id, users.name, users.email, users.role, users.isAnonymous, users.createdAt);

        const totalCountResult = await db
            .select({ count: users.id })
            .from(users)
            .where(userConditions.length > 0 ? and(...userConditions) : undefined);

        let totalUsers = totalCountResult.length;
        let filteredUsers = usersWithUsage;

        if (active !== 'all') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            filteredUsers = usersWithUsage.filter(user => {
                const isActive = user.lastActive ? new Date(user.lastActive) > thirtyDaysAgo : false;
                return active === 'active' ? isActive : !isActive;
            });

            totalUsers = filteredUsers.length;
        }

        let sortedUsers = filteredUsers;
        if (sortBy === 'tokensUsed') {
            sortedUsers = sortedUsers.sort((a, b) =>
                sortOrder === 'asc' ? a.tokensUsed - b.tokensUsed : b.tokensUsed - a.tokensUsed
            );
        } else if (sortBy === 'cost') {
            sortedUsers = sortedUsers.sort((a, b) =>
                sortOrder === 'asc' ? a.cost - b.cost : b.cost - a.cost
            );
        } else if (sortBy === 'requestCount') {
            sortedUsers = sortedUsers.sort((a, b) =>
                sortOrder === 'asc' ? a.requestCount - b.requestCount : b.requestCount - a.requestCount
            );
        } else if (sortBy === 'lastActive') {
            sortedUsers = sortedUsers.sort((a, b) => {
                const dateA = a.lastActive ? new Date(a.lastActive).getTime() : 0;
                const dateB = b.lastActive ? new Date(b.lastActive).getTime() : 0;
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            });
        } else if (sortBy === 'name') {
            sortedUsers = sortedUsers.sort((a, b) => {
                const nameA = a.name || '';
                const nameB = b.name || '';
                return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
            });
        }

        const paginatedUsers = sortedUsers.slice(offset, offset + limit);

        const usersWithDetails = paginatedUsers.map(user => {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const isActive = user.lastActive ? new Date(user.lastActive) > thirtyDaysAgo : false;

            return {
                id: user.id,
                email: user.email,
                name: user.name || 'Anonymous User',
                tokensUsed: Number(user.tokensUsed),
                cost: Number(user.cost),
                requestCount: Number(user.requestCount),
                lastActive: user.lastActive || user.createdAt.toISOString(),
                isActive,
                createdAt: user.createdAt.toISOString(),
                role: user.role,
                isAnonymous: user.isAnonymous,
            };
        });

        const summaryStats = await db
            .select({
                totalUsers: sql<number>`COUNT(DISTINCT ${users.id})`,
                totalTokens: sql<number>`COALESCE(SUM(${tokenUsageMetrics.totalTokens}), 0)`,
                totalCost: sql<number>`COALESCE(SUM(COALESCE(${tokenUsageMetrics.actualCost}, ${tokenUsageMetrics.estimatedCost})), 0)`,
                totalRequests: sql<number>`COUNT(${tokenUsageMetrics.id})`,
            })
            .from(users)
            .leftJoin(tokenUsageMetrics, eq(users.id, tokenUsageMetrics.userId));

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const activeUsersResult = await db
            .select({ count: users.id })
            .from(users)
            .leftJoin(tokenUsageMetrics, eq(users.id, tokenUsageMetrics.userId))
            .where(gte(tokenUsageMetrics.createdAt, thirtyDaysAgo))
            .groupBy(users.id);

        const activeUsers = activeUsersResult.length;

        return NextResponse.json({
            users: usersWithDetails,
            pagination: {
                page,
                limit,
                total: totalUsers,
                totalPages: Math.ceil(totalUsers / limit),
            },
            summary: {
                totalUsers,
                activeUsers,
                totalTokens: Number(summaryStats[0]?.totalTokens || 0),
                totalCost: Number(summaryStats[0]?.totalCost || 0),
                totalRequests: Number(summaryStats[0]?.totalRequests || 0),
            },
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, tokenUsageMetrics } from '@/lib/db/schema';
import { eq, like, or, and, sql, gte } from 'drizzle-orm';

/**
 * Admin API endpoint for fetching users with usage statistics
 * 
 * GET /api/admin/users - List all users with usage breakdown
 */

export async function GET(req: NextRequest) {
    try {
        // Get the authenticated session
        const session = await auth.api.getSession({ headers: req.headers });

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
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
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const user = userResult[0];
        const isAdmin = user.role === "admin" || user.isAdmin === true;

        if (!isAdmin) {
            return NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
            );
        }

        // Get query parameters
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const plan = searchParams.get('plan') || 'all';
        const active = searchParams.get('active') || 'all';
        const sortBy = searchParams.get('sortBy') || 'tokensUsed';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        const offset = (page - 1) * limit;

        // Build query conditions for users
        const userConditions = [];

        if (search) {
            userConditions.push(
                or(
                    like(users.name, `%${search}%`),
                    like(users.email, `%${search}%`)
                )
            );
        }

        if (plan !== 'all') {
            // For now, we'll use role as plan (can be enhanced later)
            userConditions.push(eq(users.role, plan));
        }

        // Note: Active/inactive filtering will be handled after the join query
        // since we need to check the last activity date

        // Get users with their usage statistics
        const usersWithUsage = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                isAdmin: users.isAdmin,
                isAnonymous: users.isAnonymous,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
                // Token usage statistics
                tokensUsed: sql<number>`COALESCE(SUM(${tokenUsageMetrics.totalTokens}), 0)`,
                cost: sql<number>`COALESCE(SUM(COALESCE(${tokenUsageMetrics.actualCost}, ${tokenUsageMetrics.estimatedCost})), 0)`,
                requestCount: sql<number>`COUNT(${tokenUsageMetrics.id})`,
                lastActive: sql<string>`MAX(${tokenUsageMetrics.createdAt})`,
            })
            .from(users)
            .leftJoin(tokenUsageMetrics, eq(users.id, tokenUsageMetrics.userId))
            .where(userConditions.length > 0 ? and(...userConditions) : undefined)
            .groupBy(users.id, users.name, users.email, users.role, users.isAdmin, users.isAnonymous, users.createdAt, users.updatedAt);

        // Get total count for pagination (before filtering)
        const totalCountResult = await db
            .select({ count: users.id })
            .from(users)
            .where(userConditions.length > 0 ? and(...userConditions) : undefined);

        let totalUsers = totalCountResult.length;

        // Apply active/inactive filtering
        let filteredUsers = usersWithUsage;
        if (active !== 'all') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            filteredUsers = usersWithUsage.filter(user => {
                const isActive = user.lastActive ? new Date(user.lastActive) > thirtyDaysAgo : false;
                return active === 'active' ? isActive : !isActive;
            });

            // Update total count after filtering
            totalUsers = filteredUsers.length;
        }

        // Apply sorting
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

        // Apply pagination
        const paginatedUsers = sortedUsers.slice(offset, offset + limit);

        // Calculate additional fields for each user
        const usersWithDetails = paginatedUsers.map(user => {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const isActive = user.lastActive ? new Date(user.lastActive) > thirtyDaysAgo : false;

            // Calculate usage percentage (placeholder - can be enhanced with actual limits)
            const usagePercentage = Math.min(Math.round((user.tokensUsed / 1000000) * 100), 100);

            // Map role to plan
            const plan = user.role === 'admin' ? 'premium' : user.role === 'user' ? 'standard' : 'basic';

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
                plan,
                usagePercentage,
            };
        });

        // Get summary statistics
        const summaryStats = await db
            .select({
                totalUsers: sql<number>`COUNT(DISTINCT ${users.id})`,
                totalTokens: sql<number>`COALESCE(SUM(${tokenUsageMetrics.totalTokens}), 0)`,
                totalCost: sql<number>`COALESCE(SUM(COALESCE(${tokenUsageMetrics.actualCost}, ${tokenUsageMetrics.estimatedCost})), 0)`,
                totalRequests: sql<number>`COUNT(${tokenUsageMetrics.id})`,
            })
            .from(users)
            .leftJoin(tokenUsageMetrics, eq(users.id, tokenUsageMetrics.userId));

        // Count active users (users with activity in last 30 days)
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
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, tokenUsageMetrics, chats, messages } from "@/lib/db/schema";
import { eq, and, gte, desc, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
    try {
        // Get session to check admin access
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user is admin
        const userResult = await db
            .select()
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        if (userResult.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const user = userResult[0];
        const isAdmin = user.role === "admin" || user.isAdmin === true;

        if (!isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const planFilter = searchParams.get("plan") || "all";
        const activeFilter = searchParams.get("active") || "all";
        const sortBy = searchParams.get("sortBy") || "tokensUsed";
        const sortOrder = searchParams.get("sortOrder") || "desc";

        const offset = (page - 1) * limit;

        // Calculate date for "active" users (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Build conditions array
        const conditions = [];

        // Add search filter
        if (search) {
            conditions.push(sql`(${users.name} ILIKE ${`%${search}%`} OR ${users.email} ILIKE ${`%${search}%`})`);
        }

        // Add plan filter (based on role for now)
        if (planFilter !== "all") {
            conditions.push(eq(users.role, planFilter));
        }

        // Get all users first to apply active filter
        const allUsers = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
                role: users.role,
                isAdmin: users.isAdmin,
                isAnonymous: users.isAnonymous,
            })
            .from(users)
            .where(conditions.length > 0 ? and(...conditions) : undefined);

        // Get usage statistics for all users
        const userStats = await db
            .select({
                userId: tokenUsageMetrics.userId,
                totalTokens: sql<number>`COALESCE(SUM(${tokenUsageMetrics.totalTokens}), 0)`,
                totalCost: sql<number>`COALESCE(SUM(COALESCE(${tokenUsageMetrics.actualCost}, ${tokenUsageMetrics.estimatedCost})), 0)`,
                requestCount: sql<number>`COUNT(*)`,
                lastActive: sql<string>`MAX(${tokenUsageMetrics.createdAt})`,
            })
            .from(tokenUsageMetrics)
            .groupBy(tokenUsageMetrics.userId);

        // Create a map of user stats
        const userStatsMap = new Map(
            userStats.map(stat => [stat.userId, stat])
        );

        // Combine user data with stats and apply active filter
        let combinedUsers = allUsers.map(user => {
            const stats = userStatsMap.get(user.id);
            const lastActive = stats?.lastActive ? new Date(stats.lastActive) : user.createdAt;
            const isActive = lastActive >= thirtyDaysAgo;

            return {
                id: user.id,
                name: user.name || "Anonymous User",
                email: user.email,
                tokensUsed: stats?.totalTokens || 0,
                cost: parseFloat(String(stats?.totalCost || "0")),
                requestCount: stats?.requestCount || 0,
                lastActive: lastActive.toISOString().split('T')[0],
                isActive,
                createdAt: user.createdAt.toISOString().split('T')[0],
                plan: user.role || "basic",
                usagePercentage: 0, // Will calculate based on total usage
            };
        });

        // Apply active filter
        if (activeFilter !== "all") {
            combinedUsers = combinedUsers.filter(user =>
                activeFilter === "active" ? user.isActive : !user.isActive
            );
        }

        // Calculate usage percentage based on total tokens across all users
        const totalTokens = combinedUsers.reduce((sum, user) => sum + user.tokensUsed, 0);
        combinedUsers = combinedUsers.map(user => ({
            ...user,
            usagePercentage: totalTokens > 0 ? Math.round((user.tokensUsed / totalTokens) * 100) : 0,
        }));

        // Sort users
        combinedUsers.sort((a, b) => {
            const aValue = a[sortBy as keyof typeof a];
            const bValue = b[sortBy as keyof typeof b];

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
            }

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortOrder === "asc"
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            return 0;
        });

        // Apply pagination
        const totalUsers = combinedUsers.length;
        const paginatedUsers = combinedUsers.slice(offset, offset + limit);

        // Calculate summary statistics
        const activeUsers = combinedUsers.filter(u => u.isActive).length;
        const totalCost = combinedUsers.reduce((sum, user) => sum + user.cost, 0);
        const totalRequests = combinedUsers.reduce((sum, user) => sum + user.requestCount, 0);

        return NextResponse.json({
            users: paginatedUsers,
            pagination: {
                page,
                limit,
                total: totalUsers,
                totalPages: Math.ceil(totalUsers / limit),
            },
            summary: {
                totalUsers,
                activeUsers,
                totalTokens,
                totalCost,
                totalRequests,
            },
        });

    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 
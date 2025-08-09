import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { usageLimits, users } from '@/lib/db/schema';
import { eq, and, or, isNull, isNotNull } from 'drizzle-orm';

/**
 * Admin API endpoint for managing usage limits
 * 
 * GET /api/admin/usage-limits - List all usage limits
 * POST /api/admin/usage-limits - Create a new usage limit
 * PUT /api/admin/usage-limits/:id - Update a usage limit
 * DELETE /api/admin/usage-limits/:id - Delete a usage limit
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
        const type = searchParams.get('type'); // 'user' or 'model' or 'all'
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Build query conditions
        const conditions = [];

        if (type === 'user') {
            conditions.push(isNotNull(usageLimits.userId));
        } else if (type === 'model') {
            conditions.push(isNotNull(usageLimits.modelId));
        }

        // Fetch usage limits with user information
        const limits = await db
            .select({
                id: usageLimits.id,
                userId: usageLimits.userId,
                modelId: usageLimits.modelId,
                provider: usageLimits.provider,
                dailyTokenLimit: usageLimits.dailyTokenLimit,
                monthlyTokenLimit: usageLimits.monthlyTokenLimit,
                dailyCostLimit: usageLimits.dailyCostLimit,
                monthlyCostLimit: usageLimits.monthlyCostLimit,
                requestRateLimit: usageLimits.requestRateLimit,
                currency: usageLimits.currency,
                isActive: usageLimits.isActive,
                description: usageLimits.description,
                createdAt: usageLimits.createdAt,
                updatedAt: usageLimits.updatedAt,
                userName: users.name,
                userEmail: users.email,
            })
            .from(usageLimits)
            .leftJoin(users, eq(usageLimits.userId, users.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(usageLimits.createdAt)
            .limit(limit)
            .offset(offset);

        // Get total count
        const totalCount = await db
            .select({ count: usageLimits.id })
            .from(usageLimits)
            .where(conditions.length > 0 ? and(...conditions) : undefined);

        return NextResponse.json({
            success: true,
            data: limits,
            meta: {
                total: totalCount.length,
                limit,
                offset,
                type: type || 'all'
            }
        });

    } catch (error) {
        console.error('Error fetching usage limits:', error);
        return NextResponse.json(
            { error: 'Failed to fetch usage limits' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
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

        // Parse request body
        const body = await req.json();
        const {
            userId,
            modelId,
            provider,
            dailyTokenLimit,
            monthlyTokenLimit,
            dailyCostLimit,
            monthlyCostLimit,
            requestRateLimit = 60,
            currency = 'USD',
            isActive = true,
            description
        } = body;

        // Validate required fields
        if (!userId && !modelId) {
            return NextResponse.json(
                { error: 'Either userId or modelId must be provided' },
                { status: 400 }
            );
        }

        if (modelId && !provider) {
            return NextResponse.json(
                { error: 'Provider is required when modelId is provided' },
                { status: 400 }
            );
        }

        if (!dailyTokenLimit || !monthlyTokenLimit || !dailyCostLimit || !monthlyCostLimit) {
            return NextResponse.json(
                { error: 'All limit values are required' },
                { status: 400 }
            );
        }

        // Validate limit values
        if (dailyTokenLimit <= 0 || monthlyTokenLimit <= 0 || dailyCostLimit <= 0 || monthlyCostLimit <= 0) {
            return NextResponse.json(
                { error: 'All limit values must be greater than 0' },
                { status: 400 }
            );
        }

        // Check if a limit already exists for this user/model
        const existingLimit = await db
            .select()
            .from(usageLimits)
            .where(
                userId
                    ? eq(usageLimits.userId, userId)
                    : and(eq(usageLimits.modelId, modelId), eq(usageLimits.provider, provider))
            )
            .limit(1);

        if (existingLimit.length > 0) {
            return NextResponse.json(
                { error: 'A usage limit already exists for this user/model' },
                { status: 409 }
            );
        }

        // Create new usage limit
        const newLimit = await db
            .insert(usageLimits)
            .values({
                userId: userId || null,
                modelId: modelId || null,
                provider: provider || null,
                dailyTokenLimit,
                monthlyTokenLimit,
                dailyCostLimit,
                monthlyCostLimit,
                requestRateLimit,
                currency,
                isActive,
                description: description || null,
            })
            .returning();

        return NextResponse.json({
            success: true,
            data: newLimit[0]
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating usage limit:', error);
        return NextResponse.json(
            { error: 'Failed to create usage limit' },
            { status: 500 }
        );
    }
}

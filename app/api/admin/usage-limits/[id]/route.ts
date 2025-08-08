import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { usageLimits, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Admin API endpoint for managing specific usage limits
 * 
 * PUT /api/admin/usage-limits/:id - Update a usage limit
 * DELETE /api/admin/usage-limits/:id - Delete a usage limit
 */

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

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

        // Check if usage limit exists
        const existingLimit = await db
            .select()
            .from(usageLimits)
            .where(eq(usageLimits.id, id))
            .limit(1);

        if (existingLimit.length === 0) {
            return NextResponse.json(
                { error: 'Usage limit not found' },
                { status: 404 }
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
            requestRateLimit,
            currency,
            isActive,
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



        // Update usage limit
        const updatedLimit = await db
            .update(usageLimits)
            .set({
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
                updatedAt: new Date(),
            })
            .where(eq(usageLimits.id, id))
            .returning();

        return NextResponse.json({
            success: true,
            data: updatedLimit[0]
        });

    } catch (error) {
        console.error('Error updating usage limit:', error);
        return NextResponse.json(
            { error: 'Failed to update usage limit' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

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

        // Check if usage limit exists
        const existingLimit = await db
            .select()
            .from(usageLimits)
            .where(eq(usageLimits.id, id))
            .limit(1);

        if (existingLimit.length === 0) {
            return NextResponse.json(
                { error: 'Usage limit not found' },
                { status: 404 }
            );
        }

        // Delete usage limit
        await db
            .delete(usageLimits)
            .where(eq(usageLimits.id, id));

        return NextResponse.json({
            success: true,
            message: 'Usage limit deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting usage limit:', error);
        return NextResponse.json(
            { error: 'Failed to delete usage limit' },
            { status: 500 }
        );
    }
}

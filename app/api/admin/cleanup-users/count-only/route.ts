import { NextRequest, NextResponse } from 'next/server';

// Force Edge Runtime for lowest memory usage
export const runtime = 'edge';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq, and, lt, sql } from 'drizzle-orm';

/**
 * Ultra-lightweight endpoint that only returns counts
 * GET /api/admin/cleanup-users/count-only?thresholdDays=45
 */
export async function GET(req: NextRequest) {
    try {
        // Get the authenticated session
        const session = await auth.api.getSession({ headers: req.headers });

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
        const thresholdDays = parseInt(searchParams.get('thresholdDays') || '45');

        // Validate parameters
        if (thresholdDays < 7 || thresholdDays > 365) {
            return NextResponse.json(
                { error: { code: 'INVALID_PARAMETERS', message: 'Threshold days must be between 7 and 365' } },
                { status: 400 }
            );
        }

        // Calculate cutoff date
        const cutoffDate = new Date(Date.now() - (thresholdDays * 24 * 60 * 60 * 1000));
        const minimumAgeDate = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));

        // Get counts only (super lightweight)
        const [totalAnonymousResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(users)
            .where(eq(users.isAnonymous, true));

        const [oldInactiveResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(users)
            .where(and(
                eq(users.isAnonymous, true),
                lt(users.updatedAt, cutoffDate),
                lt(users.createdAt, minimumAgeDate)
            ));

        const response = {
            success: true,
            data: {
                totalAnonymousUsers: totalAnonymousResult.count,
                candidatesForDeletion: oldInactiveResult.count,
                thresholdDays,
                minimumAgeDays: 7,
            },
            metadata: {
                requestedAt: new Date().toISOString(),
                lightweight: true,
                memoryOptimized: true,
            }
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Error in count-only endpoint:', error);

        return NextResponse.json(
            {
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Internal server error during count calculation',
                    details: error instanceof Error ? error.message : 'Unknown error'
                }
            },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { UserCleanupService } from '@/lib/services/userCleanupService';

/**
 * Admin API endpoint for previewing anonymous user cleanup
 * 
 * GET /api/admin/cleanup-users/preview?thresholdDays=45&limit=100
 * 
 * Query Parameters:
 * - thresholdDays: Number of days of inactivity (default: 45)
 * - limit: Maximum number of candidates to return (default: 100)
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
        const limit = parseInt(searchParams.get('limit') || '100');

        // Validate parameters
        if (thresholdDays < 7) {
            return NextResponse.json(
                { error: { code: 'INVALID_PARAMETERS', message: 'Threshold days must be at least 7' } },
                { status: 400 }
            );
        }

        if (thresholdDays > 365) {
            return NextResponse.json(
                { error: { code: 'INVALID_PARAMETERS', message: 'Threshold days must be less than 365' } },
                { status: 400 }
            );
        }

        if (limit < 1 || limit > 1000) {
            return NextResponse.json(
                { error: { code: 'INVALID_PARAMETERS', message: 'Limit must be between 1 and 1000' } },
                { status: 400 }
            );
        }

        // Get cleanup preview
        const preview = await UserCleanupService.previewCleanup(thresholdDays);

        // Limit the candidates returned
        const limitedCandidates = preview.candidates.slice(0, limit);

        const response = {
            success: true,
            data: {
                ...preview,
                candidates: limitedCandidates,
                candidatesShown: limitedCandidates.length,
                candidatesTotal: preview.candidatesForDeletion,
            },
            metadata: {
                requestedAt: new Date().toISOString(),
                thresholdDays,
                limit,
                generatedBy: session.user.email || session.user.id,
            }
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Error in cleanup preview endpoint:', error);

        return NextResponse.json(
            {
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Internal server error during cleanup preview',
                    details: error instanceof Error ? error.message : 'Unknown error'
                }
            },
            { status: 500 }
        );
    }
}

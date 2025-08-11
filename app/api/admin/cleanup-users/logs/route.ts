import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { CleanupConfigService } from '@/lib/services/cleanupConfigService';

/**
 * Admin API endpoint for retrieving cleanup execution logs
 * 
 * GET /api/admin/cleanup-users/logs?limit=50&offset=0&type=all
 * 
 * Query Parameters:
 * - limit: Maximum number of logs to return (default: 50, max: 200)
 * - offset: Number of logs to skip (default: 0)
 * - type: Filter by execution type - 'manual', 'cron', 'script', or 'all' (default: 'all')
 * - days: Filter logs from last N days (optional)
 */

// Re-export types from the service for consistency
export type { CleanupLogEntry, LogsResponse } from '@/lib/services/cleanupConfigService';

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
        const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
        const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);
        const type = searchParams.get('type') || 'all';
        const days = searchParams.get('days') ? parseInt(searchParams.get('days')!) : undefined;

        // Validate parameters
        if (type && !['manual', 'cron', 'script', 'admin', 'all'].includes(type)) {
            return NextResponse.json(
                { error: { code: 'INVALID_TYPE', message: 'Type must be one of: manual, cron, script, admin, all' } },
                { status: 400 }
            );
        }

        // Get logs from database
        const logsData = await CleanupConfigService.getLogs({
            type,
            limit,
            offset,
            days
        });

        return NextResponse.json({
            success: true,
            data: {
                ...logsData,
                filters: {
                    type,
                    days,
                }
            },
            metadata: {
                requestedAt: new Date().toISOString(),
                requestedBy: session.user.email || session.user.id,
            }
        });

    } catch (error) {
        console.error('Error in cleanup logs endpoint:', error);

        return NextResponse.json(
            {
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Internal server error during logs retrieval',
                    details: error instanceof Error ? error.message : 'Unknown error'
                }
            },
            { status: 500 }
        );
    }
}

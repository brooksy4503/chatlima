import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware } from '@/lib/middleware/auth';
import { CleanupConfigService } from '@/lib/services/cleanupConfigService';

export type { CleanupLogEntry, LogsResponse } from '@/lib/services/cleanupConfigService';

/**
 * GET /api/admin/cleanup-users/logs?limit=50&offset=0&type=all
 */
export async function GET(req: NextRequest) {
    try {
        const adminResult = await AuthMiddleware.requireAdmin(req);
        if (adminResult.response) {
            return adminResult.response;
        }

        const { searchParams } = new URL(req.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
        const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);
        const type = searchParams.get('type') || 'all';
        const days = searchParams.get('days') ? parseInt(searchParams.get('days')!) : undefined;

        if (type && !['manual', 'cron', 'script', 'admin', 'all'].includes(type)) {
            return NextResponse.json(
                { error: { code: 'INVALID_TYPE', message: 'Type must be one of: manual, cron, script, admin, all' } },
                { status: 400 }
            );
        }

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
                filters: { type, days }
            },
            metadata: {
                requestedAt: new Date().toISOString(),
                requestedBy: adminResult.authContext.userId,
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

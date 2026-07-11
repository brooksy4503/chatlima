import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware } from '@/lib/middleware/auth';
import { UserCleanupService } from '@/lib/services/userCleanupService';

/**
 * GET /api/admin/cleanup-users/preview?thresholdDays=45&limit=100
 */
export async function GET(req: NextRequest) {
    try {
        const adminResult = await AuthMiddleware.requireAdmin(req);
        if (adminResult.response) {
            return adminResult.response;
        }

        const { searchParams } = new URL(req.url);
        const thresholdDays = parseInt(searchParams.get('thresholdDays') || '45');
        const limit = parseInt(searchParams.get('limit') || '100');

        if (thresholdDays < 7 || thresholdDays > 365) {
            return NextResponse.json(
                { error: { code: 'INVALID_PARAMETERS', message: 'Threshold days must be between 7 and 365' } },
                { status: 400 }
            );
        }

        if (limit < 1 || limit > 1000) {
            return NextResponse.json(
                { error: { code: 'INVALID_PARAMETERS', message: 'Limit must be between 1 and 1000' } },
                { status: 400 }
            );
        }

        const preview = await UserCleanupService.previewCleanup(thresholdDays, limit);

        return NextResponse.json({
            success: true,
            data: {
                ...preview,
                candidatesShown: preview.candidates.length,
                candidatesTotal: preview.candidatesForDeletion,
            },
            metadata: {
                requestedAt: new Date().toISOString(),
                thresholdDays,
                limit,
                generatedBy: adminResult.authContext.userId,
            }
        });

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

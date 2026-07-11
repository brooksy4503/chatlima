import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware } from '@/lib/middleware/auth';
import { UserCleanupService } from '@/lib/services/userCleanupService';
import { CleanupConfigService } from '@/lib/services/cleanupConfigService';

/**
 * POST /api/admin/cleanup-users/execute
 * Manual anonymous user cleanup (dry run or confirmed delete).
 */
export async function POST(req: NextRequest) {
    try {
        const adminResult = await AuthMiddleware.requireAdmin(req);
        if (adminResult.response) {
            return adminResult.response;
        }

        let body: Record<string, unknown> = {};
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                { error: { code: 'INVALID_JSON', message: 'Invalid JSON in request body' } },
                { status: 400 }
            );
        }

        const thresholdDays = Number(body.thresholdDays) || 45;
        const batchSize = Number(body.batchSize) || 50;
        const dryRun = Boolean(body.dryRun);
        const confirmationToken = body.confirmationToken as string | undefined;

        if (thresholdDays < 7 || thresholdDays > 365) {
            return NextResponse.json(
                { error: { code: 'INVALID_PARAMETERS', message: 'Threshold days must be between 7 and 365' } },
                { status: 400 }
            );
        }

        if (batchSize < 1 || batchSize > 100) {
            return NextResponse.json(
                { error: { code: 'INVALID_PARAMETERS', message: 'Batch size must be between 1 and 100' } },
                { status: 400 }
            );
        }

        if (!dryRun && confirmationToken !== 'DELETE_ANONYMOUS_USERS') {
            return NextResponse.json(
                {
                    error: {
                        code: 'CONFIRMATION_REQUIRED',
                        message: 'Invalid confirmation token. Use "DELETE_ANONYMOUS_USERS" to confirm deletion.'
                    }
                },
                { status: 400 }
            );
        }

        const executionId = `cleanup_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const executionStartTime = new Date();

        console.log(`[${executionId}] Starting manual cleanup:`, {
            adminUserId: adminResult.authContext.userId,
            thresholdDays,
            batchSize,
            dryRun,
            timestamp: executionStartTime.toISOString()
        });

        const result = await UserCleanupService.executeCleanup(
            thresholdDays,
            batchSize,
            dryRun
        );

        const status = result.success
            ? 'success'
            : (result.errors.length > 0 ? 'partial' : 'error');

        try {
            await CleanupConfigService.logExecution({
                executedAt: executionStartTime.toISOString(),
                executedBy: 'admin',
                usersCounted: result.usersDeleted,
                usersDeleted: result.usersDeleted,
                thresholdDays: result.thresholdDays,
                batchSize: result.batchSize,
                durationMs: result.executionTimeMs,
                status,
                errorMessage: result.errors[0],
                errorCount: result.errors.length,
                dryRun,
                deletedUserIds: result.deletedUserIds,
            });
        } catch (loggingError) {
            console.error('Failed to log cleanup execution:', loggingError);
        }

        const response = {
            success: result.success,
            data: {
                executionId,
                usersDeleted: result.usersDeleted,
                deletedUserIds: result.deletedUserIds,
                errors: result.errors,
                executionTimeMs: result.executionTimeMs,
                thresholdDays: result.thresholdDays,
                batchSize: result.batchSize,
                dryRun,
            },
            metadata: {
                executedAt: new Date().toISOString(),
                executedBy: adminResult.authContext.userId,
            }
        };

        const statusCode = result.success ? 200 : (result.errors.length > 0 ? 206 : 500);
        return NextResponse.json(response, { status: statusCode });

    } catch (error) {
        console.error('Error in cleanup execution endpoint:', error);
        return NextResponse.json(
            {
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Internal server error during cleanup execution',
                    details: error instanceof Error ? error.message : 'Unknown error'
                }
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/admin/cleanup-users/execute
 * Cleanup stats and recent execution history.
 */
export async function GET(req: NextRequest) {
    try {
        const adminResult = await AuthMiddleware.requireAdmin(req);
        if (adminResult.response) {
            return adminResult.response;
        }

        const stats = await UserCleanupService.getCleanupStats();
        const recentExecutions = await CleanupConfigService.getExecutionHistory(7);

        return NextResponse.json({
            success: true,
            data: {
                currentStats: stats,
                executionHistory: recentExecutions.slice(0, 5),
                message: recentExecutions.length === 0
                    ? 'No execution history found. Execute a cleanup to see history here.'
                    : `Showing last ${Math.min(recentExecutions.length, 5)} executions.`
            },
            metadata: {
                requestedAt: new Date().toISOString(),
                requestedBy: adminResult.authContext.userId,
            }
        });

    } catch (error) {
        console.error('Error in cleanup history endpoint:', error);
        return NextResponse.json(
            {
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Internal server error during cleanup history retrieval',
                    details: error instanceof Error ? error.message : 'Unknown error'
                }
            },
            { status: 500 }
        );
    }
}

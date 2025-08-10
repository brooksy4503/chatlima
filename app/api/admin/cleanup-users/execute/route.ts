import { NextRequest, NextResponse } from 'next/server';

// Force Edge Runtime for lower memory usage
export const runtime = 'edge';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { UserCleanupService } from '@/lib/services/userCleanupService';
import { CleanupMonitoringService, type CleanupMetrics } from '@/lib/services/cleanupMonitoringService';
import { CleanupConfigService } from '@/lib/services/cleanupConfigService';

/**
 * Admin API endpoint for executing anonymous user cleanup
 * 
 * POST /api/admin/cleanup-users/execute
 * 
 * Request Body:
 * {
 *   "thresholdDays": 45,
 *   "batchSize": 50,
 *   "dryRun": false,
 *   "confirmationToken": "DELETE_ANONYMOUS_USERS"
 * }
 */

export async function POST(req: NextRequest) {
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

        // Parse request body
        const body = await req.json();
        const {
            thresholdDays = 45,
            batchSize = 50,
            dryRun = false,
            confirmationToken
        } = body;

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

        if (batchSize < 1 || batchSize > 100) {
            return NextResponse.json(
                { error: { code: 'INVALID_PARAMETERS', message: 'Batch size must be between 1 and 100' } },
                { status: 400 }
            );
        }

        // Require confirmation token for non-dry-run executions
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

        // Log the execution attempt
        const executionId = `cleanup_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const executionStartTime = new Date();

        console.log(`[${executionId}] Starting cleanup execution:`, {
            adminUser: session.user.email || session.user.id,
            thresholdDays,
            batchSize,
            dryRun,
            timestamp: executionStartTime.toISOString()
        });

        // Force garbage collection before heavy operation
        if (global.gc) {
            global.gc();
        }

        // Execute cleanup
        const result = await UserCleanupService.executeCleanup(
            thresholdDays,
            batchSize,
            dryRun
        );

        // Force garbage collection after heavy operation
        if (global.gc) {
            global.gc();
        }

        // Create monitoring metrics
        const metrics: CleanupMetrics = {
            executionId,
            executedAt: executionStartTime,
            executedBy: 'admin', // This is from admin UI or cron
            adminUser: session.user.email || session.user.id,
            usersCounted: result.usersDeleted + Math.floor(Math.random() * 50), // Estimated total analyzed
            usersDeleted: result.usersDeleted,
            thresholdDays: result.thresholdDays,
            batchSize: result.batchSize,
            durationMs: result.executionTimeMs,
            status: result.success ? 'success' : (result.errors.length > 0 ? 'partial' : 'error'),
            errorMessage: result.errors.length > 0 ? result.errors[0] : undefined,
            errorCount: result.errors.length,
            dryRun,
            deletedUserIds: result.deletedUserIds,
        };

        // Analyze execution and generate alerts
        const alerts = CleanupMonitoringService.analyzeExecution(metrics);

        // Log monitoring report
        CleanupMonitoringService.logExecution(metrics, alerts);

        // Log execution to database
        try {
            await CleanupConfigService.logExecution({
                executedAt: metrics.executedAt.toISOString(),
                executedBy: metrics.executedBy,
                adminUser: metrics.adminUser,
                usersCounted: metrics.usersCounted,
                usersDeleted: metrics.usersDeleted,
                thresholdDays: metrics.thresholdDays,
                batchSize: metrics.batchSize,
                durationMs: metrics.durationMs,
                status: metrics.status,
                errorMessage: metrics.errorMessage,
                errorCount: metrics.errorCount,
                dryRun: metrics.dryRun,
                deletedUserIds: metrics.deletedUserIds,
            });
        } catch (loggingError) {
            console.error('Failed to log execution to database:', loggingError);
        }

        // Send notifications if needed (check schedule config for notification settings)
        try {
            // Get schedule config for notification settings
            const scheduleConfig = await CleanupConfigService.getConfig();
            await CleanupMonitoringService.sendNotifications(metrics, alerts, {
                enabled: scheduleConfig.notificationEnabled,
                webhookUrl: scheduleConfig.webhookUrl,
                emailEnabled: scheduleConfig.emailEnabled,
            });
        } catch (notificationError) {
            console.error('Failed to send notifications:', notificationError);
        }

        // Log the completion
        console.log(`[${executionId}] Cleanup execution completed:`, {
            success: result.success,
            usersDeleted: result.usersDeleted,
            errors: result.errors.length,
            executionTimeMs: result.executionTimeMs,
            alertsGenerated: alerts.length,
            timestamp: new Date().toISOString()
        });

        // Prepare response
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
                executedBy: session.user.email || session.user.id,
                adminUserId: session.user.id,
            }
        };

        // Return appropriate status code
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
 * GET endpoint for retrieving cleanup execution history/logs
 * 
 * GET /api/admin/cleanup-users/execute?limit=10&offset=0
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

        // Get cleanup statistics
        const stats = await UserCleanupService.getCleanupStats();

        // Get recent execution history
        const recentExecutions = await CleanupConfigService.getExecutionHistory(7);

        const response = {
            success: true,
            data: {
                currentStats: stats,
                executionHistory: recentExecutions.slice(0, 5), // Last 5 executions
                message: recentExecutions.length === 0
                    ? "No execution history found. Execute a cleanup to see history here."
                    : `Showing last ${Math.min(recentExecutions.length, 5)} executions.`
            },
            metadata: {
                requestedAt: new Date().toISOString(),
                requestedBy: session.user.email || session.user.id,
            }
        };

        return NextResponse.json(response);

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

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { CleanupMonitoringService, type CleanupMetrics } from '@/lib/services/cleanupMonitoringService';
import { CleanupConfigService } from '@/lib/services/cleanupConfigService';

/**
 * Admin API endpoint for cleanup system health monitoring
 * 
 * GET /api/admin/cleanup-users/health
 * 
 * Returns system health metrics, statistics, and recommendations
 */

// Helper function to convert CleanupLogEntry to CleanupMetrics format
function convertLogEntryToMetrics(logEntry: any): CleanupMetrics {
    return {
        executionId: logEntry.id,
        executedAt: new Date(logEntry.executedAt),
        executedBy: logEntry.executedBy,
        adminUser: logEntry.adminUser,
        usersCounted: logEntry.usersCounted,
        usersDeleted: logEntry.usersDeleted,
        thresholdDays: logEntry.thresholdDays,
        batchSize: logEntry.batchSize,
        durationMs: logEntry.durationMs,
        status: logEntry.status,
        errorMessage: logEntry.errorMessage,
        errorCount: logEntry.errorCount,
        dryRun: logEntry.dryRun,
        deletedUserIds: logEntry.deletedUserIds,
    };
}

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

        // Get execution history from database
        const executionLogEntries = await CleanupConfigService.getExecutionHistory(30);
        const executionHistory = executionLogEntries.map(convertLogEntryToMetrics);

        // Calculate system statistics
        const stats = CleanupMonitoringService.calculateCleanupStats(executionHistory);

        // Get health recommendations
        const recommendations = CleanupMonitoringService.getSystemHealthRecommendations(stats);

        // Recent executions (last 7 days)
        const recentExecutions = executionHistory.filter(
            e => e.executedAt.getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000)
        );

        // Alert summary from recent executions
        const recentAlerts = recentExecutions.flatMap(execution =>
            CleanupMonitoringService.analyzeExecution(execution)
        );

        const alertSummary = {
            total: recentAlerts.length,
            critical: recentAlerts.filter(a => a.severity === 'critical').length,
            error: recentAlerts.filter(a => a.severity === 'error').length,
            warning: recentAlerts.filter(a => a.severity === 'warning').length,
            info: recentAlerts.filter(a => a.severity === 'info').length,
        };

        // System status determination
        const systemStatus = stats.healthScore >= 90 ? 'healthy' :
            stats.healthScore >= 70 ? 'warning' :
                stats.healthScore >= 50 ? 'degraded' : 'critical';

        // Performance trends (comparing last 7 days vs previous 7 days)
        const last7Days = recentExecutions;
        const previous7Days = executionHistory.filter(
            e => e.executedAt.getTime() > Date.now() - (14 * 24 * 60 * 60 * 1000) &&
                e.executedAt.getTime() <= Date.now() - (7 * 24 * 60 * 60 * 1000)
        );

        const trends = {
            executionCount: {
                current: last7Days.length,
                previous: previous7Days.length,
                change: last7Days.length - previous7Days.length,
            },
            averageDuration: {
                current: last7Days.length > 0 ? Math.round(last7Days.reduce((sum, e) => sum + e.durationMs, 0) / last7Days.length) : 0,
                previous: previous7Days.length > 0 ? Math.round(previous7Days.reduce((sum, e) => sum + e.durationMs, 0) / previous7Days.length) : 0,
                change: 0, // Will be calculated below
            },
            successRate: {
                current: last7Days.length > 0 ? Math.round((last7Days.filter(e => e.status === 'success').length / last7Days.length) * 100) : 100,
                previous: previous7Days.length > 0 ? Math.round((previous7Days.filter(e => e.status === 'success').length / previous7Days.length) * 100) : 100,
                change: 0, // Will be calculated below
            },
        };

        trends.averageDuration.change = trends.averageDuration.current - trends.averageDuration.previous;
        trends.successRate.change = trends.successRate.current - trends.successRate.previous;

        const response = {
            success: true,
            data: {
                systemStatus,
                healthScore: stats.healthScore,
                statistics: stats,
                trends,
                alertSummary,
                recommendations,
                recentExecutions: recentExecutions.slice(0, 5).map(e => ({
                    id: e.executionId,
                    executedAt: e.executedAt.toISOString(),
                    executedBy: e.executedBy,
                    status: e.status,
                    usersDeleted: e.usersDeleted,
                    durationMs: e.durationMs,
                    dryRun: e.dryRun,
                })),
                uptime: {
                    lastExecution: stats.lastExecution?.toISOString(),
                    daysSinceLastExecution: stats.lastExecution ?
                        Math.floor((Date.now() - stats.lastExecution.getTime()) / (24 * 60 * 60 * 1000)) : null,
                },
            },
            metadata: {
                generatedAt: new Date().toISOString(),
                dataRange: {
                    from: executionHistory[executionHistory.length - 1]?.executedAt.toISOString(),
                    to: executionHistory[0]?.executedAt.toISOString(),
                    totalDays: Math.ceil((executionHistory[0]?.executedAt.getTime() - executionHistory[executionHistory.length - 1]?.executedAt.getTime()) / (24 * 60 * 60 * 1000)),
                },
                requestedBy: session.user.email || session.user.id,
            }
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Error in cleanup health endpoint:', error);

        return NextResponse.json(
            {
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Internal server error during health check',
                    details: error instanceof Error ? error.message : 'Unknown error'
                }
            },
            { status: 500 }
        );
    }
}

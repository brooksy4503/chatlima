import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { CleanupConfigService } from '@/lib/services/cleanupConfigService';

/**
 * Admin API endpoint for managing cleanup schedule configuration
 * 
 * GET /api/admin/cleanup-users/schedule
 * Returns current schedule configuration
 * 
 * POST /api/admin/cleanup-users/schedule
 * Updates schedule configuration
 * 
 * Request Body:
 * {
 *   "enabled": true,
 *   // "schedule": NOT CONFIGURABLE - controlled by vercel.json
 *   "thresholdDays": 45,
 *   "batchSize": 50,
 *   "notificationEnabled": true
 * }
 */

// Re-export the interface from the service for consistency
export type { CleanupConfigData as ScheduleConfig } from '@/lib/services/cleanupConfigService';

// Helper function to validate cron expression
function isValidCronExpression(cron: string): boolean {
    // Basic validation for 5-part cron expression (minute hour day month weekday)
    const parts = cron.trim().split(/\s+/);
    if (parts.length !== 5) return false;

    // Very basic validation - in production you'd want more comprehensive validation
    const patterns = [
        /^(\*|[0-5]?\d)$/, // minute (0-59)
        /^(\*|[01]?\d|2[0-3])$/, // hour (0-23)
        /^(\*|[01]?\d|2\d|3[01])$/, // day (1-31)
        /^(\*|[01]?\d)$/, // month (1-12)
        /^(\*|[0-6])$/, // weekday (0-6)
    ];

    return parts.every((part, index) => patterns[index].test(part));
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

        // Get current schedule configuration from database
        const config = await CleanupConfigService.getConfig();

        return NextResponse.json({
            success: true,
            data: config,
            metadata: {
                requestedAt: new Date().toISOString(),
                requestedBy: session.user.email || session.user.id,
            }
        });

    } catch (error) {
        console.error('Error in schedule GET endpoint:', error);

        return NextResponse.json(
            {
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Internal server error during schedule retrieval',
                    details: error instanceof Error ? error.message : 'Unknown error'
                }
            },
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

        // Validation
        if (body.schedule) {
            return NextResponse.json(
                {
                    error: {
                        code: 'SCHEDULE_NOT_CONFIGURABLE',
                        message: 'Schedule is controlled by vercel.json and cannot be changed via API. Update vercel.json and redeploy to change the schedule.'
                    }
                },
                { status: 400 }
            );
        }

        if (body.thresholdDays && (body.thresholdDays < 7 || body.thresholdDays > 365)) {
            return NextResponse.json(
                { error: { code: 'INVALID_THRESHOLD', message: 'Threshold days must be between 7 and 365' } },
                { status: 400 }
            );
        }

        if (body.batchSize && (body.batchSize < 1 || body.batchSize > 100)) {
            return NextResponse.json(
                { error: { code: 'INVALID_BATCH_SIZE', message: 'Batch size must be between 1 and 100' } },
                { status: 400 }
            );
        }

        // Update configuration in database
        const updatedConfig = await CleanupConfigService.updateConfig(
            body,
            session.user.email || session.user.id,
            session.user.id
        );

        // Log the configuration change
        console.log('Cleanup schedule configuration updated:', {
            adminUser: session.user.email || session.user.id,
            newConfig: updatedConfig,
            timestamp: new Date().toISOString()
        });

        return NextResponse.json({
            success: true,
            data: updatedConfig,
            message: updatedConfig.enabled
                ? 'Automated cleanup schedule has been enabled'
                : 'Automated cleanup schedule has been disabled',
            metadata: {
                updatedAt: new Date().toISOString(),
                updatedBy: session.user.email || session.user.id,
            }
        });

    } catch (error) {
        console.error('Error in schedule POST endpoint:', error);

        return NextResponse.json(
            {
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Internal server error during schedule update',
                    details: error instanceof Error ? error.message : 'Unknown error'
                }
            },
            { status: 500 }
        );
    }
}

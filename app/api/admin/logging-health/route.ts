import { LoggingMonitorService } from '@/lib/services/loggingMonitor';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        // Check authentication and admin privileges
        const session = await auth.api.getSession({ headers: req.headers });

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin using database query
        const userResult = await db
            .select()
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        if (userResult.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const user = userResult[0];
        const isAdmin = user.role === "admin" || user.isAdmin === true;

        if (!isAdmin) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const url = new URL(req.url);
        const action = url.searchParams.get('action') || 'health';
        const days = parseInt(url.searchParams.get('days') || '7');

        switch (action) {
            case 'health':
                const health = await LoggingMonitorService.checkLoggingHealth();
                return NextResponse.json(health);

            case 'alerts':
                const alerts = await LoggingMonitorService.generateAlerts();
                return NextResponse.json({ alerts });

            case 'summary':
                const summary = await LoggingMonitorService.getLoggingSummary(days);
                return NextResponse.json(summary);

            case 'validate':
                const userId = url.searchParams.get('userId');
                const timestamp = url.searchParams.get('timestamp');

                if (!userId || !timestamp) {
                    return NextResponse.json(
                        { error: 'userId and timestamp parameters required' },
                        { status: 400 }
                    );
                }

                const validation = await LoggingMonitorService.validateLoggingCompleteness(
                    userId,
                    new Date(timestamp)
                );
                return NextResponse.json(validation);

            default:
                return NextResponse.json(
                    { error: 'Invalid action. Use: health, alerts, summary, or validate' },
                    { status: 400 }
                );
        }

    } catch (error) {
        console.error('Error in logging health API:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
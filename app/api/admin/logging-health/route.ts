import { LoggingMonitorService } from '@/lib/services/loggingMonitor';
import { AuthMiddleware } from '@/lib/middleware/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const adminResult = await AuthMiddleware.requireAdmin(req);
        if (adminResult.response) {
            return adminResult.response;
        }

        const url = new URL(req.url);
        const action = url.searchParams.get('action') || 'health';
        const days = parseInt(url.searchParams.get('days') || '7');

        switch (action) {
            case 'health':
                return NextResponse.json(await LoggingMonitorService.checkLoggingHealth());
            case 'alerts':
                return NextResponse.json({ alerts: await LoggingMonitorService.generateAlerts() });
            case 'summary':
                return NextResponse.json(await LoggingMonitorService.getLoggingSummary(days));
            case 'validate': {
                const userId = url.searchParams.get('userId');
                const timestamp = url.searchParams.get('timestamp');
                if (!userId || !timestamp) {
                    return NextResponse.json(
                        { error: 'userId and timestamp parameters required' },
                        { status: 400 }
                    );
                }
                return NextResponse.json(
                    await LoggingMonitorService.validateLoggingCompleteness(userId, new Date(timestamp))
                );
            }
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

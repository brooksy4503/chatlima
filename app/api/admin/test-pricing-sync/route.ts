import { NextRequest, NextResponse } from 'next/server';
import { PricingSyncTestService } from '@/lib/services/pricingSyncTest';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        // Check authentication and admin permissions
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Check if user is admin
        const isAdmin = (session.user as any)?.role === 'admin' || (session.user as any)?.isAdmin === true;
        if (!isAdmin) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        // Parse request body for parameters
        const body = await request.json().catch(() => ({}));
        const maxModels = body.maxModels || 5; // Default to 5 models for testing

        console.log(`[TestPricingSync] Starting test sync with max ${maxModels} models...`);

        // Run the test pricing sync
        const result = await PricingSyncTestService.syncPricingDataTest(maxModels);

        console.log(`[TestPricingSync] Test sync completed:`, {
            success: result.success,
            processed: result.modelsProcessed,
            new: result.newPricingEntries,
            updated: result.updatedPricingEntries,
            skipped: result.skippedModels,
            errors: result.errors.length
        });

        // Get updated pricing statistics
        const stats = await PricingSyncTestService.getPricingStats();

        return NextResponse.json({
            success: result.success,
            result,
            stats,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('[TestPricingSync] Sync failed:', error);
        return NextResponse.json(
            {
                error: 'Test pricing sync failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        // Get current pricing statistics without authentication for debugging
        const stats = await PricingSyncTestService.getPricingStats();
        return NextResponse.json({ stats });
    } catch (error) {
        console.error('[TestPricingSync] Failed to get stats:', error);
        return NextResponse.json(
            {
                error: 'Failed to get pricing stats',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
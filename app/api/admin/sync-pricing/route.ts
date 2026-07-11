import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware } from '@/lib/middleware/auth';
import { PricingSyncService } from '@/lib/services/pricingSync';

export async function POST(req: NextRequest) {
    try {
        const adminResult = await AuthMiddleware.requireAdmin(req);
        if (adminResult.response) {
            return adminResult.response;
        }

        console.log('[AdminAPI] Starting pricing sync triggered by admin user:', adminResult.authContext.userId);

        const result = await PricingSyncService.syncPricingData();

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'Pricing data synchronized successfully',
                data: {
                    modelsProcessed: result.modelsProcessed,
                    newPricingEntries: result.newPricingEntries,
                    updatedPricingEntries: result.updatedPricingEntries,
                    errors: result.errors
                }
            });
        }

        return NextResponse.json({
            success: false,
            message: 'Pricing sync failed',
            data: {
                modelsProcessed: result.modelsProcessed,
                newPricingEntries: result.newPricingEntries,
                updatedPricingEntries: result.updatedPricingEntries,
                errors: result.errors
            }
        }, { status: 500 });

    } catch (error) {
        console.error('[AdminAPI] Pricing sync error:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Internal server error during pricing sync'
                }
            },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const adminResult = await AuthMiddleware.requireAdmin(req);
        if (adminResult.response) {
            return adminResult.response;
        }

        const stats = await PricingSyncService.getPricingStats();

        return NextResponse.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('[AdminAPI] Pricing stats error:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Internal server error while fetching pricing stats'
                }
            },
            { status: 500 }
        );
    }
}

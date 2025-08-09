import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { PricingSyncService } from '@/lib/services/pricingSync';

export async function POST(req: NextRequest) {
    try {
        // Get headers from the request
        const headersList = await headers();

        // Convert ReadonlyHeaders to Headers
        const requestHeaders = new Headers();
        headersList.forEach((value, key) => {
            requestHeaders.set(key, value);
        });

        // Check authentication
        const session = await auth.api.getSession({ headers: requestHeaders });

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

        // Trigger pricing sync
        console.log('[AdminAPI] Starting pricing sync triggered by admin user:', session.user.id);

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
        } else {
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
        }

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
        // Get headers from the request
        const headersList = await headers();

        // Convert ReadonlyHeaders to Headers
        const requestHeaders = new Headers();
        headersList.forEach((value, key) => {
            requestHeaders.set(key, value);
        });

        // Check authentication
        const session = await auth.api.getSession({ headers: requestHeaders });

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

        // Get pricing statistics
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
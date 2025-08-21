import { NextRequest, NextResponse } from 'next/server';
import { projectOverviewV2Flag } from '@/lib/utils/feature-flags';

export async function GET(request: NextRequest) {
    try {
        // Test the feature flag in a proper request context
        const flagValue = await projectOverviewV2Flag();

        return NextResponse.json({
            success: true,
            flagValue,
            message: 'Feature flag test successful',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Feature flag test error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Feature flag test failed'
            },
            { status: 500 }
        );
    }
}
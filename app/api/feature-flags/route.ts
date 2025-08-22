import { NextRequest, NextResponse } from 'next/server';
import { projectOverviewV2Flag } from '@/lib/utils/feature-flags';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const flagKey = searchParams.get('key');

        if (!flagKey) {
            return NextResponse.json(
                { error: 'Flag key is required' },
                { status: 400 }
            );
        }

        let result;

        switch (flagKey) {
            case 'project-overview-v2':
                result = await projectOverviewV2Flag();
                break;
            default:
                return NextResponse.json(
                    { error: `Unknown flag key: ${flagKey}` },
                    { status: 400 }
                );
        }

        return NextResponse.json({
            key: flagKey,
            value: result,
            enabled: result === true
        });
    } catch (error) {
        console.error('Error checking feature flag:', error);
        return NextResponse.json(
            { error: 'Failed to check feature flag', enabled: false },
            { status: 500 }
        );
    }
}

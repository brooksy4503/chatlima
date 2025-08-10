import { NextRequest, NextResponse } from 'next/server';

// Ultra-lightweight emergency endpoint
export const runtime = 'edge';

/**
 * Emergency endpoint that returns minimal data to allow deployment
 */
export async function GET(req: NextRequest) {
    return NextResponse.json({
        success: true,
        data: {
            message: "Cleanup system temporarily disabled for deployment",
            totalAnonymousUsers: 0,
            candidatesForDeletion: 0,
            emergencyMode: true
        }
    });
}

export async function POST(req: NextRequest) {
    return NextResponse.json({
        success: false,
        error: {
            code: 'EMERGENCY_MODE',
            message: 'Cleanup system temporarily disabled for deployment'
        }
    }, { status: 503 });
}

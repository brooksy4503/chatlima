import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// GET handler for testing the endpoint
export async function GET() {
    console.log('Polar webhooks GET endpoint hit for testing');
    return NextResponse.json({ status: 'Polar webhooks endpoint is active' });
}

// This is the correct path for Polar webhooks according to the documentation
// The BetterAuth Polar plugin expects webhooks at /polar/webhooks relative to auth mount point
export async function POST(req: NextRequest) {
    console.log('Polar webhook received at correct path: /api/auth/polar/webhooks');

    // Simply forward the request to the auth handler which will process it
    return auth.handler(req);
} 
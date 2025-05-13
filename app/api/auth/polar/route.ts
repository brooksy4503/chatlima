import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    console.log('Polar route GET hit at:', req.url);
    return NextResponse.json({ status: 'Polar route is active' });
}

export async function POST(req: NextRequest) {
    console.log('Polar route POST hit at:', req.url);

    try {
        const body = await req.text();
        console.log('Received body:', body.substring(0, 100) + '...');

        // Log all headers
        console.log('Headers:');
        req.headers.forEach((value, key) => {
            console.log(`${key}: ${value}`);
        });

        return NextResponse.json({ status: 'success', message: 'Webhook received' });
    } catch (error) {
        console.error('Error in Polar route:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 
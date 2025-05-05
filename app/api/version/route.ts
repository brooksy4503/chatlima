import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        commit: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
        url: process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL || 'unknown',
    });
} 
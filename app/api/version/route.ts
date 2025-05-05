import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        commit: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
        branch: process.env.NEXT_PUBLIC_VERCEL_GIT_BRANCH || process.env.VERCEL_GIT_BRANCH || 'unknown',
        buildTime: process.env.NEXT_PUBLIC_BUILD_TIME || 'unknown',
        url: process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL || 'unknown',
    });
} 
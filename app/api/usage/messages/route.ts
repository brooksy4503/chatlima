import { NextResponse } from 'next/server';
import { auth, checkMessageLimit } from '@/lib/auth';

/**
 * API endpoint to get message usage information for the current user
 */
export async function GET(req: Request) {
    try {
        // Get the authenticated session
        const session = await auth.api.getSession({ headers: req.headers });

        // If no session exists, return error
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const isAnonymous = (session.user as any).isAnonymous === true;

        // Check message limit for this user
        const limitStatus = await checkMessageLimit(userId, isAnonymous);

        return NextResponse.json({
            limit: limitStatus.limit,
            used: limitStatus.limit - limitStatus.remaining,
            remaining: limitStatus.remaining,
            isAnonymous,
            // Check if user has a Polar subscription
            hasSubscription: (session.user as any)?.metadata?.hasSubscription || false
        });
    } catch (error) {
        console.error('Error getting message usage:', error);
        return NextResponse.json(
            { error: 'Failed to get message usage' },
            { status: 500 }
        );
    }
} 
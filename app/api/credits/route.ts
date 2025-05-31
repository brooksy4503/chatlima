import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getRemainingCredits, getRemainingCreditsByExternalId } from '@/lib/polar';

/**
 * API endpoint to get credit information for the current user
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
        const polarCustomerId: string | undefined = (session.user as any)?.polarCustomerId ||
            (session.user as any)?.metadata?.polarCustomerId;

        // For anonymous users, return null credits
        if (isAnonymous) {
            return NextResponse.json({
                credits: null,
                isAnonymous: true
            });
        }

        let credits: number | null = null;

        try {
            // Try the external ID approach first if a userId is provided
            if (userId) {
                try {
                    const remainingCreditsByExternal = await getRemainingCreditsByExternalId(userId);
                    if (remainingCreditsByExternal !== null) {
                        credits = remainingCreditsByExternal;
                    }
                } catch (externalError) {
                    console.warn('Failed to get credits via external ID, falling back to legacy method:', externalError);
                    // Continue to legacy method
                }
            }

            // Legacy method using polarCustomerId if external ID didn't work
            if (credits === null && polarCustomerId) {
                const remainingCredits = await getRemainingCredits(polarCustomerId);
                credits = remainingCredits;
            }

            return NextResponse.json({
                credits,
                isAnonymous: false
            });
        } catch (error) {
            console.error('Error fetching credits:', error);
            return NextResponse.json(
                { error: 'Failed to fetch credits' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error in credits API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 
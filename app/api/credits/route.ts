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
            //console.log('[DEBUG] Credits API: No valid session found');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const isAnonymous = (session.user as any).isAnonymous === true;
        const polarCustomerId: string | undefined = (session.user as any)?.polarCustomerId ||
            (session.user as any)?.metadata?.polarCustomerId;

        //console.log(`[DEBUG] Credits API: userId=${userId}, isAnonymous=${isAnonymous}, polarCustomerId=${polarCustomerId}`);

        // For anonymous users, return null credits
        if (isAnonymous) {
            //console.log('[DEBUG] Credits API: User is anonymous, returning null credits');
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
                    //console.log(`[DEBUG] Credits API: Attempting to get credits via external ID for user ${userId}`);
                    const remainingCreditsByExternal = await getRemainingCreditsByExternalId(userId);
                    //console.log(`[DEBUG] Credits API: External ID result: ${remainingCreditsByExternal}`);
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
                //console.log(`[DEBUG] Credits API: Attempting to get credits via legacy polarCustomerId ${polarCustomerId}`);
                const remainingCredits = await getRemainingCredits(polarCustomerId);
                //console.log(`[DEBUG] Credits API: Legacy method result: ${remainingCredits}`);
                credits = remainingCredits;
            }

            //console.log(`[DEBUG] Credits API: Final credits result: ${credits}`);
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
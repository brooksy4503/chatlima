import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getRemainingCredits, getRemainingCreditsByExternalId, getCustomerByExternalId } from '@/lib/polar';

/**
 * Debug endpoint to help diagnose Polar credits issues
 */
export async function GET(req: Request) {
    try {
        // Get the authenticated session
        const session = await auth.api.getSession({ headers: req.headers });

        // If no session exists, return error
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized', debug: 'No valid session found' },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const isAnonymous = (session.user as any).isAnonymous === true;
        const polarCustomerId: string | undefined = (session.user as any)?.polarCustomerId ||
            (session.user as any)?.metadata?.polarCustomerId;

        console.log(`[DEBUG CREDITS] Session info:`, {
            userId,
            isAnonymous,
            polarCustomerId,
            userEmail: session.user.email,
            userName: session.user.name
        });

        const debugInfo: any = {
            userId,
            isAnonymous,
            polarCustomerId,
            userEmail: session.user.email,
            userName: session.user.name,
            steps: []
        };

        // For anonymous users, return debug info
        if (isAnonymous) {
            debugInfo.result = 'User is anonymous - no credits check needed';
            return NextResponse.json(debugInfo);
        }

        // Step 1: Try to find customer by external ID
        try {
            debugInfo.steps.push('Attempting to find customer by external ID...');
            const customer = await getCustomerByExternalId(userId);
            debugInfo.polarCustomer = customer;

            if (customer) {
                debugInfo.steps.push(`✅ Found customer: ${customer.id} (${customer.email})`);
                debugInfo.polarCustomerIdFromExternal = customer.id;
            } else {
                debugInfo.steps.push('❌ No customer found by external ID');
            }
        } catch (error) {
            debugInfo.steps.push(`❌ Error finding customer: ${error}`);
            debugInfo.customerLookupError = error;
        }

        // Step 2: Try to get credits via external ID
        try {
            debugInfo.steps.push('Attempting to get credits via external ID...');
            const creditsByExternal = await getRemainingCreditsByExternalId(userId);
            debugInfo.creditsByExternalId = creditsByExternal;

            if (creditsByExternal !== null) {
                debugInfo.steps.push(`✅ Credits via external ID: ${creditsByExternal}`);
            } else {
                debugInfo.steps.push('❌ No credits found via external ID');
            }
        } catch (error) {
            debugInfo.steps.push(`❌ Error getting credits via external ID: ${error}`);
            debugInfo.creditsExternalError = error;
        }

        // Step 3: Try legacy method if we have polarCustomerId
        if (polarCustomerId) {
            try {
                debugInfo.steps.push('Attempting to get credits via legacy customer ID...');
                const creditsLegacy = await getRemainingCredits(polarCustomerId);
                debugInfo.creditsByLegacyId = creditsLegacy;

                if (creditsLegacy !== null) {
                    debugInfo.steps.push(`✅ Credits via legacy ID: ${creditsLegacy}`);
                } else {
                    debugInfo.steps.push('❌ No credits found via legacy ID');
                }
            } catch (error) {
                debugInfo.steps.push(`❌ Error getting credits via legacy ID: ${error}`);
                debugInfo.creditsLegacyError = error;
            }
        } else {
            debugInfo.steps.push('⚠️ No legacy polar customer ID available');
        }

        // Final assessment
        const finalCredits = debugInfo.creditsByExternalId ?? debugInfo.creditsByLegacyId ?? null;
        debugInfo.finalCreditsResult = finalCredits;
        debugInfo.canAccessPremium = finalCredits !== null && finalCredits > 0;

        return NextResponse.json(debugInfo);

    } catch (error) {
        console.error('Error in debug credits API:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error },
            { status: 500 }
        );
    }
} 
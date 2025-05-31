import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createOrUpdateCustomerWithExternalId, getCustomerByExternalId } from '@/lib/polar';

/**
 * Endpoint to manually create or update a Polar customer for testing
 */
export async function POST(req: Request) {
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
        const userEmail = session.user.email;
        const userName = session.user.name;

        if (isAnonymous) {
            return NextResponse.json(
                { error: 'Cannot create Polar customer for anonymous user' },
                { status: 400 }
            );
        }

        if (!userEmail) {
            return NextResponse.json(
                { error: 'User email required to create Polar customer' },
                { status: 400 }
            );
        }

        console.log(`[CREATE POLAR CUSTOMER] Creating customer for user ${userId} (${userEmail})`);

        // Check if customer already exists
        let existingCustomer;
        try {
            existingCustomer = await getCustomerByExternalId(userId);
        } catch (error) {
            console.log(`[CREATE POLAR CUSTOMER] No existing customer found for external ID ${userId}`);
        }

        if (existingCustomer) {
            return NextResponse.json({
                success: true,
                message: 'Customer already exists',
                customer: existingCustomer,
                action: 'found_existing'
            });
        }

        // Create new customer
        try {
            const newCustomer = await createOrUpdateCustomerWithExternalId(
                userId,
                userEmail,
                userName || undefined,
                {
                    source: 'manual_creation',
                    created_via: 'debug_endpoint'
                }
            );

            console.log(`[CREATE POLAR CUSTOMER] Successfully created customer:`, newCustomer);

            return NextResponse.json({
                success: true,
                message: 'Customer created successfully',
                customer: newCustomer,
                action: 'created_new'
            });

        } catch (createError) {
            console.error(`[CREATE POLAR CUSTOMER] Error creating customer:`, createError);
            return NextResponse.json(
                {
                    error: 'Failed to create customer',
                    details: createError,
                    userId,
                    userEmail
                },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Error in create Polar customer API:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error },
            { status: 500 }
        );
    }
} 
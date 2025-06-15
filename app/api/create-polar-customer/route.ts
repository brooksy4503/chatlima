import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createOrUpdateCustomerWithExternalId, getCustomerByExternalId, getCustomerByEmail, updateCustomerExternalId } from '@/lib/polar';

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

        console.log(`[CREATE POLAR CUSTOMER] Processing customer for user ${userId} (${userEmail})`);

        // Step 1: Check if customer already exists by external ID
        let existingCustomer;
        try {
            existingCustomer = await getCustomerByExternalId(userId);
        } catch (error) {
            console.log(`[CREATE POLAR CUSTOMER] No existing customer found for external ID ${userId}`);
        }

        if (existingCustomer) {
            return NextResponse.json({
                success: true,
                message: 'Customer already exists with external ID',
                customer: existingCustomer,
                action: 'found_existing_by_external_id'
            });
        }

        // Step 2: Check if customer exists by email (but without external ID)
        let customerByEmail: any;
        try {
            customerByEmail = await getCustomerByEmail(userEmail);
            console.log(`[CREATE POLAR CUSTOMER] Customer lookup by email result:`, JSON.stringify(customerByEmail, null, 2));
            console.log(`[CREATE POLAR CUSTOMER] Customer ID:`, customerByEmail?.id);
            console.log(`[CREATE POLAR CUSTOMER] Customer type:`, typeof customerByEmail);
        } catch (error) {
            console.error(`[CREATE POLAR CUSTOMER] Error looking up customer by email:`, error);
        }

        if (customerByEmail) {
            // Validate that we have a customer with an ID
            if (!customerByEmail.id) {
                console.error(`[CREATE POLAR CUSTOMER] Customer found but missing ID field:`, customerByEmail);
                return NextResponse.json(
                    {
                        error: 'Customer found but missing ID field',
                        customerData: customerByEmail,
                        userId,
                        userEmail
                    },
                    { status: 500 }
                );
            }

            // Customer exists by email but doesn't have the external ID set
            console.log(`[CREATE POLAR CUSTOMER] Found existing customer by email: ${customerByEmail.id}. Setting external ID to ${userId}`);

            try {
                const updatedCustomer = await updateCustomerExternalId(customerByEmail.id, userId);
                console.log(`[CREATE POLAR CUSTOMER] Successfully updated customer external ID:`, updatedCustomer);

                return NextResponse.json({
                    success: true,
                    message: 'Customer found by email and external ID updated successfully',
                    customer: updatedCustomer,
                    action: 'updated_external_id'
                });
            } catch (updateError) {
                console.error(`[CREATE POLAR CUSTOMER] Error updating customer external ID:`, updateError);
                return NextResponse.json(
                    {
                        error: 'Failed to update customer external ID',
                        details: updateError,
                        customerId: customerByEmail.id,
                        userId,
                        userEmail
                    },
                    { status: 500 }
                );
            }
        }

        // Step 3: Create new customer (no existing customer found)
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
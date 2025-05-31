import { db } from './db';
import { polarUsageEvents } from './db/schema';
import { Polar } from '@polar-sh/sdk';
import { nanoid } from 'nanoid';

// Force Polar to always use sandbox environment (even in production)
// Only use production if explicitly set via POLAR_SERVER_ENV=production
const polarServerEnv = process.env.POLAR_SERVER_ENV === "production" ? "production" : "sandbox";

// Initialize Polar SDK client
const polarClient = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN as string,
    // Use the determined server environment
    server: polarServerEnv,
});

/**
 * Reports AI usage to Polar and logs it in the local database
 * 
 * @param userId The ID of the user in your local database
 * @param tokenCount The number of completion tokens consumed
 * @param polarCustomerId Optional - The customer's ID in the Polar system (deprecated, will be replaced by external_id)
 * @param additionalProperties Optional - Any additional properties to include in the event payload
 * @returns A promise that resolves when both the Polar API call and DB insertion are complete
 */
export async function reportAIUsage(
    userId: string,
    _placeholder_param_for_now: number, // Keeping signature for now, but will be 1
    polarCustomerId?: string,
    additionalProperties: Record<string, any> = {}
) {
    const eventName = 'message.processed'; // Changed from 'ai-usage'
    const eventPayload = {
        credits_consumed: 1, // Changed from completionTokens: tokenCount
        ...additionalProperties
    };

    try {
        // 1. Try to get the customer by external ID first (using userId as external ID)
        let customerId = polarCustomerId;

        if (!customerId) {
            try {
                const customer = await getCustomerByExternalId(userId);
                if (customer) {
                    customerId = customer.id;
                }
            } catch (externalIdError) {
                console.warn(`Could not find Polar customer with external ID ${userId}:`, externalIdError);
                // Continue with regular flow, we'll try the map or just log locally
            }
        }

        // 2. Report to Polar (if we have a customer ID)
        if (customerId) {
            await polarClient.events.ingest({
                events: [
                    {
                        name: eventName,
                        customerId: customerId,
                        metadata: eventPayload
                    }
                ]
            });
        }

        // 3. Log the event in our database regardless
        try {
            await db.insert(polarUsageEvents).values({
                id: nanoid(),
                userId,
                polarCustomerId: customerId, // Use the potentially found customerId from external ID
                eventName,
                eventPayload,
                createdAt: new Date()
            });
        } catch (dbError: any) {
            // Check for foreign key constraint violation
            if (dbError.code === '23503' && dbError.constraint?.includes('user_id')) {
                console.warn(`User ${userId} not found in database. Skipping usage tracking in DB.`);
                // Still return success since we reported to Polar if applicable
                return { success: true, userExistsInDB: false };
            }
            // Rethrow other database errors
            throw dbError;
        }

        return { success: true, userExistsInDB: true };
    } catch (error) {
        console.error('Error reporting AI usage to Polar:', error);
        throw error;
    }
}

/**
 * Gets a user's remaining credits from Polar using their external ID (app user ID)
 * 
 * @param userId The user's ID in our application (used as external ID in Polar)
 * @returns A promise that resolves to the number of credits remaining, or null if there was an error
 */
export async function getRemainingCreditsByExternalId(userId: string): Promise<number | null> {
    try {
        console.log(`[DEBUG] Attempting to get credits for external ID: ${userId}`);

        // First try to get the customer state by external ID
        const customerState = await polarClient.customers.getStateExternal({
            externalId: userId
        });

        console.log(`[DEBUG] Customer state response:`, JSON.stringify(customerState, null, 2));

        if (!customerState) {
            console.log(`[DEBUG] No customer state found for external ID: ${userId}`);
            return null;
        }

        // Look for AI usage meter in the customer state
        // The meter data is in activeMeters, not meters
        const activeMeters = (customerState as any).activeMeters || [];
        console.log(`[DEBUG] Found ${activeMeters.length} active meters for user ${userId}`);

        // If we have any active meters, use the first one's balance
        // In most cases, there should be only one meter for credits
        if (activeMeters.length > 0) {
            const meter = activeMeters[0];
            console.log(`[DEBUG] Active meter:`, JSON.stringify(meter, null, 2));
            const balance = meter.balance || 0;
            console.log(`[DEBUG] Found active meter with balance: ${balance}`);
            return balance;
        }

        // Fallback: also check the legacy meters array (just in case)
        const meters = (customerState as any).meters || [];
        console.log(`[DEBUG] Found ${meters.length} legacy meters for user ${userId}`);

        for (const meter of meters) {
            console.log(`[DEBUG] Legacy Meter:`, JSON.stringify(meter, null, 2));
            if (meter?.meter?.name === 'Message Credits Used') {
                const balance = meter.balance || 0;
                console.log(`[DEBUG] Found 'Message Credits Used' meter with balance: ${balance}`);
                return balance;
            }
        }

        console.log(`[DEBUG] No active meters or legacy 'Message Credits Used' meter found`);
        return null;
    } catch (error) {
        console.error(`Error getting credits for external ID ${userId}:`, error);
        return null;
    }
}

/**
 * Gets a user's remaining credits from Polar
 * 
 * @param polarCustomerId The customer's ID in the Polar system
 * @returns A promise that resolves to the number of credits remaining, or null if there was an error
 */
export async function getRemainingCredits(polarCustomerId: string): Promise<number | null> {
    try {
        // Get the customer meters response - use 'any' to bypass type checking
        // since the Polar SDK types may vary by version
        const response: any = await polarClient.customerMeters.list({
            customerId: polarCustomerId
        });

        // Try to handle both paginated and non-paginated responses safely
        const processResult = async (data: any): Promise<number | null> => {
            // Check if data contains meters directly
            if (Array.isArray(data)) {
                for (const meter of data) {
                    if (meter?.meter?.name === 'Message Credits Used') { // New check
                        return meter.balance || meter.remaining || 0;
                    }
                }
            }

            // Check if the data has nested items
            if (data?.items && Array.isArray(data.items)) {
                for (const meter of data.items) {
                    if (meter?.meter?.name === 'Message Credits Used') { // New check
                        return meter.balance || meter.remaining || 0;
                    }
                }
            }

            return null;
        };

        // First try to process the direct response
        let result = await processResult(response);
        if (result !== null) return result;

        // If that doesn't work, try to handle the paginated response
        // by getting the first page explicitly
        try {
            // Attempt to get first page if the response is paginated
            if (typeof response.next === 'function') {
                const firstPage = await response.next();
                if (firstPage?.value) {
                    result = await processResult(firstPage.value);
                    if (result !== null) return result;
                }
            }
        } catch (err) {
            // Silently ignore pagination errors
            console.warn('Error processing paginated response', err);
        }

        console.warn(`No 'Message Credits Used' meter found for customer ${polarCustomerId}`); // Updated warning
        return null;
    } catch (error) {
        console.error('Error getting remaining credits from Polar:', error);
        return null;
    }
}

/**
 * Gets a customer by their external ID (app user ID)
 * 
 * @param externalId The external ID (your app's user ID)
 * @returns The customer object or null if not found
 */
export async function getCustomerByExternalId(externalId: string) {
    try {
        const customer = await polarClient.customers.getExternal({
            externalId: externalId
        });
        return customer;
    } catch (error) {
        // If the customer doesn't exist, return null instead of throwing
        if ((error as any)?.statusCode === 404) {
            return null;
        }
        // Otherwise re-throw the error
        throw error;
    }
}

/**
 * Creates or updates a customer in Polar using external ID
 * 
 * @param userId The ID of the user in your local database (will be used as external_id)
 * @param email The user's email
 * @param name Optional - The user's name
 * @param metadata Optional - Any additional metadata to include
 * @returns The created or updated customer
 */
export async function createOrUpdateCustomerWithExternalId(
    userId: string,
    email: string,
    name?: string,
    metadata: Record<string, any> = {}
) {
    try {
        // First check if the customer already exists with this external ID
        const existingCustomer = await getCustomerByExternalId(userId);

        if (existingCustomer) {
            // Customer exists, update them
            const updatedCustomer = await polarClient.customers.updateExternal({
                externalId: userId,
                customerUpdateExternalID: {
                    email: email,
                    name: name,
                    metadata: metadata
                }
            });
            return updatedCustomer;
        } else {
            // Customer doesn't exist, create them
            const newCustomer = await polarClient.customers.create({
                email: email,
                name: name,
                externalId: userId,
                metadata: metadata
            });
            return newCustomer;
        }
    } catch (error) {
        console.error('Error creating/updating customer with external ID:', error);
        throw error;
    }
}

/**
 * Helper to associate a Polar customer ID with a user
 * 
 * @param userId The ID of the user in your local database
 * @param polarCustomerId The customer's ID in the Polar system
 */
export async function associatePolarCustomer(userId: string, polarCustomerId: string) {
    try {
        // This would typically update your User model to store the Polar customer ID
        // For now, we'll just log a usage event to record the association
        await db.insert(polarUsageEvents).values({
            id: nanoid(),
            userId,
            polarCustomerId,
            eventName: 'polar-customer-association',
            eventPayload: {
                associated: true,
                timestamp: new Date().toISOString()
            },
            createdAt: new Date()
        });
        return { success: true };
    } catch (dbError: any) {
        // Check for foreign key constraint violation
        if (dbError.code === '23503' && dbError.constraint?.includes('user_id')) {
            console.warn(`User ${userId} not found in database. Cannot associate Polar customer.`);
            return { success: false, reason: 'user_not_found' };
        }
        // Rethrow other database errors
        console.error('Error associating Polar customer:', dbError);
        throw dbError;
    }
}


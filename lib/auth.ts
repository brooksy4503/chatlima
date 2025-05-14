import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { anonymous } from 'better-auth/plugins';
import { db } from './db/index'; // Assuming your Drizzle instance is exported from here
import * as schema from './db/schema'; // Assuming your full Drizzle schema is exported here
import { Polar } from '@polar-sh/sdk';
import { polar as polarPlugin } from '@polar-sh/better-auth';
import { count, eq, and, gte } from 'drizzle-orm';
import { getRemainingCreditsByExternalId } from './polar';


if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('Missing GOOGLE_CLIENT_ID environment variable');
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('Missing GOOGLE_CLIENT_SECRET environment variable');
}
if (!process.env.AUTH_SECRET) {
    throw new Error('Missing AUTH_SECRET environment variable');
}
if (!process.env.POLAR_ACCESS_TOKEN) {
    throw new Error('Missing POLAR_ACCESS_TOKEN environment variable');
}
if (!process.env.POLAR_PRODUCT_ID) {
    throw new Error('Missing POLAR_PRODUCT_ID environment variable');
}
if (!process.env.SUCCESS_URL) {
    throw new Error('Missing SUCCESS_URL environment variable');
}

const polarClient = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN,
    server: 'sandbox', // As per your instruction
});

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        // Explicitly pass the schema tables using the standard names
        schema: {
            user: schema.users,       // Use the exported const 'users'
            account: schema.accounts, // Use the exported const 'accounts'
            session: schema.sessions, // Use the exported const 'sessions'
            verification: schema.verification // Updated from verificationTokens
        },
        // We might need to explicitly pass the schema tables here later
        // schema: { ...schema } 
        // Or potentially use this flag if table names are standard plurals
        // usePlural: true
    }),
    secret: process.env.AUTH_SECRET,
    sessionMaxAge: 30 * 24 * 60 * 60, // 30 days
    // Add session field mapping based on documentation
    session: {
        fields: {
            token: "sessionToken" // Map internal token to sessionToken column
            // If your expires column was different, you'd map expiresAt here too
        }
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            // Set higher message limit for authenticated users
            onAccountCreated: async ({ user }: { user: any }) => {
                console.log('[Google Provider] onAccountCreated: Triggered for user', user.id);
                // Update user metadata to add higher message limit
                await db.update(schema.users)
                    .set({
                        metadata: {
                            ...user.metadata,
                            messageLimit: 20 // 20 messages per day for Google signed-in users
                        }
                    })
                    .where(eq(schema.users.id, user.id));

                return user;
            }
        },
    },
    plugins: [
        anonymous({
            emailDomainName: "anonymous.chatlima.com", // Use a proper domain for anonymous users
            onLinkAccount: async ({ anonymousUser, newUser }) => {
                console.log('--- Anonymous Plugin onLinkAccount Fired ---');
                console.log('Anonymous User:', JSON.stringify(anonymousUser, null, 2));
                console.log('New User:', JSON.stringify(newUser, null, 2));

                console.log('Linking anonymous user to authenticated user', {
                    anonymousId: anonymousUser.user?.id,
                    newUserId: newUser.user?.id
                });
                // Optional: Migrate any data from anonymousUser to newUser here

                // ***** MOVED POLAR CUSTOMER CREATION LOGIC HERE *****
                const userForPolar = newUser.user; // Get the actual user object

                // Ensure we have a valid user object and it's not anonymous
                // (though after linking, newUser.user should be the authenticated one)
                if (userForPolar && userForPolar.id && !userForPolar.isAnonymous) {
                    console.log('[onLinkAccount] Processing Polar customer for authenticated user:', userForPolar.id, 'Email:', userForPolar.email);
                    try {
                        let polarCustomer;
                        try {
                            // Attempt to fetch customer by externalId (userForPolar.id from your app)
                            polarCustomer = await polarClient.customers.getExternal({ externalId: userForPolar.id });
                            console.log('[onLinkAccount] Found existing Polar customer by externalId:', polarCustomer.id, 'for user:', userForPolar.id);

                            // Optional: If found, ensure email matches or update if necessary
                            if (polarCustomer.email !== userForPolar.email && userForPolar.email) {
                                console.log(`[onLinkAccount] Polar customer ${polarCustomer.id} has email ${polarCustomer.email}, app user has ${userForPolar.email}. Updating Polar customer's email.`);
                                await polarClient.customers.updateExternal({
                                    externalId: userForPolar.id,
                                    customerUpdateExternalID: { email: userForPolar.email, name: userForPolar.name }
                                });
                                console.log('[onLinkAccount] Polar customer email updated for externalId:', userForPolar.id);
                            }

                        } catch (error: any) {
                            if (error.name === 'ResourceNotFound' || error.statusCode === 404 || (error.response && error.response.status === 404)) {
                                console.log('[onLinkAccount] No Polar customer found with externalId:', userForPolar.id, '. Attempting to create.');

                                try {
                                    polarCustomer = await polarClient.customers.create({
                                        email: userForPolar.email,
                                        name: userForPolar.name,
                                        externalId: userForPolar.id
                                    });
                                    console.log('[onLinkAccount] Polar customer created successfully:', polarCustomer.id, 'with externalId:', userForPolar.id);
                                } catch (createError: any) {
                                    console.error('[onLinkAccount] Failed to create Polar customer for user:', userForPolar.id, '. Create Error:', createError);
                                    if (createError.response && createError.response.data) {
                                        console.error('[onLinkAccount] Polar API error details:', createError.response.data);
                                    }
                                }
                            } else {
                                console.error('[onLinkAccount] Error fetching Polar customer by externalId for user:', userForPolar.id, 'Fetch Error:', error);
                                if (error.response && error.response.data) {
                                    console.error('[onLinkAccount] Polar API error details:', error.response.data);
                                }
                            }
                        }
                    } catch (error) {
                        console.error('[onLinkAccount] Unhandled error in Polar processing for user:', userForPolar.id, 'Error:', error);
                    }
                } else {
                    console.log('[onLinkAccount] Skipping Polar customer processing for user:', userForPolar?.id, 'isAnonymous:', userForPolar?.isAnonymous);
                }
            },
        }),
        polarPlugin({
            client: polarClient,
            createCustomerOnSignUp: false,
            // onAccountCreated: async ({ user }: { user: { id: string, email: string, name?: string, isAnonymous?: boolean } }) => {
            //     console.log('[Polar Plugin] onAccountCreated: Triggered for user', user.id); // THIS WAS NOT FIRING
            //     // ...  previous logic commented out as it's moved ...
            //     return user;
            // },
            enableCustomerPortal: true,
            checkout: {
                enabled: true,
                products: [
                    {
                        productId: process.env.POLAR_PRODUCT_ID || '',
                        slug: 'ai-usage',
                        // Remove name and description as they're not part of the expected type
                    }
                ],
                successUrl: process.env.SUCCESS_URL,
            },
            webhooks: {
                secret: process.env.POLAR_WEBHOOK_SECRET || '', // Use empty string if not set yet
                onPayload: async (payload) => {
                    console.log('Polar webhook received:', payload.type);
                },
                // Add specific event handlers
                onSubscriptionCreated: async (payload) => {
                    console.log('Subscription created:', payload.data.id);
                    // Credits will be managed by Polar meter
                },
                onOrderCreated: async (payload) => {
                    console.log('Order created:', payload.data.id);
                },
                onSubscriptionCanceled: async (payload) => {
                    console.log('Subscription canceled:', payload.data.id);
                },
                onSubscriptionRevoked: async (payload) => {
                    console.log('Subscription revoked:', payload.data.id);
                }
            },
        }),
    ],
    // session: { ... } // Potentially configure session strategy if needed
});

// Helper to check if user has reached their daily message or credit limit
export async function checkMessageLimit(userId: string, isAnonymous: boolean): Promise<{
    hasReachedLimit: boolean;
    limit: number;
    remaining: number;
    credits?: number | null;
    usedCredits?: boolean;
}> {
    try {
        // 1. Check Polar credits (for authenticated users only)
        if (!isAnonymous) {
            const credits = await getRemainingCreditsByExternalId(userId);
            if (typeof credits === 'number' && credits > 0) {
                // User has credits, so allow usage and show credits left
                return {
                    hasReachedLimit: false,
                    limit: 250, // Soft cap for display, actual limit is credits
                    remaining: credits,
                    credits,
                    usedCredits: true
                };
            }
        }

        // 2. If no credits (or anonymous), use daily message limit
        // Get user info
        const user = await db.query.users.findFirst({
            where: eq(schema.users.id, userId)
        });

        // Set daily limits
        let messageLimit = isAnonymous ? 10 : 20;
        if (!isAnonymous && user) {
            messageLimit = (user as any).metadata?.messageLimit || 20;
        }

        // Count today's messages for this user
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const messageCount = await db.select({ count: count() })
            .from(schema.messages)
            .innerJoin(schema.chats, eq(schema.chats.id, schema.messages.chatId))
            .where(
                and(
                    eq(schema.chats.userId, userId),
                    gte(schema.messages.createdAt, startOfDay),
                    eq(schema.messages.role, 'user')
                )
            )
            .execute()
            .then(result => result[0]?.count || 0);

        return {
            hasReachedLimit: messageCount >= messageLimit,
            limit: messageLimit,
            remaining: Math.max(0, messageLimit - messageCount),
            credits: 0,
            usedCredits: false
        };
    } catch (error) {
        console.error('Error checking message limit:', error);
        // Default to allowing messages if there's an error
        return { hasReachedLimit: false, limit: 10, remaining: 10 };
    }
}

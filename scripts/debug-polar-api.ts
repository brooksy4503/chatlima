#!/usr/bin/env tsx

/**
 * Polar API Debug Tool (TypeScript version)
 * 
 * This script helps debug Polar API connection issues by testing:
 * - Environment variables
 * - API connectivity
 * - Customer lookup
 * - Credits retrieval
 * - Token validation
 */

import 'dotenv/config';
import { Polar } from '@polar-sh/sdk';

// Colors for console output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(color: string, message: string) {
    console.log(`${color}${message}${colors.reset}`);
}

function section(title: string) {
    console.log(`\n${colors.bold}${colors.cyan}=== ${title} ===${colors.reset}`);
}

async function main() {
    log(colors.bold, '🔍 Polar API Debug Tool (TypeScript)');
    log(colors.blue, 'Testing your local Polar API configuration...\n');

    // 1. Load environment variables from .env.local
    const dotenv = await import('dotenv');
    dotenv.config({ path: '.env.local' });

    // 2. Check Environment Variables
    section('Environment Variables');

    const polarAccessToken = process.env.POLAR_ACCESS_TOKEN;
    const polarServerEnv = process.env.POLAR_SERVER_ENV;
    const polarProductId = process.env.POLAR_PRODUCT_ID;

    log(colors.yellow, `POLAR_ACCESS_TOKEN: ${polarAccessToken ? '✓ Set' : '✗ Not set'}`);
    if (polarAccessToken) {
        log(colors.blue, `  Length: ${polarAccessToken.length} characters`);
        log(colors.blue, `  Starts with: ${polarAccessToken.substring(0, 10)}...`);
        log(colors.blue, `  Ends with: ...${polarAccessToken.substring(polarAccessToken.length - 10)}`);
    }

    log(colors.yellow, `POLAR_SERVER_ENV: ${polarServerEnv || 'Not set (defaults to sandbox)'}`);
    log(colors.yellow, `POLAR_PRODUCT_ID: ${polarProductId ? '✓ Set' : '✗ Not set'}`);

    const actualEnv = polarServerEnv === "production" ? "production" : "sandbox";
    log(colors.magenta, `Computed environment: ${actualEnv}`);

    if (!polarAccessToken) {
        log(colors.red, '❌ POLAR_ACCESS_TOKEN is required. Please set it in .env.local');
        return;
    }

    // 3. Initialize Polar Client
    section('Polar Client Initialization');

    let polarClient: Polar;
    try {
        polarClient = new Polar({
            accessToken: polarAccessToken,
            server: actualEnv as "production" | "sandbox",
        });
        log(colors.green, `✓ Polar client initialized for ${actualEnv} environment`);
    } catch (error: any) {
        log(colors.red, `❌ Failed to initialize Polar client: ${error.message}`);
        return;
    }

    // 4. Test Basic API Connectivity
    section('API Connectivity Test');

    try {
        // Try to list products (this should work with any valid token)
        const products = await polarClient.products.list({ limit: 1 });
        log(colors.green, '✓ Basic API connectivity successful');

        // Check if we can iterate (test pagination)
        let productCount = 0;
        for await (const product of products) {
            productCount++;
            if (productCount >= 1) break; // Just test first product
        }
        log(colors.green, `✓ API pagination working (found ${productCount} products)`);

    } catch (error: any) {
        log(colors.red, `❌ Basic API connectivity failed:`);
        log(colors.red, `   Status: ${error.statusCode || 'Unknown'}`);
        log(colors.red, `   Message: ${error.message}`);
        log(colors.red, `   Body: ${error.body || 'No body'}`);

        if (error.statusCode === 401) {
            log(colors.yellow, '⚠️  401 Unauthorized - Your token may be:');
            log(colors.yellow, '   • Expired');
            log(colors.yellow, '   • Invalid');
            log(colors.yellow, '   • For wrong environment (sandbox token used in production)');
        }
        return;
    }

    // 5. Test Customer Operations
    section('Customer Operations Test');

    // Test user ID (you can replace this with a real user ID for more specific testing)
    const testUserId = 'test-user-id-' + Date.now();

    try {
        // Test customer creation
        log(colors.blue, `Testing customer creation with external ID: ${testUserId}`);
        const testCustomer = await polarClient.customers.create({
            email: `test-${Date.now()}@example.com`,
            name: 'Test User',
            externalId: testUserId
        });
        log(colors.green, `✓ Customer creation successful: ${testCustomer.id}`);

        // Test customer lookup by external ID
        log(colors.blue, 'Testing customer lookup by external ID...');
        const foundCustomer = await polarClient.customers.getExternal({
            externalId: testUserId
        });
        log(colors.green, `✓ Customer lookup successful: ${foundCustomer.id}`);

        // Test customer state retrieval
        log(colors.blue, 'Testing customer state retrieval...');
        const customerState = await polarClient.customers.getStateExternal({
            externalId: testUserId
        });
        log(colors.green, `✓ Customer state retrieval successful`);
        log(colors.blue, `   Active meters: ${(customerState as any).activeMeters?.length || 0}`);
        log(colors.blue, `   Legacy meters: ${(customerState as any).meters?.length || 0}`);

        // Clean up test customer
        try {
            await polarClient.customers.delete({ id: testCustomer.id });
            log(colors.green, '✓ Test customer cleaned up');
        } catch (cleanupError: any) {
            log(colors.yellow, `⚠️  Could not clean up test customer: ${cleanupError.message}`);
        }

    } catch (error: any) {
        log(colors.red, `❌ Customer operations failed:`);
        log(colors.red, `   Status: ${error.statusCode || 'Unknown'}`);
        log(colors.red, `   Message: ${error.message}`);
        log(colors.red, `   Body: ${error.body || 'No body'}`);

        if (error.statusCode === 401) {
            log(colors.yellow, '⚠️  This confirms the 401 error you\'re seeing in your app');
        }
    }

    // 6. Test with Real User (if provided)
    const realUserId = process.argv[2];
    if (realUserId) {
        section(`Real User Test (ID: ${realUserId})`);

        try {
            log(colors.blue, `Looking up customer with external ID: ${realUserId}`);
            const customer = await polarClient.customers.getExternal({
                externalId: realUserId
            });
            log(colors.green, `✓ Found customer: ${customer.id} (${customer.email})`);

            log(colors.blue, 'Getting customer state...');
            const customerState = await polarClient.customers.getStateExternal({
                externalId: realUserId
            });

            log(colors.green, '✓ Customer state retrieved successfully');
            log(colors.blue, `   Active meters: ${(customerState as any).activeMeters?.length || 0}`);

            // Look for credits
            const activeMeters = (customerState as any).activeMeters || [];
            let creditsFound = false;

            for (const meter of activeMeters) {
                if (meter.meterId) {
                    try {
                        const meterDetails = await polarClient.meters.get({ id: meter.meterId });
                        if (meterDetails?.name === 'Message Credits Used') {
                            log(colors.green, `✓ Found credits meter: ${meter.balance || 0} credits`);
                            creditsFound = true;
                        }
                    } catch (meterError: any) {
                        log(colors.yellow, `⚠️  Could not get meter details: ${meterError.message}`);
                    }
                }
            }

            if (!creditsFound) {
                log(colors.yellow, '⚠️  No "Message Credits Used" meter found for this user');
            }

        } catch (error: any) {
            log(colors.red, `❌ Real user test failed:`);
            log(colors.red, `   Status: ${error.statusCode || 'Unknown'}`);
            log(colors.red, `   Message: ${error.message}`);
            log(colors.red, `   Body: ${error.body || 'No body'}`);
        }
    }

    // 7. Replicate Your App's Logic
    section('App Logic Replication');

    log(colors.blue, 'Testing the exact same logic as your getRemainingCreditsByExternalId function...');

    if (realUserId) {
        try {
            // This replicates the exact logic in lib/polar.ts
            console.log(`[DEBUG] Attempting to get credits for external ID: ${realUserId}`);

            const customerState = await polarClient.customers.getStateExternal({
                externalId: realUserId
            });

            console.log(`[DEBUG] Customer state response:`, JSON.stringify(customerState, null, 2));

            if (!customerState) {
                console.log(`[DEBUG] No customer state found for external ID: ${realUserId}`);
                log(colors.yellow, '⚠️  No customer state found');
            } else {
                const activeMeters = (customerState as any).activeMeters || [];
                console.log(`[DEBUG] Found ${activeMeters.length} active meters for user ${realUserId}`);

                // Search for the correct "Message Credits Used" meter among active meters
                for (const meter of activeMeters) {
                    console.log(`[DEBUG] Active meter:`, JSON.stringify(meter, null, 2));

                    // Try to get the full meter details to check the name
                    if (meter.meterId) {
                        try {
                            const meterDetails = await polarClient.meters.get({
                                id: meter.meterId
                            });
                            console.log(`[DEBUG] Meter details for ${meter.meterId}:`, JSON.stringify(meterDetails, null, 2));

                            if (meterDetails?.name === 'Message Credits Used') {
                                const balance = meter.balance || 0;
                                console.log(`[DEBUG] Found 'Message Credits Used' active meter with balance: ${balance}`);
                                log(colors.green, `✓ Credits found using app logic: ${balance}`);
                                break;
                            }
                        } catch (meterError: any) {
                            console.warn(`[DEBUG] Failed to get meter details for ${meter.meterId}:`, meterError);
                        }
                    }
                }
            }
        } catch (error: any) {
            log(colors.red, `❌ App logic replication failed:`);
            log(colors.red, `   This is the EXACT same error as in your app!`);
            log(colors.red, `   Status: ${error.statusCode || 'Unknown'}`);
            log(colors.red, `   Message: ${error.message}`);
            log(colors.red, `   Body: ${error.body || 'No body'}`);
        }
    }

    // 8. Environment Comparison
    section('Environment Analysis');

    log(colors.blue, 'Current configuration:');
    log(colors.blue, `  • Environment: ${actualEnv}`);
    log(colors.blue, `  • Token length: ${polarAccessToken.length}`);
    log(colors.blue, `  • Node.js version: ${process.version}`);
    log(colors.blue, `  • Platform: ${process.platform}`);
    log(colors.blue, `  • Working directory: ${process.cwd()}`);

    log(colors.yellow, '\nNext steps:');
    log(colors.yellow, '1. Compare this output with your production logs');
    log(colors.yellow, '2. If basic API connectivity fails, check your token in Polar dashboard');
    log(colors.yellow, '3. If customer operations fail, verify token permissions');
    log(colors.yellow, '4. Run with a real user ID: npx tsx scripts/debug-polar-api.ts YOUR_USER_ID');

    log(colors.green, '\n✅ Debug script completed');
}

main().catch(error => {
    log(colors.red, `\n💥 Script failed with error: ${error.message}`);
    console.error(error);
    process.exit(1);
}); 
#!/usr/bin/env tsx

/**
 * Test script to simulate Vercel Cron execution locally
 * This helps test your cleanup endpoint before deploying to production
 */

import { config } from 'dotenv';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Load environment variables
config({ path: '.env.local' });

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

/**
 * Get authentication cookie from browser
 * Instructions for getting the cookie:
 * 1. Open your browser and go to your app (localhost:3000)
 * 2. Sign in as admin
 * 3. Open Developer Tools (F12)
 * 4. Go to Application/Storage tab > Cookies
 * 5. Find the session cookie (usually named like "better-auth.session_token" or similar)
 * 6. Copy the entire cookie string (name=value)
 */
function getAuthCookie(): string | undefined {
    // Option 1: Read from environment variable
    if (process.env.TEST_AUTH_COOKIE) {
        return process.env.TEST_AUTH_COOKIE;
    }

    // Option 2: Read from a local file (create .auth-cookie file with your cookie)
    const cookieFile = join(process.cwd(), '.auth-cookie');
    if (existsSync(cookieFile)) {
        return readFileSync(cookieFile, 'utf-8').trim();
    }

    // Option 3: Prompt user
    console.log('\n🔐 Authentication Required!');
    console.log('To test the admin endpoints, you need to provide an auth cookie:');
    console.log('1. Go to your browser and sign in as admin');
    console.log('2. Open Developer Tools (F12) > Application > Cookies');
    console.log('3. Copy the session cookie value');
    console.log('4. Either:');
    console.log('   - Set TEST_AUTH_COOKIE environment variable');
    console.log('   - Create a .auth-cookie file with the cookie value');
    console.log('   - Or run: echo "your-cookie-here" > .auth-cookie\n');

    return undefined;
}

/**
 * Format the authentication cookie properly
 * Handles both just the token value and full cookie format
 */
function formatAuthCookie(authCookie: string): string {
    // If cookie already includes the name (contains =), use as-is
    if (authCookie.includes('=')) {
        return authCookie;
    }
    // Otherwise, add the proper cookie name
    return `better-auth.session_token=${authCookie}`;
}

async function testCronExecution(authCookie?: string) {
    console.log('🧪 Testing Vercel Cron Execution Simulation\n');

    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            // Simulate Vercel cron headers
            'x-vercel-cron': '1',
            'user-agent': 'vercel-cron/1.0',
        };

        // Add auth cookie if available
        if (authCookie) {
            headers['Cookie'] = formatAuthCookie(authCookie);
        }

        // Simulate a Vercel cron request by including the proper headers
        const response = await fetch(`${BASE_URL}/api/admin/cleanup-users/execute`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                // No body needed - cron execution uses database config
            })
        });

        const data = await response.json();

        console.log('📊 Response Status:', response.status);
        console.log('📋 Response Data:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('\n✅ Cron execution test PASSED');
            console.log(`🗑️  Users processed: ${data.usersDeleted || 0}`);
            console.log(`⏱️  Duration: ${data.durationMs || 0}ms`);
        } else {
            console.log('\n❌ Cron execution test FAILED');
            console.log('Error:', data.error);
        }

    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
}

async function testManualExecution(authCookie?: string) {
    console.log('\n🔧 Testing Manual Execution (for comparison)\n');

    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // Add auth cookie if available
        if (authCookie) {
            headers['Cookie'] = formatAuthCookie(authCookie);
        }

        const response = await fetch(`${BASE_URL}/api/admin/cleanup-users/execute`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                dryRun: true,
                thresholdDays: 7,
                batchSize: 10,
                confirmationToken: 'DELETE_ANONYMOUS_USERS'
            })
        });

        const data = await response.json();

        console.log('📊 Response Status:', response.status);
        console.log('📋 Response Data:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('\n✅ Manual execution test PASSED');
        } else {
            console.log('\n❌ Manual execution test FAILED');
        }

    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
}

async function checkCronConfiguration(authCookie?: string) {
    console.log('\n🔍 Checking Cron Configuration\n');

    try {
        const headers: Record<string, string> = {};

        // Add auth cookie if available
        if (authCookie) {
            headers['Cookie'] = formatAuthCookie(authCookie);
        }

        const response = await fetch(`${BASE_URL}/api/admin/cleanup-users/schedule`, {
            headers
        });
        const data = await response.json();

        if (response.ok) {
            console.log('📋 Current Configuration:');
            console.log(`  Enabled: ${data.enabled}`);
            console.log(`  Threshold Days: ${data.thresholdDays}`);
            console.log(`  Batch Size: ${data.batchSize}`);
            console.log(`  Notification Enabled: ${data.notificationEnabled}`);
        } else {
            console.log('❌ Failed to get configuration:', data.error?.message || 'Unknown error');
        }

    } catch (error) {
        console.error('❌ Failed to check configuration:', error);
    }
}

async function main() {
    console.log('🚀 Vercel Cron Test Suite');
    console.log('========================\n');

    // Check if dev server is running
    try {
        await fetch(`${BASE_URL}/api/health`);
    } catch (error) {
        console.error('❌ Development server not running!');
        console.log('Please start the dev server first: pnpm dev');
        process.exit(1);
    }

    // Get authentication cookie
    const authCookie = getAuthCookie();
    if (!authCookie) {
        console.log('⚠️  Running without authentication - tests will likely fail');
        console.log('   Admin endpoints require authentication\n');
    } else {
        console.log('✅ Authentication cookie found\n');
    }

    await checkCronConfiguration(authCookie);
    await testCronExecution(authCookie);
    await testManualExecution(authCookie);

    console.log('\n📝 Next Steps:');
    if (!authCookie) {
        console.log('🔐 To run authenticated tests:');
        console.log('   1. Sign in as admin in your browser');
        console.log('   2. Copy session cookie from DevTools');
        console.log('   3. Run: echo "your-cookie-here" > .auth-cookie');
        console.log('   4. Re-run this script\n');
    }
    console.log('🚀 For production:');
    console.log('   1. Deploy to Vercel with updated vercel.json');
    console.log('   2. Check Vercel dashboard > Functions > Cron Jobs');
    console.log('   3. Monitor execution logs in Vercel');
    console.log('   4. Use admin UI to view cleanup history');
}

if (require.main === module) {
    main().catch(console.error);
}

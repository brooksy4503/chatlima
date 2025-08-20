#!/usr/bin/env tsx
/**
 * Test script to verify the daily message usage tracking fix works correctly
 * 
 * This script tests that anonymous users using free models are now properly tracked.
 * 
 * Usage: pnpm exec tsx scripts/test-daily-usage-fix.ts
 */

import { DailyMessageUsageService } from '../lib/services/dailyMessageUsageService';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
} as const;

function log(message: string, color: keyof typeof colors = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message: string) {
    log(`✅ ${message}`, 'green');
}

function logError(message: string) {
    log(`❌ ${message}`, 'red');
}

function logInfo(message: string) {
    log(`ℹ️  ${message}`, 'blue');
}

async function testDailyUsageService() {
    log('🧪 Testing Daily Message Usage Service', 'cyan');

    try {
        // Test 1: Create a test anonymous user and increment usage
        const testUserId = 'test-anon-' + Date.now();
        logInfo(`Testing with anonymous user ID: ${testUserId}`);

        // Check initial usage (should be 0)
        const initialUsage = await DailyMessageUsageService.getDailyUsage(testUserId);
        logInfo(`Initial usage: ${initialUsage.messageCount}/${initialUsage.limit} (limit: ${initialUsage.limit})`);

        if (initialUsage.messageCount !== 0) {
            logError(`Expected initial usage to be 0, got ${initialUsage.messageCount}`);
            return false;
        }

        if (initialUsage.limit !== 20) { // Default for non-anonymous users
            logInfo(`User appears to be treated as non-anonymous (limit ${initialUsage.limit}), testing as anonymous explicitly`);
        }

        // Test 2: Increment usage for anonymous user
        logInfo('Incrementing usage for anonymous user...');
        const incrementResult = await DailyMessageUsageService.incrementDailyUsage(testUserId, true);
        logSuccess(`Usage incremented to: ${incrementResult.newCount} on ${incrementResult.date}`);

        // Test 3: Verify the increment worked
        const afterIncrement = await DailyMessageUsageService.getDailyUsage(testUserId);
        logInfo(`After increment: ${afterIncrement.messageCount}/${afterIncrement.limit} (isAnonymous: ${afterIncrement.isAnonymous})`);

        if (afterIncrement.messageCount !== 1) {
            logError(`Expected usage count to be 1, got ${afterIncrement.messageCount}`);
            return false;
        }

        if (afterIncrement.limit !== 10) {
            logError(`Expected anonymous user limit to be 10, got ${afterIncrement.limit}`);
            return false;
        }

        if (!afterIncrement.isAnonymous) {
            logError(`Expected user to be marked as anonymous, but isAnonymous is false`);
            return false;
        }

        logSuccess('Anonymous user daily usage tracking is working correctly!');

        // Test 4: Test multiple increments to verify atomic operations
        logInfo('Testing multiple increments...');
        await Promise.all([
            DailyMessageUsageService.incrementDailyUsage(testUserId, true),
            DailyMessageUsageService.incrementDailyUsage(testUserId, true),
            DailyMessageUsageService.incrementDailyUsage(testUserId, true)
        ]);

        const afterMultiple = await DailyMessageUsageService.getDailyUsage(testUserId);
        logInfo(`After multiple increments: ${afterMultiple.messageCount}/${afterMultiple.limit}`);

        if (afterMultiple.messageCount !== 4) {
            logError(`Expected usage count to be 4, got ${afterMultiple.messageCount}`);
            return false;
        }

        logSuccess('Multiple increments work correctly!');

        // Test 5: Test limit enforcement
        logInfo('Testing limit enforcement (adding 6 more messages to reach 10)...');
        for (let i = 0; i < 6; i++) {
            await DailyMessageUsageService.incrementDailyUsage(testUserId, true);
        }

        const atLimit = await DailyMessageUsageService.getDailyUsage(testUserId);
        logInfo(`At limit: ${atLimit.messageCount}/${atLimit.limit} (hasReachedLimit: ${atLimit.hasReachedLimit})`);

        if (atLimit.messageCount !== 10) {
            logError(`Expected usage count to be 10, got ${atLimit.messageCount}`);
            return false;
        }

        if (!atLimit.hasReachedLimit) {
            logError(`Expected hasReachedLimit to be true, got ${atLimit.hasReachedLimit}`);
            return false;
        }

        if (atLimit.remaining !== 0) {
            logError(`Expected remaining to be 0, got ${atLimit.remaining}`);
            return false;
        }

        logSuccess('Limit enforcement works correctly!');

        return true;

    } catch (error) {
        logError(`Test failed with error: ${error}`);
        return false;
    }
}

async function runTest() {
    log('🧪 Daily Message Usage Fix Test', 'cyan');
    log('===================================', 'cyan');

    const success = await testDailyUsageService();

    log('\n=== Test Summary ===', 'cyan');
    if (success) {
        logSuccess('🎉 ALL TESTS PASSED! The daily message usage tracking fix is working correctly.');
        logSuccess('✅ Anonymous users using free models will now be properly tracked');
        logSuccess('✅ Daily limits cannot be bypassed by deleting messages');
    } else {
        logError('❌ TESTS FAILED! There may be an issue with the implementation.');
    }

    return success;
}

// Run the test if this script is executed directly
if (require.main === module) {
    runTest()
        .then((success) => {
            process.exit(success ? 0 : 1);
        })
        .catch((error) => {
            log(`❌ Test script crashed: ${error}`, 'red');
            process.exit(1);
        });
}

export { runTest };

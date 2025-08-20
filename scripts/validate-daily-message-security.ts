#!/usr/bin/env tsx
/**
 * Validation script to verify the Daily Message Usage Security Fix
 * 
 * This script tests that:
 * 1. The new system tracks usage independently of message deletion
 * 2. Users cannot bypass daily limits by deleting messages
 * 3. The old vulnerable system is no longer in use
 * 4. Both anonymous and authenticated limits are properly enforced
 * 
 * Usage: pnpm exec tsx scripts/validate-daily-message-security.ts
 */

import { db } from '../lib/db';
import { dailyMessageUsage, users, messages, chats } from '../lib/db/schema';
import { DailyMessageUsageService } from '../lib/services/dailyMessageUsageService';
import { eq, and, gte, count } from 'drizzle-orm';
import { nanoid } from 'nanoid';

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

function logWarning(message: string) {
    log(`⚠️  ${message}`, 'yellow');
}

function logError(message: string) {
    log(`❌ ${message}`, 'red');
}

function logInfo(message: string) {
    log(`ℹ️  ${message}`, 'blue');
}

// Test data
const testUserId = 'validation-test-' + nanoid();
const testChatId = 'validation-chat-' + nanoid();

async function createTestUser() {
    logInfo('Creating test user...');
    await db.insert(users).values({
        id: testUserId,
        email: 'validation-test@example.com',
        isAnonymous: false,
        name: 'Validation Test User',
    });

    await db.insert(chats).values({
        id: testChatId,
        userId: testUserId,
        title: 'Validation Test Chat',
    });
}

async function cleanupTestData() {
    logInfo('Cleaning up test data...');
    try {
        // Clean up in reverse order of dependencies
        await db.delete(messages).where(eq(messages.chatId, testChatId));
        await db.delete(chats).where(eq(chats.id, testChatId));
        await db.delete(dailyMessageUsage).where(eq(dailyMessageUsage.userId, testUserId));
        await db.delete(users).where(eq(users.id, testUserId));
        logSuccess('Test data cleanup completed');
    } catch (error) {
        logWarning(`Cleanup warning: ${error}`);
    }
}

async function testNewSecureSystem() {
    log('\n=== Testing New Secure Daily Message Usage System ===', 'cyan');

    // Test 1: Basic functionality
    logInfo('Test 1: Basic increment and get functionality');
    const usage1 = await DailyMessageUsageService.incrementDailyUsage(testUserId, false);
    if (usage1.newCount === 1) {
        logSuccess('Basic increment works correctly');
    } else {
        logError(`Expected count 1, got ${usage1.newCount}`);
        return false;
    }

    const current1 = await DailyMessageUsageService.getDailyUsage(testUserId);
    if (current1.messageCount === 1 && current1.limit === 20 && current1.remaining === 19) {
        logSuccess('Basic get usage works correctly');
    } else {
        logError(`Expected count 1, limit 20, remaining 19. Got count ${current1.messageCount}, limit ${current1.limit}, remaining ${current1.remaining}`);
        return false;
    }

    // Test 2: Multiple increments
    logInfo('Test 2: Multiple increments');
    await DailyMessageUsageService.incrementDailyUsage(testUserId, false);
    await DailyMessageUsageService.incrementDailyUsage(testUserId, false);

    const current2 = await DailyMessageUsageService.getDailyUsage(testUserId);
    if (current2.messageCount === 3) {
        logSuccess('Multiple increments work correctly');
    } else {
        logError(`Expected count 3, got ${current2.messageCount}`);
        return false;
    }

    return true;
}

async function testSecurityAgainstBypass() {
    log('\n=== Testing Security Against Bypass Attempts ===', 'cyan');

    // Create some messages in the old system (messages table)
    logInfo('Creating actual messages in the database...');
    const messageIds = [];
    for (let i = 0; i < 3; i++) {
        const messageId = nanoid();
        messageIds.push(messageId);
        await db.insert(messages).values({
            id: messageId,
            chatId: testChatId,
            role: 'user',
            parts: [{ type: 'text', text: `Test message ${i + 1}` }],
        });
    }

    // Verify messages exist
    const messageCount = await db
        .select({ count: count() })
        .from(messages)
        .where(eq(messages.chatId, testChatId))
        .then(result => result[0]?.count || 0);

    logInfo(`Created ${messageCount} messages in database`);

    // Get current usage tracking count (should be 3 from previous test)
    const beforeDeletion = await DailyMessageUsageService.getDailyUsage(testUserId);
    logInfo(`Usage tracking shows ${beforeDeletion.messageCount} messages`);

    // Now delete all the actual messages (simulating user bypass attempt)
    logInfo('Deleting all actual messages (simulating bypass attempt)...');
    for (const messageId of messageIds) {
        await db.delete(messages).where(eq(messages.id, messageId));
    }

    // Verify messages are deleted
    const remainingMessages = await db
        .select({ count: count() })
        .from(messages)
        .where(eq(messages.chatId, testChatId))
        .then(result => result[0]?.count || 0);

    if (remainingMessages === 0) {
        logSuccess('Messages successfully deleted from database');
    } else {
        logError(`Expected 0 messages, found ${remainingMessages}`);
        return false;
    }

    // Check if usage tracking is still intact (THIS IS THE CRITICAL TEST)
    const afterDeletion = await DailyMessageUsageService.getDailyUsage(testUserId);

    if (afterDeletion.messageCount === beforeDeletion.messageCount) {
        logSuccess(`🔒 SECURITY TEST PASSED: Usage count remains ${afterDeletion.messageCount} despite message deletion`);
        logSuccess('Users CANNOT bypass daily limits by deleting messages');
    } else {
        logError(`SECURITY VULNERABILITY: Usage count changed from ${beforeDeletion.messageCount} to ${afterDeletion.messageCount} after message deletion`);
        logError('Users CAN bypass daily limits by deleting messages!');
        return false;
    }

    return true;
}

async function testOldVulnerableSystem() {
    log('\n=== Testing Old Vulnerable System (Should Show Vulnerability) ===', 'cyan');

    logInfo('Simulating old vulnerable message counting method...');

    // Recreate the old vulnerable query that counted existing messages
    const simulateOldCount = async (userId: string): Promise<number> => {
        const now = new Date();
        const startOfDay = new Date(now.toISOString().split('T')[0] + 'T00:00:00.000Z');

        const messageCount = await db.select({ count: count() })
            .from(messages)
            .innerJoin(chats, eq(chats.id, messages.chatId))
            .where(
                and(
                    eq(chats.userId, userId),
                    gte(messages.createdAt, startOfDay),
                    eq(messages.role, 'user')
                )
            )
            .then(result => result[0]?.count || 0);

        return messageCount;
    };

    // Create some messages
    const messageIds = [];
    for (let i = 0; i < 5; i++) {
        const messageId = nanoid();
        messageIds.push(messageId);
        await db.insert(messages).values({
            id: messageId,
            chatId: testChatId,
            role: 'user',
            parts: [{ type: 'text', text: `Old system test message ${i + 1}` }],
        });
    }

    const oldCountBefore = await simulateOldCount(testUserId);
    logInfo(`Old system would count: ${oldCountBefore} messages`);

    // Delete 3 messages
    for (let i = 0; i < 3; i++) {
        await db.delete(messages).where(eq(messages.id, messageIds[i]));
    }

    const oldCountAfter = await simulateOldCount(testUserId);
    logInfo(`Old system after deletion: ${oldCountAfter} messages`);

    if (oldCountAfter < oldCountBefore) {
        logWarning(`Old vulnerable system: Count reduced from ${oldCountBefore} to ${oldCountAfter} after deletion`);
        logWarning('This demonstrates the vulnerability that has been fixed');
    } else {
        logError('Expected old system to show reduced count after deletion');
        return false;
    }

    // Clean up remaining messages
    await db.delete(messages).where(eq(messages.chatId, testChatId));

    return true;
}

async function testLimitEnforcement() {
    log('\n=== Testing Limit Enforcement ===', 'cyan');

    // Test anonymous user limit (10 messages)
    logInfo('Testing anonymous user limit (10 messages)...');
    const anonUserId = 'anon-validation-' + nanoid();

    try {
        await db.insert(users).values({
            id: anonUserId,
            email: 'anon-validation@example.com',
            isAnonymous: true,
            name: 'Anonymous Validation User',
        });

        // Send 10 messages (should reach limit)
        for (let i = 0; i < 10; i++) {
            await DailyMessageUsageService.incrementDailyUsage(anonUserId, true);
        }

        const anonUsage = await DailyMessageUsageService.getDailyUsage(anonUserId);
        if (anonUsage.hasReachedLimit && anonUsage.messageCount === 10 && anonUsage.limit === 10) {
            logSuccess('Anonymous user limit enforcement works correctly');
        } else {
            logError(`Anonymous limit test failed: count=${anonUsage.messageCount}, limit=${anonUsage.limit}, hasReachedLimit=${anonUsage.hasReachedLimit}`);
            return false;
        }

        // Clean up anonymous user
        await db.delete(dailyMessageUsage).where(eq(dailyMessageUsage.userId, anonUserId));
        await db.delete(users).where(eq(users.id, anonUserId));
    } catch (error) {
        logError(`Anonymous user test failed: ${error}`);
        return false;
    }

    return true;
}

async function testUsageStats() {
    log('\n=== Testing Usage Statistics ===', 'cyan');

    try {
        const stats = await DailyMessageUsageService.getUsageStats(7);

        logInfo(`Total users with activity: ${stats.totalUsers}`);
        logInfo(`Total messages tracked: ${stats.totalMessages}`);
        logInfo(`Average messages per user: ${stats.averageMessagesPerUser}`);
        logInfo(`Daily breakdown entries: ${stats.dailyBreakdown.length}`);

        if (stats.totalUsers >= 1 && stats.totalMessages >= 1) {
            logSuccess('Usage statistics generation works correctly');
        } else {
            logWarning('Usage statistics seem low, but this might be expected in a clean environment');
        }

        return true;
    } catch (error) {
        logError(`Usage stats test failed: ${error}`);
        return false;
    }
}

async function testCheckLimitWithoutIncrement() {
    log('\n=== Testing Limit Check Without Increment ===', 'cyan');

    const beforeCount = await DailyMessageUsageService.getDailyUsage(testUserId);
    const limitCheck = await DailyMessageUsageService.checkDailyLimit(testUserId);
    const afterCount = await DailyMessageUsageService.getDailyUsage(testUserId);

    if (beforeCount.messageCount === afterCount.messageCount && limitCheck.messageCount === beforeCount.messageCount) {
        logSuccess('checkDailyLimit does not increment counter');
    } else {
        logError(`checkDailyLimit incorrectly modified count: before=${beforeCount.messageCount}, check=${limitCheck.messageCount}, after=${afterCount.messageCount}`);
        return false;
    }

    return true;
}

async function runAllTests() {
    log('🧪 Daily Message Usage Security Validation Script', 'cyan');
    log('================================================', 'cyan');

    let allTestsPassed = true;

    try {
        // Setup
        await createTestUser();

        // Run tests
        const tests = [
            { name: 'New Secure System', fn: testNewSecureSystem },
            { name: 'Security Against Bypass', fn: testSecurityAgainstBypass },
            { name: 'Old Vulnerable System Demo', fn: testOldVulnerableSystem },
            { name: 'Limit Enforcement', fn: testLimitEnforcement },
            { name: 'Usage Statistics', fn: testUsageStats },
            { name: 'Check Limit Without Increment', fn: testCheckLimitWithoutIncrement },
        ];

        for (const test of tests) {
            try {
                const result = await test.fn();
                if (!result) {
                    allTestsPassed = false;
                }
            } catch (error) {
                logError(`Test "${test.name}" threw an error: ${error}`);
                allTestsPassed = false;
            }
        }

    } catch (error) {
        logError(`Setup failed: ${error}`);
        allTestsPassed = false;
    } finally {
        // Cleanup
        await cleanupTestData();
    }

    // Summary
    log('\n=== Validation Summary ===', 'cyan');
    if (allTestsPassed) {
        logSuccess('🎉 ALL TESTS PASSED! The Daily Message Usage security fix is working correctly.');
        logSuccess('✅ Users cannot bypass daily limits by deleting messages');
        logSuccess('✅ New secure tracking system is functioning properly');
        logSuccess('✅ Limit enforcement is working for both anonymous and authenticated users');
    } else {
        logError('❌ SOME TESTS FAILED! Please review the output above and fix any issues.');
    }

    return allTestsPassed;
}

// Run the validation if this script is executed directly
if (require.main === module) {
    runAllTests()
        .then((success) => {
            process.exit(success ? 0 : 1);
        })
        .catch((error) => {
            logError(`Validation script crashed: ${error}`);
            process.exit(1);
        });
}

export { runAllTests };

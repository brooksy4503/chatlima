#!/usr/bin/env npx tsx

/**
 * Test script to verify cleanup database integration
 * 
 * This script tests the database tables and service functions
 * to ensure everything is working correctly.
 */

import { CleanupConfigService } from '../lib/services/cleanupConfigService';

async function testCleanupDatabase() {
    console.log('🧪 Testing Cleanup Database Integration');
    console.log('='.repeat(50));

    try {
        // Test 1: Get initial config
        console.log('\n📋 Test 1: Get cleanup configuration');
        const initialConfig = await CleanupConfigService.getConfig();
        console.log('✅ Initial config:', {
            enabled: initialConfig.enabled,
            thresholdDays: initialConfig.thresholdDays,
            batchSize: initialConfig.batchSize,
        });

        // Test 2: Update config
        console.log('\n📝 Test 2: Update configuration');
        const updatedConfig = await CleanupConfigService.updateConfig({
            enabled: true,
            thresholdDays: 30,
            notificationEnabled: true,
        }, 'test-script', 'test-user-id');
        console.log('✅ Updated config:', {
            enabled: updatedConfig.enabled,
            thresholdDays: updatedConfig.thresholdDays,
            lastModified: updatedConfig.lastModified,
        });

        // Test 3: Log a test execution
        console.log('\n📊 Test 3: Log test execution');
        const testLog = await CleanupConfigService.logExecution({
            executedAt: new Date().toISOString(),
            executedBy: 'script',
            adminUser: 'test@example.com',
            usersCounted: 100,
            usersDeleted: 5,
            thresholdDays: 30,
            batchSize: 50,
            durationMs: 2500,
            status: 'success',
            errorCount: 0,
            dryRun: true,
            deletedUserIds: ['user1', 'user2', 'user3', 'user4', 'user5'],
        });
        console.log('✅ Logged execution:', {
            id: testLog.id,
            status: testLog.status,
            usersDeleted: testLog.usersDeleted,
            dryRun: testLog.dryRun,
        });

        // Test 4: Get execution logs
        console.log('\n📚 Test 4: Retrieve execution logs');
        const logsResponse = await CleanupConfigService.getLogs({
            limit: 5,
            offset: 0,
            type: 'all'
        });
        console.log('✅ Retrieved logs:', {
            totalLogs: logsResponse.pagination.total,
            returnedLogs: logsResponse.logs.length,
            successfulExecutions: logsResponse.summary.successfulExecutions,
            totalUsersDeleted: logsResponse.summary.totalUsersDeleted,
        });

        // Test 5: Get execution history
        console.log('\n📈 Test 5: Get execution history');
        const history = await CleanupConfigService.getExecutionHistory(7);
        console.log('✅ Execution history:', {
            historyCount: history.length,
            latestExecution: history[0]?.executedAt || 'None',
        });

        console.log('\n🎉 All tests passed! Database integration is working correctly.');

    } catch (error) {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    }
}

// Run tests if called directly
if (require.main === module) {
    testCleanupDatabase().catch(console.error);
}

export default testCleanupDatabase;

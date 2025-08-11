#!/usr/bin/env tsx

/**
 * Memory optimization test script
 * Tests the improved cleanup service methods to ensure they stay within memory limits
 */

import { UserCleanupService } from '../lib/services/userCleanupService';
import { CleanupConfigService } from '../lib/services/cleanupConfigService';

interface MemoryUsage {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
}

function getMemoryUsage(): MemoryUsage {
    const usage = process.memoryUsage();
    return {
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
        external: Math.round(usage.external / 1024 / 1024), // MB
        rss: Math.round(usage.rss / 1024 / 1024) // MB
    };
}

function formatMemory(usage: MemoryUsage): string {
    return `Heap: ${usage.heapUsed}/${usage.heapTotal} MB, RSS: ${usage.rss} MB, External: ${usage.external} MB`;
}

async function testMemoryUsage() {
    console.log('🧪 Testing Memory Optimization for Cleanup System\n');

    const initialMemory = getMemoryUsage();
    console.log(`📊 Initial Memory: ${formatMemory(initialMemory)}`);

    const VERCEL_MEMORY_LIMIT = 2048; // MB for Hobby plan
    const SAFETY_MARGIN = 0.8; // Use only 80% of limit for safety
    const MAX_SAFE_MEMORY = VERCEL_MEMORY_LIMIT * SAFETY_MARGIN;

    console.log(`🎯 Target: Stay under ${MAX_SAFE_MEMORY} MB (80% of ${VERCEL_MEMORY_LIMIT} MB Vercel limit)\n`);

    try {
        // Test 1: Get anonymous user count (should be very light)
        console.log('🔍 Test 1: Getting anonymous user count...');
        const startMemory1 = getMemoryUsage();
        const userCount = await UserCleanupService.getAnonymousUserCount();
        const endMemory1 = getMemoryUsage();
        console.log(`   Result: ${userCount} anonymous users found`);
        console.log(`   Memory: ${formatMemory(startMemory1)} → ${formatMemory(endMemory1)}`);
        console.log(`   Memory increase: ${endMemory1.heapUsed - startMemory1.heapUsed} MB\n`);

        // Test 2: Get users with activity (batched)
        console.log('🔍 Test 2: Getting users with activity (batched)...');
        const startMemory2 = getMemoryUsage();
        const usersWithActivity = await UserCleanupService.getAnonymousUsersWithActivity(100, 0);
        const endMemory2 = getMemoryUsage();
        console.log(`   Result: ${usersWithActivity.length} users processed`);
        console.log(`   Memory: ${formatMemory(startMemory2)} → ${formatMemory(endMemory2)}`);
        console.log(`   Memory increase: ${endMemory2.heapUsed - startMemory2.heapUsed} MB\n`);

        // Test 3: Preview cleanup (memory-efficient)
        console.log('🔍 Test 3: Preview cleanup (memory-efficient)...');
        const startMemory3 = getMemoryUsage();
        const preview = await UserCleanupService.previewCleanup(45, 50);
        const endMemory3 = getMemoryUsage();
        console.log(`   Result: ${preview.candidatesForDeletion} candidates found, ${preview.candidates.length} returned`);
        console.log(`   Memory: ${formatMemory(startMemory3)} → ${formatMemory(endMemory3)}`);
        console.log(`   Memory increase: ${endMemory3.heapUsed - startMemory3.heapUsed} MB\n`);

        // Test 4: Get logs with efficient summary
        console.log('🔍 Test 4: Get logs with efficient summary...');
        const startMemory4 = getMemoryUsage();
        const logs = await CleanupConfigService.getLogs({ limit: 20 });
        const endMemory4 = getMemoryUsage();
        console.log(`   Result: ${logs.logs.length} logs returned, summary calculated`);
        console.log(`   Memory: ${formatMemory(startMemory4)} → ${formatMemory(endMemory4)}`);
        console.log(`   Memory increase: ${endMemory4.heapUsed - startMemory4.heapUsed} MB\n`);

        // Final memory check
        const finalMemory = getMemoryUsage();
        const totalIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

        console.log('📈 Memory Usage Summary:');
        console.log(`   Initial: ${formatMemory(initialMemory)}`);
        console.log(`   Final:   ${formatMemory(finalMemory)}`);
        console.log(`   Total increase: ${totalIncrease} MB\n`);

        // Memory limit check
        if (finalMemory.rss > MAX_SAFE_MEMORY) {
            console.log('❌ FAIL: Memory usage exceeds safe limit!');
            console.log(`   Current RSS: ${finalMemory.rss} MB`);
            console.log(`   Safe limit: ${MAX_SAFE_MEMORY} MB`);
            process.exit(1);
        } else {
            console.log('✅ PASS: Memory usage is within safe limits');
            console.log(`   Current RSS: ${finalMemory.rss} MB (${((finalMemory.rss / VERCEL_MEMORY_LIMIT) * 100).toFixed(1)}% of Vercel limit)`);
            console.log(`   Remaining: ${VERCEL_MEMORY_LIMIT - finalMemory.rss} MB`);
        }

        // Performance check
        if (totalIncrease < 50) {
            console.log('✅ PASS: Memory increase is minimal (< 50 MB)');
        } else if (totalIncrease < 100) {
            console.log('⚠️  WARN: Memory increase is moderate (50-100 MB)');
        } else {
            console.log('❌ FAIL: Memory increase is high (> 100 MB)');
        }

    } catch (error) {
        console.error('❌ Test failed with error:', error);
        process.exit(1);
    }
}

// Force garbage collection if available
if (global.gc) {
    console.log('🧹 Running garbage collection before test...');
    global.gc();
}

testMemoryUsage()
    .then(() => {
        console.log('\n🎉 Memory optimization test completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Memory optimization test failed:', error);
        process.exit(1);
    });

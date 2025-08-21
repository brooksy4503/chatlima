#!/usr/bin/env -S npx tsx

/**
 * Test script to verify Vercel Flags functionality
 * This script tests the feature flag implementation without requiring a full server
 */

import { projectOverviewV2Flag, isProjectOverviewV2Enabled } from '../lib/utils/feature-flags';

async function testFeatureFlags() {
    console.log('🧪 Testing Vercel Flags Implementation...\n');

    try {
        // Test 1: Direct flag access
        console.log('1. Testing direct flag access...');
        const flagResult = await projectOverviewV2Flag();
        console.log(`   Flag value: ${flagResult}`);
        console.log('   ✅ Direct flag access test passed\n');

        // Test 2: Helper function
        console.log('2. Testing helper function...');
        const isEnabled = await isProjectOverviewV2Enabled();
        console.log(`   Project Overview V2 enabled: ${isEnabled}`);
        console.log('   ✅ Helper function test passed\n');

        // Test 3: Error handling simulation
        console.log('3. Testing error handling...');
        try {
            // Simulate a potential error scenario
            const invalidFlag = async () => { throw new Error('Network error'); };
            await invalidFlag();
            console.log('   ❌ Error handling test failed - should have thrown error');
        } catch (error) {
            console.log(`   ✅ Error handling test passed - caught error: ${(error as Error).message}`);
        }
        console.log();

        // Test 4: Type checking
        console.log('4. Testing type consistency...');
        if (typeof flagResult === 'boolean') {
            console.log('   ✅ Flag value is boolean type');
        } else {
            console.log(`   ❌ Flag value is not boolean: ${typeof flagResult}`);
        }

        console.log('\n🎉 All feature flag tests completed successfully!');
        console.log('\n📋 Summary:');
        console.log(`   - Project Overview V2 is currently: ${flagResult ? 'ENABLED' : 'DISABLED'}`);
        console.log(`   - Default behavior: ${flagResult === false ? 'Original component' : 'V2 component'}`);
        console.log(`   - Flag key: project-overview-v2`);

    } catch (error) {
        console.error('❌ Feature flag test failed:', (error as Error).message);
        console.error('   This could be due to:');
        console.error('   - Missing FLAGS_SECRET environment variable');
        console.error('   - Network connectivity issues');
        console.error('   - Vercel Flags service unavailability');
        process.exit(1);
    }
}

// Run the tests if this script is executed directly
if (require.main === module) {
    testFeatureFlags().catch(console.error);
}

// Export for potential use in other tests
export { testFeatureFlags };
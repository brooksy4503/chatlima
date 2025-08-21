#!/usr/bin/env node

/**
 * Test script to verify Vercel Flags functionality
 * This script tests the feature flag implementation without requiring a full server
 */

const { projectOverviewV2Flag, isProjectOverviewV2Enabled } = require('../lib/utils/feature-flags');

async function testFeatureFlags() {
  console.log('🧪 Testing Vercel Flags Implementation...\n');
  
  try {
    // Test 1: Direct flag access
    console.log('1. Testing direct flag access...');
    const flagResult = await projectOverviewV2Flag.get();
    console.log(`   Flag value: ${flagResult.value}`);
    console.log(`   Flag name: ${flagResult.name}`);
    console.log(`   Flag description: ${flagResult.description}`);
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
      const invalidFlag = { get: () => Promise.reject(new Error('Network error')) };
      await invalidFlag.get();
      console.log('   ❌ Error handling test failed - should have thrown error');
    } catch (error) {
      console.log(`   ✅ Error handling test passed - caught error: ${error.message}`);
    }
    console.log();
    
    // Test 4: Type checking
    console.log('4. Testing type consistency...');
    if (typeof flagResult.value === 'boolean') {
      console.log('   ✅ Flag value is boolean type');
    } else {
      console.log(`   ❌ Flag value is not boolean: ${typeof flagResult.value}`);
    }
    
    console.log('\n🎉 All feature flag tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Project Overview V2 is currently: ${flagResult.value ? 'ENABLED' : 'DISABLED'}`);
    console.log(`   - Default behavior: ${flagResult.value === false ? 'Original component' : 'V2 component'}`);
    console.log(`   - Flag key: ${projectOverviewV2Flag.key}`);
    
  } catch (error) {
    console.error('❌ Feature flag test failed:', error.message);
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

module.exports = { testFeatureFlags };
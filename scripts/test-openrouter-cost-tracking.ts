#!/usr/bin/env tsx

/**
 * Test script for OpenRouter cost tracking functionality
 * This script tests the new cost tracking implementation
 */

import { OpenRouterCostTracker } from '../lib/services/openrouterCostTracker';
import { TokenTrackingService } from '../lib/tokenTracking';
import { nanoid } from 'nanoid';

async function testOpenRouterCostTracking() {
    console.log('🧪 Testing OpenRouter Cost Tracking Implementation\n');

    // Test 1: Test generation ID extraction
    console.log('Test 1: Generation ID extraction');
    console.log('================================');

    const mockResponse1 = { id: 'gen-12345' };
    const mockResponse2 = { generation_id: 'gen-67890' };
    const mockResponse3 = { metadata: { id: 'gen-abcdef' } };
    const mockResponse4 = {}; // No ID

    console.log('Mock response 1 (id):', OpenRouterCostTracker.extractGenerationId(mockResponse1));
    console.log('Mock response 2 (generation_id):', OpenRouterCostTracker.extractGenerationId(mockResponse2));
    console.log('Mock response 3 (metadata.id):', OpenRouterCostTracker.extractGenerationId(mockResponse3));
    console.log('Mock response 4 (no id):', OpenRouterCostTracker.extractGenerationId(mockResponse4));
    console.log();

    // Test 2: Test cost fetching (will fail without real generation ID and API key)
    console.log('Test 2: Cost fetching');
    console.log('=====================');

    const testGenerationId = 'gen-test-12345';
    console.log(`Testing cost fetch for generation ID: ${testGenerationId}`);

    try {
        const result = await OpenRouterCostTracker.fetchActualCost(testGenerationId);
        console.log('Cost fetch result:', {
            actualCost: result.actualCost,
            nativeInputTokens: result.nativeInputTokens,
            nativeOutputTokens: result.nativeOutputTokens,
            hasGenerationData: !!result.generationData
        });
    } catch (error) {
        console.log('Cost fetch failed (expected without real data):', error instanceof Error ? error.message : String(error));
    }
    console.log();

    // Test 3: Test token tracking with generation ID
    console.log('Test 3: Token tracking with generation ID');
    console.log('=========================================');

    const mockTokenUsage = {
        inputTokens: 100,
        outputTokens: 200,
        totalTokens: 300
    };

    const trackingParams = {
        userId: 'test-user-' + nanoid(),
        chatId: 'test-chat-' + nanoid(),
        messageId: 'test-message-' + nanoid(),
        modelId: 'openrouter/openai/gpt-4' as any,
        provider: 'openrouter',
        tokenUsage: mockTokenUsage,
        generationId: 'gen-test-tracking-' + nanoid(),
        metadata: {
            testMode: true,
            timestamp: new Date().toISOString()
        }
    };

    console.log('Testing token tracking with parameters:', {
        ...trackingParams,
        tokenUsage: mockTokenUsage
    });

    try {
        await TokenTrackingService.trackTokenUsage(trackingParams);
        console.log('✅ Token tracking completed successfully');
    } catch (error) {
        console.log('❌ Token tracking failed:', error instanceof Error ? error.message : String(error));
    }
    console.log();

    // Test 4: Compare with non-OpenRouter provider
    console.log('Test 4: Non-OpenRouter provider tracking');
    console.log('========================================');

    const nonOpenRouterParams = {
        ...trackingParams,
        modelId: 'anthropic/claude-3' as any,
        provider: 'anthropic',
        generationId: undefined // Should be ignored for non-OpenRouter
    };

    try {
        await TokenTrackingService.trackTokenUsage(nonOpenRouterParams);
        console.log('✅ Non-OpenRouter tracking completed successfully');
    } catch (error) {
        console.log('❌ Non-OpenRouter tracking failed:', error instanceof Error ? error.message : String(error));
    }

    console.log('\n🎉 Test completed!');
    console.log('\nKey Changes Implemented:');
    console.log('- ✅ Added OpenRouterCostTracker service');
    console.log('- ✅ Updated TokenTrackingParams interface with generationId');
    console.log('- ✅ Enhanced TokenTrackingService to fetch actual costs');
    console.log('- ✅ Updated chat route to extract and pass generation ID');
    console.log('- ✅ Enhanced metadata storage for debugging');

    console.log('\nNext Steps:');
    console.log('1. Deploy and test with real OpenRouter requests');
    console.log('2. Monitor logs for generation ID extraction');
    console.log('3. Verify actual costs are different from estimated costs');
    console.log('4. Check database records for enhanced metadata');
}

// Export the test function for potential use in other scripts
export { testOpenRouterCostTracking };

// Run the test if this script is executed directly
if (require.main === module) {
    testOpenRouterCostTracking().catch(console.error);
}
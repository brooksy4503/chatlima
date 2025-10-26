#!/usr/bin/env npx tsx

/**
 * Standalone script to test Requesty API and inspect token usage data
 * 
 * Usage: npx tsx scripts/test-requesty-usage.ts
 */

import { config } from 'dotenv';
import { createRequesty } from '@requesty/ai-sdk';
import { generateText } from 'ai';
import path from 'path';

// Load environment variables from .env.local
config({ path: path.join(process.cwd(), '.env.local') });

interface TestConfig {
    model: string;
    prompt: string;
    maxTokens?: number;
}

// Test configurations
const testConfigs: TestConfig[] = [
    {
        model: 'openai/gpt-5-mini',
        prompt: 'What is 2+2? Give a brief answer.',
        maxTokens: 50
    },
    {
        model: 'openai/gpt-5-nano',
        prompt: 'Explain what AI is in one sentence.',
        maxTokens: 30
    },
    {
        model: 'vertex/anthropic/claude-4-sonnet',
        prompt: 'Hello, how are you?',
        maxTokens: 20
    }
];

async function testRequestyUsage() {
    console.log('🚀 Testing Requesty API Usage Data...\n');

    // Check for API key
    const apiKey = process.env.REQUESTY_API_KEY;
    if (!apiKey) {
        console.error('❌ REQUESTY_API_KEY not found in .env.local');
        console.log('Please add REQUESTY_API_KEY=your_key_here to your .env.local file');
        process.exit(1);
    }

    console.log(`✅ Found Requesty API key: ${apiKey.substring(0, 8)}...`);

    // Create Requesty client (matching main app configuration)
    const requestyClient = createRequesty({
        apiKey,
        baseURL: 'https://router.requesty.ai/v1',
        headers: {
            'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://www.chatlima.com/',
            'X-Title': process.env.NEXT_PUBLIC_APP_TITLE || 'ChatLima',
        }
    });

    console.log('📡 Created Requesty client\n');

    // Test multiple models
    for (const testConfig of testConfigs) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🧪 Testing model: ${testConfig.model}`);
        console.log(`📝 Prompt: "${testConfig.prompt}"`);
        console.log(`🎛️  Max tokens: ${testConfig.maxTokens || 'default'}`);
        console.log(`${'='.repeat(60)}`);

        try {
            const startTime = Date.now();

            // Make the request using generateText (similar to streamText but simpler for testing)
            const result = await generateText({
                model: requestyClient(testConfig.model) as any,
                prompt: testConfig.prompt,
            });

            const endTime = Date.now();
            const duration = endTime - startTime;

            console.log(`\n✅ Request completed in ${duration}ms`);
            console.log(`📄 Generated text: "${result.text}"`);

            // Log the complete usage data structure
            console.log('\n📊 USAGE DATA ANALYSIS:');
            console.log('Raw usage object:', JSON.stringify(result.usage, null, 2));

            if (result.usage) {
                console.log('\n🔍 Usage field breakdown:');
                console.log(`- promptTokens: ${(result.usage as any).promptTokens || 'N/A'}`);
                console.log(`- completionTokens: ${(result.usage as any).completionTokens || 'N/A'}`);
                console.log(`- totalTokens: ${(result.usage as any).totalTokens || 'N/A'}`);

                // Check for alternative field names
                const usage = result.usage as any;
                console.log('\n🔍 Alternative field names:');
                console.log(`- inputTokens: ${usage.inputTokens || 'not present'}`);
                console.log(`- outputTokens: ${usage.outputTokens || 'not present'}`);
                console.log(`- prompt_tokens: ${usage.prompt_tokens || 'not present'}`);
                console.log(`- completion_tokens: ${usage.completion_tokens || 'not present'}`);
                console.log(`- input_tokens: ${usage.input_tokens || 'not present'}`);
                console.log(`- output_tokens: ${usage.output_tokens || 'not present'}`);
            } else {
                console.log('❌ No usage data found in response');
            }

            // Log complete response structure for debugging
            console.log('\n🔬 COMPLETE RESPONSE STRUCTURE:');
            console.log('Response keys:', Object.keys(result));
            console.log('Full response (excluding text):', JSON.stringify({
                ...result,
                text: `[TEXT CONTENT: ${result.text.length} chars]` // Abbreviate text for readability
            }, null, 2));

            // Test token extraction like the main app does
            console.log('\n🧮 TOKEN EXTRACTION TEST (simulating main app logic):');
            const usageAny = result.usage as any;
            const extractedInputTokens =
                (result.usage as any)?.promptTokens ||
                usageAny?.inputTokens ||
                usageAny?.prompt_tokens ||
                usageAny?.input_tokens ||
                0;

            const extractedOutputTokens =
                (result.usage as any)?.completionTokens ||
                usageAny?.outputTokens ||
                usageAny?.completion_tokens ||
                usageAny?.output_tokens ||
                0;

            console.log(`Extracted input tokens: ${extractedInputTokens}`);
            console.log(`Extracted output tokens: ${extractedOutputTokens}`);
            console.log(`Extracted total tokens: ${extractedInputTokens + extractedOutputTokens}`);

            if (extractedInputTokens > 0) {
                console.log('✅ Input tokens successfully extracted!');
            } else {
                console.log('❌ Failed to extract input tokens');
            }

        } catch (error: any) {
            console.error(`❌ Error testing ${testConfig.model}:`, error.message);
            if (error.cause) {
                console.error('Error cause:', error.cause);
            }
            if (error.response) {
                console.error('Response data:', error.response);
            }
            console.log('Full error object:', JSON.stringify(error, null, 2));
        }

        // Add delay between requests to be respectful to the API
        if (testConfigs.indexOf(testConfig) < testConfigs.length - 1) {
            console.log('\n⏳ Waiting 2 seconds before next request...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('🏁 Testing completed!');
    console.log(`${'='.repeat(60)}`);
}

// Run the test
testRequestyUsage().catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
});

#!/usr/bin/env tsx

/**
 * OpenRouter Pricing Analysis Tool
 * 
 * This developer-only script fetches pricing information for all OpenRouter models
 * configured in the application and calculates estimated costs for different user types.
 * 
 * Usage: npx tsx scripts/openrouter-pricing-analysis.ts
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface OpenRouterModel {
    id: string;
    name: string;
    description: string;
    context_length: number;
    architecture: {
        modality: string;
        tokenizer: string;
        instruct_type: string;
    };
    pricing: {
        prompt: string;  // Price per token for input
        completion: string;  // Price per token for output
        image?: string;  // Price per image (if applicable)
        request?: string;  // Price per request (if applicable)
    };
    top_provider: {
        context_length: number;
        max_completion_tokens: number | null;
        is_moderated: boolean;
    };
    per_request_limits: {
        prompt_tokens: string;
        completion_tokens: string;
    } | null;
}

interface PricingAnalysis {
    modelId: string;
    displayName: string;
    inputPricePerToken: number;
    outputPricePerToken: number;
    estimatedInputTokens: number;
    estimatedOutputTokens: number;
    costPerMessage: number;
    costAnonDaily: number;  // 10 messages per day
    costGoogleDaily: number;  // 20 messages per day
    costAnonMonthly: number;  // 10 * 30 days
    costGoogleMonthly: number;  // 20 * 30 days
}

// Extract OpenRouter model IDs from our configuration
const openRouterModels = [
    'anthropic/claude-3.5-sonnet',
    'anthropic/claude-3.7-sonnet',
    'anthropic/claude-3.7-sonnet:thinking',
    'deepseek/deepseek-chat-v3-0324',
    'deepseek/deepseek-r1',
    'deepseek/deepseek-r1-0528',
    'deepseek/deepseek-r1-0528-qwen3-8b',
    'google/gemini-2.5-flash-preview',
    'google/gemini-2.5-flash-preview:thinking',
    'google/gemini-2.5-flash-preview-05-20',
    'google/gemini-2.5-flash-preview-05-20:thinking',
    'google/gemini-2.5-pro-preview-03-25',
    'openai/gpt-4.1',
    'openai/gpt-4.1-mini',
    'x-ai/grok-3-beta',
    'x-ai/grok-3-mini-beta',
    'mistralai/mistral-medium-3',
    'mistralai/mistral-small-3.1-24b-instruct',
    'meta-llama/llama-4-maverick',
    'openai/o4-mini-high',
    'qwen/qwq-32b',
    'qwen/qwen3-235b-a22b',
    'anthropic/claude-sonnet-4',
    'anthropic/claude-opus-4'
];

// Model display names mapping
const modelDisplayNames: Record<string, string> = {
    'anthropic/claude-3.5-sonnet': 'Claude 3.5 Sonnet',
    'anthropic/claude-3.7-sonnet': 'Claude 3.7 Sonnet',
    'anthropic/claude-3.7-sonnet:thinking': 'Claude 3.7 Sonnet (thinking)',
    'deepseek/deepseek-chat-v3-0324': 'DeepSeek Chat V3',
    'deepseek/deepseek-r1': 'DeepSeek R1',
    'deepseek/deepseek-r1-0528': 'DeepSeek R1 (0528)',
    'deepseek/deepseek-r1-0528-qwen3-8b': 'DeepSeek R1 0528 Qwen3 8B',
    'google/gemini-2.5-flash-preview': 'Gemini 2.5 Flash Preview',
    'google/gemini-2.5-flash-preview:thinking': 'Gemini 2.5 Flash Preview (thinking)',
    'google/gemini-2.5-flash-preview-05-20': 'Gemini 2.5 Flash Preview (05-20)',
    'google/gemini-2.5-flash-preview-05-20:thinking': 'Gemini 2.5 Flash Preview (05-20, thinking)',
    'google/gemini-2.5-pro-preview-03-25': 'Gemini 2.5 Pro Preview (03-25)',
    'openai/gpt-4.1': 'GPT-4.1',
    'openai/gpt-4.1-mini': 'GPT-4.1 Mini',
    'x-ai/grok-3-beta': 'Grok 3 Beta',
    'x-ai/grok-3-mini-beta': 'Grok 3 Mini Beta',
    'mistralai/mistral-medium-3': 'Mistral Medium 3',
    'mistralai/mistral-small-3.1-24b-instruct': 'Mistral Small 3.1 24B',
    'meta-llama/llama-4-maverick': 'Llama 4 Maverick',
    'openai/o4-mini-high': 'O4 Mini High',
    'qwen/qwq-32b': 'Qwen QWQ 32B',
    'qwen/qwen3-235b-a22b': 'Qwen3 235B A22B',
    'anthropic/claude-sonnet-4': 'Claude 4 Sonnet',
    'anthropic/claude-opus-4': 'Claude 4 Opus'
};

async function fetchOpenRouterModels(): Promise<OpenRouterModel[]> {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY not found in environment variables');
    }

    console.log('🔍 Fetching OpenRouter model data...');

    const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
}

function calculatePricing(models: OpenRouterModel[]): PricingAnalysis[] {
    // Estimated tokens per message (conservative estimates)
    const ESTIMATED_INPUT_TOKENS = 500;  // User prompt + context
    const ESTIMATED_OUTPUT_TOKENS = 300; // AI response

    const analyses: PricingAnalysis[] = [];

    for (const model of models) {
        if (!openRouterModels.includes(model.id)) {
            continue; // Skip models not in our configuration
        }

        const inputPricePerToken = parseFloat(model.pricing.prompt);
        const outputPricePerToken = parseFloat(model.pricing.completion);

        const inputCost = (ESTIMATED_INPUT_TOKENS * inputPricePerToken) / 1000000; // Convert from per-million to actual
        const outputCost = (ESTIMATED_OUTPUT_TOKENS * outputPricePerToken) / 1000000;
        const costPerMessage = inputCost + outputCost;

        analyses.push({
            modelId: model.id,
            displayName: modelDisplayNames[model.id] || model.name,
            inputPricePerToken,
            outputPricePerToken,
            estimatedInputTokens: ESTIMATED_INPUT_TOKENS,
            estimatedOutputTokens: ESTIMATED_OUTPUT_TOKENS,
            costPerMessage,
            costAnonDaily: costPerMessage * 10,  // 10 messages per day for anon
            costGoogleDaily: costPerMessage * 20, // 20 messages per day for Google users
            costAnonMonthly: costPerMessage * 10 * 30,  // Monthly cost for anon
            costGoogleMonthly: costPerMessage * 20 * 30, // Monthly cost for Google users
        });
    }

    // Sort by cost per message (descending - most expensive first)
    return analyses.sort((a, b) => b.costPerMessage - a.costPerMessage);
}

function formatCurrency(amount: number): string {
    return `$${amount.toFixed(6)}`;
}

function displayPricingTable(analyses: PricingAnalysis[]): void {
    console.log('\n📊 OpenRouter Model Pricing Analysis');
    console.log('=====================================\n');

    // Table header
    console.log('Model'.padEnd(35) +
        'Input/M'.padEnd(12) +
        'Output/M'.padEnd(12) +
        'Per Msg'.padEnd(12) +
        'Anon Daily'.padEnd(12) +
        'Google Daily'.padEnd(14) +
        'Anon Monthly'.padEnd(14) +
        'Google Monthly');
    console.log('-'.repeat(35 + 12 + 12 + 12 + 12 + 14 + 14 + 14));

    // Table rows
    for (const analysis of analyses) {
        console.log(
            analysis.displayName.substring(0, 34).padEnd(35) +
            formatCurrency(analysis.inputPricePerToken).padEnd(12) +
            formatCurrency(analysis.outputPricePerToken).padEnd(12) +
            formatCurrency(analysis.costPerMessage).padEnd(12) +
            formatCurrency(analysis.costAnonDaily).padEnd(12) +
            formatCurrency(analysis.costGoogleDaily).padEnd(14) +
            formatCurrency(analysis.costAnonMonthly).padEnd(14) +
            formatCurrency(analysis.costGoogleMonthly)
        );
    }

    console.log('\n💡 Notes:');
    console.log(`• Input/Output pricing is per million tokens`);
    console.log(`• Per message estimate: ${analyses[0]?.estimatedInputTokens || 500} input + ${analyses[0]?.estimatedOutputTokens || 300} output tokens`);
    console.log('• Anonymous users: 10 messages/day limit');
    console.log('• Google users: 20 messages/day limit');
    console.log('• Monthly estimates assume 30 days');
}

function displayCostSummary(analyses: PricingAnalysis[]): void {
    if (analyses.length === 0) return;

    const mostExpensive = analyses[0];
    const cheapest = analyses[analyses.length - 1];

    console.log('\n💰 Cost Summary');
    console.log('===============\n');

    console.log('🔥 MOST EXPENSIVE MODEL:');
    console.log(`   ${mostExpensive.displayName}`);
    console.log(`   Anonymous users (10 msg/day): ${formatCurrency(mostExpensive.costAnonDaily)}/day, ${formatCurrency(mostExpensive.costAnonMonthly)}/month`);
    console.log(`   Google users (20 msg/day): ${formatCurrency(mostExpensive.costGoogleDaily)}/day, ${formatCurrency(mostExpensive.costGoogleMonthly)}/month`);

    console.log('\n💚 CHEAPEST MODEL:');
    console.log(`   ${cheapest.displayName}`);
    console.log(`   Anonymous users (10 msg/day): ${formatCurrency(cheapest.costAnonDaily)}/day, ${formatCurrency(cheapest.costAnonMonthly)}/month`);
    console.log(`   Google users (20 msg/day): ${formatCurrency(cheapest.costGoogleDaily)}/day, ${formatCurrency(cheapest.costGoogleMonthly)}/month`);

    const ratio = mostExpensive.costPerMessage / cheapest.costPerMessage;
    console.log(`\n📈 Price Difference: Most expensive is ${ratio.toFixed(1)}x more costly than cheapest`);
}

async function main(): Promise<void> {
    try {
        console.log('🚀 OpenRouter Pricing Analysis Tool');
        console.log('===================================\n');

        const models = await fetchOpenRouterModels();
        console.log(`✅ Fetched ${models.length} total models from OpenRouter`);

        const analyses = calculatePricing(models);
        console.log(`📋 Analyzing ${analyses.length} models configured in ChatLima`);

        displayPricingTable(analyses);
        displayCostSummary(analyses);

        console.log('\n✨ Analysis complete!');

    } catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
} 
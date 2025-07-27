#!/usr/bin/env tsx

/**
 * Dynamic API Pricing Analysis Tool
 * 
 * This developer-only script fetches all available models from OpenRouter and Requesty
 * using the existing application infrastructure and calculates cost estimates for different user types.
 * 
 * Usage: npx tsx scripts/dynamic-api-pricing-analysis.ts
 */

import dotenv from 'dotenv';
import { fetchAllModels, getEnvironmentApiKeys } from '@/lib/models/fetch-models';
import { ModelInfo } from '@/lib/types/models';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

interface UserTier {
    name: string;
    dailyMessages: number;
    monthlyMessages: number;
    description: string;
    canUsePremium: boolean;
}

interface PricingAnalysis {
    model: ModelInfo;
    costPerMessage: number;
    costAnonDaily: number;
    costAnonMonthly: number;
    costGoogleDaily: number;
    costGoogleMonthly: number;
    isPremium: boolean;
    hasValidPricing: boolean;
}

// User tiers based on the actual application logic
const USER_TIERS: UserTier[] = [
    {
        name: 'Anonymous',
        dailyMessages: 10,
        monthlyMessages: 10 * 30,
        description: 'Unregistered users',
        canUsePremium: false
    },
    {
        name: 'Google Auth',
        dailyMessages: 20,
        monthlyMessages: 20 * 30,
        description: 'Google-authenticated users without credits',
        canUsePremium: false
    },
    {
        name: 'Credit Users',
        dailyMessages: Infinity,
        monthlyMessages: Infinity,
        description: 'Users with purchased Polar credits',
        canUsePremium: true
    }
];

// Estimated tokens per message based on actual usage patterns
const ESTIMATED_INPUT_TOKENS = 2701;  // User prompt + context (avg: 2251 + 20% buffer)
const ESTIMATED_OUTPUT_TOKENS = 441;  // AI response (avg: 368 + 20% buffer)

function calculateModelPricing(models: ModelInfo[]): PricingAnalysis[] {
    const analyses: PricingAnalysis[] = [];

    for (const model of models) {
        // Skip models without pricing information
        if (!model.pricing?.input || !model.pricing?.output) {
            analyses.push({
                model,
                costPerMessage: 0,
                costAnonDaily: 0,
                costAnonMonthly: 0,
                costGoogleDaily: 0,
                costGoogleMonthly: 0,
                isPremium: model.premium,
                hasValidPricing: false
            });
            continue;
        }

        // Skip models with invalid pricing (negative, zero, or unreasonably high)
        if (model.pricing.input <= 0 || model.pricing.output <= 0 ||
            model.pricing.input > 1000 || model.pricing.output > 1000) {
            console.warn(`⚠️  Skipping model with invalid pricing: ${model.name} (input: ${model.pricing.input}, output: ${model.pricing.output})`);
            analyses.push({
                model,
                costPerMessage: 0,
                costAnonDaily: 0,
                costAnonMonthly: 0,
                costGoogleDaily: 0,
                costGoogleMonthly: 0,
                isPremium: model.premium,
                hasValidPricing: false
            });
            continue;
        }

        // Calculate cost per message (pricing is per token, need to convert to per message)
        const inputCost = (ESTIMATED_INPUT_TOKENS * model.pricing.input) / 1000000; // Convert from per-million to actual
        const outputCost = (ESTIMATED_OUTPUT_TOKENS * model.pricing.output) / 1000000;
        const costPerMessage = inputCost + outputCost;

        analyses.push({
            model,
            costPerMessage,
            costAnonDaily: costPerMessage * USER_TIERS[0].dailyMessages,
            costAnonMonthly: costPerMessage * USER_TIERS[0].monthlyMessages,
            costGoogleDaily: costPerMessage * USER_TIERS[1].dailyMessages,
            costGoogleMonthly: costPerMessage * USER_TIERS[1].monthlyMessages,
            isPremium: model.premium,
            hasValidPricing: true
        });
    }

    // Sort by cost per message (descending - most expensive first)
    return analyses.sort((a, b) => b.costPerMessage - a.costPerMessage);
}

function formatCurrency(amount: number): string {
    if (amount === 0) return '$0.00';
    if (amount === Infinity) return '∞';
    if (amount < 0.000001) return `$${amount.toExponential(2)}`;
    if (amount < 0.01) return `$${amount.toFixed(6)}`;
    if (amount < 1) return `$${amount.toFixed(4)}`;
    return `$${amount.toFixed(2)}`;
}

function displayPricingTable(analyses: PricingAnalysis[]): void {
    console.log('\n📊 Dynamic API Model Pricing Analysis');
    console.log('=====================================\n');

    if (analyses.length === 0) {
        console.log('❌ No models found to analyze.');
        return;
    }

    // Separate models by pricing validity and premium status
    const validPricingModels = analyses.filter(a => a.hasValidPricing);
    const noPricingModels = analyses.filter(a => !a.hasValidPricing);
    const premiumModels = validPricingModels.filter(a => a.isPremium);
    const freeModels = validPricingModels.filter(a => !a.isPremium);

    console.log(`📈 Found ${analyses.length} total models:`);
    console.log(`   • ${validPricingModels.length} with pricing data (${premiumModels.length} premium, ${freeModels.length} standard)`);
    console.log(`   • ${noPricingModels.length} without pricing data`);
    console.log(`\n💡 Token estimates: ${ESTIMATED_INPUT_TOKENS} input + ${ESTIMATED_OUTPUT_TOKENS} output tokens per message\n`);

    // Table header
    console.log('Provider'.padEnd(10) +
        'Model'.padEnd(40) +
        'Type'.padEnd(8) +
        'Input/M'.padEnd(10) +
        'Output/M'.padEnd(10) +
        'Per Msg'.padEnd(10) +
        'Anon Daily'.padEnd(12) +
        'Google Daily'.padEnd(14) +
        'Anon Monthly'.padEnd(14) +
        'Google Monthly');
    console.log('-'.repeat(10 + 40 + 8 + 10 + 10 + 10 + 12 + 14 + 14 + 14));

    // Display models with valid pricing first
    for (const analysis of validPricingModels) {
        const model = analysis.model;
        const modelName = model.name.substring(0, 39);
        const premium = analysis.isPremium ? 'Premium' : 'Standard';

        console.log(
            model.provider.padEnd(10) +
            modelName.padEnd(40) +
            premium.padEnd(8) +
            formatCurrency(model.pricing!.input!).padEnd(10) +
            formatCurrency(model.pricing!.output!).padEnd(10) +
            formatCurrency(analysis.costPerMessage).padEnd(10) +
            formatCurrency(analysis.costAnonDaily).padEnd(12) +
            formatCurrency(analysis.costGoogleDaily).padEnd(14) +
            formatCurrency(analysis.costAnonMonthly).padEnd(14) +
            formatCurrency(analysis.costGoogleMonthly)
        );
    }

    // Display models without pricing
    if (noPricingModels.length > 0) {
        console.log('\n⚠️  Models without pricing data:');
        for (const analysis of noPricingModels) {
            const model = analysis.model;
            console.log(`   • ${model.provider} - ${model.name} (${model.premium ? 'Premium' : 'Standard'})`);
        }
    }
}

function displayUserTierAnalysis(analyses: PricingAnalysis[]): void {
    const validModels = analyses.filter(a => a.hasValidPricing);
    if (validModels.length === 0) return;

    console.log('\n👥 User Tier Analysis');
    console.log('=====================\n');

    for (const tier of USER_TIERS) {
        console.log(`🔹 ${tier.name} Users:`);
        console.log(`   ${tier.description}`);
        console.log(`   Daily limit: ${tier.dailyMessages === Infinity ? 'No limit (credit-based)' : `${tier.dailyMessages} messages`}`);
        console.log(`   Premium models: ${tier.canUsePremium ? '✅ Available' : '❌ Not available'}`);

        if (tier.dailyMessages !== Infinity) {
            const availableModels = validModels.filter(a => tier.canUsePremium || !a.isPremium);
            if (availableModels.length > 0) {
                const cheapest = availableModels[availableModels.length - 1];
                const mostExpensive = availableModels[0];

                const dailyCostRange = tier.name === 'Anonymous' ?
                    `${formatCurrency(cheapest.costAnonDaily)} - ${formatCurrency(mostExpensive.costAnonDaily)}` :
                    `${formatCurrency(cheapest.costGoogleDaily)} - ${formatCurrency(mostExpensive.costGoogleDaily)}`;

                const monthlyCostRange = tier.name === 'Anonymous' ?
                    `${formatCurrency(cheapest.costAnonMonthly)} - ${formatCurrency(mostExpensive.costAnonMonthly)}` :
                    `${formatCurrency(cheapest.costGoogleMonthly)} - ${formatCurrency(mostExpensive.costGoogleMonthly)}`;

                console.log(`   Daily cost range: ${dailyCostRange}`);
                console.log(`   Monthly cost range: ${monthlyCostRange}`);
                console.log(`   Available models: ${availableModels.length}/${validModels.length}`);
            }
        } else {
            console.log(`   Cost: Pay-per-token based on actual usage`);
            console.log(`   Available models: ${validModels.length}/${validModels.length} (including premium)`);
        }
        console.log('');
    }
}

function displayCostSummary(analyses: PricingAnalysis[]): void {
    const validModels = analyses.filter(a => a.hasValidPricing);
    if (validModels.length === 0) return;

    const premiumModels = validModels.filter(a => a.isPremium);
    const standardModels = validModels.filter(a => !a.isPremium);

    console.log('\n💰 Cost Summary');
    console.log('===============\n');

    if (validModels.length > 0) {
        const mostExpensive = validModels[0];
        const cheapest = validModels[validModels.length - 1];

        console.log('🔥 MOST EXPENSIVE MODEL:');
        console.log(`   ${mostExpensive.model.provider} - ${mostExpensive.model.name} ${mostExpensive.isPremium ? '(Premium)' : ''}`);
        console.log(`   Cost per message: ${formatCurrency(mostExpensive.costPerMessage)}`);
        console.log(`   Anonymous users: ${formatCurrency(mostExpensive.costAnonDaily)}/day, ${formatCurrency(mostExpensive.costAnonMonthly)}/month`);
        console.log(`   Google users: ${formatCurrency(mostExpensive.costGoogleDaily)}/day, ${formatCurrency(mostExpensive.costGoogleMonthly)}/month`);

        console.log('\n💚 CHEAPEST MODEL:');
        console.log(`   ${cheapest.model.provider} - ${cheapest.model.name} ${cheapest.isPremium ? '(Premium)' : ''}`);
        console.log(`   Cost per message: ${formatCurrency(cheapest.costPerMessage)}`);
        console.log(`   Anonymous users: ${formatCurrency(cheapest.costAnonDaily)}/day, ${formatCurrency(cheapest.costAnonMonthly)}/month`);
        console.log(`   Google users: ${formatCurrency(cheapest.costGoogleDaily)}/day, ${formatCurrency(cheapest.costGoogleMonthly)}/month`);

        const ratio = mostExpensive.costPerMessage / cheapest.costPerMessage;
        console.log(`\n📈 Price Difference: Most expensive is ${ratio.toFixed(1)}x more costly than cheapest`);
    }

    // Provider breakdown
    const openRouterModels = validModels.filter(a => a.model.provider === 'OpenRouter');
    const requestyModels = validModels.filter(a => a.model.provider === 'Requesty');

    console.log('\n📊 Provider Breakdown:');
    console.log(`   OpenRouter: ${openRouterModels.length} models (${openRouterModels.filter(a => a.isPremium).length} premium)`);
    console.log(`   Requesty: ${requestyModels.length} models (${requestyModels.filter(a => a.isPremium).length} premium)`);

    if (openRouterModels.length > 0) {
        const avgCost = openRouterModels.reduce((sum, m) => sum + m.costPerMessage, 0) / openRouterModels.length;
        console.log(`   Average OpenRouter cost per message: ${formatCurrency(avgCost)}`);
    }

    if (requestyModels.length > 0) {
        const avgCost = requestyModels.reduce((sum, m) => sum + m.costPerMessage, 0) / requestyModels.length;
        console.log(`   Average Requesty cost per message: ${formatCurrency(avgCost)}`);
    }

    if (premiumModels.length > 0) {
        console.log(`\n⭐ Premium Model Analysis:`);
        console.log(`   Premium models: ${premiumModels.length}/${validModels.length} (${((premiumModels.length / validModels.length) * 100).toFixed(1)}%)`);
        const avgPremiumCost = premiumModels.reduce((sum, m) => sum + m.costPerMessage, 0) / premiumModels.length;
        const avgStandardCost = standardModels.length > 0 ?
            standardModels.reduce((sum, m) => sum + m.costPerMessage, 0) / standardModels.length : 0;

        console.log(`   Average premium cost: ${formatCurrency(avgPremiumCost)}/message`);
        if (avgStandardCost > 0) {
            console.log(`   Average standard cost: ${formatCurrency(avgStandardCost)}/message`);
            console.log(`   Premium markup: ${(avgPremiumCost / avgStandardCost).toFixed(1)}x`);
        }
    }

    // Show invalid pricing models summary
    const invalidModels = analyses.filter(a => !a.hasValidPricing);
    if (invalidModels.length > 0) {
        console.log(`\n⚠️  Data Quality Issues:`);
        console.log(`   ${invalidModels.length} models with invalid/missing pricing data`);
        console.log(`   These models are excluded from cost analysis`);
    }
}

async function main(): Promise<void> {
    try {
        console.log('🚀 Dynamic API Pricing Analysis Tool');
        console.log('====================================\n');

        // Get environment API keys
        const envKeys = getEnvironmentApiKeys();
        const hasOpenRouterKey = !!envKeys.OPENROUTER_API_KEY;
        const hasRequestyKey = !!envKeys.REQUESTY_API_KEY;

        if (!hasOpenRouterKey && !hasRequestyKey) {
            console.log('⚠️  No API keys found. To analyze pricing, set one or both of:');
            console.log('   • OPENROUTER_API_KEY for OpenRouter models');
            console.log('   • REQUESTY_API_KEY for Requesty models');
            console.log('\n   Example:');
            console.log('   export OPENROUTER_API_KEY="sk-or-your-key"');
            console.log('   export REQUESTY_API_KEY="rq-your-key"');
            return;
        }

        console.log('🔍 Fetching models from configured providers...');
        console.log(`   • OpenRouter: ${hasOpenRouterKey ? '✅' : '❌'}`);
        console.log(`   • Requesty: ${hasRequestyKey ? '✅' : '❌'}`);

        // Fetch all models using the existing infrastructure
        const response = await fetchAllModels({ environment: envKeys }, true);

        console.log(`\n✅ Successfully fetched ${response.models.length} models`);
        console.log(`   • Cache hit: ${response.metadata.cacheHit ? 'Yes' : 'No'}`);
        console.log(`   • Last updated: ${response.metadata.lastUpdated.toISOString()}`);

        // Display provider status
        console.log('\n🏥 Provider Health:');
        for (const [providerKey, provider] of Object.entries(response.metadata.providers)) {
            const statusIcon = provider.status === 'healthy' ? '✅' :
                provider.status === 'degraded' ? '⚠️' : '❌';
            console.log(`   • ${provider.name}: ${statusIcon} ${provider.status} (${provider.modelCount} models)`);
            if (provider.error) {
                console.log(`     Error: ${provider.error}`);
            }
        }

        // Calculate pricing analysis
        const analyses = calculateModelPricing(response.models);

        // Display results
        displayPricingTable(analyses);
        displayUserTierAnalysis(analyses);
        displayCostSummary(analyses);

        console.log('\n✨ Analysis complete!');
        console.log('\n💡 Notes:');
        console.log('• Pricing shown is per million tokens (input/output)');
        console.log('• Premium models require purchased credits');
        console.log('• Anonymous users limited to standard models only');
        console.log('• Monthly estimates assume full daily usage for 30 days');

    } catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
} 
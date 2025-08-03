/**
 * Backfill missing token_usage_metrics from polar_usage_events
 * 
 * This script addresses the critical data loss where analytics logging failed
 * but billing continued to work, creating a discrepancy between systems.
 */

import { db } from '../lib/db';
import { tokenUsageMetrics, polarUsageEvents } from '../lib/db/schema';
import { nanoid } from 'nanoid';
import { eq, sql, not, exists } from 'drizzle-orm';

interface PolarEvent {
    id: string;
    userId: string;
    polarCustomerId: string | null;
    eventName: string;
    eventPayload: {
        credits_consumed: number;
        additionalCost?: number;
        timestamp: string;
        originalCompletionTokens?: number;
        source?: string;
        skippedPolarReporting?: boolean;
        reason?: string;
    };
    createdAt: Date;
}

// Estimation functions for missing token data
function estimateTokensFromCredits(credits: number, additionalCost: number = 0): {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
} {
    // Base credits calculation: 1 credit = base usage + additionalCost
    const baseCredits = Math.max(1, credits - additionalCost);

    // Rough estimation based on average usage patterns
    // Most interactions are between 100-2000 tokens
    const estimatedTotalTokens = Math.max(100, baseCredits * 500); // Conservative estimate

    // Typical split: ~30% input, 70% output for chat completions
    const inputTokens = Math.floor(estimatedTotalTokens * 0.3);
    const outputTokens = Math.floor(estimatedTotalTokens * 0.7);

    return {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens
    };
}

function estimateCostFromTokens(inputTokens: number, outputTokens: number): {
    estimatedCost: number;
    actualCost: number;
} {
    // Conservative cost estimation for OpenRouter models
    // Average: $0.001 per 1K input tokens, $0.002 per 1K output tokens
    const inputCost = (inputTokens / 1000) * 0.001;
    const outputCost = (outputTokens / 1000) * 0.002;
    const totalCost = inputCost + outputCost;

    return {
        estimatedCost: Math.max(0.000001, totalCost), // Minimum cost
        actualCost: totalCost
    };
}

function extractModelFromTimestamp(timestamp: string): string {
    // Since we don't have model info in polar events, estimate based on time periods
    const date = new Date(timestamp);

    if (date >= new Date('2025-07-01')) {
        return 'openrouter/meta-llama/llama-3.1-8b-instruct:free'; // Recent free model
    } else if (date >= new Date('2025-06-01')) {
        return 'openrouter/google/gemma-7b-it:free'; // Mid-period model
    } else {
        return 'openrouter/mistralai/mistral-7b-instruct:free'; // Early period model
    }
}

async function backfillTokenMetrics() {
    console.log('🔄 Starting token metrics backfill process...');

    try {
        // Step 1: Find all polar_usage_events that don't have corresponding token_usage_metrics
        console.log('📊 Analyzing missing analytics records...');

        const missingEvents = await db
            .select()
            .from(polarUsageEvents)
            .where(
                and(
                    eq(polarUsageEvents.eventName, 'message.processed'),
                    not(
                        exists(
                            db.select().from(tokenUsageMetrics)
                                .where(eq(tokenUsageMetrics.userId, polarUsageEvents.userId))
                            // Note: We can't perfectly match on timestamp due to slight differences
                            // So we'll use a broader approach and check for rough time matches
                        )
                    )
                )
            )
            .orderBy(polarUsageEvents.createdAt);

        console.log(`📈 Found ${missingEvents.length} missing analytics records to backfill`);

        if (missingEvents.length === 0) {
            console.log('✅ No missing records found. Analytics are up to date.');
            return;
        }

        // Step 2: Process in batches to avoid overwhelming the database
        const BATCH_SIZE = 100;
        let processed = 0;
        let successful = 0;
        let errors = 0;

        for (let i = 0; i < missingEvents.length; i += BATCH_SIZE) {
            const batch = missingEvents.slice(i, i + BATCH_SIZE);
            console.log(`🔄 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(missingEvents.length / BATCH_SIZE)} (${batch.length} records)`);

            for (const event of batch) {
                try {
                    processed++;

                    // Extract data from polar event
                    const credits = event.eventPayload.credits_consumed || 1;
                    const additionalCost = event.eventPayload.additionalCost || 0;
                    const timestamp = event.eventPayload.timestamp || event.createdAt.toISOString();

                    // Estimate token usage
                    const { inputTokens, outputTokens, totalTokens } = estimateTokensFromCredits(credits, additionalCost);

                    // Estimate costs
                    const { estimatedCost, actualCost } = estimateCostFromTokens(inputTokens, outputTokens);

                    // Generate plausible model ID
                    const modelId = extractModelFromTimestamp(timestamp);
                    const provider = 'openrouter';

                    // Generate synthetic but consistent message and chat IDs
                    const chatId = `backfill-chat-${event.id.substring(0, 8)}`;
                    const messageId = `backfill-msg-${event.id}`;

                    // Create backfilled token usage record
                    await db.insert(tokenUsageMetrics).values({
                        id: nanoid(),
                        userId: event.userId,
                        chatId,
                        messageId,
                        modelId,
                        provider,
                        inputTokens,
                        outputTokens,
                        totalTokens,
                        estimatedCost: estimatedCost.toString(),
                        actualCost: actualCost.toString(),
                        currency: 'USD',
                        processingTimeMs: null,
                        status: 'completed',
                        errorMessage: null,
                        metadata: {
                            backfilled: true,
                            backfillDate: new Date().toISOString(),
                            sourceEventId: event.id,
                            originalCredits: credits,
                            additionalCost,
                            webSearchEnabled: additionalCost > 0,
                            estimatedData: true,
                            backfillReason: 'Analytics logging failure - recovered from billing records'
                        },
                        createdAt: event.createdAt, // Use original timestamp
                        updatedAt: new Date(),
                    });

                    successful++;

                    if (processed % 50 === 0) {
                        console.log(`   ✅ Processed ${processed}/${missingEvents.length} records (${successful} successful, ${errors} errors)`);
                    }

                } catch (error) {
                    errors++;
                    console.error(`   ❌ Error processing event ${event.id}:`, error);

                    // Continue processing other records even if one fails
                    continue;
                }
            }

            // Brief pause between batches to avoid overwhelming the database
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log('🎉 Backfill completed!');
        console.log(`📊 Final Results:`);
        console.log(`   • Total events processed: ${processed}`);
        console.log(`   • Successfully backfilled: ${successful}`);
        console.log(`   • Errors: ${errors}`);
        console.log(`   • Success rate: ${((successful / processed) * 100).toFixed(1)}%`);

        // Step 3: Verify the backfill
        const finalAnalyticsCount = await db.select({ count: sql<number>`count(*)` }).from(tokenUsageMetrics);
        const finalBillingCount = await db.select({ count: sql<number>`count(*)` }).from(polarUsageEvents).where(eq(polarUsageEvents.eventName, 'message.processed'));

        console.log(`🔍 Verification:`);
        console.log(`   • Analytics records: ${finalAnalyticsCount[0].count}`);
        console.log(`   • Billing records: ${finalBillingCount[0].count}`);
        console.log(`   • Coverage: ${((finalAnalyticsCount[0].count / finalBillingCount[0].count) * 100).toFixed(1)}%`);

        if (finalAnalyticsCount[0].count >= finalBillingCount[0].count * 0.95) {
            console.log('✅ Backfill successful! Analytics coverage is now >95%');
        } else {
            console.log('⚠️  Some records may still be missing. Consider running the script again.');
        }

    } catch (error) {
        console.error('💥 Fatal error during backfill:', error);
        throw error;
    }
}

// Add import fix at the top
import { and } from 'drizzle-orm';

// Run the backfill if this script is executed directly
if (require.main === module) {
    backfillTokenMetrics()
        .then(() => {
            console.log('🏁 Backfill process completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Backfill process failed:', error);
            process.exit(1);
        });
}

export { backfillTokenMetrics };
import { reportAIUsage, getRemainingCredits, getRemainingCreditsByExternalId } from './polar';
import { db } from './db';
import { users, polarUsageEvents } from './db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { modelID } from '@/ai/providers';
import { ModelInfo } from '@/lib/types/models';

/**
 * Cost in credits for enabling Web Search feature
 */
export const WEB_SEARCH_COST = 5;

/**
 * Tracks token usage for a user's chat session and reports it to Polar for billing.
 * @param userId The ID of the user
 * @param polarCustomerId Optional Polar customer ID
 * @param completionTokens Number of tokens to report
 * @param isAnonymous Whether the user is anonymous
 * @param shouldDeductCredits Whether to actually deduct credits (only for users with purchased credits)
 * @param additionalCost Additional credits to deduct (e.g., for premium features like web search)
 */
export async function trackTokenUsage(
    userId: string,
    polarCustomerId: string | undefined,
    completionTokens: number,
    isAnonymous: boolean = false,
    shouldDeductCredits: boolean = true,
    additionalCost: number = 0
): Promise<void> {
    try {
        // Check if the user exists in the database first
        const userExists = await db.query.users.findFirst({
            where: eq(users.id, userId)
        });

        if (!userExists) {
            console.warn(`User ${userId} not found in database. Skipping usage tracking.`);
            return;
        }

        // Calculate total credits to consume (base 1 credit + additional cost)
        const totalCreditsToConsume = shouldDeductCredits ? 1 + additionalCost : 0;

        // Additional properties we might want to track about this usage event
        const additionalProperties = {
            timestamp: new Date().toISOString(),
            source: 'chat-completion',
            additionalCost: additionalCost
        };

        // Only report to Polar if user has purchased credits and should be charged
        if (!isAnonymous && shouldDeductCredits) {
            // Report the usage to Polar and log it in our database
            // Pass totalCreditsToConsume for actual billing, original completionTokens for logging
            try {
                await reportAIUsage(userId, totalCreditsToConsume, polarCustomerId, additionalProperties);
            } catch (polarError) {
                console.error(`Error reporting AI usage to Polar:`, polarError);
                // Continue execution - this is logged but not critical to the chat flow
            }
        } else {
            // For anonymous users or users using free daily messages, just log locally without reporting to Polar
            const reason = isAnonymous ? 'anonymous user' : 'user using free daily messages';
            console.log(`Skipping Polar reporting for ${reason} ${userId} (${totalCreditsToConsume} credits would be consumed, ${completionTokens} tokens calculated)`)

            // Still log in our local database for analytics
            await db.insert(polarUsageEvents).values({
                id: nanoid(),
                userId,
                polarCustomerId, // Will be null/undefined for anonymous users
                eventName: 'message.processed', // New event name
                eventPayload: {
                    credits_consumed: totalCreditsToConsume, // Track total credits that would be consumed
                    originalCompletionTokens: completionTokens, // Keep original tokens for local logs if desired
                    ...additionalProperties,
                    skippedPolarReporting: true,
                    reason: reason
                },
                createdAt: new Date()
            });
        }
    } catch (error) {
        // Log the error but don't throw - we don't want to break the chat flow
        // if usage tracking fails
        console.error('Error tracking token usage:', error);
    }
}

/**
 * Checks if a user has enough credits to complete a request.
 * @param polarCustomerId The customer ID in Polar (legacy)
 * @param userId The user ID in our application (used as external ID in Polar)
 * @param requiredTokens Estimated number of tokens needed
 * @param isAnonymous Whether the user is anonymous
 * @param modelInfo Optional model information for premium model checks
 * @returns True if the user has enough credits, false otherwise
 */
export async function hasEnoughCredits(
    polarCustomerId: string | undefined,
    userId: string | undefined,
    requiredTokens: number = 1,
    isAnonymous: boolean = false,
    modelInfo?: ModelInfo
): Promise<boolean> {
    // For anonymous users, skip Polar credit checks completely
    // They're already limited by the daily message count
    if (isAnonymous) {
        return false; // Anonymous users cannot access any model requiring credit check, including premium.
    }

    // Check if the selected model is premium
    const isPremiumModel = modelInfo?.premium === true;

    // First, try to get credits via external ID if userId is provided
    if (userId) {
        try {
            const remainingCreditsByExternal = await getRemainingCreditsByExternalId(userId);

            // If we got a valid result (including 0), use it
            if (remainingCreditsByExternal !== null) {
                // If it's a premium model, user must have more than 0 credits.
                // For non-premium, the standard check of remainingCredits >= requiredTokens applies.
                if (isPremiumModel) {
                    return remainingCreditsByExternal > 0;
                }
                return remainingCreditsByExternal >= requiredTokens;
            }
            // If we got null, this means no Polar customer exists (e.g., Google user with no purchase)
            // For these users, we should return false so they fall back to daily message limits
            console.log(`No Polar customer found for user ${userId}, falling back to daily message limits`);
            return false;
        } catch (error) {
            console.warn('Error checking credits by external ID:', error);
            // Fall through to the legacy method
        }
    }

    // Legacy method: use polarCustomerId if provided
    if (polarCustomerId) {
        try {
            const remainingCredits = await getRemainingCredits(polarCustomerId);

            // If we couldn't determine the credits (null), this means no Polar customer/meter
            // For these users, we should return false so they fall back to daily message limits
            if (remainingCredits === null) {
                console.log(`No Polar meter found for customer ${polarCustomerId}, falling back to daily message limits`);
                return false;
            }

            // If it's a premium model, user must have more than 0 credits.
            // For non-premium, the standard check of remainingCredits >= requiredTokens applies.
            if (isPremiumModel) {
                return remainingCredits > 0;
            }
            return remainingCredits >= requiredTokens;
        } catch (error) {
            // Log the error and fall back to daily message limits
            console.error('Error checking credits by customer ID:', error);
            return false;
        }
    }

    // If we reach here, we either had no IDs or all methods failed.
    // For users without credits (e.g., Google users who haven't purchased), we should return false
    // so they fall back to daily message limits instead of bypassing them.
    console.log('No credit information available, falling back to daily message limits');
    return false;
} 
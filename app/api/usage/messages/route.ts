import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { DailyMessageUsageService } from '@/lib/services/dailyMessageUsageService';
import { getRemainingCreditsByExternalId, getSubscriptionTypeByExternalId, hasUnlimitedFreeModels } from '@/lib/polar';

/**
 * API endpoint to get message usage information for the current user
 */
export async function GET(req: Request) {
    try {
        // Get the authenticated session
        const session = await auth.api.getSession({ headers: req.headers });

        // If no session exists, return error
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const isAnonymous = (session.user as any).isAnonymous === true;

        // Get daily message usage using new secure tracking
        const dailyUsage = await DailyMessageUsageService.getDailyUsage(userId);

        // Get subscription type and unlimited free models access from Polar customer state
        // Subscription type comes from customer state, not webhooks
        let subscriptionType: 'monthly' | 'yearly' | null = null;
        let hasUnlimitedFreeModelsAccess = false;
        let hasSubscription = false;

        if (!isAnonymous && userId) {
            try {
                // Get subscription type directly from Polar customer state
                // Pass email as fallback in case customer was created during checkout
                const userEmail = session.user.email || undefined;
                subscriptionType = await getSubscriptionTypeByExternalId(userId, userEmail);
                hasSubscription = subscriptionType !== null;

                // Yearly subscription means unlimited free models
                hasUnlimitedFreeModelsAccess = subscriptionType === 'yearly';
            } catch (error) {
                console.warn('Failed to get subscription info:', error);
            }
        }

        // Also check for credits (for authenticated users, but skip if they have yearly subscription)
        let credits = 0;
        let hasCredits = false;
        let usedCredits = false;

        // Only check credits if user doesn't have unlimited free models and has a subscription
        if (!isAnonymous && !hasUnlimitedFreeModelsAccess && hasSubscription) {
            try {
                const userCredits = await getRemainingCreditsByExternalId(userId);
                if (typeof userCredits === 'number') {
                    credits = userCredits;
                    hasCredits = userCredits > 0;
                    usedCredits = true;
                }
            } catch (error) {
                console.warn('Failed to get credits for user:', error);
            }
        }

        return NextResponse.json({
            limit: dailyUsage.limit,
            used: dailyUsage.messageCount,
            remaining: dailyUsage.remaining,
            isAnonymous: dailyUsage.isAnonymous,
            // Check if user has a Polar subscription (from customer state)
            hasSubscription,
            subscriptionType,
            hasUnlimitedFreeModels: hasUnlimitedFreeModelsAccess,
            // Include credit information
            credits,
            hasCredits,
            usedCredits,
            // Additional info from new system
            date: dailyUsage.date,
            hasReachedLimit: dailyUsage.hasReachedLimit
        });
    } catch (error) {
        console.error('Error getting message usage:', error);
        return NextResponse.json(
            { error: 'Failed to get message usage' },
            { status: 500 }
        );
    }
} 
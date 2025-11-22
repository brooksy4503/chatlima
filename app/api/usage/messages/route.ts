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

        // Also check for credits (for authenticated users)
        let credits = 0;
        let hasCredits = false;
        let usedCredits = false;

        if (!isAnonymous) {
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

        // Get subscription type and unlimited free models access
        let subscriptionType: 'monthly' | 'yearly' | null = null;
        let hasUnlimitedFreeModelsAccess = false;
        
        if (!isAnonymous && userId) {
            try {
                subscriptionType = await getSubscriptionTypeByExternalId(userId);
                hasUnlimitedFreeModelsAccess = await hasUnlimitedFreeModels(userId);
            } catch (error) {
                console.warn('Failed to get subscription info:', error);
            }
        }

        return NextResponse.json({
            limit: dailyUsage.limit,
            used: dailyUsage.messageCount,
            remaining: dailyUsage.remaining,
            isAnonymous: dailyUsage.isAnonymous,
            // Check if user has a Polar subscription
            hasSubscription: (session.user as any)?.metadata?.hasSubscription || false,
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
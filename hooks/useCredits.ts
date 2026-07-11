import { useState, useEffect } from 'react';

/**
 * Hook to get and manage a user's credits
 *
 * @param polarCustomerId The customer's ID in Polar system (legacy) - deprecated, kept for compatibility
 * @param userId The user's ID in our application (used as external ID in Polar)
 */
export function useCredits(polarCustomerId?: string, userId?: string) {
    const [credits, setCredits] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchCredits = async () => {
        if (!userId) {
            setCredits(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/credits');

            if (!response.ok) {
                throw new Error(`Failed to fetch credits: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            setCredits(data.credits);
        } catch (err) {
            console.error('Error fetching credits:', err);
            setError(err instanceof Error ? err : new Error('Failed to fetch credits'));
            setCredits(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCredits();
    }, [polarCustomerId, userId]);

    const formattedCredits = credits !== null
        ? credits.toLocaleString()
        : 'Unknown';

    const hasSufficientCredits = (requiredAmount: number = 1): boolean => {
        if (credits === null) return true;
        return credits >= requiredAmount;
    };

    /** Whether the user can send a message with this model's credit cost */
    const canUseModelAtCreditCost = (requiredCredits: number = 1): boolean => {
        if (credits === null) return true;
        return credits >= requiredCredits;
    };

    /**
     * @deprecated Use canUseModelAtCreditCost(2) — legacy name from "premium model" era
     */
    const canAccessPremiumModels = (): boolean => canUseModelAtCreditCost(2);

    return {
        credits,
        formattedCredits,
        loading,
        error,
        fetchCredits,
        hasSufficientCredits,
        canUseModelAtCreditCost,
        canAccessPremiumModels,
    };
}

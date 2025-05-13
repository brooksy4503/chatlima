import { useState, useEffect } from 'react';
import { getRemainingCredits, getRemainingCreditsByExternalId } from '../lib/polar';

/**
 * Hook to get and manage a user's credits
 * 
 * @param polarCustomerId The customer's ID in Polar system (legacy)
 * @param userId The user's ID in our application (used as external ID in Polar)
 * @returns Object containing the user's credits status and related functions
 */
export function useCredits(polarCustomerId?: string, userId?: string) {
    const [credits, setCredits] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    // Function to fetch credits
    const fetchCredits = async () => {
        // If neither ID is provided, we can't fetch credits
        if (!polarCustomerId && !userId) {
            setCredits(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Try the external ID approach first if a userId is provided
            if (userId) {
                try {
                    const remainingCreditsByExternal = await getRemainingCreditsByExternalId(userId);
                    if (remainingCreditsByExternal !== null) {
                        setCredits(remainingCreditsByExternal);
                        setLoading(false);
                        return;
                    }
                    // If external ID lookup fails, fall through to legacy method
                } catch (externalError) {
                    console.warn('Failed to get credits via external ID, falling back to legacy method:', externalError);
                    // Continue to legacy method
                }
            }

            // Legacy method using polarCustomerId
            if (polarCustomerId) {
                const remainingCredits = await getRemainingCredits(polarCustomerId);
                setCredits(remainingCredits);
            } else {
                setCredits(null);
            }
        } catch (err) {
            console.error('Error fetching credits:', err);
            setError(err instanceof Error ? err : new Error('Failed to fetch credits'));
        } finally {
            setLoading(false);
        }
    };

    // Fetch credits on mount and when IDs change
    useEffect(() => {
        fetchCredits();
    }, [polarCustomerId, userId]);

    // Helper function to format credits display with thousands separator
    const formattedCredits = credits !== null
        ? credits.toLocaleString()
        : 'Unknown';

    // Function to check if user has sufficient credits for an operation
    const hasSufficientCredits = (requiredAmount: number = 1): boolean => {
        if (credits === null) return true; // Allow if credits unknown
        return credits >= requiredAmount;
    };

    return {
        credits,
        formattedCredits,
        loading,
        error,
        fetchCredits,
        hasSufficientCredits,
    };
} 
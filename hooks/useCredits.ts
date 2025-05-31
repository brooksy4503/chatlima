import { useState, useEffect } from 'react';

/**
 * Hook to get and manage a user's credits
 * 
 * @param polarCustomerId The customer's ID in Polar system (legacy) - deprecated, kept for compatibility
 * @param userId The user's ID in our application (used as external ID in Polar)
 * @returns Object containing the user's credits status and related functions
 */
export function useCredits(polarCustomerId?: string, userId?: string) {
    const [credits, setCredits] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    // Function to fetch credits via API endpoint
    const fetchCredits = async () => {
        // If no userId is provided, we can't fetch credits
        if (!userId) {
            console.log('[DEBUG] useCredits: No userId provided, setting credits to null');
            setCredits(null);
            return;
        }

        console.log(`[DEBUG] useCredits: Fetching credits for userId: ${userId}`);
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/credits');

            if (!response.ok) {
                throw new Error(`Failed to fetch credits: ${response.status}`);
            }

            const data = await response.json();
            console.log(`[DEBUG] useCredits: API response:`, data);

            if (data.error) {
                throw new Error(data.error);
            }

            console.log(`[DEBUG] useCredits: Setting credits to: ${data.credits}`);
            setCredits(data.credits);
        } catch (err) {
            console.error('Error fetching credits:', err);
            setError(err instanceof Error ? err : new Error('Failed to fetch credits'));
            setCredits(null);
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

    // Function to check if user can access premium models
    const canAccessPremiumModels = (): boolean => {
        const canAccess = credits !== null && credits > 0;
        console.log(`[DEBUG] canAccessPremiumModels: credits=${credits}, canAccess=${canAccess}`);
        return canAccess;
    };

    return {
        credits,
        formattedCredits,
        loading,
        error,
        fetchCredits,
        hasSufficientCredits,
        canAccessPremiumModels,
    };
} 
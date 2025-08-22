'use client';

import { useState, useEffect, useRef } from 'react';

// Cache for feature flag results to prevent multiple API calls
const flagCache = new Map<string, { value: boolean; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Generic hook to check if a feature flag is enabled
 * @param flagKey - The flag key to check
 * @returns Object with loading state and flag value
 */
export const useFeatureFlag = (flagKey: string) => {
    const [isEnabled, setIsEnabled] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        const checkFlag = async () => {
            try {
                // Check cache first
                const cached = flagCache.get(flagKey);
                if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
                    setIsEnabled(cached.value);
                    setIsLoading(false);
                    return;
                }

                // Abort any previous request
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }

                abortControllerRef.current = new AbortController();

                const response = await fetch(`/api/feature-flags?key=${flagKey}`, {
                    signal: abortControllerRef.current.signal
                });

                if (!response.ok) {
                    throw new Error(`Failed to check feature flag: ${response.statusText}`);
                }

                const result = await response.json();
                const flagValue = result.enabled;

                // Update cache
                flagCache.set(flagKey, { value: flagValue, timestamp: Date.now() });
                setIsEnabled(flagValue);
            } catch (error) {
                if (error instanceof Error && error.name !== 'AbortError') {
                    console.error('Error checking feature flag:', error);
                    setIsEnabled(false);
                } else if (!(error instanceof Error)) {
                    console.error('Error checking feature flag:', error);
                    setIsEnabled(false);
                }
            } finally {
                if (!abortControllerRef.current?.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        checkFlag();

        // Cleanup function to abort request if component unmounts
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [flagKey]);

    return { isEnabled, isLoading };
};

/**
 * Hook specifically for the Project Overview V2 feature flag
 */
export const useProjectOverviewV2 = () => {
    return useFeatureFlag('project-overview-v2');
};
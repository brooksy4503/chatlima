'use client';

import { useState, useEffect } from 'react';
import { projectOverviewV2Flag } from '@/lib/utils/feature-flags';

/**
 * Generic hook to check if a feature flag is enabled
 * @param flagInstance - The flag instance to check
 * @returns Object with loading state and flag value
 */
export const useFeatureFlag = <T>(flagInstance: any) => {
    const [isEnabled, setIsEnabled] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkFlag = async () => {
            try {
                const result = await flagInstance();
                setIsEnabled(result.value as T === true);
            } catch (error) {
                console.error('Error checking feature flag:', error);
                setIsEnabled(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkFlag();
    }, [flagInstance]);

    return { isEnabled, isLoading };
};

/**
 * Hook specifically for the Project Overview V2 feature flag
 */
export const useProjectOverviewV2 = () => {
    return useFeatureFlag<boolean>(projectOverviewV2Flag);
};
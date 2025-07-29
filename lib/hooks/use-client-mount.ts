import { useState, useEffect } from 'react';

/**
 * Hook to track when a component has mounted on the client side
 * This prevents hydration mismatches for components that depend on browser APIs
 * @returns boolean indicating if the component has mounted on the client
 */
export function useClientMount() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return isMounted;
} 
import { useEffect, useState, useCallback, useRef } from 'react';
import { signIn, signOut, useSession } from '@/lib/auth-client';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous' | 'unauthenticated';

interface AuthUser {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    isAnonymous?: boolean;
    messageLimit?: number;
    messageRemaining?: number;
    hasSubscription?: boolean;
    credits?: number;
    hasCredits?: boolean;
    usedCredits?: boolean;
}

export function useAuth() {
    const { data: session, isPending } = useSession();
    const [status, setStatus] = useState<AuthStatus>('loading');
    const [user, setUser] = useState<AuthUser | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const processingRef = useRef(false);

    useEffect(() => {
        if (isPending || processingRef.current) {
            setStatus('loading');
            return;
        }

        processingRef.current = true;

        try {
            if (session && session.user) {
                // If we have a user with ID, we're authenticated in some form
                if (session.user.id) {
                    const isAnonymous = (session.user as any).isAnonymous === true;

                    setUser({
                        id: session.user.id,
                        name: session.user.name || null,
                        email: session.user.email || null,
                        image: session.user.image || null,
                        isAnonymous: isAnonymous,
                        // These values would be fetched separately from an API endpoint
                        messageLimit: isAnonymous ? 10 : 20,
                        messageRemaining: 0, // Would be updated via API
                        hasSubscription: !!(session.user as any)?.metadata?.hasSubscription,
                    });

                    setStatus(isAnonymous ? 'anonymous' : 'authenticated');
                } else {
                    setStatus('unauthenticated');
                    setUser(null);
                }
            } else {
                // No session means not authenticated
                setStatus('unauthenticated');
                setUser(null);
            }
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
            setStatus('unauthenticated');
            setUser(null);
        } finally {
            // Reset processing flag after a brief delay
            setTimeout(() => {
                processingRef.current = false;
            }, 50);
        }
    }, [session, isPending]);

    // Get message usage data
    const refreshMessageUsage = useCallback(async () => {
        try {
            const response = await fetch('/api/usage/messages');
            if (response.ok) {
                const data = await response.json();
                setUser(prev => prev ? {
                    ...prev,
                    messageLimit: data.limit,
                    messageRemaining: data.remaining,
                    credits: data.credits,
                    hasCredits: data.hasCredits,
                    usedCredits: data.usedCredits
                } : null);
            }
        } catch (err) {
            console.error('Failed to fetch message usage:', err);
        }
    }, []);

    // Auto-fetch credit information when user is available (for both authenticated and anonymous users)
    useEffect(() => {
        if (user && user.credits === undefined && (status === 'authenticated' || status === 'anonymous')) {
            refreshMessageUsage();
        }
    }, [user?.id, status]); // Removed refreshMessageUsage from dependency array to prevent re-runs during hot reload

    // Sign in with Google
    const handleSignIn = async () => {
        try {
            // Use Better Auth client to sign in with Google
            await signIn.social({
                provider: 'google',
                callbackURL: window.location.origin
            });
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
        }
    };

    // Sign out
    const handleSignOut = async () => {
        try {
            // Use Better Auth client to sign out
            await signOut();

            // Refresh the page to get new anonymous session
            window.location.reload();
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
        }
    };



    return {
        status,
        user,
        error,
        signIn: handleSignIn,
        signOut: handleSignOut,
        refreshMessageUsage,
        isLoading: status === 'loading',
        isAuthenticated: status === 'authenticated',
        isAnonymous: status === 'anonymous',
    };
} 
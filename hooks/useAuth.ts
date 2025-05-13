import { useEffect, useState } from 'react';
import { auth } from '@/lib/auth';

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
}

export function useAuth() {
    const [status, setStatus] = useState<AuthStatus>('loading');
    const [user, setUser] = useState<AuthUser | null>(null);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                // Get session (handles both signed in and anonymous users)
                const session = await auth.api.getSession({ headers: new Headers() });

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
            } catch (err) {
                setError(err instanceof Error ? err : new Error(String(err)));
                setStatus('unauthenticated');
                setUser(null);
            }
        };

        fetchSession();
    }, []);

    // Sign in with Google
    const signIn = async () => {
        try {
            // Redirect to Google sign-in page
            window.location.href = '/api/auth/signin/google';
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
        }
    };

    // Sign out
    const signOut = async () => {
        try {
            // Redirect to sign-out page
            window.location.href = '/api/auth/signout';

            // The server will create a new anonymous session automatically
            // We'll need to wait for the redirect to complete and then reload
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
        }
    };

    // Get message usage data
    const refreshMessageUsage = async () => {
        if (!user) return;

        try {
            const response = await fetch('/api/usage/messages');
            if (response.ok) {
                const data = await response.json();
                setUser(prev => prev ? {
                    ...prev,
                    messageLimit: data.limit,
                    messageRemaining: data.remaining
                } : null);
            }
        } catch (err) {
            console.error('Failed to fetch message usage:', err);
        }
    };

    return {
        status,
        user,
        error,
        signIn,
        signOut,
        refreshMessageUsage,
        isLoading: status === 'loading',
        isAuthenticated: status === 'authenticated',
        isAnonymous: status === 'anonymous',
    };
} 
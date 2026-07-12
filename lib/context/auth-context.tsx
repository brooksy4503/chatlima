"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSession as getSessionOriginal, signIn as signInOriginal, signOut as signOutOriginal } from '@/lib/auth-client';

interface AuthUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  isAnonymous: boolean;
  hasSubscription: boolean;
  messageLimit: number;
  messageRemaining: number;
  credits?: number;
  hasCredits?: boolean;
  usedCredits?: boolean;
}

interface UsageData {
  limit: number;
  used: number;
  remaining: number;
  credits: number;
  hasCredits: boolean;
  usedCredits: boolean;
  subscriptionType: 'monthly' | 'yearly' | null;
  lastFetched: number;
}

interface AuthContextType {
  user: AuthUser | null;
  session: any;
  isPending: boolean;
  status: 'loading' | 'authenticated' | 'anonymous' | 'unauthenticated';
  usageData: UsageData | null;
  refetchUsage: () => Promise<void>;
  error: Error | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshMessageUsage: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAnonymous: boolean;
}

export const USAGE_MESSAGES_QUERY_KEY = 'usage-messages';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<any>(null);
  const [isPending, setIsPending] = useState(true);
  
  // Use refs to track previous values and avoid triggering effects unnecessarily
  const lastSessionJsonRef = useRef<string>('');
  const lastPendingRef = useRef<boolean>(true);
  const isInitialMountRef = useRef(true);

  const refreshSession = useCallback(async () => {
    // Avoid overlapping session calls if a refresh is already running
    if (lastPendingRef.current) {
      return;
    }
    lastPendingRef.current = true;
    setIsPending(true);

    try {
      const result = await getSessionOriginal();
      const nextSession = (result as any)?.data ?? null;
      const nextSessionJson = JSON.stringify(nextSession);

      if (nextSessionJson !== lastSessionJsonRef.current) {
        lastSessionJsonRef.current = nextSessionJson;
        setSession(nextSession);
      }
    } catch {
      setSession(null);
    } finally {
      lastPendingRef.current = false;
      setIsPending(false);
      if (isInitialMountRef.current) {
        isInitialMountRef.current = false;
      }
    }
  }, []);

  useEffect(() => {
    // Prime the first session load exactly once on mount
    lastPendingRef.current = false;
    refreshSession();
  }, [refreshSession]);
  
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthContextType['status']>('loading');
  const [error, setError] = useState<Error | null>(null);

  const userId = session?.user?.id as string | undefined;

  // Same pattern as chats list: TanStack Query + invalidate on chat finish
  const { data: usageResponse } = useQuery({
    queryKey: [USAGE_MESSAGES_QUERY_KEY, userId],
    queryFn: async () => {
      const response = await fetch('/api/usage/messages', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to fetch usage data');
      }
      return response.json();
    },
    enabled: Boolean(userId) && !isPending,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const usageData = useMemo<UsageData | null>(() => {
    if (!usageResponse) return null;
    return {
      limit: usageResponse.limit,
      used: usageResponse.limit - usageResponse.remaining,
      remaining: usageResponse.remaining,
      credits: usageResponse.credits || 0,
      hasCredits: usageResponse.hasCredits || false,
      usedCredits: usageResponse.usedCredits || false,
      subscriptionType: usageResponse.subscriptionType || null,
      lastFetched: Date.now(),
    };
  }, [usageResponse]);

  // Single effect to manage auth state - only runs when session changes
  useEffect(() => {
    if (isPending) {
      setStatus('loading');
      return;
    }

    if (userId) {
      const isAnonymous = (session.user as any).isAnonymous === true;

      setUser({
        id: session.user.id,
        name: session.user.name || null,
        email: session.user.email || null,
        image: session.user.image || null,
        isAnonymous,
        hasSubscription: !!(session.user as any)?.metadata?.hasSubscription,
        messageLimit: isAnonymous ? 10 : 20,
        messageRemaining: usageData?.remaining || 0,
        credits: usageData?.credits,
        hasCredits: usageData?.hasCredits,
        usedCredits: usageData?.usedCredits,
      });
      
      setStatus(isAnonymous ? 'anonymous' : 'authenticated');
      setError(null);
    } else {
      setUser(null);
      setStatus('unauthenticated');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, isPending]); // Only depend on session and isPending, not usageData

  // Separate effect to update user when usageData changes (without triggering fetch)
  useEffect(() => {
    if (userId && usageData) {
      setUser((prevUser) => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          messageRemaining: usageData.remaining || 0,
          credits: usageData.credits,
          hasCredits: usageData.hasCredits,
          usedCredits: usageData.usedCredits,
        };
      });
    }
  }, [usageData, userId]);

  // Sign in with Google
  const handleSignIn = useCallback(async () => {
    try {
      await signInOriginal.social({
        provider: 'google',
        callbackURL: window.location.origin
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, []);

  // Sign out
  const handleSignOut = useCallback(async () => {
    try {
      await signOutOriginal();
      // Refresh the page to get new anonymous session
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, []);

  const refetchUsage = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: [USAGE_MESSAGES_QUERY_KEY] });
  }, [queryClient]);

  const value: AuthContextType = {
    user,
    session,
    isPending,
    status,
    usageData,
    refetchUsage,
    refreshMessageUsage: refetchUsage, // Alias for backward compatibility
    error,
    signIn: handleSignIn,
    signOut: handleSignOut,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isAnonymous: status === 'anonymous',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Session is managed centrally via AuthProvider.

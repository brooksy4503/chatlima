"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
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

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
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
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [status, setStatus] = useState<AuthContextType['status']>('loading');
  const [error, setError] = useState<Error | null>(null);
  const lastFetchedRef = useRef<number | null>(null);
  const lastUserIdRef = useRef<string | null>(null);
  const usageRetryTimeoutRef = useRef<number | null>(null);

  // Centralized usage data fetching with proper caching
  const fetchUsageData = useCallback(async (userId: string) => {
    // Skip if data is fresh (< 5 minutes old) and same user
    const now = Date.now();
    if (lastFetchedRef.current && lastFetchedRef.current > now - 300000 && lastUserIdRef.current === userId) {
      return;
    }

    try {
      const response = await fetch('/api/usage/messages');
      if (response.ok) {
        const data = await response.json();
        const fetchedData = {
          limit: data.limit,
          used: data.limit - data.remaining,
          remaining: data.remaining,
          credits: data.credits || 0,
          hasCredits: data.hasCredits || false,
          usedCredits: data.usedCredits || false,
          subscriptionType: data.subscriptionType || null,
          lastFetched: now,
        };
        lastFetchedRef.current = now;
        lastUserIdRef.current = userId;
        setUsageData(fetchedData);
      }
    } catch (error) {
      console.error('Failed to fetch usage data:', error);
    }
  }, []);

  // Single effect to manage auth state - only runs when session changes
  useEffect(() => {
    if (isPending) {
      setStatus('loading');
      return;
    }

    const userId = session?.user?.id;
    
    if (userId) {
      const isAnonymous = (session.user as any).isAnonymous === true;
      
      // Only fetch usage data if userId changed
      if (lastUserIdRef.current !== userId) {
        fetchUsageData(userId);
      }
      
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
      setUsageData(null);
      lastFetchedRef.current = null;
      lastUserIdRef.current = null;
      setStatus('unauthenticated');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, isPending]); // Only depend on session and isPending, not fetchUsageData or usageData

  // Separate effect to update user when usageData changes (without triggering fetch)
  useEffect(() => {
    if (session?.user?.id && usageData) {
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
  }, [usageData, session?.user?.id]);

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

  // Wrapper for refetchUsage that uses current userId
  const refetchUsage = useCallback(async () => {
    if (!session?.user?.id) return;
    const userId = session.user.id;

    if (usageRetryTimeoutRef.current != null) {
      window.clearTimeout(usageRetryTimeoutRef.current);
      usageRetryTimeoutRef.current = null;
    }

    lastFetchedRef.current = null;
    await fetchUsageData(userId);

    // ponytail: Polar meter lags event ingest; one delayed refetch covers stale first read
    usageRetryTimeoutRef.current = window.setTimeout(() => {
      usageRetryTimeoutRef.current = null;
      if (lastUserIdRef.current !== userId) return;
      lastFetchedRef.current = null;
      void fetchUsageData(userId);
    }, 2500);
  }, [session?.user?.id, fetchUsageData]);

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
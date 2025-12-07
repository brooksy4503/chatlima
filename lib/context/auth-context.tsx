"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { useSession as useSessionOriginal, signIn as signInOriginal, signOut as signOutOriginal } from '@/lib/auth-client';

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
  // Get session data from better-auth
  const { data: sessionData, isPending: isPendingOriginal } = useSessionOriginal();
  const [session, setSession] = useState(sessionData);
  const [isPending, setIsPending] = useState(isPendingOriginal);
  
  // Use refs to track previous values and avoid triggering effects unnecessarily
  const lastSessionJsonRef = useRef<string>('');
  const lastPendingRef = useRef<boolean>(isPendingOriginal);
  const isInitialMountRef = useRef(true);
  
  // Stable session update - only update state when actual content changes
  useEffect(() => {
    // Always update pending state when it changes
    if (isPendingOriginal !== lastPendingRef.current) {
      lastPendingRef.current = isPendingOriginal;
      setIsPending(isPendingOriginal);
    }
    
    // Skip session comparison if still pending
    if (isPendingOriginal) {
      return;
    }
    
    // Compare session content, not object reference
    const currentSessionJson = JSON.stringify(sessionData);
    
    // Only update if session content actually changed
    if (currentSessionJson !== lastSessionJsonRef.current) {
      lastSessionJsonRef.current = currentSessionJson;
      setSession(sessionData);
      
      if (isInitialMountRef.current) {
        isInitialMountRef.current = false;
      }
    }
  }, [sessionData, isPendingOriginal]);
  
  const [user, setUser] = useState<AuthUser | null>(null);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [status, setStatus] = useState<AuthContextType['status']>('loading');
  const [error, setError] = useState<Error | null>(null);
  const lastFetchedRef = useRef<number | null>(null);
  const lastUserIdRef = useRef<string | null>(null);

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
    if (session?.user?.id) {
      // Force fetch by clearing the cache
      lastFetchedRef.current = null;
      await fetchUsageData(session.user.id);
    }
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

// Export original useSession for migration purposes
export { useSessionOriginal };
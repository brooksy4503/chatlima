"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
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
  const { data: session, isPending } = useSessionOriginal(); // Single useSession call
  const [user, setUser] = useState<AuthUser | null>(null);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [status, setStatus] = useState<AuthContextType['status']>('loading');
  const [error, setError] = useState<Error | null>(null);

  // Centralized usage data fetching with proper caching
  const fetchUsageData = useCallback(async () => {
    // Skip if no user or data is fresh (< 5 minutes old)
    if (!session?.user?.id || (usageData?.lastFetched && usageData.lastFetched > Date.now() - 300000)) {
      return;
    }

    try {
      const response = await fetch('/api/usage/messages');
      if (response.ok) {
        const data = await response.json();
        setUsageData({
          limit: data.limit,
          used: data.limit - data.remaining,
          remaining: data.remaining,
          credits: data.credits || 0,
          hasCredits: data.hasCredits || false,
          usedCredits: data.usedCredits || false,
          lastFetched: Date.now(),
        });
      }
    } catch (error) {
      console.error('Failed to fetch usage data:', error);
    }
  }, [session?.user?.id, usageData?.lastFetched]);

  // Single effect to manage auth state
  useEffect(() => {
    if (isPending) {
      setStatus('loading');
      return;
    }

    if (session?.user?.id) {
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
      
      // Fetch usage data when user is available
      fetchUsageData();
    } else {
      setUser(null);
      setUsageData(null);
      setStatus('unauthenticated');
    }
  }, [session, isPending, fetchUsageData, usageData]);

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

  const value: AuthContextType = {
    user,
    session,
    isPending,
    status,
    usageData,
    refetchUsage: fetchUsageData,
    refreshMessageUsage: fetchUsageData, // Alias for backward compatibility
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
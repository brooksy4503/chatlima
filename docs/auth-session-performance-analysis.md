# Auth Session Performance Analysis

## Overview
The application is experiencing significant performance issues due to excessive auth session API calls. Investigation reveals multiple components making independent session checks, leading to hundreds of redundant auth requests.

## Root Causes

### 1. Multiple Independent useSession() Calls
**Issue:** At least 6 components are calling `useSession()` independently:
- `lib/hooks/use-chats.ts`
- `hooks/useAuth.ts`
- `components/chat-sidebar.tsx`
- `components/chat.tsx`
- `components/auth/UserAccountMenu.tsx`
- `components/auth/AnonymousAuth.tsx`

**Impact:** Each component potentially triggers its own auth session check, multiplying the number of API calls.

### 2. Aggressive Refetch Settings
**Issue:** React Query is configured with `refetchOnWindowFocus: true` globally in `app/providers.tsx`:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true, // <-- This triggers refetches on every window focus
    },
  },
});
```

**Impact:** Every time the user switches back to the app window, ALL queries (including auth) refetch.

### 3. Automatic Usage Data Fetching
**Issue:** The `useAuth` hook automatically fetches usage data when a user is detected:
```typescript
// From useAuth.ts, lines 97-101
useEffect(() => {
    if (user && user.credits === undefined && (status === 'authenticated' || status === 'anonymous')) {
        refreshMessageUsage();
    }
}, [user?.id, status]);
```

**Impact:** This triggers an additional API call to `/api/usage/messages` for every component using `useAuth`.

### 4. Anonymous Auth Auto-Attempts
**Issue:** The `AnonymousAuth` component in the provider hierarchy automatically attempts to sign in anonymous users:
```typescript
// From AnonymousAuth.tsx
useEffect(() => {
    if (!isPending && !session) {
        const attemptSignIn = async () => {
            // Attempts anonymous sign-in
        };
    }
}, [isPending, session]);
```

**Impact:** This can trigger additional auth flows on every page load.

### 5. Chat Components with Redundant Session Checks
**Issue:** Both `chat.tsx` and `chat-sidebar.tsx` independently check sessions and manage their own auth state, leading to duplicate checks.

## Performance Impact Analysis

### Estimated API Calls per Page Load:
1. **Initial Load:**
   - 6 components × useSession() = 6 auth checks
   - useAuth usage fetch = 1 additional call
   - Anonymous auth attempt = 1 potential call
   - **Total: ~8 auth-related API calls**

2. **On Window Focus:**
   - All queries refetch due to `refetchOnWindowFocus: true`
   - Potentially doubles the calls: **~16 auth-related API calls**

3. **During Navigation:**
   - Components remount and re-check auth
   - Additional multiplier effect

## Recommended Solutions

### 1. Centralize Auth State Management
Create a single auth context provider that manages all auth state:

```typescript
// lib/context/auth-context.tsx
export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession(); // Single useSession call
  const [user, setUser] = useState<AuthUser | null>(null);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  
  // Centralized usage data fetching with proper caching
  const fetchUsageData = useCallback(async () => {
    if (!session?.user?.id || usageData?.lastFetched > Date.now() - 300000) {
      return; // Skip if no user or data is fresh (< 5 minutes old)
    }
    
    try {
      const response = await fetch('/api/usage/messages');
      if (response.ok) {
        const data = await response.json();
        setUsageData({ ...data, lastFetched: Date.now() });
      }
    } catch (error) {
      console.error('Failed to fetch usage data:', error);
    }
  }, [session?.user?.id, usageData?.lastFetched]);
  
  // Single effect to manage auth state
  useEffect(() => {
    if (session?.user) {
      setUser(transformSessionToUser(session.user));
      fetchUsageData();
    } else {
      setUser(null);
      setUsageData(null);
    }
  }, [session, fetchUsageData]);
  
  return (
    <AuthContext.Provider value={{ user, session, isPending, usageData, refetchUsage: fetchUsageData }}>
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
```

### 2. Optimize React Query Configuration
Update the global React Query configuration to reduce aggressive refetching:

```typescript
// app/providers.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false, // Disable global refetch on focus
      refetchOnMount: false, // Don't refetch on mount if data exists
      refetchOnReconnect: false, // Don't refetch on reconnect
      retry: 1, // Reduce retry attempts
    },
  },
});
```

### 3. Implement Session Caching
Use Better Auth's built-in session caching or implement a custom cache:

```typescript
// lib/auth-client.ts
export const { signIn, signOut, useSession } = createAuthClient({
  plugins: [anonymousClient()],
  // Add session caching configuration
  session: {
    cache: {
      enabled: true,
      maxAge: 300, // 5 minutes
    },
  },
});
```

### 4. Lazy Load Anonymous Auth
Move anonymous auth logic to be triggered only when needed:

```typescript
// components/auth/AnonymousAuth.tsx
export function AnonymousAuth({ trigger = false }: { trigger?: boolean }) {
  const { data: session, isPending } = useSession();
  const attemptedRef = useRef(false);
  
  useEffect(() => {
    // Only attempt if explicitly triggered
    if (!trigger || isPending || session || attemptedRef.current) {
      return;
    }
    
    // Anonymous sign-in logic
  }, [trigger, isPending, session]);
  
  return null;
}
```

### 5. Batch API Calls
Combine related auth checks into single API endpoints:

```typescript
// app/api/auth/session-with-usage/route.ts
export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  
  if (!session?.user?.id) {
    return NextResponse.json({ session: null, usage: null });
  }
  
  const [sessionData, usageData] = await Promise.all([
    Promise.resolve(session),
    checkMessageLimit(session.user.id, session.user.isAnonymous),
  ]);
  
  return NextResponse.json({
    session: sessionData,
    usage: usageData,
  });
}
```

## Implementation Priority

1. **High Priority (Immediate Impact):**
   - Disable `refetchOnWindowFocus` globally
   - Centralize auth state with single `useSession()` call
   - Remove redundant `useSession()` calls from components

2. **Medium Priority (Significant Improvement):**
   - Implement session caching
   - Batch auth and usage API calls
   - Add proper cache invalidation strategies

3. **Low Priority (Polish):**
   - Optimize anonymous auth flow
   - Add performance monitoring
   - Implement progressive enhancement

## Expected Performance Improvements

By implementing these solutions:
- **Reduce auth API calls by 80-90%** (from ~16 to 1-2 per page load)
- **Improve initial page load time** by reducing blocking auth checks
- **Better user experience** with less flickering and faster interactions
- **Reduced server load** from fewer redundant API calls

## Monitoring and Validation

Add performance monitoring to track improvements:

```typescript
// lib/utils/performance-monitor.ts
export function trackAuthCalls() {
  if (typeof window === 'undefined') return;
  
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const authCalls = entries.filter(entry => 
      entry.name.includes('/api/auth') || 
      entry.name.includes('/api/usage')
    );
    
    if (authCalls.length > 5) {
      console.warn(`Excessive auth calls detected: ${authCalls.length} calls`);
    }
  });
  
  observer.observe({ entryTypes: ['resource'] });
}
```

## Next Steps

1. Create a proof-of-concept branch implementing the centralized auth context
2. Measure performance improvements with the changes
3. Gradually migrate components to use the new auth context
4. Monitor production metrics to validate improvements
# Client-Side Auth Import Fix

## Error Description

**Error Message:**
```
Error: Missing GOOGLE_CLIENT_SECRET environment variable
    at [project]/lib/auth.ts [app-client] (ecmascript)
```

**Context:** 
The error occurred during application startup when accessing the homepage at `http://localhost:3000`. The error appeared in the browser console and prevented the application from loading properly.

## Root Cause Analysis

The issue was caused by importing the server-side auth configuration (`@/lib/auth`) in client-side code. Specifically:

1. **File:** `hooks/useAuth.ts` 
2. **Problematic Import:** `import { auth } from '@/lib/auth';`
3. **Impact:** This caused the entire `/lib/auth.ts` file to execute in the browser

### Why This Caused the Error

The `/lib/auth.ts` file contains environment variable validation code that runs at module initialization:

```typescript
if (!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('Missing GOOGLE_CLIENT_SECRET environment variable');
}
```

When this code executed in the browser:
- Server-only environment variables like `GOOGLE_CLIENT_SECRET` are not available
- The validation check failed, throwing the error
- The application failed to load

### Stack Trace Analysis

The error stack trace showed the issue originated from:
- `lib/auth.ts` → `hooks/useAuth.ts` → `components/model-picker.tsx` → `components/chat.tsx`

This confirmed that client-side components were importing server-side auth configuration.

## Solution Implemented

### 1. Updated useAuth Hook

**File:** `hooks/useAuth.ts`

**Before:**
```typescript
import { auth } from '@/lib/auth';

// Later in code:
const session = await auth.api.getSession({ headers: new Headers() });
```

**After:**
```typescript
import { createAuthClient } from 'better-auth/client';

const authClient = createAuthClient({
    baseURL: process.env.NODE_ENV === 'production' 
        ? 'https://www.chatlima.com' 
        : 'http://localhost:3000'
});

// Later in code:
const session = await authClient.getSession();
```

### 2. Updated Session Handling

**Before:**
```typescript
if (session && session.user) {
    // Access session.user properties
}
```

**After:**
```typescript
if (session.data && session.data.user) {
    // Access session.data.user properties
}
```

### 3. Updated Authentication Methods

**Before:**
```typescript
const signIn = async () => {
    window.location.href = '/api/auth/signin/google';
};

const signOut = async () => {
    window.location.href = '/api/auth/signout';
};
```

**After:**
```typescript
const signIn = async () => {
    await authClient.signIn.social({
        provider: 'google',
        callbackURL: window.location.origin
    });
};

const signOut = async () => {
    await authClient.signOut();
    window.location.reload();
};
```

## Environment Variables Status

The environment variables were correctly configured in `.env.local`:

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID="1030808897485-806kfuahfgc4h05ev9b75ln1a2nk84fb.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"
AUTH_SECRET="BmPUuEpigbwo2w4bUOYAyOwsnwZKF6Qj5o2yBP28MS0="
POLAR_ACCESS_TOKEN="polar_oat_zBhvX0l9jxZfiUcM0kpD2fTxLP5wRFSW1ZzPD1pWSWR"
POLAR_WEBHOOK_SECRET="98fef0d83d0049b4a316b9f0641731f9"
POLAR_PRODUCT_ID="027524b2-6058-452b-8207-1913c2eeafbb"
POLAR_SERVER_ENV="sandbox"
```

The issue was not missing environment variables, but improper access to them from client-side code.

## Verification

After implementing the fix:

1. **Server Status:** Application starts successfully
   ```bash
   ✓ Ready in 899ms
   ✓ Compiled / in 6.9s
   GET / 200 in 8011ms
   ```

2. **Page Loading:** Homepage loads without errors
   ```bash
   curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
   # Returns: 200
   ```

3. **Client-Side:** No more environment variable errors in browser console

## Best Practices

### 1. Separate Client and Server Auth

- **Server-side:** Use `@/lib/auth` for API routes and server components
- **Client-side:** Use `@/lib/auth-client` or Better Auth client for React components

### 2. Environment Variable Naming

- **Client-accessible:** Prefix with `NEXT_PUBLIC_` (e.g., `NEXT_PUBLIC_GOOGLE_CLIENT_ID`)
- **Server-only:** No prefix (e.g., `GOOGLE_CLIENT_SECRET`)

### 3. Import Guidelines

**✅ Correct:**
```typescript
// In React components/hooks
import { createAuthClient } from 'better-auth/client';
import { useSession, signIn, signOut } from '@/lib/auth-client';

// In API routes
import { auth } from '@/lib/auth';
```

**❌ Incorrect:**
```typescript
// In React components/hooks - DON'T DO THIS
import { auth } from '@/lib/auth'; // Server-side config in client code
```

### 4. Existing Correct Pattern

The project already had the correct pattern established in other components:

```typescript
// components/auth/UserAccountMenu.tsx
import { signOut, useSession } from "@/lib/auth-client";

// components/chat-sidebar.tsx  
import { useSession, signOut } from "@/lib/auth-client";
```

## Related Files

- **Fixed:** `hooks/useAuth.ts`
- **Correct Pattern:** `lib/auth-client.ts`
- **Server-side Config:** `lib/auth.ts` 
- **Components Using Correct Pattern:**
  - `components/auth/UserAccountMenu.tsx`
  - `components/chat-sidebar.tsx`
  - `components/auth/AnonymousAuth.tsx`
  - `components/auth/SignInButton.tsx`

## Date

**Fixed:** December 19, 2024

**Issue Duration:** Immediate fix after identification of client-side import issue 
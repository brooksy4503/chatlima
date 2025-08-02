# Auth Migration Guide

## Components Still Using Direct useSession

The following components need to be migrated from direct `useSession` calls to the centralized auth hook:

### 1. `components/chat.tsx`
- Line 19: `import { useSession } from '@/lib/auth-client';`
- Line 40: `const { data: session, isPending: isSessionLoading } = useSession();`

**Migration:**
```typescript
// Replace:
import { useSession } from '@/lib/auth-client';
const { data: session, isPending: isSessionLoading } = useSession();

// With:
import { useAuth } from '@/hooks/useAuth';
const { session, isPending: isSessionLoading } = useAuth();
```

### 2. `components/auth/AnonymousAuth.tsx`
- Line 4: `import { signIn, useSession } from '@/lib/auth-client';`
- Line 7: `const { data: session, isPending } = useSession();`

**Migration:**
```typescript
// Replace:
import { signIn, useSession } from '@/lib/auth-client';
const { data: session, isPending } = useSession();

// With:
import { useAuth } from '@/hooks/useAuth';
import { signIn } from '@/lib/auth-client';
const { session, isPending } = useAuth();
```

### 3. `components/chat-sidebar.tsx`
- Line 83: `const { data: session, isPending: isSessionLoading } = useSession();`

**Migration:**
```typescript
// Add import:
import { useAuth } from '@/hooks/useAuth';

// Replace:
const { data: session, isPending: isSessionLoading } = useSession();

// With:
const { session, isPending: isSessionLoading } = useAuth();
```

### 4. `components/auth/UserAccountMenu.tsx`
- Uses `useSession` (need to check exact usage)

### 5. `lib/hooks/use-chats.ts`
- Line 8: `const { data: session, isPending: isSessionLoading } = useSession();`

**Migration:**
```typescript
// Replace:
import { useSession } from '@/lib/auth-client';
const { data: session, isPending: isSessionLoading } = useSession();

// With:
import { useAuth } from '@/hooks/useAuth';
const { session, isPending: isSessionLoading } = useAuth();
```

## Migration Steps

1. **Import Change**: Replace `useSession` import with `useAuth` import
2. **Hook Usage**: Update the destructuring pattern
3. **Test**: Verify component still works correctly

## Validation Checklist

After migrating each component:
- [ ] Component renders without errors
- [ ] Auth state is correctly displayed
- [ ] No duplicate auth API calls in network tab
- [ ] Session changes are properly reflected

## Common Issues

1. **Property Access**: The centralized auth returns `session` directly, not `data: session`
2. **Loading State**: Use `isPending` instead of `isLoading`
3. **User Access**: Can access user directly from `useAuth()` as `user` property

## Benefits After Migration

- Single auth API call instead of 6+
- Shared auth state across all components
- Better performance and user experience
- Easier to debug auth issues
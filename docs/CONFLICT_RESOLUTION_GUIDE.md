# Merge Conflict Resolution Guide

## Overview
This PR merges 400 commits from `feature/yearly-subscription-plan` into `main`. The feature adds yearly subscription support with unlimited free models access.

## Conflict Resolution Strategy

### 1. **Import Conflicts**
- **Pattern**: Main branch doesn't have `hasUnlimitedFreeModels` imports
- **Resolution**: Keep the feature branch imports (`.our`) - they're needed for yearly subscription functionality

### 2. **Function Signature Conflicts**
- **Pattern**: Main branch has simpler function signatures without `subscriptionType` and `hasUnlimitedFreeModels` parameters
- **Resolution**: Keep feature branch signatures (`.our`) - they include the new subscription fields

### 3. **Logic Conflicts**
- **Pattern**: Main branch doesn't check for yearly subscriptions
- **Resolution**: Keep feature branch logic (`.our`) - it includes yearly subscription checks

### 4. **Type Definition Conflicts**
- **Pattern**: Main branch doesn't have `subscriptionType` and `hasUnlimitedFreeModels` in interfaces
- **Resolution**: Keep feature branch types (`.our`) - they include subscription metadata

## Step-by-Step Resolution Process

### Step 1: Start Merge
```bash
git checkout feature/yearly-subscription-plan
git merge origin/main
```

### Step 2: Resolve Conflicts File by File

#### Priority Order:
1. **Type definitions** (`lib/types/api.ts`, `lib/middleware/auth.ts`)
2. **Core utilities** (`lib/polar.ts`)
3. **Service layer** (`lib/services/*.ts`)
4. **API routes** (`app/api/**/*.ts`)
5. **Components** (`components/**/*.tsx`)
6. **Pages** (`app/**/page.tsx`)
7. **Tests** (`__tests__/**/*.ts`)

### Step 3: General Resolution Rules

For each conflict:
- **Keep feature branch code (`.our`)** when it adds yearly subscription functionality
- **Keep main branch code (`.their`)** when it's unrelated bug fixes or improvements
- **Merge both** when changes are complementary

### Step 4: Test After Resolution
```bash
pnpm test
pnpm build
```

## Common Conflict Patterns

### Pattern 1: Import Statements
```diff
<<<<<<< .our
import { hasUnlimitedFreeModels } from '@/lib/polar';
=======
import { getRemainingCreditsByExternalId } from '@/lib/polar';
>>>>>>> .their
```
**Resolution**: Keep both imports
```typescript
import { getRemainingCreditsByExternalId, hasUnlimitedFreeModels } from '@/lib/polar';
```

### Pattern 2: Function Parameters
```diff
<<<<<<< .our
const { isUsingOwnApiKeys, isFreeModel, hasCredits, isAnonymous, userId } = context;
=======
const { isUsingOwnApiKeys, isFreeModel, hasCredits, isAnonymous } = context;
>>>>>>> .their
```
**Resolution**: Keep feature branch version (includes `userId`)

### Pattern 3: Conditional Logic
```diff
<<<<<<< .our
const shouldRestrictToFreeModels = isAnonymous || (!hasCredits && !hasUnlimitedFreeModelsAccess);
=======
const shouldRestrictToFreeModels = isAnonymous || !hasCredits;
>>>>>>> .their
```
**Resolution**: Keep feature branch version (includes yearly subscription check)

### Pattern 4: Type Definitions
```diff
<<<<<<< .our
subscriptionType?: 'monthly' | 'yearly' | null;
hasUnlimitedFreeModels?: boolean;
=======
>>>>>>> .their
```
**Resolution**: Keep feature branch types (adds subscription metadata)

## Files with Conflicts

Based on the merge preview, these files have conflicts:

1. `__tests__/components/checkout-button.test.tsx`
2. `lib/db/pool.ts`
3. `lib/services/creditCache.ts`
4. `lib/polar.ts`
5. `lib/auth.ts`
6. `lib/middleware/auth.ts`
7. `app/api/credits/route.ts`
8. `app/api/models/route.ts`
9. `app/api/usage/messages/route.ts`
10. `app/api/chat/route.ts`
11. `app/checkout/success/page.tsx`
12. `app/upgrade/page.tsx`
13. `components/auth/UserAccountMenu.tsx`
14. `components/chat-list.tsx`
15. `components/chat.tsx`
16. `components/checkout-button.tsx`
17. `hooks/useAuth.tsx`
18. `lib/services/chatCreditValidationService.ts`
19. `lib/services/dailyMessageUsageService.ts`

## Automated Resolution Script

After manual review, you can use:
```bash
# Review all conflicts
git diff --name-only --diff-filter=U

# For each file, resolve conflicts then:
git add <resolved-file>
```

## Final Steps

1. Resolve all conflicts
2. Run tests: `pnpm test`
3. Build: `pnpm build`
4. Commit: `git commit -m "Merge main into feature/yearly-subscription-plan"`
5. Push: `git push origin feature/yearly-subscription-plan`

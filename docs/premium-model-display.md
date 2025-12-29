# Premium Model Display Feature

## Overview

This feature allows free users to see premium models in featured sections on the models listing page (`/models`) for marketing and upsell purposes, while maintaining strict security to prevent free users from actually accessing or using premium models.

## Problem Statement

Previously, premium models were completely hidden from free users. This prevented:
- Marketing opportunities to showcase premium models
- User awareness of available premium features
- Upsell opportunities

However, we needed to ensure that:
- Free users cannot select premium models in the model picker
- Free users cannot chat with premium models (security enforced)
- Premium users see premium models as expected
- The existing security model remains intact

## Solution Architecture

### Display Mode vs. Normal Mode

The solution introduces two modes for fetching models:

1. **Normal Mode** (default): Returns only models the user can actually access
   - Used for: Model picker, chat interface, filtered model lists
   - Security: Enforced at API level

2. **Display Mode** (`display=true`): Returns all models with an `accessible` flag
   - Used for: Featured sections, marketing displays
   - Security: Enforced at UI and validation layers

### Security Layers

The security is maintained through multiple layers:

1. **API Layer** (`/app/api/models/route.ts`)
   - Normal mode: Filters models based on user credits/subscription
   - Display mode: Returns all models with `accessible` boolean flag

2. **Model Context** (`/lib/context/model-context.tsx`)
   - Uses normal mode (filtered models)
   - Model picker only shows accessible models

3. **Chat Validation** (`/lib/services/chatCreditValidationService.ts`)
   - Validates model access before allowing chat
   - Blocks premium models for free users

4. **UI Layer** (`/components/models-listing/models-grid.tsx`)
   - Shows premium badge with lock icon for non-accessible models
   - Changes button text to "Upgrade to Access" for premium models

## Implementation Details

### 1. API Route Changes

**File**: `/app/api/models/route.ts`

Added support for `display=true` query parameter:

```typescript
const displayMode = url.searchParams.get('display') === 'true';
```

When `displayMode` is true:
- Returns all models (including premium)
- Adds `accessible` flag to each model indicating if user can use it
- Calculates accessibility based on:
  - Free models: Always accessible
  - Premium models: Accessible if user has credits or premium subscription
  - BYOK models: Accessible if user provided their own API key

### 2. Type Definitions

**File**: `/lib/types/models.ts`

Added optional `accessible` field to `ModelInfo`:

```typescript
interface ModelInfo {
  // ... existing fields
  accessible?: boolean; // Whether the current user can actually use this model (display mode only)
}
```

### 3. Models Hook Enhancement

**File**: `/hooks/use-models.ts`

Added `displayMode` option:

```typescript
interface UseModelsOptions {
  // ... existing options
  displayMode?: boolean; // If true, returns all models with accessible flag
}
```

The hook now:
- Adds `?display=true` to API URL when `displayMode` is true
- Maintains separate cache keys for display vs normal mode
- Supports both modes simultaneously (used on models page)

### 4. Models Page Updates

**File**: `/app/models/page.tsx`

Dual fetching strategy:

```typescript
// Filtered models for actual usage (security enforced)
const { models, isLoading } = useModels();

// All models for display (marketing/upsell) - includes premium with accessible flag
const { models: allModelsForDisplay, isLoading: isLoadingDisplay } = useModels({ displayMode: true });
```

Usage:
- **Featured sections**: Use `allModelsForDisplay` to show premium models
- **Filtered "All Models" section**: Use filtered `models` for security

### 5. ModelsGrid Component

**File**: `/components/models-listing/models-grid.tsx`

Enhanced to handle premium models:

- Added `showAccessibleOnly` prop to filter non-accessible models when needed
- Premium badge with lock icon for non-accessible premium models
- Button text changes:
  - Accessible premium: "View Details"
  - Non-accessible premium: "Upgrade to Access"
  - Free models: "Chat Free"

Visual indicators:
- Premium badge shows lock icon when model is not accessible
- Reduced opacity for non-accessible premium models

## Security Verification

### ✅ Model Picker
- Uses `ModelProvider` context which fetches models in normal mode
- Only shows models that user can actually access
- Premium models not in filtered list cannot be selected

### ✅ Chat Validation
- `ChatCreditValidationService.validateFreeModelAccess()` blocks premium access
- Validates before every chat request
- Throws `PremiumModelRestrictedError` or `FreeModelOnlyError` as appropriate

### ✅ API Filtering
- Normal mode API calls filter models server-side
- Display mode only used for UI display, not for model selection
- User cannot bypass by manipulating client-side code

### ✅ Model Context
- Always uses normal mode (filtered models)
- Model picker inherits filtered models from context
- No way for free users to access premium models through UI

## User Experience

### Free Users
- ✅ See premium models in "Featured Premium Models" section
- ✅ Can view premium model detail pages (informational)
- ✅ See premium badge with lock icon on non-accessible models
- ✅ Button shows "Upgrade to Access" for premium models
- ❌ Cannot select premium models in model picker
- ❌ Cannot chat with premium models (blocked by validation)

### Premium Users
- ✅ See premium models in featured sections
- ✅ Can select and use premium models
- ✅ Premium badge shows without lock icon
- ✅ Button shows "View Details" for premium models

## Testing

### Manual Testing Checklist

1. **As Free User (Anonymous or No Credits)**
   - [ ] Navigate to `/models`
   - [ ] Verify "Featured Premium Models" section appears with premium models
   - [ ] Verify premium models show lock icon on badge
   - [ ] Verify button text is "Upgrade to Access" for premium models
   - [ ] Click on premium model card → Should navigate to model page
   - [ ] Try to select premium model in model picker → Should not appear
   - [ ] Try to chat with premium model → Should be blocked with error

2. **As Premium User (With Credits)**
   - [ ] Navigate to `/models`
   - [ ] Verify "Featured Premium Models" section appears
   - [ ] Verify premium models show premium badge without lock
   - [ ] Verify button text is "View Details" for premium models
   - [ ] Select premium model in model picker → Should work
   - [ ] Chat with premium model → Should work

3. **Security Verification**
   - [ ] Open browser console
   - [ ] Try to manually set a premium model ID → Should be rejected
   - [ ] Try to bypass API filtering → Should fail at validation layer
   - [ ] Verify network requests show filtered models for normal mode

## Files Modified

1. `/app/api/models/route.ts` - Added display mode support
2. `/lib/types/models.ts` - Added `accessible` field
3. `/hooks/use-models.ts` - Added `displayMode` option
4. `/app/models/page.tsx` - Dual fetching for featured sections
5. `/components/models-listing/models-grid.tsx` - Premium model UI handling

## Future Enhancements

Potential improvements:
- Add analytics tracking for premium model views by free users
- A/B test different premium model presentations
- Add "Upgrade" CTA that links to pricing page
- Show premium model usage stats to encourage upgrades
- Add tooltip explaining premium access requirements

## Related Documentation

- [Programmatic SEO Model Pages](./programmatic-seo-model-pages.md)
- [Testing Guide](../testing-programmatic-seo-features.md)
- [Variable Credit Costs](../variable-credit-costs-implementation.md)

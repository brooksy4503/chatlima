<!-- a5991ae3-9e3c-4809-af3b-db6144f4b20e ea552181-7cc2-4484-b954-984ff70eb07d -->
# Add $10/Year Subscription Plan for Unlimited Free Models

## Overview

Add a new $10/year subscription tier that provides unlimited access to free OpenRouter models (`:free` models). The existing $10/month plan (1000 messages for all models) will remain unchanged. Users can only have one active subscription at a time.

## Implementation Plan

### 1. Polar Product Configuration

- **Create new product in Polar dashboard** (manual step - user will do this)
- Product name: "Free Models Unlimited Access" (or similar)
- Price: $10/year
- Billing period: Annual
- **Add environment variable**: `POLAR_PRODUCT_ID_YEARLY` for the new product ID
- **Update checkout configuration** in `lib/auth.ts`:
- Add the new product to the `products` array with a new slug (e.g., `free-models-unlimited`)
- Keep existing `POLAR_PRODUCT_ID` for monthly plan

### 2. Subscription Type Detection

- **Create new function** in `lib/polar.ts`:
- `getSubscriptionTypeByExternalId(userId: string)`: Returns subscription type (`'monthly' | 'yearly' | null`)
- Use `polarClient.customers.getStateExternal()` to get customer state
- Check active subscriptions and match product IDs to determine type
- Cache results similar to credit checking pattern
- **Create helper function** `hasUnlimitedFreeModels(userId: string)`: Returns boolean for $10/year subscribers

### 3. Update User Metadata Schema

- **Extend metadata structure** to include:
- `subscriptionType: 'monthly' | 'yearly' | null`
- Keep `hasSubscription: boolean` for backward compatibility
- **Update webhook handlers** in `lib/auth.ts`:
- `onSubscriptionCreated`: Check product ID and update user metadata with subscription type
- `onSubscriptionCanceled`: Clear subscription type from metadata
- `onSubscriptionRevoked`: Clear subscription type from metadata

### 4. Model Access Logic Updates

- **Update `app/api/models/route.ts`**:
- Modify model filtering logic to check for `hasUnlimitedFreeModels()` subscription
- For $10/year subscribers: Show all free models (`:free` models) regardless of credit status
- For $10/month subscribers: Keep existing behavior (all models if they have credits)
- For non-subscribers: Keep existing free model restrictions
- **Update `lib/services/chatCreditValidationService.ts`**:
- Add check for unlimited free models subscription before enforcing credit requirements
- Allow free model usage without credit deduction for $10/year subscribers

### 5. Message Limit Logic

- **Update `lib/auth.ts` - `checkMessageLimit()` function**:
- For $10/year subscribers using free models: Return unlimited (or very high limit)
- Still track message count for analytics but don't enforce limits
- For premium models: Still require credits/subscription
- **Update `lib/services/dailyMessageUsageService.ts`**:
- Add logic to skip limit enforcement for $10/year subscribers on free models

### 6. Upgrade Page

- **Create `app/upgrade/page.tsx`**:
- Display both subscription options side-by-side
- Show benefits comparison:
- $10/month: 1000 messages, all models (premium + free)
- $10/year: Unlimited messages, free models only
- Include checkout buttons for each plan
- Show current subscription status if user is subscribed
- Handle upgrade/downgrade scenarios (one subscription replaces the other)

### 7. UI Components

- **Update `components/checkout-button.tsx`**:
- Add prop to specify which plan to checkout
- Or create separate components: `MonthlyCheckoutButton` and `YearlyCheckoutButton`
- **Update `components/model-picker.tsx`**:
- Show indicator for unlimited free models subscription
- Display upgrade prompt when trying to access premium models for $10/year subscribers

### 8. API Route Updates

- **Update `app/api/usage/messages/route.ts`**:
- Include `subscriptionType` in response
- Include `hasUnlimitedFreeModels` flag
- **Update `lib/middleware/auth.ts`**:
- Add `subscriptionType` to `AuthContext` type
- Populate from user metadata or Polar API check

### 9. Type Definitions

- **Update `lib/types/api.ts`**:
- Add `subscriptionType?: 'monthly' | 'yearly' | null` to relevant interfaces
- Add `hasUnlimitedFreeModels?: boolean` flag

### 10. Testing Considerations

- Test subscription creation/cancellation webhooks
- Test model filtering for different subscription types
- Test message limit enforcement (or lack thereof) for $10/year subscribers
- Test upgrade flow from yearly to monthly and vice versa
- Verify premium models are blocked for $10/year subscribers

## Key Files to Modify

1. `lib/auth.ts` - Webhook handlers, checkout config
2. `lib/polar.ts` - Subscription type detection functions
3. `app/api/models/route.ts` - Model filtering logic
4. `lib/auth.ts` - `checkMessageLimit()` function
5. `lib/services/dailyMessageUsageService.ts` - Message limit logic
6. `lib/services/chatCreditValidationService.ts` - Credit validation
7. `app/upgrade/page.tsx` - New upgrade page (create)
8. `components/checkout-button.tsx` - Checkout button updates
9. `lib/middleware/auth.ts` - Auth context updates
10. `lib/types/api.ts` - Type definitions

## Environment Variables Needed

- `POLAR_PRODUCT_ID_YEARLY` - Product ID for the $10/year plan (to be set after product creation in Polar)
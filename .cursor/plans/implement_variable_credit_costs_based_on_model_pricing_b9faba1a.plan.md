---
name: Implement Variable Credit Costs Based on Model Pricing
overview: Implement tiered credit costs so expensive models (like o1-pro) cost more credits per message, protecting against users running up large bills while paying a flat rate.
todos:
  - id: "1"
    content: Create lib/utils/creditCostCalculator.ts with calculateCreditCostPerMessage function implementing tier-based pricing (1/2/5/15/30 credits)
    status: completed
  - id: "2"
    content: Update lib/tokenCounter.ts trackTokenUsage() to accept modelInfo parameter and use calculateCreditCostPerMessage() instead of hardcoded 1 credit
    status: completed
  - id: "3"
    content: Update lib/tokenCounter.ts hasEnoughCredits() to check if user has sufficient credits based on model credit cost, not just > 0
    status: completed
  - id: "4"
    content: Update lib/services/creditCache.ts hasEnoughCreditsWithCache() with same credit cost validation logic
    status: completed
  - id: "5"
    content: Update lib/services/directTokenTracking.ts to accept modelInfo in params and fetch if missing, pass to trackTokenUsage()
    status: completed
  - id: "6"
    content: Update lib/services/chatTokenTrackingService.ts to pass modelInfo through to DirectTokenTrackingService
    status: completed
  - id: "7"
    content: Update app/api/chat/route.ts to pass modelValidation.modelInfo to token tracking calls
    status: completed
  - id: "8"
    content: Update lib/services/chatCreditValidationService.ts to calculate and validate required credits based on model cost
    status: completed
  - id: "9"
    content: Add credit cost display to components/model-picker.tsx showing cost per message (or create API endpoint for client-side access)
    status: completed
  - id: "10"
    content: Update tests in lib/services/__tests__/chatCreditValidationService.test.ts to verify tiered credit costs
    status: completed
---

# Implement Variable Credit Costs Based on Model Pricing Tiers

## Overview

Replace the flat 1 credit per message system with variable credit costs based on model pricing. Premium models will cost 2-30 credits depending on their actual API cost, preventing abuse where users could consume $100+ of API costs while only paying $10 in credits.

## Implementation Steps

### 1. Create Credit Cost Calculator Utility

**File: `lib/utils/creditCostCalculator.ts`** (NEW)

Create a new utility function that calculates credit cost based on model pricing:

```typescript
import { ModelInfo } from '@/lib/types/models';

/**
 * Calculates the credit cost per message for a given model
 * Based on tiered pricing structure to protect against expensive model abuse
 * 
 * Tiers:
 * - Free/Standard models: 1 credit
 * - Premium ($3-15/M input or $5-50/M output): 2 credits  
 * - High Premium ($15-50/M): 5 credits
 * - Very High Premium ($50-100/M): 15 credits
 * - Ultra Premium ($100+/M): 30 credits
 */
export function calculateCreditCostPerMessage(modelInfo: ModelInfo | null): number {
  if (!modelInfo) return 1; // Default to 1 credit if model info unavailable
  if (!modelInfo.premium) return 1; // Free/standard models: 1 credit
  
  const inputPrice = modelInfo.pricing?.input || 0;
  const outputPrice = modelInfo.pricing?.output || 0;
  const inputPerMillion = inputPrice * 1000000;
  const outputPerMillion = outputPrice * 1000000;
  
  // Use the higher of input price or scaled output price (output typically higher volume)
  const maxPrice = Math.max(inputPerMillion, outputPerMillion * 0.5);
  
  // Tier determination
  if (maxPrice >= 100) return 30;  // Ultra-premium (o1-pro, o3-pro): 30 credits
  if (maxPrice >= 50) return 15;   // Very High premium (gpt-5-pro): 15 credits
  if (maxPrice >= 15) return 5;    // High premium (claude-opus, gpt-4): 5 credits
  if (inputPerMillion >= 3 || outputPerMillion >= 5) return 2; // Standard premium: 2 credits
  
  return 1; // Fallback
}
```

### 2. Update Credit Deduction Logic

**File: `lib/tokenCounter.ts`**

Modify `trackTokenUsage()` to accept modelInfo and use variable credit costs:

**Changes:**

- Add `modelInfo?: ModelInfo` parameter to function signature (line 23)
- Import `calculateCreditCostPerMessage` from new utility
- Replace line 43: `const totalCreditsToConsume = shouldDeductCredits ? 1 + additionalCost : 0;`
- With: `const baseCreditCost = calculateCreditCostPerMessage(modelInfo);`
- Then: `const totalCreditsToConsume = shouldDeductCredits ? baseCreditCost + additionalCost : 0;`

### 3. Update Credit Validation to Check Sufficient Credits

**File: `lib/tokenCounter.ts`** - `hasEnoughCredits()` function

Modify to check if user has enough credits for the model's credit cost:

**Changes:**

- Import `calculateCreditCostPerMessage`
- Calculate required credits: `const requiredCredits = calculateCreditCostPerMessage(modelInfo);`
- Update line 119-120: Instead of `return remainingCreditsByExternal > 0;` for premium models, use `return remainingCreditsByExternal >= requiredCredits;`
- Update line 122: Change `return remainingCreditsByExternal >= requiredTokens;` to check credits instead
- Apply same logic to legacy method (lines 148-151)

**File: `lib/services/creditCache.ts`** - `hasEnoughCreditsWithCache()` function

Apply same changes as above to the cached version (lines 113-182).

### 4. Update All Credit Deduction Call Sites

Pass modelInfo through the call chain:

**File: `lib/services/directTokenTracking.ts`**

- Add `modelInfo?: ModelInfo` to `DirectTokenTrackingParams` interface (line 19-40)
- Fetch modelInfo if not provided: Use `getModelDetails(params.modelId)` before calling `trackTokenUsage()`
- Update `trackTokenUsage()` call (line 164-171) to include `modelInfo`

**File: `lib/services/chatTokenTrackingService.ts`**

- Add `modelInfo` to context/params if available
- Pass `modelInfo` when calling `DirectTokenTrackingService.processTokenUsage()` (line 107)

**File: `app/api/chat/route.ts`**

- ModelInfo is already available from `modelValidation.modelInfo` (line 416-421)
- Pass `modelInfo` through to `DirectTokenTrackingService.processTokenUsage()` (line 1452)
- Update credit validation to calculate required credits (line 437-446)

### 5. Update Credit Validation Service

**File: `lib/services/chatCreditValidationService.ts`**

**Changes:**

- Import `calculateCreditCostPerMessage`
- After fetching modelInfo (line 137), calculate required credits
- Update credit checks to verify user has enough credits for model cost
- In `validateFreeModelAccess()` and `validatePremiumModelAccess()`, check against calculated credit cost

### 6. Update UI to Display Credit Costs (Optional but Recommended)

**File: `components/model-picker.tsx`**

Add credit cost display to model details:

**Changes:**

- Import `calculateCreditCostPerMessage` utility (note: needs to work client-side or create API endpoint)
- Add credit cost display in model details panel (around line 658-659)
- Show: "Cost: X credits per message" or similar
- Consider adding visual indicator (badge) for expensive models

**Alternative:** Create API endpoint `/api/models/[modelId]/credit-cost` that returns credit cost, call from client

### 7. Update Types and Interfaces

**File: `lib/types/models.ts`** (if needed)

Ensure ModelInfo type includes all necessary pricing fields (already present based on earlier review).

### 8. Testing Considerations

**Test Cases:**

1. Free models should cost 1 credit (unchanged)
2. Standard premium models ($3-15/M) should cost 2 credits
3. High premium models ($15-50/M) should cost 5 credits  
4. Ultra premium models (o1-pro) should cost 30 credits
5. Credit validation should block requests if insufficient credits
6. Web search additional cost should still add to base credit cost
7. BYOK users should not be charged credits
8. Free model users should not be charged credits

**Test Files to Update:**

- `lib/services/__tests__/chatCreditValidationService.test.ts`
- `lib/__tests__/tokenCounter.test.ts` (if exists)
- Integration tests in `app/api/chat/route.ts` tests

## Migration Notes

- **Backward Compatibility:** This is a breaking change for users expecting 1 credit per message
- **Communication:** Consider announcement or in-app notification about new pricing
- **Grandfathering:** Decide if existing users should be grandfathered (not recommended for cost protection)
- **Free Models:** Free models (`:free` suffix) should remain at 1 credit per current logic

## Risk Mitigation

- **Fallback:** If modelInfo unavailable, default to 1 credit (safe fallback)
- **Edge Cases:** Handle models with missing pricing info gracefully
- **Performance:** Credit cost calculation is O(1), no performance impact
- **Testing:** Thoroughly test edge cases before deployment

## Files to Modify

1. `lib/utils/creditCostCalculator.ts` (NEW)
2. `lib/tokenCounter.ts` 
3. `lib/services/creditCache.ts`
4. `lib/services/directTokenTracking.ts`
5. `lib/services/chatTokenTrackingService.ts`
6. `lib/services/chatCreditValidationService.ts`
7. `app/api/chat/route.ts`
8. `components/model-picker.tsx` (optional UI enhancement)

## Estimated Impact

- **Protection:** 10-30x better cost protection on expensive models
- **User Experience:** Transparent pricing, users see cost upfront
- **Revenue:** Better cost coverage, especially for premium models
- **Breaking Change:** Yes - users will use credits faster on premium models
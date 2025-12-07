# Variable Credit Costs Based on Model Pricing

## Overview

ChatLima implements a tiered credit cost system that charges different amounts of credits per message based on the actual API pricing of the AI model being used. This system protects against abuse where users could consume $100+ of API costs while only paying $10 in credits, while also providing transparent pricing to users.

## Credit Cost Tiers

The system uses a five-tier pricing structure based on model API pricing:

| Tier | Price Range | Credit Cost | Example Models |
|------|-------------|-------------|----------------|
| **Free/Standard** | Free or low-cost models | **1 credit** | Most `:free` models, standard GPT-3.5 |
| **Premium** | $3-15/M input or $5-50/M output | **2 credits** | Standard premium models |
| **High Premium** | $15-50/M | **5 credits** | Claude Opus, GPT-4 |
| **Very High Premium** | $50-100/M | **15 credits** | GPT-5 Pro |
| **Ultra Premium** | $100+/M | **30 credits** | o1-pro, o3-pro |

### Tier Calculation Logic

The credit cost is calculated using the following algorithm:

1. **Free models** (models with `premium: false`): Always 1 credit
2. **Premium models**: Calculate based on pricing:
   - Convert per-token prices to per-million-token prices
   - Use the higher of:
     - Input price per million tokens
     - Output price per million tokens × 0.5 (scaled because output is typically higher volume)
   - Apply tier thresholds:
     - ≥ $100/M → 30 credits (Ultra Premium)
     - ≥ $50/M → 15 credits (Very High Premium)
     - ≥ $15/M → 5 credits (High Premium)
     - ≥ $3/M input OR ≥ $5/M output → 2 credits (Premium)
     - Otherwise → 1 credit (fallback)

### Fallback Behavior

- If model information is unavailable: Defaults to 1 credit (safe fallback)
- If pricing data is missing: Defaults to 1 credit for non-premium models, 2 credits for premium models

## User Experience

### Credit Cost Display

Users can see the credit cost for each model in the model picker:

1. **Model Picker Details Panel**: When hovering or selecting a model, the credit cost is displayed
2. **API Endpoint**: `/api/models/[modelId]/credit-cost` provides real-time credit cost information
3. **Visual Indicators**: Premium models show their credit cost prominently

### Credit Validation

Before allowing a message to be sent:

1. **Pre-flight Check**: System calculates required credits (base model cost + additional features like web search)
2. **Balance Verification**: Checks if user has sufficient credits
3. **Blocking**: Prevents message if insufficient credits, with clear error messaging
4. **Transparency**: Users see exactly how many credits will be deducted

### Additional Costs

The base credit cost can be augmented by additional features:

- **Web Search**: +5 credits per message (when enabled)
- **Future features**: Can add additional credit costs as needed

**Total Cost Formula**: `Base Model Cost + Additional Feature Costs`

## Technical Implementation

### Core Components

#### 1. Credit Cost Calculator (`lib/utils/creditCostCalculator.ts`)

The central utility function that calculates credit costs:

```typescript
export function calculateCreditCostPerMessage(modelInfo: ModelInfo | null): number
```

**Parameters:**
- `modelInfo`: Model information including pricing data, or `null` for fallback

**Returns:**
- Number of credits required (1, 2, 5, 15, or 30)

**Usage:**
```typescript
import { calculateCreditCostPerMessage } from '@/lib/utils/creditCostCalculator';

const creditCost = calculateCreditCostPerMessage(modelInfo);
```

#### 2. Credit Validation Service (`lib/services/chatCreditValidationService.ts`)

Validates that users have sufficient credits before allowing model access:

- Calculates required credits based on selected model
- Checks user's credit balance
- Blocks access if insufficient credits
- Provides clear error messages

#### 3. Token Tracking Service (`lib/services/chatTokenTrackingService.ts`)

Tracks token usage and deducts credits:

- Accepts `modelInfo` parameter
- Calculates base credit cost using `calculateCreditCostPerMessage()`
- Adds additional costs (web search, etc.)
- Deducts total credits from user balance

#### 4. Direct Token Tracking (`lib/services/directTokenTracking.ts`)

Handles direct token usage tracking with model-aware credit deduction:

- Fetches model information if not provided
- Passes model info to credit deduction logic
- Tracks actual API usage costs

#### 5. Credit Cache Service (`lib/services/creditCache.ts`)

Cached version of credit validation for performance:

- Same logic as credit validation service
- Includes request-level caching
- Optimized for high-frequency checks

### API Endpoints

#### GET `/api/models/[modelId]/credit-cost`

Returns the credit cost for a specific model.

**Response:**
```json
{
  "modelId": "openai/gpt-4",
  "creditCost": 5,
  "premium": true
}
```

**Usage:**
```typescript
const response = await fetch(`/api/models/${encodeURIComponent(modelId)}/credit-cost`);
const { creditCost } = await response.json();
```

### Integration Points

#### Chat API Route (`app/api/chat/route.ts`)

1. **Model Validation**: Validates model selection and fetches model info
2. **Credit Pre-check**: Validates user has sufficient credits before processing
3. **Token Tracking**: Passes model info to tracking services for accurate deduction

#### Model Picker Component (`components/model-picker.tsx`)

1. **Credit Cost Fetching**: Fetches credit costs for displayed models
2. **UI Display**: Shows credit costs in model details panel
3. **Real-time Updates**: Updates credit costs as user hovers/selects models

## Migration & Breaking Changes

### What Changed

**Before:**
- All models cost 1 credit per message (flat rate)
- Users could use expensive models (o1-pro) for the same cost as free models

**After:**
- Models cost 1-30 credits based on actual API pricing
- Expensive models cost significantly more credits
- Better cost protection for the platform

### Impact on Users

1. **Free Models**: No change (still 1 credit)
2. **Standard Premium Models**: 2x cost (1 → 2 credits)
3. **High-End Models**: 5-30x cost depending on model
4. **Ultra Premium Models**: 30x cost (1 → 30 credits)

### Backward Compatibility

- **Fallback Behavior**: If model info unavailable, defaults to 1 credit (safe)
- **Free Models**: Continue to cost 1 credit (unchanged behavior)
- **BYOK Users**: Not affected (no credit deduction for bring-your-own-key users)
- **Anonymous Users**: Not affected (no credit system for anonymous users)

## Testing

### Test Coverage

The implementation includes comprehensive test coverage:

1. **Unit Tests**: `lib/services/__tests__/chatCreditValidationService.test.ts`
   - Tests tier calculation logic
   - Tests credit validation
   - Tests edge cases (missing pricing, null model info)

2. **Integration Tests**: Chat API route tests
   - Tests end-to-end credit deduction
   - Tests credit validation blocking
   - Tests model info passing through call chain

### Test Cases

1. ✅ Free models cost 1 credit (unchanged)
2. ✅ Standard premium models ($3-15/M) cost 2 credits
3. ✅ High premium models ($15-50/M) cost 5 credits
4. ✅ Ultra premium models (o1-pro) cost 30 credits
5. ✅ Credit validation blocks requests if insufficient credits
6. ✅ Web search additional cost adds to base credit cost
7. ✅ BYOK users are not charged credits
8. ✅ Free model users are not charged credits
9. ✅ Fallback to 1 credit if model info unavailable
10. ✅ Models with missing pricing default appropriately

## Performance Considerations

### Optimization Strategies

1. **Caching**: Model details are cached to avoid repeated API calls
2. **Request-Level Caching**: Credit costs cached per request
3. **Lazy Loading**: Credit costs fetched only when needed in UI
4. **Efficient Calculation**: O(1) credit cost calculation (no performance impact)

### Performance Impact

- **Credit Calculation**: Negligible (< 1ms)
- **API Calls**: Cached, minimal impact
- **UI Updates**: Asynchronous, non-blocking

## Security & Abuse Prevention

### Protection Mechanisms

1. **Pre-flight Validation**: Credits checked before API call
2. **Atomic Deduction**: Credit deduction is atomic (prevents race conditions)
3. **Balance Verification**: Multiple validation points prevent negative balances
4. **Model Cost Awareness**: System knows actual API costs and protects accordingly

### Abuse Scenarios Prevented

- **Expensive Model Abuse**: Users can't consume $100+ API costs for $10 in credits
- **Credit Gaming**: System validates sufficient credits before expensive operations
- **Balance Manipulation**: Atomic operations prevent negative balance exploits

## Future Enhancements

### Potential Improvements

1. **Dynamic Tier Adjustment**: Adjust tiers based on actual usage patterns
2. **User-Specific Pricing**: Different credit costs for different user tiers
3. **Bulk Discounts**: Reduced credit costs for high-volume users
4. **Feature-Specific Costs**: More granular cost breakdown (tokens, features, etc.)
5. **Cost Predictions**: Estimate total cost before sending message
6. **Usage Analytics**: Show credit cost trends and optimization suggestions

## Troubleshooting

### Common Issues

**Issue**: Model shows incorrect credit cost
- **Solution**: Clear model cache, verify model pricing data is up-to-date

**Issue**: User blocked despite having credits
- **Solution**: Check credit balance, verify model cost calculation, check for additional costs (web search)

**Issue**: Credit cost not displaying in UI
- **Solution**: Check API endpoint `/api/models/[modelId]/credit-cost`, verify model ID encoding

### Debugging

Enable debug logging to see credit calculations:

```typescript
// In creditCostCalculator.ts
console.log('Model pricing:', { inputPrice, outputPrice, maxPrice, tier });
```

Check credit validation logs:

```typescript
// In chatCreditValidationService.ts
console.log('Credit validation:', { requiredCredits, userBalance, sufficient });
```

## Related Documentation

- [Credit System Overview](../README.md#-billing--payment-system)
- [Model Picker Documentation](../components/model-picker.tsx)
- [API Documentation](../app/api/models/[modelId]/credit-cost/route.ts)

## Changelog

### Version 0.35.0 (Current)
- ✅ Implemented tiered credit cost system
- ✅ Added credit cost calculator utility
- ✅ Updated all credit deduction logic
- ✅ Added credit cost display in model picker
- ✅ Created API endpoint for credit cost queries
- ✅ Comprehensive test coverage

---

**Last Updated**: 2024-01-XX  
**Author**: Garth Scaysbrook  
**Status**: ✅ Implemented and Production-Ready

---
name: Fix Pricing Decimal Precision
overview: Increase pricing decimal precision from 6 to 9 places in both database schema, display format, and pricing sync threshold to properly show very small prices (like 0.000000005 for thenlper/gte-base) that are currently appearing as zero.
todos:
  - id: update-schema
    content: Update drizzle/schema.ts to change numeric precision from (10,6) to (13,9) for pricing and cost columns
    status: pending
  - id: create-migration
    content: Run pnpm drizzle-kit generate to auto-generate migration SQL file after schema changes
    status: pending
  - id: update-pricing-sync
    content: Update minValidPrice threshold in lib/services/pricingSync.ts from 0.0000001 (1e-7) to 0.000000001 (1e-9)
    status: pending
  - id: update-display-format
    content: Update formatCurrency function in AdminPricingManagement.tsx to use 9 decimal places instead of 6
    status: pending
  - id: update-form-inputs
    content: Update input step values in pricing form to support 9 decimal places (0.000000001)
    status: pending
  - id: verify-other-formatters
    content: Check other currency formatting functions to ensure consistency
    status: pending
---

# Fix Pricing Decimal Precision

## Problem

The pricing display in the Admin Dashboard shows input/output prices as `$0.000000` for very cheap models because:

1. Database schema uses `numeric(10, 6)` - only 6 decimal places
2. Display format uses `minimumFractionDigits: 6, maximumFractionDigits: 6` - only 6 decimal places
3. Prices smaller than 0.000001 (1e-6) are being rounded to zero
4. **Pricing sync threshold** in `pricingSync.ts` skips models with prices below `0.0000001` (1e-7)

## Solution

Update database schema, display formatting, and pricing sync threshold to support 9 decimal places to handle very cheap models like:
- `arcee-ai/trinity-mini`: Input $0.045/M = 0.000000045 per token (9 places)
- `thenlper/gte-base`: Input $0.005/M = 0.000000005 per token (9 places)

## Implementation Steps

### 1. Database Schema Update

- **File**: `drizzle/schema.ts`
  - Change `inputTokenPrice` from `numeric(10, 6)` to `numeric(13, 9)` (precision 13, scale 9)
  - Change `outputTokenPrice` from `numeric(10, 6)` to `numeric(13, 9)`
  - Update related cost fields that use `numeric(10, 6)`:
    - `dailyTokenUsage.totalEstimatedCost` and `totalActualCost`
    - `tokenUsageMetrics.estimatedCost` and `actualCost`

### 2. Database Migration

- After updating schema.ts, run Drizzle migration generation:
  ```bash
  pnpm drizzle-kit generate
  ```
- This will automatically create the migration SQL file in `drizzle/` directory
- Review the generated migration file to ensure it correctly alters column types

### 3. Pricing Sync Threshold Update (CRITICAL)

- **File**: `lib/services/pricingSync.ts` (line 87)
  - Change `minValidPrice` from `0.0000001` (1e-7) to `0.000000001` (1e-9)
  - This ensures very cheap models like `thenlper/gte-base` (0.000000005) are not skipped during sync

```typescript
// Current (line 87):
const minValidPrice = 0.0000001; // 1e-7

// Change to:
const minValidPrice = 0.000000001; // 1e-9 minimum valid price for 9 decimal place support
```

### 4. Display Format Update

- **File**: `components/admin/AdminPricingManagement.tsx`
  - Update `formatCurrency` function (line 143-150):
    - Change `minimumFractionDigits: 6` to `9`
    - Change `maximumFractionDigits: 6` to `9`

### 5. Form Input Precision

- **File**: `components/admin/AdminPricingManagement.tsx`
  - Update input step values (lines 447, 459):
    - Change `step="0.000001"` to `step="0.000000001"` for 9 decimal place precision

### 6. Verify Other Formatting Functions

- Check `scripts/dynamic-api-pricing-analysis.ts` - already handles small values with exponential notation
- Check `components/model-picker.tsx` - uses per-million formatting (not affected)
- Other currency formatters use 2 decimal places for larger amounts (appropriate)

## Files to Modify

1. `drizzle/schema.ts` - Update numeric precision/scale from (10,6) to (13,9)
2. `drizzle/XXXX_new_migration.sql` - Auto-generated via `pnpm drizzle-kit generate`
3. `lib/services/pricingSync.ts` - Update minValidPrice threshold from 1e-7 to 1e-9
4. `components/admin/AdminPricingManagement.tsx` - Update formatCurrency and input steps

## Testing

- Verify prices like 0.000000005 (thenlper/gte-base) and 0.000000045 (arcee-ai/trinity-mini) display correctly
- Check that existing prices still display correctly
- Test form inputs accept 9 decimal places
- Verify database migration runs successfully
- Click "Sync Pricing" in Admin Dashboard and verify very cheap models are now stored (not skipped)
- Check console logs during sync to confirm models are no longer being skipped due to "pricing too small"
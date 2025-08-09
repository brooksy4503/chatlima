-- Fix the model_pricing unique constraint
-- The current constraint prevents multiple pricing entries for the same model+provider
-- This breaks historical pricing tracking and causes sync failures

-- Drop the problematic constraint
ALTER TABLE "model_pricing" DROP CONSTRAINT "model_pricing_model_id_provider_active_idx";

-- Add a proper conditional unique constraint that only applies to active entries
-- This allows multiple historical entries but ensures only one active entry per model+provider
CREATE UNIQUE INDEX "model_pricing_unique_active_model_provider_idx" 
ON "model_pricing" ("model_id", "provider") 
WHERE "is_active" = true;

-- Add a comment to explain the constraint
COMMENT ON INDEX "model_pricing_unique_active_model_provider_idx" IS 
'Ensures only one active pricing entry per model+provider combination while allowing historical entries';
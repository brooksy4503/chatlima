-- Remove the one_default_per_user constraint that's causing duplicate key violations
-- This constraint is no longer needed as the application handles default preset logic
ALTER TABLE "presets" DROP CONSTRAINT IF EXISTS "one_default_per_user"; 
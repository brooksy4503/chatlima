ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "model_id" text;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "model_provider" text;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "model_display_name" text;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "comparison_turn_id" text;

-- Create presets table with simplified schema
CREATE TABLE "presets" (
  "id" text PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "model_id" text NOT NULL,
  "system_instruction" text NOT NULL,
  "temperature" integer NOT NULL,
  "max_tokens" integer NOT NULL,
  "web_search_enabled" boolean DEFAULT false,
  "web_search_context_size" text DEFAULT 'medium',
  "api_key_preferences" jsonb DEFAULT '{}',
  "is_default" boolean DEFAULT false,
  "share_id" text UNIQUE,
  "visibility" text DEFAULT 'private',
  "version" integer DEFAULT 1,
  "created_at" timestamp DEFAULT NOW() NOT NULL,
  "updated_at" timestamp DEFAULT NOW() NOT NULL,
  "deleted_at" timestamp,
  
  -- Constraints
  CONSTRAINT "check_name_length" CHECK (char_length("name") >= 1 AND char_length("name") <= 100),
  CONSTRAINT "check_system_instruction_length" CHECK (char_length("system_instruction") >= 10 AND char_length("system_instruction") <= 4000),
  CONSTRAINT "check_temperature_range" CHECK ("temperature" >= 0 AND "temperature" <= 2000),
  CONSTRAINT "check_max_tokens_range" CHECK ("max_tokens" > 0 AND "max_tokens" <= 100000),
  CONSTRAINT "check_visibility" CHECK ("visibility" IN ('private', 'shared')),
  CONSTRAINT "check_web_search_context_size" CHECK ("web_search_context_size" IN ('low', 'medium', 'high')),
  CONSTRAINT "check_share_id_format" CHECK ("share_id" IS NULL OR (char_length("share_id") >= 20 AND char_length("share_id") <= 50)),
  CONSTRAINT "unique_name_per_user" UNIQUE ("user_id", "name"),
  CONSTRAINT "one_default_per_user" UNIQUE ("user_id", "is_default") DEFERRABLE INITIALLY DEFERRED
);

-- Create preset usage tracking table
CREATE TABLE "preset_usage" (
  "id" text PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "preset_id" text NOT NULL REFERENCES "presets"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "chat_id" text,
  "used_at" timestamp DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX "idx_presets_user_id" ON "presets"("user_id") WHERE "deleted_at" IS NULL;
CREATE INDEX "idx_presets_share_id" ON "presets"("share_id") WHERE "share_id" IS NOT NULL;
CREATE INDEX "idx_presets_model_id" ON "presets"("model_id") WHERE "deleted_at" IS NULL;
CREATE INDEX "idx_presets_created_at" ON "presets"("created_at");
CREATE INDEX "idx_preset_usage_preset_id" ON "preset_usage"("preset_id");
CREATE INDEX "idx_preset_usage_user_id" ON "preset_usage"("user_id");
CREATE INDEX "idx_preset_usage_used_at" ON "preset_usage"("used_at");

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_presets_updated_at 
  BEFORE UPDATE ON "presets" 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add default_preset_id to users table
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "default_preset_id" text REFERENCES "presets"("id") ON DELETE SET NULL;

-- Function to generate secure share IDs
CREATE OR REPLACE FUNCTION generate_share_id()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(20), 'base64')::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Migration function to handle existing anonymous users
CREATE OR REPLACE FUNCTION migrate_anonymous_presets(
  p_anonymous_user_id text,
  p_authenticated_user_id text
) RETURNS VOID AS $$
BEGIN
  -- Transfer presets from anonymous user to authenticated user
  UPDATE "presets" 
  SET "user_id" = p_authenticated_user_id 
  WHERE "user_id" = p_anonymous_user_id;
  
  -- Log the migration
  INSERT INTO "preset_usage" ("preset_id", "user_id", "chat_id", "used_at")
  SELECT "id", p_authenticated_user_id, NULL, NOW()
  FROM "presets" 
  WHERE "user_id" = p_authenticated_user_id
  AND "created_at" <= NOW() - INTERVAL '1 minute'; -- Recently migrated presets
END;
$$ LANGUAGE plpgsql;
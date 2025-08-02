-- Add admin role fields to user table
ALTER TABLE "user" 
ADD COLUMN "role" text DEFAULT 'user',
ADD COLUMN "is_admin" boolean DEFAULT false;

-- Create index for role lookups
CREATE INDEX "user_role_idx" ON "user" ("role");
CREATE INDEX "user_is_admin_idx" ON "user" ("is_admin"); 
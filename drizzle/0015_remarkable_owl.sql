-- First add the column as nullable
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "token" text;
-- Then update existing records to use the sessionToken value
UPDATE "session" SET "token" = "sessionToken" WHERE "token" IS NULL;
-- Finally make the column NOT NULL if needed
ALTER TABLE "session" ALTER COLUMN "token" SET NOT NULL;
-- This migration fixes issues with the session table token column
-- First check if token column exists, and if it does, drop it
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'session' AND column_name = 'token'
    ) THEN
        ALTER TABLE "session" DROP COLUMN "token";
    END IF;
END $$; 
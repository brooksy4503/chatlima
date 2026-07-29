-- Rename session.expires → expiresAt (idempotent).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'session' AND column_name = 'expires'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'session' AND column_name = 'expiresAt'
  ) THEN
    ALTER TABLE "session" RENAME COLUMN "expires" TO "expiresAt";
  END IF;
END $$;

-- Align account token expiry column name/type with Better Auth.
-- Production already renamed via push; fresh DBs still have expires_at after 0008.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'account' AND column_name = 'expires_at'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'account' AND column_name = 'access_token_expires_at'
  ) THEN
    ALTER TABLE "account" RENAME COLUMN "expires_at" TO "access_token_expires_at";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'account'
      AND column_name = 'access_token_expires_at'
      AND data_type = 'timestamp without time zone'
  ) THEN
    ALTER TABLE "account"
      ALTER COLUMN "access_token_expires_at"
      SET DATA TYPE integer
      USING EXTRACT(epoch FROM "access_token_expires_at")::integer;
  END IF;
END $$;

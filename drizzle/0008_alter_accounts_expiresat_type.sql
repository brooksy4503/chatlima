-- Convert account.expires_at to timestamp when still integer (fresh baseline).
-- No-op if already timestamp or column already renamed.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'account'
      AND column_name = 'expires_at'
      AND data_type = 'integer'
  ) THEN
    ALTER TABLE "account"
      ALTER COLUMN "expires_at"
      SET DATA TYPE timestamp
      USING to_timestamp(expires_at);
  END IF;
END $$;

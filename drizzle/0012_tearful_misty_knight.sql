-- access_token_expires_at: integer epoch → timestamp (idempotent).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'account'
      AND column_name = 'access_token_expires_at'
      AND data_type = 'integer'
  ) THEN
    ALTER TABLE "account"
      ALTER COLUMN "access_token_expires_at"
      SET DATA TYPE timestamp
      USING to_timestamp("access_token_expires_at");
  END IF;
END $$;

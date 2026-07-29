-- providerType optional (idempotent).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'account'
      AND column_name = 'providerType'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE "account" ALTER COLUMN "providerType" DROP NOT NULL;
  END IF;
END $$;

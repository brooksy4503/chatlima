-- emailVerified: timestamp → boolean (idempotent).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user'
      AND column_name = 'emailVerified'
      AND data_type = 'timestamp without time zone'
  ) THEN
    ALTER TABLE "user"
      ALTER COLUMN "emailVerified"
      SET DATA TYPE boolean
      USING ("emailVerified" IS NOT NULL);
  END IF;
END $$;

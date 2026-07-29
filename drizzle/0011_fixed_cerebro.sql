-- Add surrogate primary key on account (replaces composite providerId+accountId PK).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'account_providerId_accountId_pk'
  ) THEN
    ALTER TABLE "account" DROP CONSTRAINT "account_providerId_accountId_pk";
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'account' AND column_name = 'id'
  ) THEN
    ALTER TABLE "account" ADD COLUMN "id" text;
    UPDATE "account"
      SET "id" = md5(random()::text || clock_timestamp()::text || COALESCE("accountId", '') || COALESCE("providerId", ''))
      WHERE "id" IS NULL;
    ALTER TABLE "account" ALTER COLUMN "id" SET NOT NULL;
    ALTER TABLE "account" ADD PRIMARY KEY ("id");
  END IF;
END $$;

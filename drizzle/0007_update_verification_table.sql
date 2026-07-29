-- Reshape verificationToken → verification (Better Auth).
-- Idempotent: no-op if "verification" already exists; create final shape if neither exists.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'verification'
  ) THEN
    -- Already migrated (production / re-run)
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'verificationToken'
  ) THEN
    ALTER TABLE "verificationToken" RENAME TO "verification";
    ALTER TABLE "verification" RENAME COLUMN "expires" TO "expiresAt";
    ALTER TABLE "verification" DROP CONSTRAINT IF EXISTS "verificationToken_token_unique";
    ALTER TABLE "verification" DROP CONSTRAINT IF EXISTS "verificationToken_identifier_token_pk";
    ALTER TABLE "verification" ADD COLUMN "id" text;
    UPDATE "verification" SET "id" = md5(random()::text || clock_timestamp()::text) WHERE "id" IS NULL;
    ALTER TABLE "verification" ALTER COLUMN "id" SET NOT NULL;
    ALTER TABLE "verification" ADD PRIMARY KEY ("id");
    ALTER TABLE "verification" ADD COLUMN "value" text;
    UPDATE "verification" SET "value" = COALESCE("token", '') WHERE "value" IS NULL;
    ALTER TABLE "verification" ALTER COLUMN "value" SET NOT NULL;
    ALTER TABLE "verification" DROP COLUMN IF EXISTS "token";
    -- Better Auth timestamps
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'verification' AND column_name = 'createdAt'
    ) THEN
      ALTER TABLE "verification" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'verification' AND column_name = 'updatedAt'
    ) THEN
      ALTER TABLE "verification" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;
    END IF;
    RETURN;
  END IF;

  -- Fresh path: create final verification table directly
  CREATE TABLE "verification" (
    "id" text PRIMARY KEY NOT NULL,
    "identifier" text NOT NULL,
    "value" text NOT NULL,
    "expiresAt" timestamp NOT NULL,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL
  );
END $$;

-- Baseline Better Auth tables for fresh databases (CI / new envs).
-- These tables were originally applied via drizzle-kit push on production and
-- never had a CREATE migration. 0007+ ALTERs assume they already exist.
-- Fully idempotent: safe if production already has the modern auth stack.

DO $$
BEGIN
  -- user (shape as of 0007_snapshot / pre-0008)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user'
  ) THEN
    CREATE TABLE "user" (
      "id" text PRIMARY KEY NOT NULL,
      "name" text,
      "email" text NOT NULL,
      "emailVerified" timestamp,
      "image" text,
      "createdAt" timestamp DEFAULT now() NOT NULL,
      "updatedAt" timestamp DEFAULT now() NOT NULL,
      CONSTRAINT "user_email_unique" UNIQUE ("email")
    );
  END IF;

  -- account (composite PK; id column added in 0011)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'account'
  ) THEN
    CREATE TABLE "account" (
      "userId" text NOT NULL,
      "providerId" text NOT NULL,
      "accountId" text NOT NULL,
      "providerType" text NOT NULL,
      "access_token" text,
      "refresh_token" text,
      "expires_at" integer,
      "token_type" text,
      "scope" text,
      "id_token" text,
      "session_state" text,
      "createdAt" timestamp DEFAULT now() NOT NULL,
      "updatedAt" timestamp DEFAULT now() NOT NULL,
      CONSTRAINT "account_providerId_accountId_pk" PRIMARY KEY ("providerId", "accountId"),
      CONSTRAINT "account_userId_user_id_fk"
        FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action
    );
  END IF;

  -- session (expires renamed to expiresAt in 0014)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'session'
  ) THEN
    CREATE TABLE "session" (
      "id" text PRIMARY KEY NOT NULL,
      "sessionToken" text NOT NULL,
      "userId" text NOT NULL,
      "expires" timestamp NOT NULL,
      "ipAddress" text,
      "userAgent" text,
      "createdAt" timestamp DEFAULT now() NOT NULL,
      "updatedAt" timestamp DEFAULT now() NOT NULL,
      CONSTRAINT "session_sessionToken_unique" UNIQUE ("sessionToken"),
      CONSTRAINT "session_userId_user_id_fk"
        FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action
    );
  END IF;

  -- Legacy NextAuth-style verificationToken; 0007 renames/reshapes to verification.
  -- Skip if modern "verification" already exists (production).
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'verificationToken'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'verification'
  ) THEN
    CREATE TABLE "verificationToken" (
      "identifier" text NOT NULL,
      "token" text NOT NULL,
      "expires" timestamp NOT NULL,
      CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY ("identifier", "token"),
      CONSTRAINT "verificationToken_token_unique" UNIQUE ("token")
    );
  END IF;
END $$;

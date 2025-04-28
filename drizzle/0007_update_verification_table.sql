ALTER TABLE "verificationToken" RENAME TO "verification";--> statement-breakpoint
ALTER TABLE "verification" RENAME COLUMN "expires" TO "expiresAt";--> statement-breakpoint
ALTER TABLE "verification" DROP CONSTRAINT "verificationToken_token_unique";--> statement-breakpoint
ALTER TABLE "verification" DROP CONSTRAINT "verificationToken_identifier_token_pk";--> statement-breakpoint
ALTER TABLE "verification" ADD COLUMN "id" text PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "verification" ADD COLUMN "value" text NOT NULL;--> statement-breakpoint
ALTER TABLE "verification" DROP COLUMN "token";
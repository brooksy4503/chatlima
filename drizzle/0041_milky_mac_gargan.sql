CREATE TABLE "daily_message_usage" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"message_count" integer DEFAULT 0 NOT NULL,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"last_message_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "daily_message_usage_user_date_idx" UNIQUE("user_id","date"),
	CONSTRAINT "check_daily_message_usage_count_non_negative" CHECK ("daily_message_usage"."message_count" >= 0),
	CONSTRAINT "check_daily_message_usage_count_reasonable" CHECK ("daily_message_usage"."message_count" <= 1000)
);
--> statement-breakpoint
ALTER TABLE "daily_message_usage" ADD CONSTRAINT "daily_message_usage_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_daily_message_usage_user_id" ON "daily_message_usage" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_daily_message_usage_date" ON "daily_message_usage" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_daily_message_usage_user_date" ON "daily_message_usage" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "idx_daily_message_usage_is_anonymous" ON "daily_message_usage" USING btree ("is_anonymous");
CREATE TABLE "usage_limits" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"model_id" text,
	"provider" text,
	"daily_token_limit" integer NOT NULL,
	"monthly_token_limit" integer NOT NULL,
	"daily_cost_limit" numeric(10, 2) NOT NULL,
	"monthly_cost_limit" numeric(10, 2) NOT NULL,
	"request_rate_limit" integer DEFAULT 60 NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "check_usage_limits_positive" CHECK ("usage_limits"."daily_token_limit" >= 0 AND "usage_limits"."monthly_token_limit" >= 0 AND "usage_limits"."daily_cost_limit" >= 0 AND "usage_limits"."monthly_cost_limit" >= 0 AND "usage_limits"."request_rate_limit" >= 1),
	CONSTRAINT "check_usage_limits_user_or_model" CHECK (("usage_limits"."user_id" IS NOT NULL) OR ("usage_limits"."model_id" IS NOT NULL AND "usage_limits"."provider" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "usage_limits" ADD CONSTRAINT "usage_limits_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_usage_limits_user_id" ON "usage_limits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_usage_limits_model_id" ON "usage_limits" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "idx_usage_limits_provider" ON "usage_limits" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "idx_usage_limits_is_active" ON "usage_limits" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_usage_limits_created_at" ON "usage_limits" USING btree ("created_at");
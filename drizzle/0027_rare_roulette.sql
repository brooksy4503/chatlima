CREATE TABLE "daily_token_usage" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"provider" text NOT NULL,
	"total_input_tokens" integer DEFAULT 0 NOT NULL,
	"total_output_tokens" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer DEFAULT 0 NOT NULL,
	"total_estimated_cost" numeric(10, 6) DEFAULT '0' NOT NULL,
	"total_actual_cost" numeric(10, 6) DEFAULT '0' NOT NULL,
	"request_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "daily_token_usage_user_id_date_provider_idx" UNIQUE("user_id","date","provider"),
	CONSTRAINT "check_daily_token_usage_tokens_non_negative" CHECK ("daily_token_usage"."total_input_tokens" >= 0 AND "daily_token_usage"."total_output_tokens" >= 0 AND "daily_token_usage"."total_tokens" >= 0),
	CONSTRAINT "check_daily_token_usage_cost_non_negative" CHECK ("daily_token_usage"."total_estimated_cost" >= 0 AND "daily_token_usage"."total_actual_cost" >= 0)
);
--> statement-breakpoint
CREATE TABLE "model_pricing" (
	"id" text PRIMARY KEY NOT NULL,
	"model_id" text NOT NULL,
	"provider" text NOT NULL,
	"input_token_price" numeric(10, 6) NOT NULL,
	"output_token_price" numeric(10, 6) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"effective_from" timestamp DEFAULT now() NOT NULL,
	"effective_to" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "model_pricing_model_id_provider_active_idx" UNIQUE("model_id","provider"),
	CONSTRAINT "check_model_pricing_prices_positive" CHECK ("model_pricing"."input_token_price" > 0 AND "model_pricing"."output_token_price" > 0)
);
--> statement-breakpoint
CREATE TABLE "token_usage_metrics" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"chat_id" text NOT NULL,
	"message_id" text NOT NULL,
	"model_id" text NOT NULL,
	"provider" text NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer DEFAULT 0 NOT NULL,
	"estimated_cost" numeric(10, 6) DEFAULT '0' NOT NULL,
	"actual_cost" numeric(10, 6),
	"currency" text DEFAULT 'USD' NOT NULL,
	"processing_time_ms" integer,
	"status" text DEFAULT 'completed' NOT NULL,
	"error_message" text,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "check_token_usage_metrics_status" CHECK ("token_usage_metrics"."status" IN ('pending', 'processing', 'completed', 'failed')),
	CONSTRAINT "check_token_usage_metrics_tokens_non_negative" CHECK ("token_usage_metrics"."input_tokens" >= 0 AND "token_usage_metrics"."output_tokens" >= 0 AND "token_usage_metrics"."total_tokens" >= 0),
	CONSTRAINT "check_token_usage_metrics_cost_non_negative" CHECK ("token_usage_metrics"."estimated_cost" >= 0 AND ("token_usage_metrics"."actual_cost" IS NULL OR "token_usage_metrics"."actual_cost" >= 0))
);
--> statement-breakpoint
ALTER TABLE "daily_token_usage" ADD CONSTRAINT "daily_token_usage_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token_usage_metrics" ADD CONSTRAINT "token_usage_metrics_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token_usage_metrics" ADD CONSTRAINT "token_usage_metrics_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token_usage_metrics" ADD CONSTRAINT "token_usage_metrics_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_daily_token_usage_date" ON "daily_token_usage" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_model_pricing_provider" ON "model_pricing" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "idx_model_pricing_effective_from" ON "model_pricing" USING btree ("effective_from");--> statement-breakpoint
CREATE INDEX "idx_token_usage_metrics_user_id" ON "token_usage_metrics" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_token_usage_metrics_chat_id" ON "token_usage_metrics" USING btree ("chat_id");--> statement-breakpoint
CREATE INDEX "idx_token_usage_metrics_model_id" ON "token_usage_metrics" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "idx_token_usage_metrics_provider" ON "token_usage_metrics" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "idx_token_usage_metrics_created_at" ON "token_usage_metrics" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_token_usage_metrics_status" ON "token_usage_metrics" USING btree ("status");
ALTER TABLE "token_usage_metrics" ADD COLUMN "time_to_first_token_ms" integer;--> statement-breakpoint
ALTER TABLE "token_usage_metrics" ADD COLUMN "tokens_per_second" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "token_usage_metrics" ADD COLUMN "streaming_start_time" timestamp;
ALTER TABLE "daily_token_usage" ALTER COLUMN "total_estimated_cost" SET DATA TYPE numeric(13, 9);--> statement-breakpoint
ALTER TABLE "daily_token_usage" ALTER COLUMN "total_estimated_cost" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "daily_token_usage" ALTER COLUMN "total_actual_cost" SET DATA TYPE numeric(13, 9);--> statement-breakpoint
ALTER TABLE "daily_token_usage" ALTER COLUMN "total_actual_cost" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "model_pricing" ALTER COLUMN "input_token_price" SET DATA TYPE numeric(13, 9);--> statement-breakpoint
ALTER TABLE "model_pricing" ALTER COLUMN "output_token_price" SET DATA TYPE numeric(13, 9);--> statement-breakpoint
ALTER TABLE "token_usage_metrics" ALTER COLUMN "estimated_cost" SET DATA TYPE numeric(13, 9);--> statement-breakpoint
ALTER TABLE "token_usage_metrics" ALTER COLUMN "estimated_cost" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "token_usage_metrics" ALTER COLUMN "actual_cost" SET DATA TYPE numeric(13, 9);
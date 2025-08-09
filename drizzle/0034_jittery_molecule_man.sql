CREATE INDEX "idx_daily_token_usage_user_id" ON "daily_token_usage" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_daily_token_usage_provider" ON "daily_token_usage" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "idx_daily_token_usage_user_date_provider" ON "daily_token_usage" USING btree ("user_id","date","provider");
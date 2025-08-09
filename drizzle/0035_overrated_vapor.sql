CREATE INDEX "idx_model_pricing_model_provider_active_effective" ON "model_pricing" USING btree ("model_id","provider","is_active","effective_from");--> statement-breakpoint
CREATE INDEX "idx_token_usage_metrics_user_created_at" ON "token_usage_metrics" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_token_usage_metrics_user_provider_created_at" ON "token_usage_metrics" USING btree ("user_id","provider","created_at");--> statement-breakpoint
CREATE INDEX "idx_token_usage_metrics_model_provider" ON "token_usage_metrics" USING btree ("model_id","provider");
CREATE INDEX "idx_model_pricing_model_id" ON "model_pricing" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "idx_model_pricing_is_active" ON "model_pricing" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_model_pricing_model_provider_active" ON "model_pricing" USING btree ("model_id","provider","is_active");
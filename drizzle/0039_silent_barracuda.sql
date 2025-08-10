CREATE TABLE "cleanup_config" (
	"id" text PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"schedule" text DEFAULT '0 2 * * 0' NOT NULL,
	"threshold_days" integer DEFAULT 45 NOT NULL,
	"batch_size" integer DEFAULT 50 NOT NULL,
	"notification_enabled" boolean DEFAULT true NOT NULL,
	"webhook_url" text,
	"email_enabled" boolean DEFAULT false NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL,
	"modified_by" text,
	"modified_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cleanup_config_singleton" UNIQUE("id"),
	CONSTRAINT "check_cleanup_config_threshold_days" CHECK ("cleanup_config"."threshold_days" >= 7 AND "cleanup_config"."threshold_days" <= 365),
	CONSTRAINT "check_cleanup_config_batch_size" CHECK ("cleanup_config"."batch_size" >= 1 AND "cleanup_config"."batch_size" <= 100)
);
--> statement-breakpoint
CREATE TABLE "cleanup_execution_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"executed_at" timestamp NOT NULL,
	"executed_by" text NOT NULL,
	"admin_user_id" text,
	"admin_user_email" text,
	"users_counted" integer NOT NULL,
	"users_deleted" integer NOT NULL,
	"threshold_days" integer NOT NULL,
	"batch_size" integer NOT NULL,
	"duration_ms" integer NOT NULL,
	"status" text NOT NULL,
	"error_message" text,
	"error_count" integer DEFAULT 0 NOT NULL,
	"dry_run" boolean DEFAULT false NOT NULL,
	"deleted_user_ids" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "check_cleanup_execution_logs_executed_by" CHECK ("cleanup_execution_logs"."executed_by" IN ('admin', 'cron', 'script')),
	CONSTRAINT "check_cleanup_execution_logs_status" CHECK ("cleanup_execution_logs"."status" IN ('success', 'error', 'partial')),
	CONSTRAINT "check_cleanup_execution_logs_positive" CHECK ("cleanup_execution_logs"."users_counted" >= 0 AND "cleanup_execution_logs"."users_deleted" >= 0 AND "cleanup_execution_logs"."threshold_days" > 0 AND "cleanup_execution_logs"."batch_size" > 0 AND "cleanup_execution_logs"."duration_ms" >= 0 AND "cleanup_execution_logs"."error_count" >= 0),
	CONSTRAINT "check_cleanup_execution_logs_users_deleted" CHECK ("cleanup_execution_logs"."users_deleted" <= "cleanup_execution_logs"."users_counted")
);
--> statement-breakpoint
ALTER TABLE "cleanup_config" ADD CONSTRAINT "cleanup_config_modified_by_user_id_user_id_fk" FOREIGN KEY ("modified_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cleanup_execution_logs" ADD CONSTRAINT "cleanup_execution_logs_admin_user_id_user_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_cleanup_config_enabled" ON "cleanup_config" USING btree ("enabled");--> statement-breakpoint
CREATE INDEX "idx_cleanup_config_last_modified" ON "cleanup_config" USING btree ("last_modified");--> statement-breakpoint
CREATE INDEX "idx_cleanup_execution_logs_executed_at" ON "cleanup_execution_logs" USING btree ("executed_at");--> statement-breakpoint
CREATE INDEX "idx_cleanup_execution_logs_executed_by" ON "cleanup_execution_logs" USING btree ("executed_by");--> statement-breakpoint
CREATE INDEX "idx_cleanup_execution_logs_status" ON "cleanup_execution_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_cleanup_execution_logs_admin_user_id" ON "cleanup_execution_logs" USING btree ("admin_user_id");--> statement-breakpoint
CREATE INDEX "idx_cleanup_execution_logs_executed_by_status" ON "cleanup_execution_logs" USING btree ("executed_by","status");--> statement-breakpoint
CREATE INDEX "idx_cleanup_execution_logs_executed_at_status" ON "cleanup_execution_logs" USING btree ("executed_at","status");
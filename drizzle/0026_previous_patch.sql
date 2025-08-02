CREATE TABLE "chat_shares" (
	"id" text PRIMARY KEY NOT NULL,
	"chat_id" text NOT NULL,
	"owner_user_id" text NOT NULL,
	"share_id" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"visibility" text DEFAULT 'unlisted' NOT NULL,
	"snapshot_json" json NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"revoked_at" timestamp,
	CONSTRAINT "chat_shares_share_id_unique" UNIQUE("share_id"),
	CONSTRAINT "check_chat_shares_status" CHECK ("chat_shares"."status" IN ('active','revoked')),
	CONSTRAINT "check_chat_shares_visibility" CHECK ("chat_shares"."visibility" IN ('unlisted')),
	CONSTRAINT "check_chat_shares_share_id_format" CHECK (char_length("chat_shares"."share_id") >= 20 AND char_length("chat_shares"."share_id") <= 64)
);
--> statement-breakpoint
ALTER TABLE "chat_shares" ADD CONSTRAINT "chat_shares_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_shares" ADD CONSTRAINT "chat_shares_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_chat_shares_chat_id_status" ON "chat_shares" USING btree ("chat_id","status");--> statement-breakpoint
CREATE INDEX "idx_chat_shares_owner_user_id_status" ON "chat_shares" USING btree ("owner_user_id","status");
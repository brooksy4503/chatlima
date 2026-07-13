ALTER TABLE "chats" ADD COLUMN "active_leaf_message_id" text;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "parent_message_id" text;--> statement-breakpoint
CREATE INDEX "idx_chats_active_leaf" ON "chats" USING btree ("active_leaf_message_id");--> statement-breakpoint
CREATE INDEX "idx_messages_chat_parent" ON "messages" USING btree ("chat_id","parent_message_id");--> statement-breakpoint
CREATE INDEX "idx_messages_chat_created" ON "messages" USING btree ("chat_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_messages_chat_comparison" ON "messages" USING btree ("chat_id","comparison_turn_id");
ALTER TABLE "messages" ADD COLUMN "has_web_search" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "web_search_context_size" text DEFAULT 'medium';
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'messages' AND column_name = 'has_web_search'
    ) THEN
        ALTER TABLE "messages" ADD COLUMN "has_web_search" boolean DEFAULT false;
    END IF;
END $$;--> statement-breakpoint

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'messages' AND column_name = 'web_search_context_size'
    ) THEN
        ALTER TABLE "messages" ADD COLUMN "web_search_context_size" text DEFAULT 'medium';
    END IF;
END $$;
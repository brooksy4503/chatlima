DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'polar_usage_events'
    ) THEN
        CREATE TABLE "polar_usage_events" (
            "id" text PRIMARY KEY NOT NULL,
            "user_id" text NOT NULL,
            "polar_customer_id" text,
            "event_name" text NOT NULL,
            "event_payload" json NOT NULL,
            "created_at" timestamp DEFAULT now() NOT NULL
        );
        
        ALTER TABLE "polar_usage_events" ADD CONSTRAINT "polar_usage_events_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
END $$;
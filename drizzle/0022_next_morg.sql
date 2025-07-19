CREATE TABLE "presets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"model" text NOT NULL,
	"temperature" numeric DEFAULT '0.7',
	"max_tokens" integer,
	"system_prompt" text
);
--> statement-breakpoint
ALTER TABLE "presets" ADD CONSTRAINT "presets_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
CREATE TABLE "favorite_models" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"model_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_user_model" UNIQUE("user_id","model_id")
);
--> statement-breakpoint
ALTER TABLE "favorite_models" ADD CONSTRAINT "favorite_models_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
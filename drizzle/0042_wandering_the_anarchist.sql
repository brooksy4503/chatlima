CREATE TABLE "mcp_oauth_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"server_url" text NOT NULL,
	"resource" text NOT NULL,
	"state" text NOT NULL,
	"code_verifier" text NOT NULL,
	"resource_metadata_url" text,
	"authorization_server" text,
	"authorization_endpoint" text,
	"token_endpoint" text,
	"registration_endpoint" text,
	"client_id" text,
	"client_secret" text,
	"scope" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mcp_oauth_sessions_state_unique" UNIQUE("state")
);
--> statement-breakpoint
CREATE TABLE "mcp_oauth_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"server_url" text NOT NULL,
	"resource" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"token_type" text DEFAULT 'Bearer',
	"scope" text,
	"expires_at" timestamp,
	"token_endpoint" text,
	"client_id" text,
	"client_secret" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mcp_oauth_tokens_user_server_unique" UNIQUE("user_id","server_url")
);
--> statement-breakpoint
ALTER TABLE "mcp_oauth_sessions" ADD CONSTRAINT "mcp_oauth_sessions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mcp_oauth_tokens" ADD CONSTRAINT "mcp_oauth_tokens_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_mcp_oauth_tokens_user_id" ON "mcp_oauth_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_mcp_oauth_tokens_server_url" ON "mcp_oauth_tokens" USING btree ("server_url");
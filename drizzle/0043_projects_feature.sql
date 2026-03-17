CREATE TABLE IF NOT EXISTS "projects" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "name" text NOT NULL,
  "instructions" text DEFAULT '' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "deleted_at" timestamp,
  CONSTRAINT "unique_project_name_per_user" UNIQUE("user_id","name"),
  CONSTRAINT "check_project_name_length" CHECK (char_length("name") >= 1 AND char_length("name") <= 100),
  CONSTRAINT "check_project_instructions_length" CHECK (char_length("instructions") <= 8000)
);

CREATE TABLE IF NOT EXISTS "project_files" (
  "id" text PRIMARY KEY NOT NULL,
  "project_id" text NOT NULL,
  "filepath" text,
  "url" text,
  "filename" text NOT NULL,
  "mime_type" text,
  "size" integer,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "chat_projects" (
  "chat_id" text PRIMARY KEY NOT NULL,
  "project_id" text NOT NULL,
  "attached_at" timestamp DEFAULT now() NOT NULL
);

DO $$ BEGIN
  ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "project_files" ADD CONSTRAINT "project_files_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "chat_projects" ADD CONSTRAINT "chat_projects_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "chat_projects" ADD CONSTRAINT "chat_projects_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "idx_projects_user_id" ON "projects" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_projects_user_id_created_at" ON "projects" ("user_id","created_at");
CREATE INDEX IF NOT EXISTS "idx_project_files_project_id" ON "project_files" ("project_id");
CREATE INDEX IF NOT EXISTS "idx_project_files_project_id_created_at" ON "project_files" ("project_id","created_at");
CREATE INDEX IF NOT EXISTS "idx_chat_projects_project_id" ON "chat_projects" ("project_id");

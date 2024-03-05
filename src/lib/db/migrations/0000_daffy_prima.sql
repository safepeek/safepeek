CREATE SCHEMA "results_schema";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "results" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"channel_id" varchar(20),
	"guild_id" varchar(20),
	"command_author_id" varchar(20),
	"url_id" varchar(26),
	"context" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "urls" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"source_url_hash" text,
	"source_url" text,
	"destination_url" text,
	"redirects" text[],
	"meta_title" text,
	"meta_description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "url_hash_idx" ON "urls" ("source_url_hash");
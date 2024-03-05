CREATE TABLE IF NOT EXISTS "results" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"message_id" varchar(20),
	"channel_id" varchar(20),
	"guild_id" varchar(20),
	"command_author_id" varchar(20),
	"source_url" text,
	"destination_url" text,
	"redirects" text[],
	"context" text,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "author_idx" ON "results" ("command_author_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "guild_idx" ON "results" ("guild_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "channel_idx" ON "results" ("channel_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "context_idx" ON "results" ("context");
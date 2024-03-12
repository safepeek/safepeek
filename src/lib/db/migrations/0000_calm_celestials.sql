CREATE TABLE IF NOT EXISTS "analyzed_url_results" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"analyzed_url_revision_id" varchar(26) NOT NULL,
	"redirect_analyzed_url_id" char(26),
	"meta_title" text,
	"meta_description" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "analyzed_url_revisions" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"analyzed_url_id" char(26) NOT NULL,
	"user_id" char(26) NOT NULL,
	"guild_id" char(26),
	"discord_channel_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "analyzed_urls" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"domain_hash" char(64) NOT NULL,
	"path_hash" char(64),
	"params_hash" char(64)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "guilds" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"discord_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"discord_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "analyzed_url_results_analyzed_url_revision_id_index" ON "analyzed_url_results" ("analyzed_url_revision_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "analyzed_url_results_redirect_analyzed_url_id_index" ON "analyzed_url_results" ("redirect_analyzed_url_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "analyzed_url_revisions_analyzed_url_id_index" ON "analyzed_url_revisions" ("analyzed_url_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "analyzed_url_revisions_user_id_index" ON "analyzed_url_revisions" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "analyzed_url_revisions_guild_id_index" ON "analyzed_url_revisions" ("guild_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "analyzed_urls_domain_hash_index" ON "analyzed_urls" ("domain_hash");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "analyzed_urls_domain_hash_path_hash_params_hash_index" ON "analyzed_urls" ("domain_hash","path_hash","params_hash");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "guilds_discord_id_index" ON "guilds" ("discord_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_discord_id_index" ON "users" ("discord_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "analyzed_url_results" ADD CONSTRAINT "analyzed_url_results_analyzed_url_revision_id_analyzed_url_revisions_id_fk" FOREIGN KEY ("analyzed_url_revision_id") REFERENCES "analyzed_url_revisions"("id") ON DELETE cascade ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "analyzed_url_results" ADD CONSTRAINT "analyzed_url_results_redirect_analyzed_url_id_analyzed_urls_id_fk" FOREIGN KEY ("redirect_analyzed_url_id") REFERENCES "analyzed_urls"("id") ON DELETE cascade ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "analyzed_url_revisions" ADD CONSTRAINT "analyzed_url_revisions_analyzed_url_id_analyzed_urls_id_fk" FOREIGN KEY ("analyzed_url_id") REFERENCES "analyzed_urls"("id") ON DELETE cascade ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "analyzed_url_revisions" ADD CONSTRAINT "analyzed_url_revisions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "analyzed_url_revisions" ADD CONSTRAINT "analyzed_url_revisions_guild_id_guilds_id_fk" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE cascade ON UPDATE restrict;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

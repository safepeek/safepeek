// credits to "George" (t3ned) on Discord for the contribution to the schema below
import { pgTable, text, varchar, uniqueIndex, bigint, char, index, foreignKey, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { ulid } from '@/lib/ulid';

const ULID_LENGTH = 26;

export const guilds = pgTable(
  'guilds',
  {
    id: char('id', { length: ULID_LENGTH })
      .$default(() => ulid())
      .primaryKey(),
    discordId: bigint('discord_id', { mode: 'bigint' }).notNull()
  },
  (columns) => ({
    discordIdUnqIdx: uniqueIndex().on(columns.discordId)
  })
);

export const guildsRelations = relations(guilds, ({ many }) => ({
  analyzedUrlRevisions: many(analyzedUrlRevisions)
}));

export const users = pgTable(
  'users',
  {
    id: char('id', { length: ULID_LENGTH })
      .$default(() => ulid())
      .primaryKey(),
    discordId: bigint('discord_id', { mode: 'bigint' }).notNull()
  },
  (columns) => ({
    discordIdUnqIdx: uniqueIndex().on(columns.discordId)
  })
);

export const usersRelations = relations(users, ({ many }) => ({
  analyzedUrlRevisions: many(analyzedUrlRevisions)
}));

// THISISDOMAIN.COM/THIS/IS/PATH?THIS=PARAMS
export const analyzedUrls = pgTable(
  'analyzed_urls',
  {
    id: char('id', { length: ULID_LENGTH })
      .$default(() => ulid())
      .primaryKey(),
    domainHash: char('domain_hash', { length: 64 }).notNull(),
    pathHash: char('path_hash', { length: 64 }),
    paramsHash: char('params_hash', { length: 64 })
  },
  (columns) => ({
    domainHashIdx: index().on(columns.domainHash),
    domainHashPathHashParamsHashUnqIdx: uniqueIndex().on(columns.domainHash, columns.pathHash, columns.paramsHash)
  })
);

export const analyzedUrlsRelations = relations(analyzedUrls, ({ many }) => ({
  analyzedUrlRevisions: many(analyzedUrlRevisions),
  analyzedUrlResults: many(analyzedUrlResults)
}));

// TODO: add unique constraint on userId and channelId. only insert after x time
export const analyzedUrlRevisions = pgTable(
  'analyzed_url_revisions',
  {
    id: char('id', { length: ULID_LENGTH })
      .$default(() => ulid())
      .primaryKey(),
    analyzedUrlId: char('analyzed_url_id', { length: ULID_LENGTH }).notNull(),
    userId: char('user_id', { length: ULID_LENGTH }).notNull(),
    // if guild_id is null, then it was ran in dm
    guildId: char('guild_id', { length: ULID_LENGTH }),
    discordChannelId: bigint('discord_channel_id', {
      mode: 'bigint'
    }).notNull(),
    insertedAt: timestamp('inserted_at', { withTimezone: true }).defaultNow()
  },
  (columns) => ({
    analyzedUrlIdIdx: index().on(columns.analyzedUrlId),
    userIdIdx: index().on(columns.userId),
    guildIdIdx: index().on(columns.guildId),
    userIdChannelIdUnqIdx: uniqueIndex().on(columns.userId, columns.discordChannelId),
    analyzedUrlIdFk: foreignKey({
      columns: [columns.analyzedUrlId],
      foreignColumns: [analyzedUrls.id]
    })
      .onUpdate('restrict')
      .onDelete('cascade'),
    userIdFk: foreignKey({
      columns: [columns.userId],
      foreignColumns: [users.id]
    })
      .onUpdate('restrict')
      .onDelete('cascade'),
    guildIdFk: foreignKey({
      columns: [columns.guildId],
      foreignColumns: [guilds.id]
    })
      .onUpdate('restrict')
      .onDelete('cascade')
  })
);

export const analyzedUrlRevisionsRelations = relations(analyzedUrlRevisions, ({ one, many }) => ({
  analyzedUrl: one(analyzedUrls, {
    fields: [analyzedUrlRevisions.analyzedUrlId],
    references: [analyzedUrls.id]
  }),
  user: one(users, {
    fields: [analyzedUrlRevisions.userId],
    references: [users.id]
  }),
  guild: one(guilds, {
    fields: [analyzedUrlRevisions.guildId],
    references: [guilds.id]
  }),
  analyzedUrlResults: many(analyzedUrlResults)
}));

export const analyzedUrlResults = pgTable(
  'analyzed_url_results',
  {
    id: char('id', { length: ULID_LENGTH })
      .$default(() => ulid())
      .primaryKey(),
    analyzedUrlRevisionId: varchar('analyzed_url_revision_id', {
      length: ULID_LENGTH
    }).notNull(),
    // If this is null then you've reached the last redirect (destination url)
    redirectAnalyzedUrlId: char('redirect_analyzed_url_id', {
      length: ULID_LENGTH
    }),
    metaTitle: text('meta_title'),
    metaDescription: text('meta_description')
  },
  (columns) => ({
    analyzedUrlRevisionIdIdx: index().on(columns.analyzedUrlRevisionId),
    redirectAnalyzedUrlIdIdx: index().on(columns.redirectAnalyzedUrlId),
    analyzedUrlRevisionIdFk: foreignKey({
      columns: [columns.analyzedUrlRevisionId],
      foreignColumns: [analyzedUrlRevisions.id]
    })
      .onUpdate('restrict')
      .onDelete('cascade'),
    redirectAnalyzedUrlIdFk: foreignKey({
      columns: [columns.redirectAnalyzedUrlId],
      foreignColumns: [analyzedUrls.id]
    })
      .onUpdate('restrict')
      .onDelete('cascade')
  })
);

export const analyzedUrlResultsRelations = relations(analyzedUrlResults, ({ one }) => ({
  analyzedUrlRevision: one(analyzedUrlRevisions, {
    fields: [analyzedUrlResults.analyzedUrlRevisionId],
    references: [analyzedUrlRevisions.id]
  }),
  redirectAnalyzedUrl: one(analyzedUrls, {
    fields: [analyzedUrlResults.redirectAnalyzedUrlId],
    references: [analyzedUrls.id]
  })
}));

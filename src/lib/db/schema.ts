import { pgTable, text, timestamp, varchar, pgSchema, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { generateULID } from '@/lib/ulid';
import { relations } from 'drizzle-orm';

export const resultsSchema = pgSchema('results_schema');

export const results = pgTable('results', {
  id: varchar('id', { length: 26 })
    .$default(() => generateULID())
    .primaryKey(),
  channelId: varchar('channel_id', { length: 20 }),
  guildId: varchar('guild_id', { length: 20 }),
  commandAuthorId: varchar('command_author_id', { length: 20 }),
  urlId: varchar('url_id', { length: 26 }),
  context: text('context').$type<'guild' | 'dm'>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
});

export const resultsRelations = relations(results, ({ one }) => ({
  url: one(urls, {
    fields: [results.urlId],
    references: [urls.id]
  })
}));

export const urls = pgTable(
  'urls',
  {
    id: varchar('id', { length: 26 })
      .$default(() => generateULID())
      .primaryKey(),
    sourceUrlHash: text('source_url_hash'), // hashed
    sourceUrl: text('source_url'), // encrypted
    destinationUrl: text('destination_url'), // encrypted
    redirects: text('redirects').array(), // encrypted
    metaTitle: text('meta_title'), // encrypted
    metaDescription: text('meta_description'), // encrypted
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at')
  },
  (table) => {
    return {
      urlHashIdx: uniqueIndex('url_hash_idx').on(table.sourceUrlHash)
    };
  }
);

export const urlsRelations = relations(urls, ({ many }) => ({
  results: many(results)
}));

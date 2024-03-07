import { AnalysisData } from '@/types/url';
import { CommandContext, ComponentContext } from 'slash-create/web';
import { database } from '@/lib/db/index';
import { Client } from 'pg';
import { results, urls } from '@/lib/db/schema';

type InsertUrlProps = {
  data: AnalysisData;
  hashedUrl: string;
  ctx: CommandContext | ComponentContext;
  dbClient: Client;
};

type ExistingUrlProps = {
  dbClient: Client;
  hashedUrl: string;
};

export const insertUrlData = async (props: InsertUrlProps): Promise<string> => {
  const db = database(props.dbClient);

  return db.transaction(async (tx) => {
    const insertedUrl = await tx
      .insert(urls)
      .values({
        sourceUrlHash: props.hashedUrl,
        sourceUrl: props.data.sourceUrl,
        destinationUrl: props.data.destinationUrl,
        redirects: props.data.redirects,
        metaTitle: props.data.title,
        metaDescription: props.data.description
      })
      .returning();

    const insertedResult = await tx
      .insert(results)
      .values({
        channelId: props.ctx.channelID,
        guildId: props.ctx.guildID ?? null,
        commandAuthorId: props.ctx.user.id,
        context: props.ctx.guildID ? 'guild' : 'dm',
        urlId: insertedUrl[0].id
      })
      .returning();

    return insertedResult[0].id;
  });
};

export const findExistingUrl = async (props: ExistingUrlProps) => {
  const db = database(props.dbClient);
  return db.query.urls.findMany({
    with: {
      results: true
    },
    where: (urls, { eq }) => eq(urls.sourceUrlHash, props.hashedUrl)
  });
};

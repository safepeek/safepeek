// credits to "George" (t3ned) on Discord for the contribution to most of the functions below
import { AnalyzedUrl } from '@/types/url';
import { database, DrizzleClient } from './';
import { Client } from 'pg';
import { analyzedUrlResults, analyzedUrlRevisions, analyzedUrls, guilds, users } from './schema';
import { and, eq, gt, isNull } from 'drizzle-orm';

async function sha256(data: string) {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(data);

  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function sha256IfNotEmpty(data: string) {
  const isEmpty = !data.length || data === '/';
  return isEmpty ? null : sha256(data);
}

function takeFirstOrThrow<T>(results: T[]): T {
  const [result] = results;
  if (!result) throw new Error(`Something went wrong with query: no results`);
  return result;
}

async function upsertUser(discordId: bigint, tx: DrizzleClient) {
  const user = await tx.query.users.findFirst({
    where: eq(users.discordId, discordId)
  });

  if (user) return user;

  return takeFirstOrThrow(
    await tx
      .insert(users)
      .values({
        discordId
      })
      .returning()
  );
}

async function upsertGuild(discordId: bigint, tx: DrizzleClient) {
  const guild = await tx.query.guilds.findFirst({
    where: eq(guilds.discordId, discordId)
  });

  if (guild) return guild;

  return takeFirstOrThrow(
    await tx
      .insert(guilds)
      .values({
        discordId
      })
      .returning()
  );
}

async function upsertAnalyzedUrl(rawUrl: string, tx: DrizzleClient) {
  const url = new URL(rawUrl);
  const domainHash = await sha256(url.host);
  const pathHash = await sha256IfNotEmpty(url.pathname);
  const paramsHash = await sha256IfNotEmpty(url.searchParams.toString());

  const analyzedUrl = await tx.query.analyzedUrls.findFirst({
    where: and(
      eq(analyzedUrls.domainHash, domainHash),
      pathHash ? eq(analyzedUrls.pathHash, pathHash) : isNull(analyzedUrls.pathHash),
      paramsHash ? eq(analyzedUrls.paramsHash, paramsHash) : isNull(analyzedUrls.paramsHash)
    )
  });

  if (analyzedUrl) return analyzedUrl;

  return takeFirstOrThrow(
    await tx
      .insert(analyzedUrls)
      .values({
        domainHash,
        pathHash,
        paramsHash
      })
      .returning()
  );
}

async function createAnalyzedUrlRevision(
  analyzedUrlId: string,
  userId: string,
  guildId: string | null,
  discordChannelId: bigint,
  tx: DrizzleClient
) {
  const minInsertTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

  const inserted = await tx
    .select()
    .from(analyzedUrlRevisions)
    .where(
      and(
        eq(analyzedUrlRevisions.userId, userId),
        eq(analyzedUrlRevisions.discordChannelId, discordChannelId),
        gt(analyzedUrlRevisions.insertedAt, minInsertTime)
      )
    );

  if (!inserted.length)
    return takeFirstOrThrow(
      await tx
        .insert(analyzedUrlRevisions)
        .values({
          analyzedUrlId,
          userId,
          guildId,
          discordChannelId
        })
        .returning()
    );

  return takeFirstOrThrow(inserted);
}

type CreateAnalyzedUrlResultProps = {
  analyzedUrlRevisionId: string;
  redirectAnalyzedUrlId: string | null;
  metaTitle: string;
  metaDescription: string;
  tx: DrizzleClient;
};

async function createAnalyzedUrlResult(props: CreateAnalyzedUrlResultProps) {
  return props.tx.insert(analyzedUrlResults).values({
    analyzedUrlRevisionId: props.analyzedUrlRevisionId,
    redirectAnalyzedUrlId: props.redirectAnalyzedUrlId,
    metaTitle: props.metaTitle,
    metaDescription: props.metaDescription
  });
}

// TODO: look into additional checks to prevent insertion of repeated data. consult more with george on this
type CreateAnalyzedUrlDataProps = {
  dbClient: Client;
  analyzedUrlData: AnalyzedUrl;
};

export async function createFromAnalyzedUrlData(props: CreateAnalyzedUrlDataProps) {
  const db = database(props.dbClient);

  return db.transaction(async (tx) => {
    const user = await upsertUser(props.analyzedUrlData.userId, tx);
    const guild = props.analyzedUrlData.guildId ? await upsertGuild(props.analyzedUrlData.guildId, tx) : { id: null };

    let previousRedirectAnalyzedUrlId: string | null = null;
    for (const redirect of props.analyzedUrlData.redirects.reverse()) {
      const analyzedUrl = await upsertAnalyzedUrl(redirect.rawUrl, tx);
      const analyzedUrlRevision = await createAnalyzedUrlRevision(
        analyzedUrl.id,
        user.id,
        guild.id,
        props.analyzedUrlData.channelId,
        tx
      );
      await createAnalyzedUrlResult({
        analyzedUrlRevisionId: analyzedUrlRevision.id,
        redirectAnalyzedUrlId: previousRedirectAnalyzedUrlId,
        metaTitle: redirect.meta.title,
        metaDescription: redirect.meta.description,
        tx
      });

      previousRedirectAnalyzedUrlId = analyzedUrl.id;
    }

    return previousRedirectAnalyzedUrlId!;
  });
}

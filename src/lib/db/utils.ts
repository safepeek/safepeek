// credits to "George" (t3ned) on Discord for the contribution to most of the functions below
import { AnalyzedUrl } from '@/types/url';
import { client, database, DrizzleClient } from './';
import { Client } from 'pg';
import { analyzedUrlResults, analyzedUrlRevisions, analyzedUrls, guilds, users } from './schema';
import { and, eq, isNull } from 'drizzle-orm';
import { BaseSlashCreator } from 'slash-create/lib/creator';
import { CommandContext } from 'slash-create/lib/structures/interfaces/commandContext';
import { makeProfileRequest } from '@/lib/fetch';
import { Env } from '@/types';
import {
  CommandMetadata,
  UserProfileDataResponse,
  UserProfileError,
  UserResponseError,
  UserResponseSuccess
} from '@/types/user';
import { SlashCreator } from 'slash-create/web';

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
}

type CreateAnalyzedUrlResultProps = {
  analyzedUrlId: string;
  analyzedUrlRevisionId: string;
  redirectAnalyzedUrlId: string | null;
  metaTitle: string;
  metaDescription: string;
  tx: DrizzleClient;
};

async function createAnalyzedUrlResult(props: CreateAnalyzedUrlResultProps) {
  const minInsertTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

  const inserted = await props.tx.query.analyzedUrlRevisions.findFirst({
    where: (revisions, { eq }) => eq(revisions.analyzedUrlId, props.analyzedUrlId),
    with: {
      analyzedUrlResults: {
        where: (results, { gt }) => gt(results.insertedAt, minInsertTime)
      }
    }
  });

  if (!inserted?.analyzedUrlResults.length)
    return takeFirstOrThrow(
      await props.tx
        .insert(analyzedUrlResults)
        .values({
          analyzedUrlRevisionId: props.analyzedUrlRevisionId,
          redirectAnalyzedUrlId: props.redirectAnalyzedUrlId,
          metaTitle: props.metaTitle,
          metaDescription: props.metaDescription
        })
        .returning()
    );

  return inserted;
}

export type ProfileData = {
  discordUserId: string;
  data: {
    ephemeral?: boolean;
  };
};

type UpdateProfileDataProps = {
  data: ProfileData;
  metadata: CommandMetadata;
  env: Env;
};

export async function updateProfileData(props: UpdateProfileDataProps) {
  return makeProfileRequest(
    {
      method: 'update',
      discordUserId: props.data.discordUserId,
      data: props.data.data,
      metadata: {
        discordUserId: props.metadata.discordUserId,
        discordChannelId: props.metadata.discordChannelId,
        discordGuildId: props.metadata.discordGuildId
      }
    },
    props.env
  );
}

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
        analyzedUrlId: analyzedUrl.id,
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

type GetUserProfileProps = {
  creator: BaseSlashCreator;
  ctx: CommandContext;
};

export async function getUserProfile(props: GetUserProfileProps): Promise<UserProfileDataResponse> {
  const data = await makeProfileRequest(
    {
      discordUserId: props.ctx.user.id,
      method: 'get'
    },
    props.creator.client
  );

  if (!data.ok) throw new Error((data as UserResponseError).data.code);

  return {
    ok: true,
    data: data.data
  };
}

type UpdateUserProfileProps = GetUserProfileProps & {
  data: ProfileData;
  ctx: CommandContext;
  creator: BaseSlashCreator;
};

export async function updateUserProfile(props: UpdateUserProfileProps): Promise<UserProfileDataResponse> {
  const data = await updateProfileData({
    data: props.data,
    metadata: {
      discordUserId: props.ctx.user.id,
      discordChannelId: props.ctx.channelID,
      discordGuildId: props.ctx.guildID
    },
    env: props.creator.client
  });

  if (!data.ok) throw new Error((data as UserResponseError).data.code);

  return {
    ok: true,
    data: data.data
  };
}

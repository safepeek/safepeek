import { BaseSlashCreator } from 'slash-create/lib/creator';
import { CommandContext } from 'slash-create/lib/structures/interfaces/commandContext';
import { makeProfileRequest } from '@/lib/fetch';
import { Env } from '@/types';
import { CommandMetadata, UserProfileDataResponse, UserResponseError } from '@/types/user';

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

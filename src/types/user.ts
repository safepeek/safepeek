export type UserProfile = {
  id: string;
  discordId: string;
  ephemeral: boolean | null;
};

export type UserProfileUpdateProps = {
  ephemeral?: boolean;
};

export type UserProfileError = {
  code: string;
  id?: string;
};

export type CommandMetadata = {
  discordUserId: string;
  discordChannelId: string;
  discordGuildId?: string;
};

export type MakeProfileRequestProps =
  | {
      method: 'get';
      discordUserId: string;
    }
  | {
      method: 'update';
      discordUserId: string;
      data: UserProfileUpdateProps;
      metadata: CommandMetadata;
    };

export type UserResponseSuccess = {
  ok: true;
  data: UserProfile;
};

export type UserResponseError = {
  ok: false;
  data: UserProfileError;
};
export type UserProfileDataResponse = UserResponseSuccess | UserResponseError;

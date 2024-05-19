import {
  CommandContext,
  SlashCommand,
  SlashCreator,
  ApplicationIntegrationType,
  CommandOptionType,
  InteractionContextType
} from 'slash-create/web';
import { stripIndents } from 'common-tags';
import { APIEmbed } from 'discord-api-types/v10';
import { EmbedBuilder } from '@discordjs/builders';

import { EMBED_COLOR } from '@/lib/constants';
import { getUserProfile, updateUserProfile } from '@/lib/utils';
import { EmbedAuthor } from 'slash-create/lib/structures/message';
import { errorEmbedBuilder } from '@/ui';
import { UserResponseError, UserResponseSuccess } from '@/types/user';

type OptionTypes = {
  ephemeral: boolean | undefined;
};

export default class ProfileSlashCommand extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'profile',
      description: 'Manage your personal settings for the bot.',
      options: [
        {
          type: CommandOptionType.BOOLEAN,
          name: 'ephemeral',
          description: 'Choose if responses should be ephemeral or not by default.',
          required: false
        }
      ],
      integrationTypes: [ApplicationIntegrationType.GUILD_INSTALL, ApplicationIntegrationType.USER_INSTALL],
      contexts: [InteractionContextType.GUILD, InteractionContextType.PRIVATE_CHANNEL, InteractionContextType.BOT_DM]
    });
  }

  async onError(err: Error, ctx: CommandContext) {
    const embed = errorEmbedBuilder(err);
    return ctx.send({ content: 'An error occurred running this command.', embeds: [embed], ephemeral: true });
  }

  async run(ctx: CommandContext) {
    const options = ctx.options as OptionTypes;

    const embedAuthor: EmbedAuthor = {
      name: `${ctx.user.username}'s settings`,
      icon_url: ctx.user.avatarURL
    };

    let ephemeral: boolean;
    if (options.ephemeral !== undefined) {
      const userProfile = await updateUserProfile({
        creator: this.creator,
        ctx,
        data: {
          data: {
            ephemeral: options.ephemeral ?? true
          },
          discordUserId: ctx.user.id
        }
      });

      if (!userProfile.ok) throw new Error((userProfile as UserResponseError).data.code);

      ephemeral = userProfile.data.ephemeral!;

      const embed: APIEmbed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setAuthor(embedAuthor)
        .setDescription(
          stripIndents`
          The **ephemeral** option has been successfully updated to \`${ephemeral ? 'true' : 'false'}\`
        `
        )
        .setFooter({
          text: userProfile.data.id
        })
        .setTimestamp()
        .toJSON();

      return ctx.send({
        embeds: [embed],
        ephemeral: true
      });
    }

    const userProfile = (await getUserProfile({
      creator: this.creator,
      ctx
    })) as UserResponseSuccess;

    ephemeral = userProfile.data.ephemeral!;

    const embed: APIEmbed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setAuthor(embedAuthor)
      .setDescription(
        stripIndents`
        **Ephemeral**: ${userProfile.data.ephemeral!}
      `
      )
      .setFooter({
        text: userProfile.data.id
      })
      .setTimestamp()
      .toJSON();

    return ctx.send({
      embeds: [embed],
      ephemeral: true
    });
  }
}

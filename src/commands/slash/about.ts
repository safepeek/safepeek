import {
  CommandContext,
  SlashCommand,
  SlashCreator,
  ApplicationIntegrationType,
  CommandOptionType,
  InteractionContextType
} from 'slash-create/web';
import { EmbedBuilder } from '@discordjs/builders';
import { APIEmbed } from 'discord-api-types/v10';

import {
  APP_DESCRIPTION,
  APP_GITHUB,
  APP_NAME,
  APP_VERSION,
  DISCORD_INVITE,
  DISCORD_INVITE_CODE,
  EMBED_COLOR,
  WEBSITE
} from '@/lib/constants';
import { getUserProfile } from '@/lib/utils';
import { errorEmbedBuilder } from '@/ui';
import { UserResponseError } from '@/types/user';

type OptionTypes = {
  ephemeral: boolean | undefined;
};

export default class AboutSlashCommand extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'about',
      description: 'Get information about the bot.',
      options: [
        {
          type: CommandOptionType.BOOLEAN,
          name: 'ephemeral',
          description: 'Choose if the command should be ephemeral or not (true by default)',
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
    const profile = await getUserProfile({
      creator: this.creator,
      ctx
    });

    if (!profile.ok) throw new Error((profile as UserResponseError).data.code);

    const options = ctx.options as OptionTypes;
    const ephemeral = options.ephemeral ?? profile.data.ephemeral ?? true;

    const date = new Date();
    const COMMIT_HASH = this.creator.client.LAST_COMMIT;
    const COMMIT_HASH_SHORT = this.creator.client.LAST_COMMIT_SHORT;

    const embed: APIEmbed = new EmbedBuilder()
      .setTitle(APP_NAME)
      .setDescription(APP_DESCRIPTION)
      .setColor(EMBED_COLOR)
      .addFields([
        {
          name: 'Bot Author',
          value: 'Anthony Collier (acollierr17)',
          inline: true
        },
        {
          name: 'Website',
          value: `[safepeek.org](${WEBSITE})`,
          inline: true
        },
        {
          name: 'Support',
          value: `[discord.gg\u200B/${DISCORD_INVITE_CODE}](${DISCORD_INVITE})`,
          inline: true
        },
        {
          name: 'GitHub',
          value: `[safepeek/safepeek](${APP_GITHUB})`,
          inline: true
        },
        {
          name: 'Legal',
          value: `[Terms](${WEBSITE}/legal/terms) | [Privacy](${WEBSITE}/legal/privacy)`,
          inline: true
        },
        {
          name: 'Version',
          value: `${APP_VERSION} [\`[${COMMIT_HASH_SHORT}]\`](${APP_GITHUB}/commit/${COMMIT_HASH})`,
          inline: true
        }
      ])
      .setFooter({
        text: `© ${date.getFullYear()} Anthony Collier`
      })
      .setTimestamp()
      .toJSON();

    return ctx.send({
      embeds: [embed],
      ephemeral
    });
  }
}

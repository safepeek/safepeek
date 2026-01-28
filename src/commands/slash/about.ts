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
import { getCommitHash, getCommitHashShort } from '@/lib/config';
import { resolveEphemeral } from '@/lib/cache';
import { errorEmbedBuilder } from '@/ui';
import { Env } from '@/types';

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
    const env = this.creator.client as Env;
    const options = ctx.options as OptionTypes;
    const ephemeral = options.ephemeral ?? (await resolveEphemeral(ctx.user.id, env));

    const date = new Date();
    const [COMMIT_HASH, COMMIT_HASH_SHORT] = await Promise.all([getCommitHash(env), getCommitHashShort(env)]);

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

import {
  CommandContext,
  SlashCommand,
  SlashCreator,
  ApplicationIntegrationType,
  CommandOptionType,
  InteractionContextType
} from 'slash-create/web';
import { APIApplication, APIEmbed } from 'discord-api-types/v10';
import { EmbedBuilder } from '@discordjs/builders';

import packageJson from '@/../package.json';
import { APP_GITHUB, APP_VERSION, EMBED_COLOR } from '@/lib/constants';
import { getUserProfile } from '@/lib/db/utils';
import { errorEmbedBuilder } from '@/ui';

type OptionTypes = {
  ephemeral: boolean | undefined;
};

export default class StatsSlashCommand extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'stats',
      description: 'Get stats about the bot.',
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
    const userProfile = await getUserProfile({
      creator: this.creator,
      ctx
    });

    const options = ctx.options as OptionTypes;
    const ephemeral = options.ephemeral ?? userProfile.ephemeral ?? true;

    const appInfo = await ctx.creator.requestHandler.request<APIApplication>('GET', '/applications/@me', {
      auth: true
    });

    const COMMIT_HASH = this.creator.client.LAST_COMMIT;
    const COMMIT_HASH_SHORT = this.creator.client.LAST_COMMIT_SHORT;
    const CF_DEPLOYMENT_ID = this.creator.client.CF_DEPLOYMENT_ID.split('-')[0];

    const guildCount = appInfo.approximate_guild_count;
    const slashCreateVersion = packageJson.devDependencies['slash-create'];
    const typescriptVersion = packageJson.devDependencies.typescript;

    const embed: APIEmbed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setFields([
        {
          name: 'Guild Count',
          value: guildCount?.toLocaleString() ?? '0',
          inline: true
        },
        {
          name: 'Version',
          value: `${APP_VERSION} [\`[${COMMIT_HASH_SHORT}]\`](${APP_GITHUB}/commit/${COMMIT_HASH})`,
          inline: true
        },
        {
          name: 'Deployment',
          value: `\`${CF_DEPLOYMENT_ID}\``,
          inline: true
        },
        {
          name: 'Slash Create',
          value: slashCreateVersion.replace('^', ''),
          inline: true
        },
        {
          name: 'TypeScript',
          value: typescriptVersion.replace('^', ''),
          inline: true
        },
        {
          name: '\u200B',
          value: '\u200B',
          inline: true
        }
      ])
      .setTimestamp()
      .toJSON();

    return ctx.send({
      embeds: [embed],
      ephemeral
    });
  }
}

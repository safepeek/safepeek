import {
  CommandContext,
  MessageEmbed,
  SlashCommand,
  SlashCreator,
  ApplicationIntegrationType,
  CommandOptionType,
  InteractionContextType
} from 'slash-create/web';
import { APIApplication } from 'discord-api-types/v10';

import packageJson from '@/../package.json';
import { APP_GITHUB, APP_VERSION, EMBED_COLOR } from '@/lib/constants';

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
    return ctx.send({ content: 'An error occurred running this command.', ephemeral: true });
  }

  async run(ctx: CommandContext) {
    const options = ctx.options as OptionTypes;
    const ephemeral = options.ephemeral ?? true;

    const appInfo = await ctx.creator.requestHandler.request<APIApplication>('GET', '/applications/@me', {
      auth: true
    });

    const COMMIT_HASH = this.creator.client.LAST_COMMIT;
    const COMMIT_HASH_SHORT = this.creator.client.LAST_COMMIT_SHORT;

    const guildCount = appInfo.approximate_guild_count;
    const slashCreateVersion = packageJson.devDependencies['slash-create'];
    const typescriptVersion = packageJson.devDependencies.typescript;

    const embed: MessageEmbed = {
      type: 'rich',
      color: EMBED_COLOR,
      fields: [
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
          name: '\u200B',
          value: '\u200B',
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
      ]
    };

    return ctx.send({
      embeds: [embed],
      ephemeral
    });
  }
}

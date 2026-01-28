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
import { getCommitHash, getCommitHashShort, getDeploymentId } from '@/lib/config';
import { resolveEphemeral } from '@/lib/cache';
import { errorEmbedBuilder } from '@/ui';
import { Env } from '@/types';

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
    const options = ctx.options as OptionTypes;
    const env = this.creator.client as Env;
    const ephemeral = options.ephemeral ?? (await resolveEphemeral(ctx.user.id, env));

    await ctx.defer(ephemeral);

    const [appInfo, deploymentId, commitHash, commitHashShort] = await Promise.all([
      ctx.creator.requestHandler.request<APIApplication>('GET', '/applications/@me', { auth: true }),
      getDeploymentId(env),
      getCommitHash(env),
      getCommitHashShort(env)
    ]);

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
          value: `${APP_VERSION} [\`[${commitHashShort}]\`](${APP_GITHUB}/commit/${commitHash})`,
          inline: true
        },
        {
          name: 'Deployment',
          value: `\`${deploymentId}\``,
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

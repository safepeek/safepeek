import {
  CommandContext,
  EmbedField,
  MessageEmbed,
  SlashCommand,
  SlashCreator,
  ApplicationIntegrationType,
  CommandOptionType,
  InteractionContextType
} from 'slash-create/web';

import {
  APP_DESCRIPTION,
  APP_GITHUB,
  APP_NAME,
  APP_VERSION,
  DISCORD_INVITE,
  EMBED_COLOR,
  WEBSITE
} from '@/lib/constants';

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
    return ctx.send({ content: 'An error occurred running this command.', ephemeral: true });
  }

  async run(ctx: CommandContext) {
    const options = ctx.options as OptionTypes;
    const ephemeral = options.ephemeral ?? true;

    const date = new Date();
    const COMMIT_HASH = this.creator.client.LAST_COMMIT;
    const COMMIT_HASH_SHORT = this.creator.client.LAST_COMMIT_SHORT;

    const fields: EmbedField[] = [
      {
        name: 'Bot Author',
        value: 'Anthony Collier (acollierr17)'
      },
      {
        name: 'Website',
        value: `[safepeek.org](${WEBSITE})`
      },
      {
        name: 'Discord',
        value: DISCORD_INVITE
      },
      {
        name: 'GitHub',
        value: `[github.com/safepeek/safepeek](${APP_GITHUB})`
      },
      {
        name: 'Legal',
        value: `[Terms of Service](${WEBSITE}/legal/terms) | [Privacy Policy](${WEBSITE}/legal/privacy)`
      },
      {
        name: 'Version',
        value: `${APP_VERSION} [\`[${COMMIT_HASH_SHORT}]\`](${APP_GITHUB}/commit/${COMMIT_HASH})`
      }
    ].map((field) => ({ ...field, inline: true }));

    const embed: MessageEmbed = {
      type: 'rich',
      title: APP_NAME,
      description: APP_DESCRIPTION,
      color: EMBED_COLOR,
      fields,
      footer: {
        text: `© ${date.getFullYear()} Anthony Collier`
      },
      timestamp: date
    };

    return ctx.send({
      embeds: [embed],
      ephemeral
    });
  }
}

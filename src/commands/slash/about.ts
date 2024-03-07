import { CommandContext, EmbedField, MessageEmbed, SlashCommand, SlashCreator } from 'slash-create/web';
import {
  APP_DESCRIPTION,
  APP_GITHUB,
  APP_NAME,
  APP_VERSION,
  DISCORD_INVITE,
  EMBED_COLOR,
  WEBSITE
} from '@/lib/constants';

export default class AboutSlashCommand extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'about',
      description: 'Get information about the bot.'
    });
  }

  async run(ctx: CommandContext) {
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
        value: `[Terms of Service](${WEBSITE}/terms) | [Privacy Policy](${WEBSITE}/privacy)`
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
      ephemeral: true
    });
  }
}

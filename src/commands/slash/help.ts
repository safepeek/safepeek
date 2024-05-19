import {
  ApplicationIntegrationType,
  ButtonStyle,
  CommandContext,
  CommandOptionType,
  ComponentType,
  InteractionContextType,
  SlashCommand,
  SlashCreator
} from 'slash-create/web';
import { EmbedBuilder } from '@discordjs/builders';
import { stripIndents } from 'common-tags';

import { getUserProfile } from '@/lib/utils';
import { APP_NAME, EMBED_COLOR, WEBSITE } from '@/lib/constants';
import { errorEmbedBuilder } from '@/ui';
import { UserResponseError } from '@/types/user';

type OptionTypes = {
  ephemeral: boolean | undefined;
};

export default class HelpSlashCommand extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'help',
      description: 'Get started with the bot and get links to bot resources.',
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

    const analyzeSlashCommandId: string =
      this.creator.client.NODE_ENV === 'production' ? '1210526106634027019' : '1210506556710588487';
    const analyzeMessageCommandId: string =
      this.creator.client.NODE_ENV === 'production' ? '1210526106634027018' : '1208321747040870412';

    const embed = new EmbedBuilder()
      .setTitle(`${APP_NAME} • Help`)
      .setColor(EMBED_COLOR)
      .setDescription(
        stripIndents`
        To get started with analyzing URLs, you can either use the <\/analyze:${analyzeSlashCommandId}> command or right-click a message and use the <\/Analyze:${analyzeMessageCommandId}> command.
        
        Each time you analyze a URL, you'll be given the destination URL's meta title and description, as well as any redirects.
        
        Additionally, you may check to see if the destination URL is deemed safe using the Google Safe Browsing API\*.
        
        You may visit our [website](${WEBSITE}) for more information.
        
        **\`Privacy\`**
        URLs are hashed and stored securely via serverless database instances powered by [Vercel](https://vercel.com/docs/storage/vercel-postgres). However, URLs sent to the Google Safe Browsing API are sent unhashed at this time. We wish to resolve this in a near-future update.
        
        **\`Google Safe Browsing API\`**
        Google works to provide the most accurate and up-to-date information about unsafe web resources. However, Google cannot guarantee that its information is comprehensive and error-free: some risky sites may not be identified, and some safe sites may be identified in error.
        `
      )
      .setImage('https://cdn.safepeek.org/assets/embed-graphics/help-embed-main.png')
      .setTimestamp()
      .toJSON();

    return ctx.send({
      embeds: [embed],
      components: [
        {
          type: ComponentType.ACTION_ROW,
          components: [
            {
              type: ComponentType.BUTTON,
              style: ButtonStyle.LINK,
              label: 'Website',
              url: WEBSITE
            }
          ]
        }
      ],
      ephemeral
    });
  }
}

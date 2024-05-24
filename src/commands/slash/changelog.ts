import {
  ApplicationIntegrationType,
  ButtonStyle,
  CommandContext,
  CommandOptionType,
  ComponentButtonLink,
  ComponentType,
  InteractionContextType,
  SlashCommand,
  SlashCreator
} from 'slash-create/web';
import { EmbedBuilder } from '@discordjs/builders';
import { getUserProfile } from '@/lib/utils';
import { errorEmbedBuilder } from '@/ui';
import { UserResponseError } from '@/types/user';
import { makeGitHubAPIRequest } from '@/lib/fetch';
import { APP_GITHUB, APP_VERSION, EMBED_COLOR } from '@/lib/constants';

type OptionTypes = {
  ephemeral: boolean | undefined;
};

export default class ChangelogSlashCommand extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'changelog',
      description: 'View the recent changelog and a link to previous bot changelogs via GitHub.',
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

    await ctx.defer(ephemeral);

    const jsonResponse = await makeGitHubAPIRequest(
      {
        route: `/releases/tags/v${APP_VERSION}`
      },
      this.creator.client
    );

    const body = jsonResponse['body'] as string;
    const url = jsonResponse['html_url'] as string;
    const publishedAt = jsonResponse['published_at'] as string;
    const tagName = jsonResponse['tag_name'] as string;

    const embed = new EmbedBuilder()
      .setTitle(`Latest Release • ${tagName}`)
      .setURL(url)
      .setDescription(body)
      .setColor(EMBED_COLOR)
      .setFooter({
        text: 'Release published'
      })
      .setTimestamp(new Date(publishedAt))
      .toJSON();

    const buttons: ComponentButtonLink[] = [
      {
        type: ComponentType.BUTTON,
        style: ButtonStyle.LINK,
        label: 'View all releases',
        url: `${APP_GITHUB}/releases`
      }
    ];

    return ctx.send({
      embeds: [embed],
      components: [
        {
          type: ComponentType.ACTION_ROW,
          components: buttons
        }
      ],
      ephemeral
    });
  }
}

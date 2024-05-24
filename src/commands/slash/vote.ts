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
import { APP_NAME, BOT_LISTS, EMBED_COLOR } from '@/lib/constants';

type OptionTypes = {
  ephemeral: boolean | undefined;
};

export default class VoteSlashCommand extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'vote',
      description: 'See where the bot is listed and links to vote.',
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

    const embed = new EmbedBuilder()
      .setDescription(`You may view below each bot list site and where **\`${APP_NAME}\`** is listed for voting.`)
      .setFields(
        BOT_LISTS.map((site) => ({
          name: site.name,
          value: site.url
        }))
      )
      .setColor(EMBED_COLOR)
      .setFooter({
        text: "Please contact support if there's an issue accessing or voting at a particular site listed above."
      })
      .setTimestamp()
      .toJSON();

    const buttons: ComponentButtonLink[] = BOT_LISTS.map((site) => ({
      type: ComponentType.BUTTON,
      style: ButtonStyle.LINK,
      label: `Vote @ ${site.name}`,
      url: site.voteLink
    }));

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

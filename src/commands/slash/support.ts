import {
  CommandContext,
  SlashCommand,
  SlashCreator,
  ApplicationIntegrationType,
  CommandOptionType,
  InteractionContextType
} from 'slash-create/web';

import { DISCORD_INVITE } from '@/lib/constants';
import { getUserProfile } from '@/lib/db/utils';
import { errorEmbedBuilder } from '@/ui';

type OptionTypes = {
  ephemeral: boolean | undefined;
};

export default class SupportSlashCommand extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'support',
      description: 'Get the invite link for the official support server.',
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

    return ctx.send({
      content: DISCORD_INVITE,
      ephemeral
    });
  }
}

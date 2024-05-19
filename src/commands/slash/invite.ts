import {
  CommandContext,
  SlashCommand,
  SlashCreator,
  ApplicationIntegrationType,
  CommandOptionType,
  InteractionContextType
} from 'slash-create/web';

import { BOT_INVITE } from '@/lib/constants';
import { getUserProfile } from '@/lib/utils';
import { errorEmbedBuilder } from '@/ui';
import { UserResponseError } from '@/types/user';

type OptionTypes = {
  ephemeral: boolean | undefined;
};

export default class InviteSlashCommand extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'invite',
      description: 'Get the invite link for the bot.',
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

    return ctx.send({
      content: BOT_INVITE,
      ephemeral
    });
  }
}

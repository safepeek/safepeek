import {
  CommandContext,
  SlashCommand,
  SlashCreator,
  ApplicationIntegrationType,
  CommandOptionType,
  InteractionContextType
} from 'slash-create/web';

import { BOT_INVITE } from '@/lib/constants';

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

  async run(ctx: CommandContext) {
    const options = ctx.options as OptionTypes;
    const ephemeral = options.ephemeral ?? true;

    return ctx.send({
      content: BOT_INVITE,
      ephemeral
    });
  }
}

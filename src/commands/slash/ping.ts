import {
  CommandContext,
  SlashCommand,
  SlashCreator,
  ApplicationIntegrationType,
  CommandOptionType,
  InteractionContextType
} from 'slash-create/web';
import { resolveEphemeral } from '@/lib/cache';
import { errorEmbedBuilder } from '@/ui';
import { Env } from '@/types';

type OptionTypes = {
  ephemeral: boolean | undefined;
};

export default class PingSlashCommand extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'ping',
      description: 'Pong!',
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
    const env = this.creator.client as Env;
    const options = ctx.options as OptionTypes;
    const ephemeral = options.ephemeral ?? (await resolveEphemeral(ctx.user.id, env));

    return ctx.send({
      content: 'Pong!',
      ephemeral
    });
  }
}

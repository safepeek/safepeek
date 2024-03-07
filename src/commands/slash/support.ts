import { CommandContext, SlashCommand, SlashCreator } from 'slash-create/web';
import { DISCORD_INVITE } from '@/lib/constants';

export default class SupportSlashCommand extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'support',
      description: 'Get the invite link for the official support server.'
    });
  }

  async run(ctx: CommandContext) {
    return ctx.send({
      content: DISCORD_INVITE,
      ephemeral: true
    });
  }
}

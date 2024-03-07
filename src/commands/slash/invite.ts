import { CommandContext, SlashCommand, SlashCreator } from 'slash-create/web';
import { BOT_INVITE } from '@/lib/constants';

export default class InviteSlashCommand extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'invite',
      description: 'Get the invite link for the bot.'
    });
  }

  async run(ctx: CommandContext) {
    return ctx.send({
      content: BOT_INVITE,
      ephemeral: true
    });
  }
}

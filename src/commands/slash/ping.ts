import { CommandContext, SlashCommand, SlashCreator } from 'slash-create/web';

export default class PingSlashCommand extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'ping',
      description: 'Pong!'
    });
  }

  async run(ctx: CommandContext) {
    return ctx.send({
      content: 'Pong!',
      ephemeral: true
    });
  }
}

import extractUrls from 'extract-urls';

import { ApplicationCommandType, CommandContext, MessageEmbed, SlashCommand, SlashCreator } from 'slash-create/web';
import { analyzeUrl } from '@/lib/fetch';
import { resultEmbedBuilder } from '@/lib/ui';

export default class AnalyzeMessageCommand extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'Analyze',
      type: ApplicationCommandType.MESSAGE
    });
  }

  async run(ctx: CommandContext) {
    const messageContent = ctx.targetMessage!.content;
    const urls = extractUrls(messageContent);
    if (!urls) return ctx.send({ content: 'No valid URLs on this message.', ephemeral: true });

    const url = urls![0];
    await ctx.defer(true);

    const data = await analyzeUrl(url);
    const embed: MessageEmbed = resultEmbedBuilder(data);

    return ctx.send({
      embeds: [embed],
      ephemeral: true
    });
  }
}

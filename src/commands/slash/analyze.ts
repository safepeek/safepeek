import { CommandContext, CommandOptionType, SlashCommand, SlashCreator } from 'slash-create/web';
import extractUrls from 'extract-urls';
import { MessageEmbed } from 'slash-create/lib/web';
import { resultEmbedBuilder } from '@/ui';
import { analyzeUrl } from '@/lib/fetch';

export default class AnalyzeSlashCommand extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'analyze',
      description: 'Analyze a given URL.',
      options: [
        {
          type: CommandOptionType.STRING,
          name: 'url',
          description: 'The URL to analyze.'
        }
      ]
    });
  }

  async run(ctx: CommandContext) {
    await ctx.defer(true);

    const urls = extractUrls(ctx.options.url as string);
    if (!urls) return ctx.send({ content: `The provided URL \`${ctx.options.url}\` was invalid.` });

    const url = urls![0];

    const data = await analyzeUrl(url);
    const embed: MessageEmbed = resultEmbedBuilder(data);

    return ctx.send({
      embeds: [embed],
      ephemeral: true
    });
  }
}

import { CommandContext, CommandOptionType, SlashCommand, SlashCreator } from 'slash-create/web';
import extractUrls from 'extract-urls';
import { resultEmbedBuilder } from '@/ui';
import { validateUrl } from '@/lib/fetch';
import { analyzeUrl } from '@/lib/urls';

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

  async onError(err: Error, ctx: CommandContext) {
    return ctx.send({ content: 'Check console for error', ephemeral: true });
  }

  async run(ctx: CommandContext) {
    await ctx.defer(true);

    const urls = extractUrls(ctx.options.url as string);
    if (!urls) return ctx.editOriginal({ content: `The provided URL \`${ctx.options.url}\` was invalid.` });

    const url = urls[0];
    const validUrl = await validateUrl(url);
    if (!validUrl) return ctx.editOriginal(`The following URL has no response: \`${url}\``);

    const data = await analyzeUrl({
      creator: this.creator,
      ctx,
      url: urls![0]
    });

    const embed = resultEmbedBuilder({
      input: data.data,
      resultId: data.id,
      existed: data.existed
    });

    return ctx.editOriginal({
      content: `\`${data.id}\``,
      embeds: [embed]
    });
  }
}

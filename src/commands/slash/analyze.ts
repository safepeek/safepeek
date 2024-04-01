import {
  CommandContext,
  CommandOptionType,
  SlashCommand,
  SlashCreator,
  ApplicationIntegrationType,
  InteractionContextType
} from 'slash-create/web';
import extractUrls from 'extract-urls';

import { resultEmbedBuilder } from '@/ui';
import { validateUrl } from '@/lib/fetch';
import { analyzeUrl } from '@/lib/urls';

type OptionTypes = {
  url: string;
  ephemeral: boolean | undefined;
};

export default class AnalyzeSlashCommand extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'analyze',
      description: 'Analyze a given URL.',
      options: [
        {
          type: CommandOptionType.STRING,
          name: 'url',
          description: 'The URL to analyze.',
          required: true
        },
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
    return ctx.send({ content: 'An error occurred running this command.', ephemeral: true });
  }

  async run(ctx: CommandContext) {
    const options = ctx.options as OptionTypes;
    const ephemeral = options.ephemeral ?? true;

    await ctx.defer(ephemeral);

    const urls = extractUrls(ctx.options.url as string);
    if (!urls) return ctx.editOriginal({ content: `The provided URL \`${ctx.options.url}\` was invalid.` });

    const url = urls[0];
    const validUrl = await validateUrl(url);
    if (!validUrl) return ctx.editOriginal(`The following URL had an invalid response: \`${url}\``);

    let data;
    try {
      data = await analyzeUrl({
        creator: this.creator,
        ctx,
        url: urls![0]
      });
    } catch (e: any) {
      console.error(e);
      return ctx.send({ content: `An error occurred analyzing the URL: \`${url}\``, ephemeral: true });
    }

    const embed = resultEmbedBuilder({
      input: data.data,
      analyzedId: data.id
    });

    return ctx.editOriginal({
      embeds: [embed]
    });
  }
}

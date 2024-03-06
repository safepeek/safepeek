import extractUrls from 'extract-urls';

import {
  ApplicationCommandType,
  CommandContext,
  ComponentSelectOption,
  ComponentType,
  SlashCommand,
  SlashCreator
} from 'slash-create/web';
import { cancelButton, jumpToMessageButton, resultEmbedBuilder, urlButtons, urlSelectComponent } from '@/ui';
import { validateUrl } from '@/lib/fetch';
import { analyzeUrl, truncate } from '@/lib/urls';

export default class AnalyzeMessageCommand extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'Analyze',
      type: ApplicationCommandType.MESSAGE
    });
  }

  async onError(err: Error, ctx: CommandContext) {
    return ctx.send({ content: 'Check console for error', ephemeral: true });
  }

  async run(ctx: CommandContext) {
    await ctx.defer(true);

    const messageContent = ctx.targetMessage!.content;
    const urls = [...new Set(extractUrls(messageContent))];
    if (urls.length < 1) return ctx.editOriginal({ content: 'No valid URLs on this message.' });

    const component = urlSelectComponent;
    const options: ComponentSelectOption[] = [];

    for (const url of urls) {
      const truncated = truncate(url, 100);

      options.push({
        label: truncated,
        value: truncated,
        description: 'The parsed URL result.'
      });
    }

    component.options = options;

    await ctx.editOriginal({
      content: 'Choose a URL to analyze:',
      embeds: [],
      components: [
        {
          type: ComponentType.ACTION_ROW,
          components: [component]
        },
        {
          type: ComponentType.ACTION_ROW,
          components: [
            jumpToMessageButton({
              guildId: ctx.guildID!,
              channelId: ctx.targetMessage!.channelID,
              messageId: ctx.targetMessage!.id
            })
          ]
        }
      ]
    });

    ctx.registerComponent('url_select', async (selectCtx) => {
      return this.handleUrl(ctx, selectCtx.values[0]);
    });
  }

  private async handleUrl(ctx: CommandContext, selectedUrl: string) {
    const component = urlSelectComponent;
    component.options = component.options!.map((opt) => {
      if (opt.value === selectedUrl) {
        return {
          ...opt,
          default: true
        };
      }
      return {
        ...opt,
        default: false
      };
    });

    await ctx.editOriginal({
      content: `Selected URL: \`\`\`${selectedUrl}\`\`\``,
      embeds: [],
      components: [
        {
          type: ComponentType.ACTION_ROW,
          components: [component]
        },
        {
          type: ComponentType.ACTION_ROW,
          components: [
            ...urlButtons,
            jumpToMessageButton({
              guildId: ctx.guildID!,
              channelId: ctx.targetMessage!.channelID,
              messageId: ctx.targetMessage!.id
            })
          ]
        }
      ]
    });

    ctx.registerComponent('analyze_button', async (btnCtx) => {
      // try {
      component.options = component.options!.map((opt) => {
        if (opt.default) {
          return {
            ...opt,
            default: false
          };
        }

        return opt;
      });

      const validUrl = await validateUrl(selectedUrl);
      if (!validUrl) return ctx.editOriginal(`The following URL has no response: \`${selectedUrl}\``);

      const data = await analyzeUrl({
        creator: this.creator,
        ctx,
        url: selectedUrl
      });

      const embed = resultEmbedBuilder({
        input: data.data,
        resultId: data.id,
        existed: data.existed
      });

      return ctx.editOriginal({
        content: '',
        embeds: [embed],
        components: [
          {
            type: ComponentType.ACTION_ROW,
            components: [component]
          },
          {
            type: ComponentType.ACTION_ROW,
            components: [
              jumpToMessageButton({
                guildId: ctx.guildID!,
                channelId: ctx.targetMessage!.channelID,
                messageId: ctx.targetMessage!.id
              }),
              cancelButton
            ]
          }
        ]
      });
    });

    ctx.registerComponent('cancel_button', async (btnCtx) => {
      return ctx.delete();
    });
  }
}

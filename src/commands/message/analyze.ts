import extractUrls from 'extract-urls';

import { ApplicationCommandType, CommandContext, ComponentType, SlashCommand, SlashCreator } from 'slash-create/web';
import { cancelButton, jumpToMessageButton, resultEmbedBuilder, urlButtons, urlSelectComponent } from '@/ui';
import { analyzeUrl } from '@/lib/fetch';

export default class AnalyzeMessageCommand extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'Analyze',
      type: ApplicationCommandType.MESSAGE
    });
  }

  async run(ctx: CommandContext) {
    await ctx.defer(true);

    const messageContent = ctx.targetMessage!.content;
    const urls = extractUrls(messageContent);
    if (!urls) return ctx.send({ content: 'No valid URLs on this message.' });

    const component = urlSelectComponent;

    for (const url of urls) {
      component.options!.push({
        label: url,
        value: url,
        description: 'The parsed URL result.'
      });
    }

    await ctx.send({
      content: 'Choose a URL to analyze:',
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

  private async handleUrl(ctx: CommandContext, url: string) {
    await ctx.editOriginal({
      content: `Selected URL: \`\`\`${url}\`\`\``,
      embeds: [],
      components: [
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
      const data = await analyzeUrl(url);
      const embed = resultEmbedBuilder(data);

      return ctx.editOriginal({
        embeds: [embed],
        components: [
          {
            type: ComponentType.ACTION_ROW,
            components: [urlSelectComponent]
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

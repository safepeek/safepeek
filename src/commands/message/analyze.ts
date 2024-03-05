import extractUrls from 'extract-urls';

import {
  ApplicationCommandType,
  CommandContext,
  ComponentType,
  SlashCommand,
  SlashCreator,
  ComponentSelectOption
} from 'slash-create/web';
import { cancelButton, jumpToMessageButton, resultEmbedBuilder, urlButtons, urlSelectComponent } from '@/ui';
import { validateUrl } from '@/lib/fetch';
import { analyzeUrl } from '@/lib/urls';

export default class AnalyzeMessageCommand extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'Analyze',
      type: ApplicationCommandType.MESSAGE
    });
  }

  async run(ctx: CommandContext) {
    // TODO: handle defers better because executions are taking longer than 3 seconds
    await ctx.defer(true);

    const messageContent = ctx.targetMessage!.content;
    const urls = extractUrls(messageContent);
    if (!urls) return ctx.send({ content: 'No valid URLs on this message.' });

    const component = urlSelectComponent;
    const options: ComponentSelectOption[] = [];

    for (const url of urls) {
      options.push({
        label: url,
        value: url,
        description: 'The parsed URL result.'
      });
    }

    component.options = options;

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
      try {
        const validUrl = await validateUrl(url);
        if (!validUrl) return ctx.send(`The following URL has no response: \`${url}\``);

        const data = await analyzeUrl({
          creator: this.creator,
          ctx,
          url
        });

        const embed = resultEmbedBuilder({
          input: data.data,
          resultId: data.id,
          existed: data.existed
        });

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
      } catch (e: any) {
        console.log(e);
        return ctx.send({
          content: 'Check console for error.',
          ephemeral: true
        });
      }
    });

    ctx.registerComponent('cancel_button', async (btnCtx) => {
      return ctx.delete();
    });
  }
}

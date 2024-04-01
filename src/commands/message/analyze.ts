import {
  ApplicationCommandType,
  CommandContext,
  ComponentContext,
  ComponentSelectOption,
  ComponentType,
  Message,
  SlashCommand,
  SlashCreator,
  ApplicationIntegrationType,
  InteractionContextType
} from 'slash-create/web';
import extractUrls from 'extract-urls';

import { cancelButton, jumpToMessageButton, resultEmbedBuilder, urlButtons, urlSelectComponent } from '@/ui';
import { validateUrl } from '@/lib/fetch';
import { analyzeUrl, truncate } from '@/lib/urls';
import { getUserProfile } from '@/lib/db/utils';

export default class AnalyzeMessageCommand extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: 'Analyze',
      type: ApplicationCommandType.MESSAGE,
      integrationTypes: [ApplicationIntegrationType.GUILD_INSTALL, ApplicationIntegrationType.USER_INSTALL],
      contexts: [InteractionContextType.GUILD, InteractionContextType.PRIVATE_CHANNEL, InteractionContextType.BOT_DM]
    });
  }

  async onError(err: Error, ctx: CommandContext) {
    return ctx.send({ content: 'An error occurred running this command.', ephemeral: true });
  }

  async run(ctx: CommandContext) {
    const userProfile = await getUserProfile({
      creator: this.creator,
      ctx
    });

    const ephemeral = userProfile.ephemeral ?? true;

    await ctx.defer(ephemeral);

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
      return this.handleUrl(selectCtx, ctx.targetMessage!);
    });
  }

  private async handleUrl(ctx: ComponentContext, targetMessage: Message) {
    const selectedUrl = ctx.values[0];

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
              channelId: targetMessage.channelID,
              messageId: targetMessage.id
            })
          ]
        }
      ]
    });

    ctx.registerComponent('analyze_button', async (btnCtx) => {
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
      if (!validUrl) return btnCtx.editOriginal(`The following URL had an invalid response: \`${selectedUrl}\``);

      let data;
      try {
        data = await analyzeUrl({
          creator: this.creator,
          ctx: btnCtx,
          url: selectedUrl
        });
      } catch (e: any) {
        return btnCtx.editOriginal(`An error occurred analyzing the URL: \`${selectedUrl}\``);
      }

      const embed = resultEmbedBuilder({
        input: data.data,
        analyzedId: data.id
      });

      return btnCtx.editOriginal({
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
                channelId: targetMessage.channelID,
                messageId: targetMessage.id
              }),
              cancelButton
            ]
          }
        ]
      });
    });

    ctx.registerComponent('cancel_button', async (btnCtx) => {
      return btnCtx.delete();
    });
  }
}

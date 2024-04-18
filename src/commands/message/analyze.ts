import {
  AnyComponentButton,
  ApplicationCommandType,
  ApplicationIntegrationType,
  CommandContext,
  ComponentActionRow,
  ComponentButton,
  ComponentContext,
  ComponentSelectMenu,
  ComponentSelectOption,
  ComponentType,
  InteractionContextType,
  SlashCommand,
  SlashCreator
} from 'slash-create/web';
import extractUrls from 'extract-urls';

import {
  cancelButton,
  jumpToMessageButton,
  resultEmbedBuilder,
  safetyCheckButton,
  threatEmbedBuilder,
  threatEmbedNoHits,
  urlButtons,
  urlSelectComponent
} from '@/ui';
import { fetchUrlData, validateUrl } from '@/lib/fetch';
import { analyzeUrl, truncate } from '@/lib/urls';
import { getUserProfile } from '@/lib/db/utils';
import { AnalysisData } from '@/types/url';
import { ThreatMatchResponse } from '@/types/google';
import { checkUrlsForThreats } from '@/lib/google';

type HandleUrlProps = {
  ctx: ComponentContext | CommandContext;
  selectedUrl: string;
  ephemeral: boolean;
  urlSelectComponent: ComponentSelectMenu;
};

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

    const onlyOneResult = urls.length === 1;

    for (const url of urls) {
      const truncated = truncate(url, 100);

      options.push({
        label: truncated,
        value: truncated,
        description: 'The parsed URL result.',
        default: onlyOneResult ? true : undefined
      });
    }

    component.options = options;

    const components: ComponentActionRow[] = [
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
    ];

    if (onlyOneResult) components[1].components.splice(0, 0, ...urlButtons);

    await ctx.editOriginal({
      content: onlyOneResult ? `Selected URL: \`\`\`${urls[0]}\`\`\`` : 'Choose a URL to analyze:',
      embeds: [],
      components
    });

    if (onlyOneResult) return this.handleUrl({ ctx, selectedUrl: urls[0], urlSelectComponent, ephemeral });

    ctx.registerComponent('url_select', async (selectCtx) => {
      return this.handleUrl({ ctx, selectedUrl: selectCtx.values[0], urlSelectComponent, ephemeral });
    });
  }

  private async handleUrl(props: HandleUrlProps) {
    const selectedUrl = props.selectedUrl;

    const component = props.urlSelectComponent;
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

    await props.ctx.editOriginal({
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
              guildId: props.ctx.guildID!,
              channelId: props.ctx instanceof CommandContext ? props.ctx.targetMessage!.channelID : props.ctx.channelID,
              messageId: props.ctx instanceof CommandContext ? props.ctx.targetMessage!.id : props.ctx.messageID!
            })
          ]
        }
      ]
    });

    props.ctx.registerComponent('analyze_button', async (btnCtx) => {
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
                guildId: props.ctx.guildID!,
                channelId:
                  props.ctx instanceof CommandContext ? props.ctx.targetMessage!.channelID : props.ctx.channelID,
                messageId: props.ctx instanceof CommandContext ? props.ctx.targetMessage!.id : props.ctx.messageID!
              }),
              safetyCheckButton,
              cancelButton
            ]
          }
        ]
      });
    });

    props.ctx.registerComponent('safety_check_button', async (btnCtx) => {
      let data: AnalysisData, threatData: ThreatMatchResponse;
      try {
        data = await fetchUrlData(selectedUrl);
        threatData = await checkUrlsForThreats({
          apiKey: this.creator.client.GOOGLE_API_KEY,
          urls: [data.destinationUrl]
        });
      } catch (e: any) {
        if (e === 'NO_MATCHES_FOUND') {
          // we should disable the button if no matches are found to prevent frequent checks
          const components = btnCtx.message.components as ComponentActionRow[];
          const safetyCheckBtn = ((components[1] as ComponentActionRow).components as AnyComponentButton[]).find(
            (c) => (c as ComponentButton).custom_id === 'safety_check_button'
          );
          safetyCheckBtn!.disabled = true;

          await btnCtx.editOriginal({
            components
          });

          return props.ctx.send({
            embeds: [threatEmbedNoHits()],
            ephemeral: props.ephemeral
          });
        }

        console.error(e);
        return props.ctx.send({ content: `An error occurred analyzing the URL: \`${selectedUrl}\``, ephemeral: true });
      }

      const embed = threatEmbedBuilder({
        input: data,
        threatData
      });

      return props.ctx.send({
        embeds: [embed],
        components: [
          {
            type: ComponentType.ACTION_ROW,
            components: [
              jumpToMessageButton({
                guildId: props.ctx.guildID!,
                channelId:
                  props.ctx instanceof CommandContext ? props.ctx.targetMessage!.channelID : props.ctx.channelID,
                messageId: props.ctx instanceof CommandContext ? props.ctx.targetMessage!.id : props.ctx.messageID!
              }),
              cancelButton
            ]
          }
        ],
        ephemeral: props.ephemeral
      });
    });

    props.ctx.registerComponent('cancel_button', async (btnCtx) => {
      return btnCtx.delete();
    });
  }
}

import {
  AnyComponentButton,
  ApplicationIntegrationType,
  CommandContext,
  CommandOptionType,
  ComponentActionRow,
  ComponentButton,
  ComponentType,
  InteractionContextType,
  SlashCommand,
  SlashCreator
} from 'slash-create/web';
import extractUrls from 'extract-urls';

import {
  cancelButton,
  errorEmbedBuilder,
  resultEmbedBuilder,
  safetyCheckButton,
  threatEmbedBuilder,
  threatEmbedNoHits
} from '@/ui';
import { analyzeUrl } from '@/lib/urls';
import { getUserProfile } from '@/lib/db/utils';
import { ThreatMatchResponse } from '@/types/google';
import { checkUrlsForThreats } from '@/lib/google';
import { AnalyzeUrlError, AnalyzeUrlResponse, AnalyzeUrlSuccess } from '@/types/url';
import { UserResponseError } from '@/types/user';

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
    const embed = errorEmbedBuilder(err);
    return ctx.send({ content: 'An error occurred running this command.', embeds: [embed], ephemeral: true });
  }

  async run(ctx: CommandContext) {
    const profile = await getUserProfile({
      creator: this.creator,
      ctx
    });

    if (!profile.ok) throw new Error((profile as UserResponseError).data.code);

    const options = ctx.options as OptionTypes;
    const ephemeral = options.ephemeral ?? profile.data.ephemeral ?? true;

    await ctx.defer(ephemeral);

    const urls = extractUrls(ctx.options.url as string);
    if (!urls) return ctx.editOriginal({ content: `The provided URL \`${ctx.options.url}\` was invalid.` });
    const url = urls[0];

    let data: AnalyzeUrlResponse;
    try {
      data = (await analyzeUrl({
        creator: this.creator,
        ctx,
        url: urls![0]
      })) as AnalyzeUrlSuccess;

      if (!data.ok) return new Error((data as AnalyzeUrlError).data.code);
    } catch (e: any) {
      console.error(e);
      const errorEmbed = errorEmbedBuilder(e);

      return ctx.send({
        content: `An error occurred analyzing the URL: \`${url}\``,
        embeds: [errorEmbed],
        ephemeral: true
      });
    }

    const embed = resultEmbedBuilder({
      input: data.data,
      analyzedId: data.id
    });

    await ctx.editOriginal({
      embeds: [embed],
      components: [
        {
          type: ComponentType.ACTION_ROW,
          components: [safetyCheckButton, cancelButton]
        }
      ]
    });

    ctx.registerComponent('safety_check_button', async (btnCtx) => {
      let threatData: ThreatMatchResponse;
      try {
        threatData = await checkUrlsForThreats({
          apiKey: this.creator.client.GOOGLE_API_KEY,
          urls: [data.data.destinationUrl]
        });
      } catch (e: any) {
        if (e === 'NO_MATCHES_FOUND') {
          // we should disable the button if no matches are found to prevent frequent checks
          const components = btnCtx.message.components as ComponentActionRow[];
          const safetyCheckBtn = ((components[0] as ComponentActionRow).components as AnyComponentButton[]).find(
            (c) => (c as ComponentButton).custom_id === 'safety_check_button'
          );
          safetyCheckBtn!.disabled = true;

          await btnCtx.editOriginal({
            components
          });

          return ctx.send({
            embeds: [threatEmbedNoHits()],
            ephemeral
          });
        }

        console.error(e);
        const errorEmbed = errorEmbedBuilder(e);
        return ctx.send({
          content: `An error occurred analyzing the URL: \`${url}\``,
          embeds: [errorEmbed],
          ephemeral: true
        });
      }

      const embed = threatEmbedBuilder({
        threatData
      });

      await ctx.send({
        embeds: [embed],
        ephemeral
      });
    });

    ctx.registerComponent('cancel_button', async (btnCtx) => {
      return btnCtx.delete();
    });
  }
}

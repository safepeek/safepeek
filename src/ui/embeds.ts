import { oneLine } from 'common-tags';
import { EmbedBuilder } from '@discordjs/builders';
import { APIEmbed } from 'discord-api-types/v10';
import { AnalysisData } from '@/types/url';
import { APP_NAME, EMBED_COLOR } from '@/lib/constants';
import { decode, truncate } from '@/lib/urls';
import { ThreatMatchResponse } from '@/types/google';

type ThreatEmbedInput = {
  input: AnalysisData;
  threatData: ThreatMatchResponse;
};

export const threatEmbedBuilder = (data: ThreatEmbedInput): APIEmbed => {
  return new EmbedBuilder()
    .setTitle(`${APP_NAME} • Threat Analysis`)
    .setDescription("Here's what the Google Safe Browsing API provided about the URL.")
    .setColor(EMBED_COLOR)
    .setFields(
      data.threatData.matches.map((match) => ({
        name: 'Threat Information',
        value: `\`\`\`${JSON.stringify(match, null, 2)}\`\`\``
      }))
    )
    .setFooter({
      text: 'Google works to provide the most accurate and up-to-date information about unsafe web resources. However, Google cannot guarantee that its information is comprehensive and error-free: some risky sites may not be identified, and some safe sites may be identified in error.'
    })
    .setTimestamp()
    .toJSON();
};

export const threatEmbedNoHits = (): APIEmbed => {
  return new EmbedBuilder()
    .setTitle(`${APP_NAME} • Threat Analysis`)
    .setDescription(
      'The website has been checked against known security threats and no issues were found. However, please remain cautious as new threats emerge constantly, and not all risks may be known at the time of this check.'
    )
    .setColor(EMBED_COLOR)
    .setFooter({
      text: 'Google works to provide the most accurate and up-to-date information about unsafe web resources. However, Google cannot guarantee that its information is comprehensive and error-free: some risky sites may not be identified, and some safe sites may be identified in error.'
    })
    .setTimestamp()
    .toJSON();
};

type ResultEmbedInput = {
  input: AnalysisData;
  analyzedId: string;
};

export const resultEmbedBuilder = (data: ResultEmbedInput): APIEmbed => {
  const metaTitle = truncate(decode(data.input.title), 256);
  const metaDescription = truncate(decode(oneLine(data.input.description)), 256);

  return new EmbedBuilder()
    .setTitle(`${APP_NAME} • Results`)
    .setDescription("Here's what I found about the URL you asked me to analyze.")
    .setColor(EMBED_COLOR)
    .addFields([
      {
        name: 'Title',
        value: data.input.title ? metaTitle : 'No title found.',
        inline: true
      },
      {
        name: 'Description',
        value: data.input.description ? metaDescription : 'No description found.',
        inline: true
      },
      {
        name: '\u200B',
        value: '\u200B',
        inline: true
      },
      {
        name: 'Source URL',
        value: data.input.sourceUrl,
        inline: false
      },
      {
        name: 'Redirects',
        value:
          data.input.redirects.length > 0
            ? data.input.redirects
                .reverse()
                .map((res) => res.rawUrl)
                .join('\n')
            : 'No redirects.',
        inline: false
      },
      {
        name: 'Final URL',
        value: data.input.destinationUrl,
        inline: false
      }
    ])
    .setFooter({
      text: data.analyzedId
    })
    .setTimestamp()
    .toJSON();
};

import { AnalysisData } from '@/types/url';
import { MessageEmbed } from 'slash-create/web';
import { EMBED_COLOR } from '@/lib/constants';
import { decode, truncate } from '@/lib/urls';
import { oneLine } from 'common-tags';
import { ThreatMatchResponse } from '@/types/google';

type ThreatEmbedInput = {
  input: AnalysisData;
  threatData: ThreatMatchResponse;
};

export const threatEmbedBuilder = (data: ThreatEmbedInput): MessageEmbed => {
  return {
    type: 'rich',
    title: 'SafePeek Threat Analysis',
    description: "Here's what the Google Safe Browsing API provided about the URL.",
    color: EMBED_COLOR,
    fields: data.threatData.matches.map((match) => ({
      name: 'Threat Information',
      value: JSON.stringify(match, null, 2)
    })),
    footer: {
      text: 'Google works to provide the most accurate and up-to-date information about unsafe web resources. However, Google cannot guarantee that its information is comprehensive and error-free: some risky sites may not be identified, and some safe sites may be identified in error.'
    }
  };
};

export const threatEmbedNoHits = (): MessageEmbed => {
  return {
    type: 'rich',
    description: 'The destination URL analyzed appears to safe, but always proceed with caution!',
    color: EMBED_COLOR,
    footer: {
      text: 'Google works to provide the most accurate and up-to-date information about unsafe web resources. However, Google cannot guarantee that its information is comprehensive and error-free: some risky sites may not be identified, and some safe sites may be identified in error.'
    }
  };
};

type ResultEmbedInput = {
  input: AnalysisData;
  analyzedId: string;
};

export const resultEmbedBuilder = (data: ResultEmbedInput): MessageEmbed => {
  const metaTitle = truncate(decode(data.input.title), 256);
  const metaDescription = truncate(decode(oneLine(data.input.description)), 256);

  return {
    type: 'rich',
    title: 'SafePeek Results',
    description: "Here's what I found about the URL you asked me to analyze.",
    color: EMBED_COLOR,
    fields: [
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
    ],
    footer: {
      text: data.analyzedId
    },
    timestamp: new Date()
  };
};

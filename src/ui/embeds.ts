import { AnalysisData } from '@/types/url';
import { MessageEmbed } from 'slash-create/web';
import { EMBED_COLOR } from '@/lib/constants';
import { decode, truncate } from '@/lib/urls';
import { oneLine } from 'common-tags';

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

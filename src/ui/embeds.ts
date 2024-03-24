import { AnalysisData } from '@/types/url';
import { MessageEmbed } from 'slash-create/web';
import { EMBED_COLOR } from '@/lib/constants';

type ResultEmbedInput = {
  input: AnalysisData;
  analyzedId: string;
};

export const resultEmbedBuilder = (data: ResultEmbedInput): MessageEmbed => {
  return {
    type: 'rich',
    title: 'SafePeek Results',
    description: "Here's what I found about the URL you asked me to analyze:",
    color: EMBED_COLOR,
    fields: [
      {
        name: 'Title',
        value: data.input.title ? data.input.title : 'No title found.',
        inline: true
      },
      {
        name: 'Description',
        value: data.input.description ? data.input.description : 'No description found.',
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
        value: data.input.redirects
          .reverse()
          .map((res) => res.rawUrl)
          .join('\n'),
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

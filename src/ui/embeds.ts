import { AnalysisData } from '@/types/url';
import { MessageEmbed } from 'slash-create/web';

type ResultEmbedInput = {
  input: AnalysisData;
  resultId: string;
  existed?: boolean;
};

export const resultEmbedBuilder = (data: ResultEmbedInput): MessageEmbed => {
  return {
    type: 'rich',
    title: 'SafePeek Results',
    description: "Here's what I found about the URL you asked me to analyze:",
    color: 0x0099ff,
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
        value: data.input.redirects.join('\n'),
        inline: false
      },
      {
        name: 'Final URL',
        value: data.input.destinationUrl,
        inline: false
      }
    ],
    footer: {
      text: `${data.existed ? 'Existing' : 'New'} record | ${data.resultId}`
    },
    timestamp: new Date()
  };
};

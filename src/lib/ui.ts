import { MessageEmbed } from 'slash-create/web';
import { AnalysisResponse } from './fetch';

export const resultEmbedBuilder = (data: AnalysisResponse): MessageEmbed => {
  return {
    type: 'rich',
    title: 'SafePeek Results',
    description: "Here's what I found about the URL you asked me to analyze:",
    color: 0x0099ff,
    fields: [
      {
        name: 'Title',
        value: data.title ? data.title : 'No title found.',
        inline: true
      },
      {
        name: 'Description',
        value: data.description ? data.description : 'No description found.',
        inline: true
      },
      {
        name: '\u200B',
        value: '\u200B',
        inline: true
      },
      {
        name: 'Source URL',
        value: data.sourceUrl,
        inline: false
      },
      {
        name: 'Redirects',
        value: data.redirects.join('\n'),
        inline: false
      },
      {
        name: 'Final URL',
        value: data.destinationUrl,
        inline: false
      }
    ]
  };
};

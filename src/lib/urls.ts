import { BaseSlashCreator, CommandContext, ComponentContext } from 'slash-create/web';
import he from 'he';
import { analyzeUrlRequest } from '@/lib/fetch';
import { AnalysisDataResponse, AnalyzeUrlDataError, AnalyzeUrlResponse } from '@/types/url';

type AnalyzeUrlProps = {
  creator: BaseSlashCreator;
  ctx: CommandContext | ComponentContext;
  url: string;
};

export const analyzeUrl = async (props: AnalyzeUrlProps): Promise<AnalyzeUrlResponse> => {
  const data = await analyzeUrlRequest(
    {
      url: props.url,
      metadata: {
        discordUserId: props.ctx.user.id,
        discordChannelId: props.ctx.channelID,
        discordGuildId: props.ctx.guildID
      }
    },
    props.creator.client
  );

  if (!data.ok) throw new Error((data as AnalyzeUrlDataError).data.code);

  return {
    ok: true,
    data: (data.data as AnalysisDataResponse).data,
    id: (data.data as AnalysisDataResponse).id
  };
};

export const truncate = (string: string, maxLength: number): string => {
  if (string.length >= maxLength) {
    return string.substring(0, maxLength - 4) + '...';
  } else {
    return string;
  }
};

export const decode = (encoded: string): string => {
  return he.decode(encoded);
};

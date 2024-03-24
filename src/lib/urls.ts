import { BaseSlashCreator, CommandContext, ComponentContext } from 'slash-create/web';
import he from 'he';
import { client } from '@/lib/db';
import { fetchUrlData } from '@/lib/fetch';
import { createFromAnalyzedUrlData } from '@/lib/db/utils';
import { AnalysisData } from '@/types/url';

type AnalyzeUrlProps = {
  creator: BaseSlashCreator;
  ctx: CommandContext | ComponentContext;
  url: string;
};

type AnalyzeUrlResponse = {
  data: AnalysisData;
  id: string;
};

export const analyzeUrl = async (props: AnalyzeUrlProps): Promise<AnalyzeUrlResponse> => {
  const data = await fetchUrlData(props.url);

  const dbClient = client(props.creator.client);
  await dbClient.connect();

  const id = await createFromAnalyzedUrlData({
    dbClient,
    analyzedUrlData: {
      guildId: props.ctx.guildID ? BigInt(props.ctx.guildID) : null,
      userId: BigInt(props.ctx.user.id),
      channelId: BigInt(props.ctx.channelID),
      redirects: data.redirects
    }
  });

  // TODO: look into properly running dbClient.end() as the worker process is killed before the rest of the function can run
  // await dbClient.end();

  return { data, id };
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

import { BaseSlashCreator, CommandContext } from 'slash-create/web';
import { decryptUrlData, encryptUrlData, hash } from '@/lib/crypto';
import { client } from '@/lib/db';
import { fetchUrlData } from '@/lib/fetch';
import { findExistingUrl, insertUrlData } from '@/lib/db/utils';
import { AnalysisData } from '@/types/url';

type AnalyzeUrlProps = {
  creator: BaseSlashCreator;
  ctx: CommandContext;
  url: string;
};

type AnalyzeUrlResponse = {
  data: AnalysisData;
  id: string;
  existed?: boolean;
};

export const analyzeUrl = async (props: AnalyzeUrlProps): Promise<AnalyzeUrlResponse> => {
  const data = await fetchUrlData(props.url);

  const encryptedData = await encryptUrlData(
    {
      sourceUrl: data.sourceUrl,
      destinationUrl: data.destinationUrl,
      title: data.title,
      description: data.description,
      redirects: data.redirects
    },
    props.creator.client.URL_ENCRYPTION_KEY
  );

  const hashedUrl = await hash(data.sourceUrl);

  let id: string;
  const dbClient = client(props.creator.client);
  await dbClient.connect();

  try {
    id = await insertUrlData({
      data: encryptedData,
      hashedUrl,
      ctx: props.ctx,
      dbClient
    });

    await dbClient.end();
  } catch (e: any) {
    if (e.code === '23505') {
      const existingUrl = await findExistingUrl({
        dbClient,
        hashedUrl
      });
      id = existingUrl[0].id;

      const decrypted = await decryptUrlData(
        {
          sourceUrl: existingUrl[0].sourceUrl!,
          destinationUrl: existingUrl[0].destinationUrl!,
          title: existingUrl[0].metaTitle!,
          description: existingUrl[0].metaDescription!,
          redirects: existingUrl[0].redirects!
        },
        props.creator.client.URL_ENCRYPTION_KEY
      );

      return { data: decrypted, id, existed: true };
    }

    throw e;
  }

  return { data, id };
};

import {
  type AnalyzeUrlDataResponse,
  type AnalyzeUrlPostData,
  AnalyzeUrlSuccess,
  AnalyzeUrlValidation
} from '@/types/url';
import { Env } from '@/types';

export const analyzeUrlRequest = async (data: AnalyzeUrlPostData, env: Env): Promise<AnalyzeUrlDataResponse> => {
  const response = await fetch(env.API_BASE_ROUTE + 'analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.API_KEY
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    return {
      ok: false,
      data: await response.json()
    };
  }

  if (data.validate) {
    return {
      ok: true,
      data: (await response.json()) as AnalyzeUrlValidation
    };
  }

  return {
    ok: true,
    data: (await response.json()) as AnalyzeUrlSuccess
  };
};

import { type FetchUrlDataResponse } from '@/types/url';
import { Env } from '@/types';

export const fetchUrlData = async (url: string, env: Env): Promise<FetchUrlDataResponse> => {
  const response = await fetch(env.API_BASE_ROUTE + 'analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.API_KEY
    },
    body: JSON.stringify({
      url
    })
  });

  if (!response.ok) {
    return {
      ok: false,
      data: await response.json()
    };
  }

  return {
    ok: true,
    data: await response.json()
  };
};

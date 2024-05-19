import {
  type AnalyzeUrlDataResponse,
  type AnalyzeUrlPostData,
  AnalyzeUrlSuccess,
  AnalyzeUrlValidation
} from '@/types/url';
import { Env } from '@/types';
import { MakeProfileRequestProps, UserProfileDataResponse, UserProfileError } from '@/types/user';

type FetcherOptions = {
  route: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  // eslint-disable-next-line no-undef
  body?: BodyInit;
};

export const makeAPIRequest = (options: FetcherOptions, env: Env) => {
  return fetch(env.API_BASE_ROUTE + options.route, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.API_KEY
    },
    body: options.body ?? undefined
  });
};

export const analyzeUrlRequest = async (data: AnalyzeUrlPostData, env: Env): Promise<AnalyzeUrlDataResponse> => {
  const response = await makeAPIRequest(
    {
      route: 'analyze',
      method: 'POST',
      body: JSON.stringify(data)
    },
    env
  );

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

export const makeProfileRequest = async (
  props: MakeProfileRequestProps,
  env: Env
): Promise<UserProfileDataResponse> => {
  switch (props.method) {
    case 'get': {
      const response = await makeAPIRequest(
        {
          route: `profile/${props.discordUserId}`
        },
        env
      );

      if (!response.ok)
        return {
          ok: false,
          data: (await response.json()) as UserProfileError
        };

      return {
        ok: true,
        data: await response.json()
      };
    }
    case 'update': {
      const response = await makeAPIRequest(
        {
          route: `profile/${props.discordUserId}`,
          method: 'POST',
          body: JSON.stringify({
            data: props.data,
            metadata: props.metadata
          })
        },
        env
      );

      if (!response.ok)
        return {
          ok: false,
          data: await response.json()
        };

      return {
        ok: true,
        data: await response.json()
      };
    }
  }
};

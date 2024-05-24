import {
  type AnalyzeUrlDataResponse,
  type AnalyzeUrlPostData,
  AnalyzeUrlSuccess,
  AnalyzeUrlValidation
} from '@/types/url';
import { Env } from '@/types';
import { CommandStatEntry } from '@safepeek/utils';
import { MakeProfileRequestProps, UserProfileDataResponse, UserProfileError } from '@/types/user';
import { APP_VERSION } from '@/lib/constants';

type FetcherOptions = {
  route: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  // eslint-disable-next-line no-undef
  body?: BodyInit;
};

const USER_AGENT = `SafePeekBot/v${APP_VERSION}`;

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

export const makeCommandStatRequest = async (data: CommandStatEntry, env: Env): Promise<boolean> => {
  const response = await makeAPIRequest(
    {
      route: 'stats/command',
      method: 'POST',
      body: JSON.stringify(data)
    },
    env
  );

  if (!response.ok)
    throw new Error(
      JSON.stringify({
        status: response.status,
        message: response.statusText
      })
    );

  return response.ok;
};

// TODO: add in access token
export const makeGitHubAPIRequest = async (options: FetcherOptions, env: Env) => {
  const baseRoute: string = 'https://api.github.com/repos/safepeek/safepeek';

  const response = await fetch(baseRoute + options.route, {
    method: options.method ?? 'GET',
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/vnd.github+json',
      Authorization: `token ${env.GITHUB_TOKEN}`
    },
    body: options.body ?? undefined
  });

  console.log('url', response.url);

  if (!response.ok)
    throw new Error(
      JSON.stringify({
        status: response.status,
        message: response.statusText
      })
    );

  return (await response.json()) as Record<string, unknown>;
};

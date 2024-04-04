import { ThreatMatchRequest, ThreatMatchResponse } from '@/types/google';

type CheckUrlsForThreatsProps = {
  apiKey: string;
  urls: string[];
};

export const checkUrlsForThreats = async (props: CheckUrlsForThreatsProps): Promise<ThreatMatchResponse> => {
  const url = new URL('https://safebrowsing.googleapis.com/v4/threatMatches:find');
  url.searchParams.append('key', props.apiKey);

  const requestBody: ThreatMatchRequest = {
    client: {
      clientId: 'safepeekbot',
      clientVersion: '1.0.0'
    },
    threatInfo: {
      threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING'],
      platformTypes: ['ANY_PLATFORM'],
      threatEntryTypes: ['URL'],
      threatEntries: props.urls.map((url) => ({ url }))
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  }).then((res) => res.json() as unknown as ThreatMatchResponse);

  if (!('matches' in response)) throw 'NO_MATCHES_FOUND';

  return response;
};

// TODO: further handle fetch-related errors
import { type AnalysisData, AnalyzedUrlRedirect } from '@/types/url';

const fetcher = (url: string, follow?: boolean) => {
  // TODO: some urls return a 4xx error. not sure why. need to look into this more
  // TODO: some urls return a 429 too many redirects error. has to do with cloudflare workers
  return fetch(url, {
    redirect: follow ? 'follow' : 'manual',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'text/html',
      Referer: 'https://google.com/'
    }
  });
};

export const validateUrl = async (url: string): Promise<boolean> => {
  const response = await fetcher(url, true);
  return response.ok;
};

const fetchWithRedirects = async (url: string) => {
  let response = await fetcher(url);
  const urls: AnalyzedUrlRedirect[] = [];

  while (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('location');
    if (!location) break;

    response = await fetcher(location);
    const meta = await getMetadata(response);
    urls.push({
      rawUrl: location,
      meta
    });
  }

  return urls;
};

const getMetadata = async (response: Response) => {
  let title = '';
  let description = '';

  // eslint-disable-next-line no-undef
  const rewriter = new HTMLRewriter()
    .on('title', {
      text(text: Text) {
        if (text.text === '') return;
        title = text.text;
      }
    })
    .on('meta[name="description"]', {
      element(element: Element) {
        description = element.getAttribute('content') || '';
      }
    });

  try {
    await rewriter.transform(response).text(); // Ensure HTMLRewriter processes the entire document
  } catch (e: any) {
    return { title, description }; // if there's an error, just return the default data
  }

  return { title, description };
};

export const fetchUrlData = async (url: string): Promise<AnalysisData> => {
  const response = await fetcher(url, true);
  const sourceUrl = url;
  const destinationUrl = response.url;
  const redirects = await fetchWithRedirects(sourceUrl);
  const { title, description } = await getMetadata(response);

  return {
    title,
    description,
    sourceUrl,
    destinationUrl,
    redirects
  };
};

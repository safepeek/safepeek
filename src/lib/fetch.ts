export type AnalysisResponse = {
  title: string;
  description: string;
  sourceUrl: string;
  destinationUrl: string;
  redirects: string[];
};

const fetcher = (url: string) => {
  return fetch(url, {
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

const fetchWithRedirects = async (url: string) => {
  let response = await fetcher(url);
  const urls: string[] = [];

  while (response.redirected) {
    urls.push(response.url);
    response = await fetcher(response.url);
  }

  urls.push(response.url);
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

  await rewriter.transform(response).text(); // Ensure HTMLRewriter processes the entire document

  return { title, description };
};

export const analyzeUrl = async (url: string): Promise<AnalysisResponse> => {
  const response = await fetcher(url);
  const sourceUrl = url;
  const destinationUrl = response.url;
  const redirects = await fetchWithRedirects(destinationUrl);
  const { title, description } = await getMetadata(response);

  return {
    title,
    description,
    sourceUrl,
    destinationUrl,
    redirects
  };
};

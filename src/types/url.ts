export type AnalysisData = {
  title: string;
  description: string;
  sourceUrl: string;
  destinationUrl: string;
  redirects: AnalyzedUrlRedirect[];
};

export type AnalysisError = {
  code: string;
  url?: string;
};

export type FetchUrlDataSuccess = {
  ok: true;
  data: AnalysisData;
};

export type FetchUrlDataError = {
  ok: false;
  data: AnalysisError;
};

export type FetchUrlDataResponse = FetchUrlDataSuccess | FetchUrlDataError;

export interface AnalyzedUrl {
  guildId: bigint | null;
  userId: bigint;
  channelId: bigint;
  redirects: AnalyzedUrlRedirect[];
}

export interface AnalyzedUrlRedirect {
  rawUrl: string;
  meta: AnalyzedUrlRedirectMetadata;
}

export interface AnalyzedUrlRedirectMetadata {
  title: string;
  description: string;
}

export type AnalyzeUrlSuccess = {
  ok: true;
  data: AnalysisData;
  id: string;
};

export type AnalyzeUrlError = {
  ok: false;
  data: AnalysisError;
};

export type AnalyzeUrlResponse = AnalyzeUrlSuccess | AnalyzeUrlError;

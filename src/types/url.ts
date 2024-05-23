import { AnalysisData } from '@safepeek/utils';

export type AnalysisDataResponse = {
  data: AnalysisData;
  id: string;
};

export type AnalysisError = {
  code: string;
  url?: string;
};

export type AnalyzeUrlDataSuccess = {
  ok: true;
  data: AnalysisDataResponse | AnalyzeUrlValidation;
};

export type AnalyzeUrlDataError = {
  ok: false;
  data: AnalysisError;
};

export type AnalyzeUrlValidation = {
  code: string;
  sourceUrl: string;
  destinationUrl: string;
};

export type AnalyzeUrlDataResponse = AnalyzeUrlDataSuccess | AnalyzeUrlDataError;

export type AnalyzeUrlSuccess = {
  ok: true;
  data: AnalysisData;
  id: string;
};

export type AnalyzeUrlError = {
  ok: false;
  data: AnalysisError;
};

export type AnalyzeUrlPostData = {
  url: string;
  metadata: {
    discordUserId: string;
    discordChannelId: string;
    discordGuildId?: string;
  };
  validate?: boolean;
};

export type AnalyzeUrlResponse = AnalyzeUrlSuccess | AnalyzeUrlError;

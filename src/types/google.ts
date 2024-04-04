export interface ThreatMatchRequest {
  client: {
    clientId: string;
    clientVersion: string;
  };
  threatInfo: {
    threatTypes: string[];
    platformTypes: string[];
    threatEntryTypes: string[];
    threatEntries: {
      url: string;
    }[];
  };
}

export interface ThreatMatchResponse {
  matches: ThreatMatch[];
}

export interface ThreatMatch {
  threatType: string;
  platformType: string;
  threatEntryType: string;
  threat: {
    url: string;
  };
  threatEntryMetadata?: {
    entries: {
      key: string;
      value: string;
    }[];
  };
  cacheDuration: string;
}

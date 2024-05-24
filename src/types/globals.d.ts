// secrets: wrangler secret put <name>
declare const DISCORD_APP_ID: string;
declare const DISCORD_PUBLIC_KEY: string;
declare const DISCORD_BOT_TOKEN: string;
declare const DEVELOPMENT_GUILD_ID: string;
declare const NODE_ENV: string;
declare const GOOGLE_API_KEY: string;
declare const LAST_COMMIT: string;
declare const LAST_COMMIT_SHORT: string;
declare const CF_DEPLOYMENT_ID: string;
declare const API_KEY: string;
declare const API_BASE_ROUTE: string;
declare const GITHUB_TOKEN: string;

// extract-urls.d.ts
declare module 'extract-urls' {
  /**
   * Extracts URLs from a given string.
   *
   * @param str The string from which URLs will be extracted.
   * @param lower Optional. Converts extracted URLs to lowercase if true.
   * @returns An array of URLs found in the string, with optional lowercase transformation and cleaned up brackets.
   * @throws TypeError if the provided `str` argument is not a string.
   */
  function extractUrls(str: string, lower?: boolean): string[] | undefined;

  export = extractUrls;
}

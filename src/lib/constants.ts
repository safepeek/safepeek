import packageJson from '../../package.json';
import { BotList } from '@/types/lists';

export const EMBED_COLOR: number = 0x74b9ff;
export const EMBED_COLOR_ERROR: number = 0xd63031;

export const APP_NAME: string = 'SafePeek';
export const APP_DESCRIPTION: string = packageJson.description;
export const APP_VERSION: string = packageJson.version;
export const APP_GITHUB: string = 'https://github.com/safepeek/safepeek';

export const WEBSITE: string = 'https://safepeek.org';
export const TWITTER: string = 'https://twitter.com/safepeekbot';
export const DISCORD_INVITE: string = 'https://discord.gg/2TvARX4Xwp';
export const DISCORD_INVITE_CODE: string = '2TvARX4Xwp';
export const GUILD_INSTALL_LINK: string =
  'https://discord.com/oauth2/authorize?client_id=1208283559799029760&permissions=274878024704&scope=bot+applications.commands';
export const USER_INSTALL_LINK: string =
  'https://discord.com/oauth2/authorize?client_id=1208283559799029760&scope=applications.commands&integration_type=1';

export const BOT_LISTS: BotList[] = [
  {
    name: 'top.gg',
    url: 'https://top.gg/bot/1208283559799029760',
    voteLink: 'https://top.gg/bot/1208283559799029760/vote'
  }
];

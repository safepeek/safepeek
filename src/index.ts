import { SlashCreator, CloudflareWorkerServer } from 'slash-create/web';

import { commands } from './commands';
import { Env } from '@/types';
import { CommandStatEntry } from '@safepeek/utils';
import { makeCommandStatRequest } from '@/lib/fetch';
import { errorEmbedBuilder } from '@/ui';
import { APP_VERSION } from '@/lib/constants';

const cfServer = new CloudflareWorkerServer();
let creator: SlashCreator;
// Since we only get our secrets on fetch, set them before running
function makeCreator(env: Env) {
  creator = new SlashCreator({
    applicationID: env.DISCORD_APP_ID,
    publicKey: env.DISCORD_PUBLIC_KEY,
    token: env.DISCORD_BOT_TOKEN,
    // TODO: add typings for this
    client: env
  });
  creator.withServer(cfServer).registerCommands(commands);

  creator.on('warn', (message) => console.warn(message));
  creator.on('error', (error) => console.error(error));
  creator.on('commandRun', async (command, _, ctx) => {
    console.info(`${ctx.user.username}#${ctx.user.discriminator} (${ctx.user.id}) ran command ${command.commandName}`);
    const statObj: CommandStatEntry = {
      name: command.commandName,
      id: ctx.commandID,
      type: command.type,
      options: ctx.options,
      context: ctx.context ?? null,
      integration_types: command.integrationTypes,
      metadata: {
        user_id: ctx.user.id,
        channel_id: ctx.channelID,
        guild_id: ctx.guildID ?? null,
        locale: ctx.locale ?? null,
        guild_locale: ctx.guildLocale ?? null,
        interaction_id: ctx.interactionID,
        invoked_at: ctx.invokedAt,
        bot_version: APP_VERSION,
        last_commit: env.LAST_COMMIT_SHORT,
        environment: env.NODE_ENV
      }
    };

    try {
      await makeCommandStatRequest(statObj, env);
    } catch (error: any) {
      console.error(error);
      const embed = errorEmbedBuilder(error);
      return ctx.send({
        embeds: [embed],
        ephemeral: true
      });
    }
  });
  creator.on('commandError', (command, error) => console.error(`Command ${command.commandName} errored:`, error));
}

export default {
  async fetch(request: any, env: Env, ctx: any) {
    if (!creator) makeCreator(env);
    return cfServer.fetch(request, env, ctx);
  }
};

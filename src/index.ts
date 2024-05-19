import { SlashCreator, CloudflareWorkerServer } from 'slash-create/web';

import { commands } from './commands';
import { Env } from '@/types';
import { CommandStatEntry } from '@/types/stat';
import { makeCommandStatRequest } from '@/lib/fetch';
import { errorEmbedBuilder } from '@/ui';

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
      integrationTypes: command.integrationTypes,
      metadata: {
        userId: ctx.user.id,
        channelId: ctx.channelID,
        guildId: ctx.guildID ?? null,
        locale: ctx.locale ?? null,
        guildLocale: ctx.guildLocale ?? null,
        interactionId: ctx.interactionID,
        invokedAt: ctx.invokedAt
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

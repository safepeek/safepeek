import { commands } from './commands';
import { SlashCreator, CloudflareWorkerServer } from 'slash-create/web';
import { Env } from '@/types';

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
  creator.on('commandRun', (command, _, ctx) =>
    console.info(`${ctx.user.username}#${ctx.user.discriminator} (${ctx.user.id}) ran command ${command.commandName}`)
  );
  creator.on('commandError', (command, error) => console.error(`Command ${command.commandName} errored:`, error));
}

export default {
  async fetch(request: any, env: Env, ctx: any) {
    if (!creator) makeCreator(env);
    return cfServer.fetch(request, env, ctx);
  }
};

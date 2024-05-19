import { ApplicationCommandType, InteractionContextType, ApplicationIntegrationType } from 'slash-create/web';

export interface CommandStatEntryMetadata {
  userId: string;
  channelId: string;
  guildId: string | null;
  locale: string | null;
  guildLocale: string | null;
  interactionId: string;
  invokedAt: number;
}

export interface CommandStatEntry {
  name: string;
  id: string;
  type: ApplicationCommandType;
  options: { [p: string]: any };
  context: InteractionContextType | null;
  integrationTypes: ApplicationIntegrationType[];
  metadata: CommandStatEntryMetadata;
}

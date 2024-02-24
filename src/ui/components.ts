import {
  AnyComponentButton,
  ButtonStyle,
  ComponentButtonLink,
  ComponentSelectMenu,
  ComponentType
} from 'slash-create/web';

type DiscordMessageUrlData = {
  guildId: string;
  channelId: string;
  messageId: string;
};

export const urlSelectComponent: ComponentSelectMenu = {
  type: ComponentType.STRING_SELECT,
  custom_id: 'url_select',
  placeholder: 'Choose a URL',
  min_values: 1,
  max_values: 1,
  options: []
};

export const analyzeButton: AnyComponentButton = {
  type: ComponentType.BUTTON,
  style: ButtonStyle.PRIMARY,
  label: 'Analyze',
  custom_id: 'analyze_button',
  emoji: {
    name: '🔍'
  }
};

export const cancelButton: AnyComponentButton = {
  type: ComponentType.BUTTON,
  style: ButtonStyle.DESTRUCTIVE,
  label: 'Cancel',
  custom_id: 'cancel_button',
  emoji: {
    name: '🗑️'
  }
};

export const urlButtons: AnyComponentButton[] = [analyzeButton, cancelButton];

export const jumpToMessageButton = (data: DiscordMessageUrlData): ComponentButtonLink => ({
  type: ComponentType.BUTTON,
  style: ButtonStyle.LINK,
  label: 'Message',
  url: `https://discord.com/channels/${data.guildId}/${data.channelId}/${data.messageId}`
});

import {
  Channel,
  Guild,
  MessageCreateOptions,
  MessagePayload,
  MessageReplyOptions,
  User,
  VoiceBasedChannel
} from 'discord.js';

export interface DiscordRequest {
  getAuthor(): User;

  getVoiceChannel(): VoiceBasedChannel | null;

  getSenderGuild(): Guild | null;

  getSenderChannel(): Channel | null;

  reply(options: string | MessagePayload | MessageReplyOptions): Promise<void>;

  send(content: string | MessagePayload | MessageCreateOptions): Promise<void>;

  react(emoji: string): Promise<void>;
}

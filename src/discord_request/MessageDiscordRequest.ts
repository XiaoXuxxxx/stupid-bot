import { DiscordRequest } from '@/src/discord_request/base/DiscordRequest';
import {
  Channel,
  Guild,
  Message,
  MessagePayload,
  User,
  VoiceBasedChannel
} from 'discord.js';

export class MessageDiscordRequest implements DiscordRequest {
  private readonly message: Message;

  public constructor(message: Message) {
    this.message = message;
  }

  public getVoiceChannel(): VoiceBasedChannel | null {
    return this.message.member?.voice.channel ?? null;
  }

  public getSenderGuild(): Guild | null {
    return this.message.guild;
  }

  public getSenderChannel(): Channel | null {
    return this.message.channel;
  }

  public getAuthor(): User {
    return this.message.author;
  }

  public async reply(options: string | MessagePayload): Promise<void> {
    await this.message.reply(options);
  }

  public async send(content: string | MessagePayload): Promise<void> {
    await this.message.channel.send(content);
  }

  public async react(emoji: string): Promise<void> {
    await this.message.react(emoji);
  }
}

import {
  Channel,
  CommandInteraction,
  Guild,
  GuildMember,
  MessagePayload,
  User,
  VoiceBasedChannel,
} from 'discord.js';

import { DiscordRequest } from '@/src/discord_request/base/DiscordRequest';

export class InteractionDiscordRequest implements DiscordRequest {
  private readonly interaction: CommandInteraction;

  public constructor(interaction: CommandInteraction) {
    this.interaction = interaction;
  }

  public getVoiceChannel(): VoiceBasedChannel | null {
    const member = this.interaction.member as GuildMember;

    return member?.voice.channel ?? null;
  }

  public getSenderGuild(): Guild | null {
    return this.interaction.guild;
  }

  public getSenderChannel(): Channel | null {
    return this.interaction.channel;
  }

  public getAuthor(): User {
    return this.interaction.member?.user as User;
  }

  public async reply(options: string | MessagePayload): Promise<void> {
    await this.interaction.editReply(options);
  }

  public async send(content: string | MessagePayload): Promise<void> {
    await this.interaction.channel?.send(content);
  }

  public async react(): Promise<void> {
    //
  }
}

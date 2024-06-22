import { SlashCommandBuilder } from 'discord.js';

import SoundBlasterManager from '@/src/audio/SoundBlasterManager';
import Commandable from '@/src/commands/Commandable';
import { DiscordRequest } from '@/src/discord_request/base/DiscordRequest';

export default class Clear implements Commandable {
  public name = 'clear';
  public aliases: string[] = ['c', 'clear'];
  public description = 'clear the upcoming queue';
  public slashCommand = new SlashCommandBuilder()
    .setName('clear')
    .setDescription('clear the upcoming queue');

  private soundBlasterManager: SoundBlasterManager;

  public constructor(soundBlasterManager: SoundBlasterManager) {
    this.soundBlasterManager = soundBlasterManager;
  }

  public async execute(request: DiscordRequest, args: string[]): Promise<void> {
    const channel = request.getVoiceChannel();
    const guild = request.getSenderGuild();

    if (!channel || !guild) {
      request.reply('join voice channel first!');
      request.react('👎');
      return;
    }

    const soundBlaster = this.soundBlasterManager.getSoundBlaster(guild.id);

    soundBlaster.getQueue().clearUpcomingItems();

    request.reply('cleared the upcoming queue!');
    request.react('👍');
  }
}

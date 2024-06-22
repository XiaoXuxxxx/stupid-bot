import { SlashCommandBuilder } from 'discord.js';

import SoundBlasterManager from '@/src/audio/SoundBlasterManager';
import Commandable from '@/src/commands/Commandable';
import { DiscordRequest } from '@/src/discord_request/base/DiscordRequest';

export default class Prune implements Commandable {
  public name = 'prune';
  public aliases: string[] = ['pr', 'prune'];
  public description = 'clear the previous played tracks';
  public slashCommand = new SlashCommandBuilder()
    .setName('prune')
    .setDescription('clear the previous played tracks');

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

    soundBlaster.getQueue().pruneItems();

    request.reply('cleared the previous played tracks');
    request.react('👍');
  }
}

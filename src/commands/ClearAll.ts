import SoundBlasterManager from '@/src/audio/SoundBlasterManager';
import Commandable from '@/src/commands/Commandable';
import { DiscordRequest } from '@/src/discord_request/base/DiscordRequest';
import { SlashCommandBuilder } from 'discord.js';

export default class ClearAll implements Commandable {
  public name = 'clearall';
  public aliases: string[] = ['ca', 'clearall'];
  public description = 'clear previous play song and upcoming queue';
  public slashCommand = new SlashCommandBuilder()
    .setName('clear-all')
    .setDescription('clear previous play song and upcoming queue');

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

    soundBlaster.getQueue().clearUpcomingTracks();
    soundBlaster.getQueue().pruneTracks();

    request.reply('cleared the upcoming queue and previous played song!');
    request.react('👍');
  }
}

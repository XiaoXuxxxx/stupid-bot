import SoundBlasterManager from '@/src/audio/SoundBlasterManager';
import Commandable from '@/src/commands/Commandable';
import { DiscordRequest } from '@/src/discord_request/base/DiscordRequest';
import { ListSongEmbed } from '@/src/embed/ListSongEmbed';
import { SlashCommandBuilder } from 'discord.js';

export default class Queue implements Commandable {
  public name = 'queue';
  public aliases = ['q', 'list'];
  public description = '**show the current/upcoming/previous tracks**';

  public slashCommand: SlashCommandBuilder = new SlashCommandBuilder()
    .setName('queue')
    .setDescription('show the queue');

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

    const queue = this.soundBlasterManager.getSoundBlaster(guild.id).getQueue();

    const currentTrack = queue.getCurrentItem();

    if (!currentTrack) {
      request.reply('no song is playing');
      request.react('👎');
      return;
    }

    const embed = await new ListSongEmbed(queue).build();

    request.reply({ embeds: [embed] });
    request.react('👍');
  }
}

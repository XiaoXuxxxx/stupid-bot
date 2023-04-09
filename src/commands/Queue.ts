import SoundBlasterManager from '@/src/audio/SoundBlasterManager';
import Commandable from '@/src/commands/Commandable';
import { ListSongEmbed } from '@/src/embed/ListSongEmbed';
import { Message } from 'discord.js';

export default class Queue implements Commandable {
  public name = 'list';
  public aliases = ['q', 'queue'];
  public description = '**show the current/upcomming/previous tracks**';

  private soundBlasterManager: SoundBlasterManager;

  public constructor(soundBlasterManager: SoundBlasterManager) {
    this.soundBlasterManager = soundBlasterManager;
  }

  public async execute(
    message: Message<boolean>,
    args: string[]
  ): Promise<void> {
    const channel = message.member?.voice.channel;
    const guild = message.guild;

    if (!channel || !guild) {
      message.reply('join voice channel first!');
      message.react('👎');
      return;
    }

    const queue = this.soundBlasterManager.getSoundBlaster(guild.id).getQueue();

    const currentTrack = queue.getCurrentTrack();

    if (!currentTrack) {
      message.reply('no song is playing');
      message.react('👎');
      return;
    }

    const embed = await new ListSongEmbed(queue).build();

    message.reply({ embeds: [embed] });
    message.react('👍');
  }
}

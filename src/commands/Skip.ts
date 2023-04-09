import SoundBlasterManager from '@/src/audio/SoundBlasterManager';
import Commandable from '@/src/commands/Commandable';
import CommonEmbed from '@/src/embed/CommonEmbed';
import { Message } from 'discord.js';

export default class Skip implements Commandable {
  public name = 'skip';
  public aliases = ['s', 'skip'];
  public description = '**skip 1 track**';

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

    const soundBlaster = this.soundBlasterManager.getSoundBlaster(guild.id);

    await soundBlaster.playNextTrack();

    const embed = new CommonEmbed('Skip', 'Skip 1 step', '#FF5000');
    message.reply({ embeds: [embed] });

    message.react('👍');
  }
}

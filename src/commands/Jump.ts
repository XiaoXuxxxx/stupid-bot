import SoundBlasterManager from '@/src/audio/SoundBlasterManager';
import Commandable from '@/src/commands/Commandable';
import { Message } from 'discord.js';

export default class Jump implements Commandable {
  public name = 'jump';
  public aliases = ['j', 'jump'];
  public description =
    '**jump to the specific song in the queue**\n *example*\n`{{PREFIX}}jump 5` for jump to the next 5 song\n`{{PREFIX}}jump -5` for jump to the 5 previous song';

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

    const index = parseInt(args[0], 10);
    if (isNaN(index)) {
      message.reply('invalid index');
      message.react('👎');
      return;
    }

    const soundBlaster = this.soundBlasterManager.getSoundBlaster(guild.id);

    await soundBlaster.jumpToTrack(index);

    message.react('👍');
  }
}

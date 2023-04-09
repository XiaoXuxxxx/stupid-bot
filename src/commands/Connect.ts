import SoundBlasterManager from '@/src/audio/SoundBlasterManager';
import Commandable from '@/src/commands/Commandable';
import { Message } from 'discord.js';

export default class Connect implements Commandable {
  public name = 'connect';
  public aliases = ['c', 'connect'];
  public description = '**make the bot connect to voice channel**';
  private soundBlasterManager: SoundBlasterManager;

  public constructor(soundBlasterManager: SoundBlasterManager) {
    this.soundBlasterManager = soundBlasterManager;
  }

  public async execute(
    message: Message<boolean>,
    args: string[]
  ): Promise<void> {
    const channel = message.member?.voice.channel;
    const guildId = message.guild?.id;
    if (!channel || !guildId) {
      message.reply('join voice channel first!');
      message.react('👎');
      return;
    }
    this.soundBlasterManager.getSoundBlaster(guildId).joinChannel(channel);

    message.react('👍');
  }
}

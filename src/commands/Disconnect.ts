import SoundBlasterManager from '@/src/audio/SoundBlasterManager';
import Commandable from '@/src/commands/Commandable';
import DisconnectEmbed from '@/src/embed/DisconnectEmbed';
import { Message } from 'discord.js';

export default class Disconnect implements Commandable {
  public name = 'disconnect';
  public aliases = ['d', 'disconnect'];
  public description = '**make bot disconnected from voice channel**';
  private soundBlasterManager: SoundBlasterManager;

  public constructor(soundBlasterManager: SoundBlasterManager) {
    this.soundBlasterManager = soundBlasterManager;
  }

  public async execute(
    message: Message<boolean>,
    args: string[]
  ): Promise<void> {
    const guildId = message.guild?.id;
    if (!guildId) {
      message.reply('join voice channel first!');
      message.react('👎');
      return;
    }
    this.soundBlasterManager.terminateSoundBlaster(guildId);
    const embed = new DisconnectEmbed();
    message.reply({ embeds: [embed] });
    message.react('👍');
  }
}

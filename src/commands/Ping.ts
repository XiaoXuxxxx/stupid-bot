import Commandable from '@/src/commands/Commandable';
import { Message } from 'discord.js';

export default class Ping implements Commandable {
  public name = 'ping';
  public aliases = ['ping'];
  public description = '**ping pong!!! 😅**';

  public async execute(
    message: Message<boolean>,
    args: string[]
  ): Promise<void> {
    message.reply('pong');
  }
}

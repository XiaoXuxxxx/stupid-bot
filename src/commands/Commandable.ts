import { Message } from 'discord.js';

export default interface Commandable {
  readonly name: string;
  readonly aliases: string[];
  readonly description: string;

  execute(message: Message, args: string[]): Promise<void>;
}

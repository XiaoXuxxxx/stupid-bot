import { DiscordRequest } from '@/src/discord_request/base/DiscordRequest';
import {
  CommandInteractionOptionResolver,
  SlashCommandBuilder
} from 'discord.js';

export default interface Commandable {
  readonly name: string;
  readonly aliases: string[];
  readonly description: string;

  readonly slashCommand: Omit<
    SlashCommandBuilder,
    'addSubcommand' | 'addSubcommandGroup'
  >;

  execute(
    request: DiscordRequest,
    args:
      | string[]
      | Omit<CommandInteractionOptionResolver, 'getMessage' | 'getFocused'>
  ): Promise<void>;
}

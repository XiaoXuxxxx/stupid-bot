import {
  CommandInteractionOptionResolver,
  SlashCommandOptionsOnlyBuilder,
} from 'discord.js';

import { DiscordRequest } from '@/src/discord_request/base/DiscordRequest';

export default interface Commandable {
  readonly name: string;
  readonly aliases: string[];
  readonly description: string;

  readonly slashCommand: SlashCommandOptionsOnlyBuilder;

  execute(
    request: DiscordRequest,
    args:
      | string[]
      | Omit<CommandInteractionOptionResolver, 'getMessage' | 'getFocused'>,
  ): Promise<void>;
}

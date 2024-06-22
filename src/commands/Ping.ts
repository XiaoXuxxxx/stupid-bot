import { SlashCommandBuilder } from 'discord.js';

import Commandable from '@/src/commands/Commandable';
import { DiscordRequest } from '@/src/discord_request/base/DiscordRequest';

export default class Ping implements Commandable {
  public name = 'ping';
  public aliases = ['ping'];
  public description = '**ping pong!!! 😅**';

  public slashCommand: SlashCommandBuilder = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  public async execute(request: DiscordRequest, args: string[]): Promise<void> {
    request.reply('pong');
  }
}

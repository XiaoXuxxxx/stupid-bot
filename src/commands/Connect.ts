import { SlashCommandBuilder } from 'discord.js';

import SoundBlasterManager from '@/src/audio/SoundBlasterManager';
import Commandable from '@/src/commands/Commandable';
import { DiscordRequest } from '@/src/discord_request/base/DiscordRequest';

export default class Connect implements Commandable {
  public name = 'connect';
  public aliases = ['connect'];
  public description = '**make the bot connect to voice channel**';

  public slashCommand: SlashCommandBuilder = new SlashCommandBuilder()
    .setName('connect')
    .setDescription('connect the bot to the room');

  private soundBlasterManager: SoundBlasterManager;

  public constructor(soundBlasterManager: SoundBlasterManager) {
    this.soundBlasterManager = soundBlasterManager;
  }

  public async execute(request: DiscordRequest, args: string[]): Promise<void> {
    const channel = request.getVoiceChannel();
    const guildId = request.getSenderGuild()?.id;

    if (!channel || !guildId) {
      request.reply('join voice channel first!');
      request.react('👎');
      return;
    }
    this.soundBlasterManager.getSoundBlaster(guildId).joinChannel(channel);

    request.react('👍');
  }
}

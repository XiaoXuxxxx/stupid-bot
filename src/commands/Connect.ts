import SoundBlasterManager from '@/src/audio/SoundBlasterManager';
import Commandable from '@/src/commands/Commandable';
import { DiscordRequest } from '@/src/discord_request/base/DiscordRequest';
import { SlashCommandBuilder } from 'discord.js';

export default class Connect implements Commandable {
  public name = 'connect';
  public aliases = ['c', 'connect'];
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

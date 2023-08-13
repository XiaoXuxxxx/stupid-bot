import SoundBlasterManager from '@/src/audio/SoundBlasterManager';
import Commandable from '@/src/commands/Commandable';
import { DiscordRequest } from '@/src/discord_request/base/DiscordRequest';
import DisconnectEmbed from '@/src/embed/DisconnectEmbed';
import { SlashCommandBuilder } from 'discord.js';

export default class Disconnect implements Commandable {
  public name = 'disconnect';
  public aliases = ['d', 'disconnect'];
  public description = '**make bot disconnected from voice channel**';

  public slashCommand: SlashCommandBuilder = new SlashCommandBuilder()
    .setName('disconnect')
    .setDescription('disconnect the bot from the room');

  private soundBlasterManager: SoundBlasterManager;

  public constructor(soundBlasterManager: SoundBlasterManager) {
    this.soundBlasterManager = soundBlasterManager;
  }

  public async execute(request: DiscordRequest, args: string[]): Promise<void> {
    const guildId = request.getSenderGuild()?.id;
    if (!guildId) {
      request.reply('join voice channel first!');
      request.react('👎');
      return;
    }
    this.soundBlasterManager.terminateSoundBlaster(guildId);
    const embed = new DisconnectEmbed();
    request.reply({ embeds: [embed] });
    request.react('👍');
  }
}

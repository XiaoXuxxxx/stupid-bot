import { SlashCommandBuilder } from 'discord.js';

import SoundBlasterManager from '@/src/audio/SoundBlasterManager';
import Commandable from '@/src/commands/Commandable';
import { DiscordRequest } from '@/src/discord_request/base/DiscordRequest';
import CommonEmbed from '@/src/embed/CommonEmbed';

export default class Skip implements Commandable {
  public name = 'skip';
  public aliases = ['s', 'skip'];
  public description = '**skip 1 track**';

  public slashCommand: SlashCommandBuilder = new SlashCommandBuilder()
    .setName('skip')
    .setDescription('skip the current song');

  private soundBlasterManager: SoundBlasterManager;

  public constructor(soundBlasterManager: SoundBlasterManager) {
    this.soundBlasterManager = soundBlasterManager;
  }

  public async execute(request: DiscordRequest, args: string[]): Promise<void> {
    const channel = request.getVoiceChannel();
    const guild = request.getSenderGuild();

    if (!channel || !guild) {
      request.reply('join voice channel first!');
      request.react('👎');
      return;
    }

    const soundBlaster = this.soundBlasterManager.getSoundBlaster(guild.id);

    await soundBlaster.playNextTrack();

    const embed = new CommonEmbed('Skip', 'Skip 1 step', '#FF5000');
    request.reply({ embeds: [embed] });

    request.react('👍');
  }
}

import { SlashCommandBuilder } from 'discord.js';

import SoundBlasterManager from '@/src/audio/SoundBlasterManager';
import Commandable from '@/src/commands/Commandable';
import { DiscordRequest } from '@/src/discord_request/base/DiscordRequest';

export default class Jump implements Commandable {
  public name = 'jump';
  public aliases = ['j', 'jump'];
  public description =
    '**jump to the specific song in the queue**\n *example*\n`{{PREFIX}}jump 5` for jump to the next 5 song\n`{{PREFIX}}jump -5` for jump to the 5 previous song';

  public slashCommand = new SlashCommandBuilder()
    .setName('jump')
    .setDescription('jump to the selected song')
    .addIntegerOption((option) =>
      option
        .setName('position')
        .setDescription('position to jump')
        .setRequired(true),
    );

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

    const index = parseInt(args[0], 10);

    if (isNaN(index)) {
      request.reply('invalid index');
      request.react('👎');
      return;
    }

    const soundBlaster = this.soundBlasterManager.getSoundBlaster(guild.id);

    const isSuccess = await soundBlaster.jumpToTrack(index);

    const message = isSuccess
      ? `jump to the ${index} song`
      : 'index out of bound :(';

    request.reply(message);
    request.react(isSuccess ? '👍' : '👎');
  }
}

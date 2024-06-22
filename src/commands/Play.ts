import { SlashCommandBuilder } from 'discord.js';

import SoundBlasterManager from '@/src/audio/SoundBlasterManager';
import Track from '@/src/audio/Track';
import TrackFactory from '@/src/audio/TrackFactory';
import Commandable from '@/src/commands/Commandable';
import { DiscordRequest } from '@/src/discord_request/base/DiscordRequest';
import { AddSongEmbed } from '@/src/embed/AddSongEmbed';

export default class Play implements Commandable {
  public name = 'play';
  public aliases = ['p', 'play'];
  public description =
    '**play the song by url or search**\n*example*\n`{{PREFIX}}play https://www.youtube.com/watch?v=6TP0abZdRXg`\n`{{PREFIX}}play bonk sound effect`';

  public slashCommand = new SlashCommandBuilder()
    .setName('play')
    .setDescription('play the song')
    .addStringOption((option) =>
      option
        .setName('url_or_search')
        .setDescription('url of video or the name of video')
        .setRequired(true),
    );

  private soundBlasterManager: SoundBlasterManager;
  private trackFactory: TrackFactory;

  public constructor(
    soundBlasterManager: SoundBlasterManager,
    trackFactory: TrackFactory,
  ) {
    this.soundBlasterManager = soundBlasterManager;
    this.trackFactory = trackFactory;
  }

  public async execute(request: DiscordRequest, args: string[]): Promise<void> {
    const channel = request.getVoiceChannel();
    const guild = request.getSenderGuild();

    if (!channel || !guild) {
      request.reply('join voice channel first!');
      request.react('👎');
      return;
    }

    if (args.length === 0) {
      request.reply('please enter the url or search');
      request.react('👎');
      return;
    }

    const soundBlaster = this.soundBlasterManager.getSoundBlaster(guild.id);
    let tracks: Track[] = [];
    try {
      tracks = await this.trackFactory.getTracks(args.join(' '), request);
    } catch (e) {
      console.error(e);
      request.reply((e as any).message ?? 'something went wrong');
      request.react('👎');
      return;
    }

    if (tracks.length === 0) {
      request.reply('cant find anything');
      return;
    }

    request.react('⌛');
    await soundBlaster.joinChannel(channel);
    await soundBlaster.queueAndPlay(...tracks);

    request.react('👍');

    if (tracks.length > 1) {
      request.reply('im a playing playlist now');
      return;
    }

    const trackInfo = await tracks[0].getTrackInfo();
    const trackMessage = tracks[0].getRequest();
    if (trackInfo === undefined) {
      request.reply('trackInfo is undefined i will handle it later');
      return;
    }

    const embed = new AddSongEmbed(trackInfo, trackMessage);

    request.reply({ embeds: [embed] });
  }
}

import SoundBlasterManager from '@/src/audio/SoundBlasterManager';
import Track from '@/src/audio/Track';
import TrackFactory from '@/src/audio/TrackFactory';
import Commandable from '@/src/commands/Commandable';
import { AddSongEmbed } from '@/src/embed/AddSongEmbed';
import { Message } from 'discord.js';

export default class Play implements Commandable {
  public name = 'play';
  public aliases = ['p', 'play'];
  public description =
    '**play the song by url or search**\n*example*\n`{{PREFIX}}play https://www.youtube.com/watch?v=6TP0abZdRXg`\n`{{PREFIX}}play bonk sound effect`';

  private soundBlasterManager: SoundBlasterManager;
  private trackFactory: TrackFactory;

  public constructor(
    soundBlasterManager: SoundBlasterManager,
    trackFactory: TrackFactory
  ) {
    this.soundBlasterManager = soundBlasterManager;
    this.trackFactory = trackFactory;
  }

  public async execute(
    message: Message<boolean>,
    args: string[]
  ): Promise<void> {
    const channel = message.member?.voice.channel;
    const guild = message.guild;

    if (!channel || !guild) {
      message.reply('join voice channel first!');
      message.react('👎');
      return;
    }

    const soundBlaster = this.soundBlasterManager.getSoundBlaster(guild.id);
    let tracks: Track[] = [];
    try {
      tracks = await this.trackFactory.getTracks(args.join(' '), message);
    } catch (e) {
      console.error(e);
      message.reply((e as any).message ?? 'something went wrong');
      message.react('👎');
      return;
    }

    if (tracks.length === 0) {
      message.reply('cant find anything');
      return;
    }

    message.react('⌛');
    await soundBlaster.joinChannel(channel);
    await soundBlaster.playOrQueue(...tracks);

    message.react('👍');

    if (tracks.length > 1) {
      message.reply('im a playing playlist now');
      return;
    }

    const trackInfo = await tracks[0].getTrackInfo();
    const trackMessage = tracks[0].getMessage();
    if (trackInfo === undefined) {
      message.reply('trackInfo is undefined i will handle it later');
      return;
    }

    const embed = new AddSongEmbed(trackInfo, trackMessage);

    message.reply({ embeds: [embed] });
  }
}

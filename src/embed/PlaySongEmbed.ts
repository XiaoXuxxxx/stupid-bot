import { TrackInfo } from '@/src/audio/resource/ResourceLoadable';
import { EmbedBuilder, Message } from 'discord.js';

export class PlaySongEmbed extends EmbedBuilder {
  private readonly trackInfo: TrackInfo;
  private readonly trackMessage: Message;

  public constructor(trackInfo: TrackInfo, trackMessage: Message) {
    super();
    this.trackInfo = trackInfo;
    this.trackMessage = trackMessage;

    this.build();
    return this;
  }

  private build(): void {
    this.setColor('#FFBF00');
    this.setTitle('Now playing...');
    this.setDescription(
      `\`[${this.secondToTime(this.trackInfo.duration)}]\` [${
        this.trackInfo.title
      }](${
        this.trackInfo.url
      })\nrequested by ${this.trackMessage.author.toString()}`
    );
  }

  private secondToTime(second: number): string {
    const minutes = Math.floor(second / 60);
    const seconds = second % 60;

    return `${minutes}:${seconds}`;
  }
}

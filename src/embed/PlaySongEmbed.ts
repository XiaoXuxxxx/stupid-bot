import { TrackInfo } from '@/src/audio/resource/ResourceLoadable';
import { DiscordRequest } from '@/src/discord_request/base/DiscordRequest';
import { EmbedBuilder } from 'discord.js';

export class PlaySongEmbed extends EmbedBuilder {
  private readonly trackInfo: TrackInfo;
  private readonly trackRequest: DiscordRequest;

  public constructor(trackInfo: TrackInfo, trackRequest: DiscordRequest) {
    super();
    this.trackInfo = trackInfo;
    this.trackRequest = trackRequest;

    this.build();
    return this;
  }

  private build(): void {
    this.setColor('#FFBF00');
    this.setTitle('Now playing...');
    this.setDescription(
      `\`[${this.secondToTime(this.trackInfo.duration)}]\`[${
        this.trackInfo.title
      }](${this.trackInfo.url})\nrequested by ${this.trackRequest
        .getAuthor()
        .toString()}`
    );
  }

  private secondToTime(second: number): string {
    const minutes = Math.floor(second / 60);
    const seconds = second % 60;

    return `${minutes}:${seconds}`;
  }
}

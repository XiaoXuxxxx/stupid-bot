import { EmbedBuilder } from 'discord.js';

import { TrackInfo } from '@/src/audio/resource/ResourceLoadable';
import { DiscordRequest } from '@/src/discord_request/base/DiscordRequest';

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
    this.setDescription(this.getEmbedDescription());
  }

  private secondToTime(second: number): string {
    const minutes = Math.floor(second / 60);
    const seconds = second % 60;

    return `${minutes}:${seconds}`;
  }

  private getEmbedDescription(): string {
    const time = this.secondToTime(this.trackInfo.duration);
    const title = this.trackInfo.title;
    const url = this.trackInfo.url;
    const author = this.trackRequest.getAuthor().toString();

    const description = `\`[${time}]\`[${title}](${url})\nrequested by ${author}`;

    return description;
  }
}

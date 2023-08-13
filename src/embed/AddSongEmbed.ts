import { TrackInfo } from '@/src/audio/resource/ResourceLoadable';
import { DiscordRequest } from '@/src/discord_request/base/DiscordRequest';
import { EmbedBuilder } from 'discord.js';

export class AddSongEmbed extends EmbedBuilder {
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
    this.setColor('#0099ff');
    this.setTitle(this.trackInfo.title);
    this.setURL(this.trackInfo.url);
    this.setThumbnail(this.trackInfo.thumbnailUrl);
    this.setAuthor({
      name: this.trackInfo.channelName,
      url: this.trackInfo.channelUrl,
      iconURL: this.trackInfo.channelIconUrl
    });
    this.setFields([
      {
        name: 'Duration',
        value: this.secondToTime(this.trackInfo.duration),
        inline: true
      },
      {
        name: 'Source',
        value: this.trackInfo.source,
        inline: true
      },
      {
        name: 'Requested by',
        value: this.trackRequest.getAuthor().toString(),
        inline: true
      }
    ]);
    this.setFooter({
      text: `Requested date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      iconURL: this.trackRequest.getAuthor().avatarURL() ?? undefined
    });
  }

  private secondToTime(second: number): string {
    const minutes = Math.floor(second / 60);
    const seconds = second % 60;

    return `${minutes}:${seconds}`;
  }
}

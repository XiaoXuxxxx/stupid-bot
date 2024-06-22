import play from 'play-dl';

import Track from '@/src/audio/Track';
import GenericResource from '@/src/audio/resource/GenericResource';
import YoutubeResource from '@/src/audio/resource/YoutubeResource';
import { DiscordRequest } from '@/src/discord_request/base/DiscordRequest';

export default class TrackFactory {
  private readonly ytdlpPath: string;

  public constructor(ytdlpPath: string) {
    this.ytdlpPath = ytdlpPath;
  }
  public async getTracks(
    str: string,
    request: DiscordRequest,
  ): Promise<Track[]> {
    const type = await play.validate(str);

    if (type === 'search') {
      const url = await this.getUrlFromSearch(str);
      return [
        new Track(url, new YoutubeResource(url, this.ytdlpPath), request),
      ];
    }

    if (type === 'yt_video') {
      return [
        new Track(str, new YoutubeResource(str, this.ytdlpPath), request),
      ];
    }

    if (type === 'yt_playlist') {
      const urls = await this.getUrlsFromPlaylist(str);
      return urls.map(
        (url) =>
          new Track(url, new YoutubeResource(url, this.ytdlpPath), request),
      );
    }

    return [new Track(str, new GenericResource(str, this.ytdlpPath), request)];
  }

  private async getUrlFromSearch(str: string): Promise<string> {
    const info = await play.search(str, {
      limit: 1,
      source: {
        youtube: 'video',
      },
    });

    return info[0].url;
  }

  private async getUrlsFromPlaylist(str: string): Promise<string[]> {
    const info = await play.playlist_info(str);

    const urls = (await info.all_videos()).map((v) => v.url);

    return urls;
  }
}

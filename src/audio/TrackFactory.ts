import Track from '@/src/audio/Track';
import YoutubeResource from '@/src/audio/resource/YoutubeResource';
import { DiscordRequest } from '@/src/discord_request/base/DiscordRequest';
import play from 'play-dl';

export default class TrackFactory {
  public async getTracks(
    str: string,
    request: DiscordRequest
  ): Promise<Track[]> {
    const type = await play.validate(str);
    const expectedType = ['yt_video', 'yt_playlist', 'search', 'so_track'];
    if (!type || !expectedType.includes(type)) {
      return [];
    }

    if (type === 'search') {
      const url = await this.getUrlFromSearch(str);
      return [new Track(url, new YoutubeResource(url), request)];
    }

    if (type === 'yt_video') {
      return [new Track(str, new YoutubeResource(str), request)];
    }

    if (type === 'yt_playlist') {
      const urls = await this.getUrlsFromPlaylist(str);
      return urls.map(
        (url) => new Track(url, new YoutubeResource(url), request)
      );
    }

    return [];
  }

  private async getUrlFromSearch(str: string): Promise<string> {
    const info = await play.search(str, {
      limit: 1,
      source: {
        youtube: 'video'
      }
    });

    return info[0].url;
  }

  private async getUrlsFromPlaylist(str: string): Promise<string[]> {
    const info = await play.playlist_info(str);

    const urls = (await info.all_videos()).map((v) => v.url);

    return urls;
  }
}

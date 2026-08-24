import Track from '@/src/audio/Track';
import Ytdlp from '@/src/audio/Ytdlp';
import GenericResource from '@/src/audio/resource/GenericResource';
import YoutubeResource from '@/src/audio/resource/YoutubeResource';
import { DiscordRequest } from '@/src/discord_request/base/DiscordRequest';

type TrackType = 'search' | 'yt_video' | 'yt_playlist' | 'generic';

export default class TrackFactory {
  private readonly ytdlpPath: string;
  private readonly ytdlp: Ytdlp;

  public constructor(ytdlpPath: string) {
    this.ytdlpPath = ytdlpPath;
    this.ytdlp = new Ytdlp(ytdlpPath);
  }
  public async getTracks(
    str: string,
    request: DiscordRequest,
  ): Promise<Track[]> {
    const type = this.getTrackType(str);

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
    return this.ytdlp.search(str);
  }

  private async getUrlsFromPlaylist(str: string): Promise<string[]> {
    return this.ytdlp.playlistUrls(str);
  }

  private getTrackType(str: string): TrackType {
    let url: URL;
    try {
      url = new URL(str);
    } catch {
      return 'search';
    }

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return 'generic';
    }

    const hostname = url.hostname.toLowerCase();
    const isYoutubeHost =
      hostname === 'youtube.com' ||
      hostname.endsWith('.youtube.com') ||
      hostname === 'youtu.be' ||
      hostname === 'youtube-nocookie.com' ||
      hostname.endsWith('.youtube-nocookie.com');

    if (!isYoutubeHost) {
      return 'generic';
    }

    if (hostname === 'youtu.be') {
      return url.pathname.length > 1 ? 'yt_video' : 'generic';
    }

    if (url.searchParams.get('v')) {
      return 'yt_video';
    }

    if (url.searchParams.get('list')) {
      return 'yt_playlist';
    }

    if (/^\/(shorts|embed|live)\//.test(url.pathname)) {
      return 'yt_video';
    }

    return 'generic';
  }
}

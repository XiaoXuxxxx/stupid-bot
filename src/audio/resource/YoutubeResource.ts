import ResourceLoadable, {
  TrackInfo
} from '@/src/audio/resource/ResourceLoadable';
import { AudioResource, createAudioResource } from '@discordjs/voice';
import play from 'play-dl';

export default class YoutubeResource implements ResourceLoadable {
  private readonly rawUrl: string;
  private trackInfo?: TrackInfo;

  public constructor(rawUrl: string) {
    this.rawUrl = rawUrl;
  }

  public async loadTrackInfo(): Promise<void> {
    let video;
    try {
      const { video_details } = await play.video_info(this.rawUrl);
      video = video_details;
    } catch (e) {
      console.error(e);
      return;
    }

    const trackInfo: TrackInfo = {
      title: video.title ?? 'Unknown',
      duration: video.durationInSec,
      url: video.url,
      thumbnailUrl: video.thumbnails[0].url,
      channelIconUrl: video.channel?.iconURL({ size: 128 }),
      channelName: video.channel?.name ?? 'Unknown',
      channelUrl: video.channel?.url,
      source: 'youtube'
    };

    this.trackInfo = trackInfo;
  }

  public async getTrackInfo(): Promise<TrackInfo | undefined> {
    if (this.trackInfo === undefined) {
      await this.loadTrackInfo();
    }

    return this.trackInfo;
  }

  public async getAudioResource(): Promise<AudioResource<null> | undefined> {
    let stream;

    try {
      stream = await play.stream(this.rawUrl);
    } catch (error) {
      console.error(error);
      return;
    }

    if (stream === undefined) {
      return undefined;
    }

    const resource = createAudioResource(stream.stream, {
      inputType: stream.type,
      inlineVolume: true
    });

    return resource;
  }
}

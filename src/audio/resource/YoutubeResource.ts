import { AudioResource, createAudioResource } from '@discordjs/voice';
import { spawn } from 'child_process';
import play, { YouTubeVideo } from 'play-dl';
import { PassThrough } from 'stream';

import ResourceLoadable, {
  TrackInfo,
} from '@/src/audio/resource/ResourceLoadable';

export default class YoutubeResource implements ResourceLoadable {
  private readonly rawUrl: string;
  private readonly ytdlpPath: string;
  private trackInfo?: TrackInfo;

  public constructor(rawUrl: string, ytdlpPath: string) {
    this.rawUrl = rawUrl;
    this.ytdlpPath = ytdlpPath;
  }

  public async loadTrackInfo(): Promise<void> {
    let video: YouTubeVideo | undefined;
    try {
      const { video_details } = await play.video_info(this.rawUrl);
      video = video_details;
    } catch (e) {
      console.error(e);
    }

    const trackInfo: TrackInfo = {
      title: video?.title ?? '<UNKNOWN>',
      duration: video?.durationInSec ?? 0,
      url: video?.url ?? this.rawUrl,
      thumbnailUrl: video?.thumbnails[0].url ?? this.rawUrl,
      channelIconUrl: video?.channel?.iconURL({ size: 128 }),
      channelName: video?.channel?.name ?? 'Unknown',
      channelUrl: video?.channel?.url,
      source: 'youtube',
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
    const passThrough = new PassThrough();

    const resource = createAudioResource(passThrough, {
      inlineVolume: true,
    });

    const process = spawn(this.ytdlpPath, [
      '--quiet',
      '-o',
      '-',
      '-x',
      this.rawUrl,
    ]);

    process.stdout.pipe(passThrough);

    return resource;
  }
}

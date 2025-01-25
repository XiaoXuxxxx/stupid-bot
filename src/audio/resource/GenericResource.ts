import { AudioResource, createAudioResource } from '@discordjs/voice';
import { spawn } from 'child_process';
import { PassThrough } from 'stream';

import ResourceLoadable, {
  TrackInfo,
} from '@/src/audio/resource/ResourceLoadable';

export default class GenericResource implements ResourceLoadable {
  private readonly rawUrl: string;
  private readonly ytdlpPath: string;
  private trackInfo?: TrackInfo;

  public constructor(rawUrl: string, ytdlpPath: string) {
    this.rawUrl = rawUrl;
    this.ytdlpPath = ytdlpPath;
  }
  public async loadTrackInfo(): Promise<void> {
    this.trackInfo = {
      title: this.rawUrl,
      duration: 0,
      url: this.rawUrl,
      thumbnailUrl: this.rawUrl,
      channelIconUrl: this.rawUrl,
      channelName: this.rawUrl,
      channelUrl: this.rawUrl,
      source: 'generic',
    };
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

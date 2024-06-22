import { AudioResource, createAudioResource } from '@discordjs/voice';
import play, { SoundCloud } from 'play-dl';

import ResourceLoadable, {
  TrackInfo,
} from '@/src/audio/resource/ResourceLoadable';

export class SoundCloudResource implements ResourceLoadable {
  private readonly rawUrl: string;
  private soundCloudInfo: SoundCloud;
  private trackInfo?: TrackInfo;

  public constructor(rawUrl: string, soundCloudInfo: SoundCloud) {
    this.rawUrl = rawUrl;
    this.soundCloudInfo = soundCloudInfo;
  }

  public async getAudioResource(): Promise<AudioResource<null> | undefined> {
    const stream = await play.stream(this.rawUrl);
    if (stream === undefined) {
      return undefined;
    }

    const resource = createAudioResource(stream.stream, {
      inputType: stream.type,
      inlineVolume: true,
    });

    return resource;
  }

  private async loadTrackInfo(): Promise<void> {
    const trackInfo: TrackInfo = {
      title: this.soundCloudInfo.name,
      duration: this.soundCloudInfo.durationInSec,
      url: this.soundCloudInfo.url,
      channelName: this.soundCloudInfo.user.name,
      source: 'soundcloud',
      thumbnailUrl: this.soundCloudInfo.user.thumbnail,
      channelIconUrl: this.soundCloudInfo.user.thumbnail,
      channelUrl: this.soundCloudInfo.user.url,
    };

    this.trackInfo = trackInfo;
  }

  public async getTrackInfo(): Promise<TrackInfo | undefined> {
    if (this.trackInfo === undefined) {
      await this.loadTrackInfo();
    }

    return this.trackInfo;
  }
}

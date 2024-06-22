import ResourceLoadable from '@/src/audio/resource/ResourceLoadable';
import { DiscordRequest } from '@/src/discord_request/base/DiscordRequest';

export default class Track {
  private readonly rawUrl: string;
  private readonly resourceLoader: ResourceLoadable;
  private readonly request: DiscordRequest;
  private isFailed = false;

  constructor(
    rawUrl: string,
    resourceLoadable: ResourceLoadable,
    request: DiscordRequest,
  ) {
    this.rawUrl = rawUrl;
    this.resourceLoader = resourceLoadable;
    this.request = request;
  }

  public getRawUrl(): string {
    return this.rawUrl;
  }

  public getRequest(): DiscordRequest {
    return this.request;
  }

  public async getAudioResource() {
    if (this.isFailed) {
      return undefined;
    }

    let resouce;
    try {
      resouce = await this.resourceLoader.getAudioResource();
    } catch (e) {
      console.error(e);
      this.isFailed = true;
      return undefined;
    }

    this.isFailed = resouce === undefined;
    return resouce;
  }

  public async getTrackInfo() {
    if (this.isFailed) {
      return undefined;
    }

    const trackInfo = await this.resourceLoader.getTrackInfo();
    return trackInfo;
  }
}

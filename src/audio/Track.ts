import ResourceLoadable from '@/src/audio/resource/ResourceLoadable';
import { Message } from 'discord.js';

export default class Track {
  private readonly rawUrl: string;
  private readonly resourceLoader: ResourceLoadable;
  private readonly message: Message;
  private isFailed = false;

  constructor(
    rawUrl: string,
    resourceLoadable: ResourceLoadable,
    message: Message
  ) {
    this.rawUrl = rawUrl;
    this.resourceLoader = resourceLoadable;
    this.message = message;
  }

  public getRawUrl(): string {
    return this.rawUrl;
  }

  public getMessage(): Message {
    return this.message;
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

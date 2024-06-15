import ResourceLoadable, {
  TrackInfo,
} from "@/src/audio/resource/ResourceLoadable";
import { AudioResource, createAudioResource } from "@discordjs/voice";
import play, { YouTubeVideo } from "play-dl";
import ytdl from "ytdl-core";

export default class YoutubeResource implements ResourceLoadable {
  private readonly rawUrl: string;
  private trackInfo?: TrackInfo;

  public constructor(rawUrl: string) {
    this.rawUrl = rawUrl;
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
      title: video?.title ?? "<UNKNOWN>",
      duration: video?.durationInSec ?? 0,
      url: video?.url ?? this.rawUrl,
      thumbnailUrl: video?.thumbnails[0].url ?? this.rawUrl,
      channelIconUrl: video?.channel?.iconURL({ size: 128 }),
      channelName: video?.channel?.name ?? "Unknown",
      channelUrl: video?.channel?.url,
      source: "youtube",
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
      stream = ytdl(this.rawUrl, {
        filter: "audioonly",
        liveBuffer: 2000,
        highWaterMark: 1 << 25,
      });
    } catch (error) {
      console.error(error);
      return;
    }

    if (stream === undefined) {
      return undefined;
    }

    const resource = createAudioResource(stream, {
      inlineVolume: true,
    });

    return resource;
  }
}

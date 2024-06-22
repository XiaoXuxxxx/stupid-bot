import { AudioResource } from '@discordjs/voice';

export type TrackInfo = {
  title: string;
  url: string;
  duration: number;
  thumbnailUrl?: string;
  channelName?: string;
  channelUrl?: string;
  channelIconUrl?: string;
  source: 'youtube' | 'soundcloud' | 'generic';
};

export default interface ResourceLoadable {
  getAudioResource(): Promise<AudioResource<null> | undefined>;

  getTrackInfo(): Promise<TrackInfo | undefined>;
}

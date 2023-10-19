import Track from '@/src/audio/Track';

export default class Queue {
  private tracks: Track[] = [];
  private currentTrackIndex = 0;

  public getCurrentTrackIndex(): number {
    return this.currentTrackIndex;
  };

  public getUpcomingTracks(): Track[] {
    return this.tracks.slice(this.currentTrackIndex + 1);
  };

  public getCurrentTrack(): Track | null {
    return this.tracks[this.currentTrackIndex] ?? null;
  };

  public getPreviousTracks(): Track[] {
    return this.tracks.slice(0, this.currentTrackIndex);
  };

  public addTracks(...tracks: Track[]): void {
    this.tracks.push(...tracks);
  };

  public nextTrack(): Track | null {
    if (this.tracks.length === this.currentTrackIndex + 1) {
      return null;
    }

    if (this.tracks.length === 0) {
      return null;
    }

    return this.tracks[++this.currentTrackIndex];
  };

  public previousTrack(): Track | null {
    if (this.currentTrackIndex === 0) {
      return null;
    }

    if (this.tracks.length === 0) {
      return null;
    }

    return this.tracks[--this.currentTrackIndex];
  };

  public jumpToTrack(trackIndex: number): Track | null {
    if (trackIndex < 0 || trackIndex >= this.tracks.length) {
      return null;
    }

    this.currentTrackIndex = trackIndex;

    return this.getCurrentTrack();
  };

  public pruneTracks(tailCount = 0): void {
    if (tailCount > this.getPreviousTracks().length) {
      tailCount = this.getPreviousTracks().length;
    }

    this.tracks = this.tracks.slice(this.currentTrackIndex - tailCount);
    this.currentTrackIndex = tailCount;
  };

  public clearUpcomingTracks(): void {
    this.tracks = this.tracks.slice(0, this.currentTrackIndex + 1);
  };

  public clearAll(): void {
    this.tracks = [];
    this.currentTrackIndex = 0;
  };
}

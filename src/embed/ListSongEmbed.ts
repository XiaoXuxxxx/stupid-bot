import Queue from '@/src/audio/Queue';
import Track from '@/src/audio/Track';
import { EmbedBuilder } from 'discord.js';

export class ListSongEmbed extends EmbedBuilder {
  private readonly queue: Queue;

  public constructor(queue: Queue) {
    super();
    this.queue = queue;
  }

  public async build() {
    const currentTrack = this.queue.getCurrentTrack();
    const previousTracks = this.queue.getPreviousTracks();
    const upcomingTracks = this.queue.getUpcomingTracks();

    this.setColor('#7F00FF');
    this.setTitle('Queue');

    if (!currentTrack) {
      return this;
    }

    const description = await this.getDescription(
      previousTracks,
      currentTrack,
      upcomingTracks
    );

    this.setDescription(description);

    return this;
  }

  private async getDescription(
    previousTracks: Track[],
    currentTrack: Track,
    upcomingTracks: Track[]
  ) {
    let txt = '';
    txt += `previous tracks: ${previousTracks.length}\n`;

    const shownPreviousTracks = previousTracks.slice(
      Math.max(previousTracks.length - 5, 0)
    );
    for (const previousTrack of shownPreviousTracks) {
      const desc = await this.trackToQueueTxt(
        previousTrack,
        previousTracks.indexOf(previousTrack) - previousTracks.length
      );
      txt += desc + '\n';
    }

    txt += '\n';
    txt += await this.trackToQueueTxt(currentTrack, 0);
    txt += '  `now playing`\n';

    txt += '\n';
    txt += `upcoming tracks: ${upcomingTracks.length}\n`;

    const shownUpcomingTracks = upcomingTracks.slice(0, 10);
    for (const upcomingTrack of shownUpcomingTracks) {
      const desc = await this.trackToQueueTxt(
        upcomingTrack,
        upcomingTracks.indexOf(upcomingTrack) + 1
      );
      txt += desc + '\n';
    }

    return txt;
  }

  private async trackToQueueTxt(track: Track, index: number) {
    const trackInfo = await track.getTrackInfo();
    const messagex = track.getRequest();
    const desc = `\`${index}\` \`[${this.secondToTime(
      trackInfo?.duration ?? 0
    )}]\` [${trackInfo?.title.substring(0, 20)}](${
      trackInfo?.url
    }) ${messagex.getAuthor()}`;

    return desc;
  }

  private secondToTime(second: number) {
    // mm:ss
    const min = Math.floor(second / 60);
    const sec = second % 60;

    return `${min}:${sec}`;
  }
}

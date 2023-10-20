import Queue from '@/src/audio/Queue';
import Track from '@/src/audio/Track';
import { EmbedBuilder } from 'discord.js';

export class ListSongEmbed extends EmbedBuilder {
  private readonly queue: Queue<Track>;

  public constructor(queue: Queue<Track>) {
    super();
    this.queue = queue;
  }

  public async build() {
    const currentTrack = this.queue.getCurrentItem();
    const previousTracks = this.queue.getPreviousItems();
    const upcomingTracks = this.queue.getUpcomingItems();

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
    txt = txt.concat(`previous tracks: ${previousTracks.length}\n`);

    const previousShownAmount = Math.max(previousTracks.length - 5, 0)
    const shownPreviousTracks = previousTracks.slice(previousShownAmount);

    for (const previousTrack of shownPreviousTracks) {
      const index = previousTracks.indexOf(previousTrack) - previousTracks.length;
      const desc = await this.trackToQueueText(previousTrack, index);

      txt = txt.concat(desc + '\n');
    }

    txt = txt.concat('\n');
    txt = txt.concat(await this.trackToQueueText(currentTrack, 0));
    txt = txt.concat('  `now playing`\n');

    txt = txt.concat('\n');
    txt = txt.concat(`upcoming tracks: ${upcomingTracks.length}\n`);

    const shownUpcomingTracks = upcomingTracks.slice(0, 10);
    for (const upcomingTrack of shownUpcomingTracks) {
      const index = upcomingTracks.indexOf(upcomingTrack) + 1;
      const desc = await this.trackToQueueText(upcomingTrack, index);

      txt = txt.concat(desc + '\n');
    }

    return txt;
  }

  private async trackToQueueText(track: Track, index: number) {
    const trackInfo = await track.getTrackInfo();

    const time = this.secondToTime(trackInfo?.duration ?? 0)
    const title = trackInfo?.title.substring(0, 20);
    const url = trackInfo?.url;

    const author = track.getRequest().getAuthor();

    const text = `\`${index}\` \`[${time}]\` [${title}](${url}) ${author}`;

    return text;
  }

  private secondToTime(second: number) {
    const min = Math.floor(second / 60);
    const sec = second % 60;

    return `${min}:${sec}`;
  }
}

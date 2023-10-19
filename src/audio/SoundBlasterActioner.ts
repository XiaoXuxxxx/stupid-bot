import SoundBlaster from '@/src/audio/SoundBlaster';
import { PlaySongEmbed } from '@/src/embed/PlaySongEmbed';

export default class SoundBlasterActioner {
  private soundBlaster?: SoundBlaster;

  public async alertPlaying(): Promise<void> {
    const currentTrack = this.soundBlaster?.getQueue().getCurrentItem();

    if (!currentTrack) return;

    const trackInfo = await currentTrack.getTrackInfo();
    const message = currentTrack.getRequest();

    if (!trackInfo || !message) return;

    const embed = new PlaySongEmbed(trackInfo, message);

    currentTrack.getRequest().send({ embeds: [embed] });
  }

  public loadSoundBlaster(soundBlaster: SoundBlaster): SoundBlasterActioner {
    this.soundBlaster = soundBlaster;
    return this;
  }
}

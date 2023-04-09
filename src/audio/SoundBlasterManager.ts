import SoundBlaster from '@/src/audio/SoundBlaster';
import SoundBlasterActioner from '@/src/audio/SoundBlasterActioner';

export default class SoundBlasterManager {
  private readonly soundBlasterByGuildId: Map<string, SoundBlaster> = new Map();

  public getSoundBlaster(guildId: string): SoundBlaster {
    let soundBlaster = this.soundBlasterByGuildId.get(guildId);

    if (!soundBlaster) {
      soundBlaster = new SoundBlaster(guildId, new SoundBlasterActioner());
      this.soundBlasterByGuildId.set(guildId, soundBlaster);
    }

    return soundBlaster;
  }

  public terminateSoundBlaster(guildId: string): void {
    this.soundBlasterByGuildId.get(guildId)?.terminate();
    this.soundBlasterByGuildId.delete(guildId);
  }
}

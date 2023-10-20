import SoundBlaster from '@/src/audio/SoundBlaster';

export default class SoundBlasterManager {
  private readonly timeoutInMS: number;
  private readonly soundBlasterByGuildId: Map<string, SoundBlaster> = new Map();

  public constructor(timeoutInMS: number) {
    this.timeoutInMS = timeoutInMS;
  }

  public getSoundBlaster(guildId: string): SoundBlaster {
    let soundBlaster = this.soundBlasterByGuildId.get(guildId);

    if (!soundBlaster) {
      soundBlaster = new SoundBlaster(
        guildId,
        this.timeoutInMS
      );
      this.soundBlasterByGuildId.set(guildId, soundBlaster);
    }

    return soundBlaster;
  }

  public terminateSoundBlaster(guildId: string): void {
    this.soundBlasterByGuildId.get(guildId)?.terminate();
    this.soundBlasterByGuildId.delete(guildId);
  }
}

import fs from 'fs';
import yaml from 'js-yaml';

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

type Config = RecursivePartial<{
  prefix: string;
  voiceBehavior: {
    timeoutInMS: string;
  };
  ytdlpPath: string;
}>;

export class ConfigContainer {
  public prefix = ';';
  public timeoutInMS: number = 1000 * 60 * 5;
  public ytldlpPath: string = 'yt-dlp';

  public constructor() {
    try {
      const configPath = fs.readFileSync('config.yaml', 'utf-8');
      const config = yaml.load(configPath) as Config;

      const prefix = config.prefix as unknown;
      if (typeof prefix === 'string' && prefix.length === 1) {
        console.log(`[CONFIG] use prefix: ${prefix}`);
        this.prefix = prefix;
      }

      const timeout = config.voiceBehavior?.timeoutInMS;
      if (typeof timeout === 'number') {
        console.log(`[CONFIG] use timeout: ${timeout}`);
        this.timeoutInMS = timeout;
      }

      const ytdlpPath = config.ytdlpPath;
      if (typeof ytdlpPath === 'string') {
        console.log(`[CONFIG] use yt-dlp path: ${ytdlpPath}`);
        this.ytldlpPath = ytdlpPath;
      }
    } catch (e) {
      console.log(e);
      console.log('[CONFIG] no config file, use default config');
    }
  }
}

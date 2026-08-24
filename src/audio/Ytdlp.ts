import { spawn } from 'child_process';

export type YtdlpVideoInfo = {
  title?: string;
  duration?: number | string | null;
  webpage_url?: string;
  original_url?: string;
  thumbnail?: string;
  thumbnails?: Array<{ url?: string }>;
  uploader?: string;
  uploader_url?: string;
  uploader_avatar?: string;
  channel?: string;
  channel_url?: string;
  channel_thumbnail?: string;
};

export default class Ytdlp {
  private readonly ytdlpPath: string;

  public constructor(ytdlpPath: string) {
    this.ytdlpPath = ytdlpPath;
  }

  public async search(query: string): Promise<string> {
    const output = await this.execute([
      '--quiet',
      '--no-warnings',
      '--js-runtimes',
      'bun',
      '--flat-playlist',
      '--print',
      'webpage_url',
      `ytsearch1:${query}`,
    ]);

    const url = this.getUrls(output)[0];
    if (url === undefined) {
      throw new Error(`No search results found for "${query}"`);
    }

    return url;
  }

  public async playlistUrls(url: string): Promise<string[]> {
    const output = await this.execute([
      '--quiet',
      '--no-warnings',
      '--js-runtimes',
      'bun',
      '--flat-playlist',
      '--print',
      'webpage_url',
      url,
    ]);

    return this.getUrls(output);
  }

  public async videoInfo(url: string): Promise<YtdlpVideoInfo> {
    const output = await this.execute([
      '--quiet',
      '--no-warnings',
      '--js-runtimes',
      'bun',
      '--dump-single-json',
      '--no-playlist',
      '--skip-download',
      url,
    ]);

    try {
      return JSON.parse(output.trim()) as YtdlpVideoInfo;
    } catch {
      throw new Error(`yt-dlp returned invalid metadata for ${url}`);
    }
  }

  private getUrls(output: string): string[] {
    return output
      .split('\n')
      .map((line) => line.trim())
      .filter(
        (line) => line.startsWith('http://') || line.startsWith('https://'),
      );
  }

  private execute(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const process = spawn(this.ytdlpPath, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.once('error', reject);
      process.once('close', (code) => {
        if (code === 0) {
          resolve(stdout);
          return;
        }

        const details = stderr.trim();
        reject(
          new Error(
            `yt-dlp exited with code ${code}${details ? `: ${details}` : ''}`,
          ),
        );
      });
    });
  }
}

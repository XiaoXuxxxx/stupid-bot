import {
  AudioResource,
  StreamType,
  createAudioResource,
} from '@discordjs/voice';
import { spawn } from 'child_process';
import { PassThrough } from 'stream';

import ResourceLoadable, {
  TrackInfo,
} from '@/src/audio/resource/ResourceLoadable';

export default class GenericResource implements ResourceLoadable {
  private readonly rawUrl: string;
  private readonly ytdlpPath: string;
  private trackInfo?: TrackInfo;

  public constructor(rawUrl: string, ytdlpPath: string) {
    this.rawUrl = rawUrl;
    this.ytdlpPath = ytdlpPath;
  }
  public async loadTrackInfo(): Promise<void> {
    this.trackInfo = {
      title: this.rawUrl,
      duration: 0,
      url: this.rawUrl,
      thumbnailUrl: this.rawUrl,
      channelIconUrl: this.rawUrl,
      channelName: this.rawUrl,
      channelUrl: this.rawUrl,
      source: 'generic',
    };
  }

  public async getTrackInfo(): Promise<TrackInfo | undefined> {
    if (this.trackInfo === undefined) {
      await this.loadTrackInfo();
    }

    return this.trackInfo;
  }

  public async getAudioResource(): Promise<AudioResource<null> | undefined> {
    const passThrough = new PassThrough();

    // Spawn yt-dlp to fetch best audio
    const ytdlp = spawn(this.ytdlpPath, [
      '--quiet',
      '-o',
      '-',
      '-f',
      'bestaudio',
      this.rawUrl,
    ]);

    const ffmpeg = spawn(
      'ffmpeg',
      [
        '-re',

        '-i',
        'pipe:0',

        '-analyzeduration',
        '0',

        '-loglevel',
        'panic',

        '-af',
        'volume=0.5',

        '-f',
        's16le',

        '-ar',
        '48000',

        '-ac',
        '2',

        'pipe:1',
      ],
      {
        stdio: ['pipe', 'pipe', 'pipe'],
      },
    );

    ytdlp.stdout.pipe(ffmpeg.stdin);

    ffmpeg.stdout.pipe(passThrough);

    ytdlp.stderr?.on('data', (data) => {
      console.error('[yt-dlp stderr]', data.toString());
    });

    ytdlp.on('error', (err) => {
      console.error('[yt-dlp error]', err);
    });

    ytdlp.on('close', (code) => {
      if (code !== 0) {
        console.warn(`[yt-dlp] exited with code ${code}`);
      }
    });

    ffmpeg.on('error', (err) => {
      console.error('[ffmpeg error]', err);
    });

    ffmpeg.on('close', (code) => {
      if (code !== 0) {
        console.warn(`[ffmpeg] exited with code ${code}`);
      }
    });

    const resource = createAudioResource(passThrough, {
      inputType: StreamType.Raw,
      inlineVolume: true,
    });

    return resource;
  }
}

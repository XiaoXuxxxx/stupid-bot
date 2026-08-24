import {
  AudioResource,
  StreamType,
  createAudioResource,
} from '@discordjs/voice';
import { spawn } from 'child_process';
import { PassThrough } from 'stream';

import Ytdlp, { YtdlpVideoInfo } from '@/src/audio/Ytdlp';
import ResourceLoadable, {
  TrackInfo,
} from '@/src/audio/resource/ResourceLoadable';

export default class YoutubeResource implements ResourceLoadable {
  private readonly rawUrl: string;
  private readonly ytdlpPath: string;
  private readonly ytdlp: Ytdlp;
  private trackInfo?: TrackInfo;

  public constructor(rawUrl: string, ytdlpPath: string) {
    this.rawUrl = rawUrl;
    this.ytdlpPath = ytdlpPath;
    this.ytdlp = new Ytdlp(ytdlpPath);
  }

  public async loadTrackInfo(): Promise<void> {
    let video: YtdlpVideoInfo | undefined;
    try {
      video = await this.ytdlp.videoInfo(this.rawUrl);
    } catch (e) {
      console.error(e);
    }

    const trackInfo: TrackInfo = {
      title: video?.title ?? '<UNKNOWN>',
      duration: this.getDuration(video?.duration),
      url: video?.webpage_url ?? video?.original_url ?? this.rawUrl,
      thumbnailUrl:
        video?.thumbnail ??
        video?.thumbnails?.find((t) => t.url)?.url ??
        this.rawUrl,
      channelIconUrl: video?.channel_thumbnail ?? video?.uploader_avatar,
      channelName: video?.channel ?? video?.uploader ?? 'Unknown',
      channelUrl: video?.channel_url ?? video?.uploader_url,
      source: 'youtube',
    };

    this.trackInfo = trackInfo;
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
      '--js-runtimes',
      'bun',
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

  private getDuration(duration: number | string | null | undefined): number {
    if (typeof duration === 'number') {
      return Number.isFinite(duration) ? duration : 0;
    }

    if (typeof duration !== 'string') {
      return 0;
    }

    const parts = duration.split(':').map(Number);
    if (parts.some((part) => !Number.isFinite(part))) {
      return 0;
    }

    return parts.reduce((total, part) => total * 60 + part, 0);
  }
}

import { spawn } from 'child_process';
import { SlashCommandBuilder } from 'discord.js';

import Commandable from '@/src/commands/Commandable';
import { DiscordRequest } from '@/src/discord_request/base/DiscordRequest';

// TODO: refactor
export default class About implements Commandable {
  public name = 'about';
  public aliases = ['about', 'a'];
  public description = 'show bot information and version of dependencies`';
  private readonly ytdlpPath: string;

  private ytdlpVersion: string = 'NOT_FETCH_YET';
  private latestYtdlpVersion: string = 'NOT_FETCH_YET';
  private readonly initUnixDate: number;
  private ytdlpStatusExecuteLastTime: Date = new Date();

  public slashCommand = new SlashCommandBuilder()
    .setName('about')
    .setDescription('about the bot');

  public constructor(ytdlpPath: string) {
    this.ytdlpPath = ytdlpPath;
    this.initUnixDate = Math.floor(new Date().getTime() / 1000);

    this.initialize();
  }

  private async initialize(): Promise<void> {
    this.ytdlpStatusExecuteLastTime = new Date();
    this.ytdlpVersion = await this.getYtdlpVersion(this.ytdlpPath);
    this.latestYtdlpVersion = await this.getLatestReleaseYtdlpVersion();
  }

  public async execute(request: DiscordRequest, args: string[]): Promise<void> {
    if (
      new Date() >
      new Date(this.ytdlpStatusExecuteLastTime.getTime() + 30 * 1000) // cache 30 sec
    ) {
      console.log('renew');
      this.ytdlpStatusExecuteLastTime = new Date();
      this.ytdlpVersion = await this.getYtdlpVersion(this.ytdlpPath);
      this.latestYtdlpVersion = await this.getLatestReleaseYtdlpVersion();
    }

    const messages = [
      `**About this bot** (last check <t:${Math.floor(this.ytdlpStatusExecuteLastTime.getTime() / 1000)}:R>)`,
      `- Instance online since: <t:${this.initUnixDate}:F> (uptime: <t:${this.initUnixDate}:R>)`,
      `- Using yt-dlp version: \`${this.ytdlpVersion}\` (Latest version is \`${this.latestYtdlpVersion}\`)`,
    ];
    request.reply(messages.join('\n'));
  }

  private async getYtdlpVersion(ytdlpPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const proc = spawn(ytdlpPath, ['--version']);

      let version = '';
      proc.stdout.on('data', (data) => {
        version += data.toString();
      });

      proc.on('error', (err) => {
        reject(err);
      });

      proc.on('close', (code) => {
        if (code === 0) {
          resolve(version.trim());
        } else {
          reject(new Error(`Process exited with code ${code}`));
        }
      });
    });
  }

  private async getLatestReleaseYtdlpVersion(): Promise<string> {
    const endpoint =
      'https://raw.githubusercontent.com/yt-dlp/yt-dlp/release/yt_dlp/version.py';

    try {
      const res = await fetch(endpoint);

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
      }

      const text = await res.text();

      const match = text.match(/__version__ = ["'](.+?)["']/);

      if (!match) {
        console.error('Version not found in response');
        return 'CANNOT_FETCH_VERSION';
      }

      return match[1];
    } catch (error) {
      console.error('Error fetching yt-dlp version:', error);
      return 'CANNOT_FETCH_VERSION';
    }
  }
}

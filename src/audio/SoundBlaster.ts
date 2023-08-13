import Queue from '@/src/audio/Queue';
import SoundBlasterActioner from '@/src/audio/SoundBlasterActioner';
import Track from '@/src/audio/Track';
import { DiscordRequest } from '@/src/discord_request/base/DiscordRequest';
import IdleDisconnectEmbed from '@/src/embed/IdleDisconnectEmbed';
import {
  AudioPlayer,
  AudioPlayerStatus,
  VoiceConnection,
  VoiceConnectionStatus,
  createAudioPlayer,
  getVoiceConnection,
  joinVoiceChannel
} from '@discordjs/voice';
import { VoiceBasedChannel } from 'discord.js';

export default class SoundBlaster {
  private audioPlayer: AudioPlayer;
  private readonly guildId: string;
  private readonly soundBlasterActioner: SoundBlasterActioner;
  private queue: Queue;
  private isPlaying = false;
  private nodeTimeout: NodeJS.Timeout | null = null;
  private timeoutInMS: number;
  private lastMessage: DiscordRequest | null = null;

  public constructor(
    guildId: string,
    soundBlasterActioner: SoundBlasterActioner,
    timeoutInMS: number
  ) {
    this.guildId = guildId;
    this.soundBlasterActioner = soundBlasterActioner.loadSoundBlaster(this);
    this.timeoutInMS = timeoutInMS;
    this.queue = new Queue();
    this.audioPlayer = createAudioPlayer();
    this.audioPlayer.on(AudioPlayerStatus.Idle, () => this.onIdle());
    this.countdownToTerminate();
  }

  public getAudioPlayer(): AudioPlayer {
    return this.audioPlayer;
  }

  public getQueue(): Queue {
    return this.queue;
  }

  public async joinChannel(
    voiceChanel: VoiceBasedChannel
  ): Promise<VoiceConnection> {
    const guild = voiceChanel.guild;

    let connection = getVoiceConnection(voiceChanel.guild.id);

    if (
      !connection ||
      connection.state.status === VoiceConnectionStatus.Disconnected
    ) {
      connection = joinVoiceChannel({
        channelId: voiceChanel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator
      });
    }

    return connection;
  }

  public async playOrQueue(...tracks: Track[]) {
    this.queue.addTracks(...tracks);

    if (this.queue.getUpcomingTracks().length === 0) {
      this.playTrack(tracks[0]);
      this.isPlaying = true;
      return;
    }

    if (!this.isPlaying) {
      this.playNextTrack();
    }
  }

  public async playNextTrack() {
    const track = this.queue.nextTrack();
    if (!track) {
      this.audioPlayer.stop();
      this.isPlaying = false;
      return;
    }

    this.playTrack(track);
    this.isPlaying = true;
  }

  public async playTrack(track: Track) {
    this.lastMessage = track.getRequest();
    const resource = await track.getAudioResource();
    if (!resource) {
      this.isPlaying = false;
      return;
    }
    this.audioPlayer.play(resource);
    const voiceConnection = getVoiceConnection(this.guildId);
    if (!voiceConnection) {
      this.isPlaying = false;
      return;
    }
    voiceConnection.subscribe(this.audioPlayer);
    this.soundBlasterActioner.alertPlaying();
    this.isPlaying = true;

    if (this.nodeTimeout) {
      clearTimeout(this.nodeTimeout);
      this.nodeTimeout = null;
    }
  }

  public async jumpToTrack(index: number) {
    const track = this.queue.jumpToTrack(
      this.queue.getCurrentTrackIndex() + index
    );
    if (!track) {
      this.isPlaying = false;
      return;
    }

    this.playTrack(track);
    this.isPlaying = true;
  }

  public async getQueueText(): Promise<string> {
    const previousTracks = this.queue.getPreviousTracks();
    const currentTrack = this.queue.getCurrentTrack();
    const upComingTracks = this.queue.getUpcomingTracks();

    let text = '';

    if (previousTracks.length > 0) {
      text += 'Previous tracks:\n';
      text += previousTracks
        .map(
          (track, index) =>
            `\`${index - previousTracks.length}\` <${track.getRawUrl()}>`
        )
        .join('\n');
      text += '\n\n';
    }

    if (currentTrack) {
      text += `\`0\` <${currentTrack.getRawUrl()}>  \`[⬅ now playing]\`\n\n`;
    }

    if (upComingTracks.length > 0) {
      text += 'Upcoming tracks:\n';
      text += upComingTracks
        .map((track, index) => `\`${index + 1}\` <${track.getRawUrl()}>`)
        .join('\n');
    }

    if (text === '') {
      text = 'Queue is empty';
    }

    return text;
  }

  public terminate() {
    this.queue.clearAll();
    this.audioPlayer.stop(true);
    getVoiceConnection(this.guildId)?.destroy();
    this.isPlaying = false;
  }

  private async onIdle() {
    this.isPlaying = false;
    this.playNextTrack();

    if (
      this.queue.getUpcomingTracks().length === 0 &&
      this.audioPlayer.state.status === AudioPlayerStatus.Idle
    ) {
      this.countdownToTerminate();
    }
  }

  private countdownToTerminate() {
    if (this.nodeTimeout) {
      clearTimeout(this.nodeTimeout);
      this.nodeTimeout = null;
    }

    this.nodeTimeout = setTimeout(
      this.timeoutAction.bind(this),
      this.timeoutInMS
    );
  }

  private timeoutAction() {
    this.terminate();
    const embed = new IdleDisconnectEmbed();
    try {
      this.lastMessage?.send({ embeds: [embed] });
    } catch (error) {
      console.log(error);
    }
  }
}

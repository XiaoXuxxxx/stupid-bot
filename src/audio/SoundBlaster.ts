import Queue from '@/src/audio/Queue';
import Track from '@/src/audio/Track';
import { DiscordRequest } from '@/src/discord_request/base/DiscordRequest';
import IdleDisconnectEmbed from '@/src/embed/IdleDisconnectEmbed';
import { PlaySongEmbed } from '@/src/embed/PlaySongEmbed';
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
  private readonly audioPlayer: AudioPlayer;
  private readonly queue: Queue<Track>;
  private readonly guildId: string;
  private readonly timeoutInMS: number;

  private nodeTimeout: NodeJS.Timeout | null = null;
  private lastMessage: DiscordRequest | null = null;

  public constructor(
    guildId: string,
    timeoutInMS: number
  ) {
    this.audioPlayer = createAudioPlayer();
    this.queue = new Queue();
    this.guildId = guildId;
    this.timeoutInMS = timeoutInMS;

    this.audioPlayer.on(AudioPlayerStatus.Idle, () => this.onIdle());
    this.countdownToTerminate();
  }

  public getAudioPlayer(): AudioPlayer {
    return this.audioPlayer;
  }

  public getQueue(): Queue<Track> {
    return this.queue;
  }

  public async joinChannel(
    voiceChanel: VoiceBasedChannel
  ): Promise<VoiceConnection> {
    let connection = getVoiceConnection(voiceChanel.guild.id);

    if (
      !connection ||
      connection.state.status === VoiceConnectionStatus.Disconnected
    ) {
      connection = joinVoiceChannel({
        channelId: voiceChanel.id,
        guildId: voiceChanel.guild.id,
        adapterCreator: voiceChanel.guild.voiceAdapterCreator
      });

      connection.on(VoiceConnectionStatus.Disconnected, () => {
        this.terminate();
      });
    }

    return connection;
  }

  public async queueAndPlay(...tracks: Track[]) {
    this.queue.addItems(...tracks);

    if (this.queue.getUpcomingItems().length === 0) {
      this.playTrack(tracks[0]);
      return;
    }

    if (this.audioPlayer.state.status === AudioPlayerStatus.Idle) {
      this.playNextTrack();
      return;
    }
  }

  public async playNextTrack() {
    const track = this.queue.nextItem();
    if (!track) {
      this.audioPlayer.stop();
      return;
    }

    this.playTrack(track);
  }

  public async jumpToTrack(index: number) {
    const track = this.queue.jumpToItem(
      this.queue.getCurrentIndex() + index
    );

    if (!track) {
      this.audioPlayer.stop();
      return;
    }

    this.playTrack(track);
  }

  public terminate() {
    this.queue.clearAll();

    this.audioPlayer.stop();

    if (this.nodeTimeout) {
      clearTimeout(this.nodeTimeout);
      this.nodeTimeout = null;
    }

    getVoiceConnection(this.guildId)?.destroy();
  }

  private async playTrack(track: Track) {
    this.lastMessage = track.getRequest();

    const resource = await track.getAudioResource();
    if (!resource) {
      this.audioPlayer.stop();
      return;
    }

    this.audioPlayer.play(resource);

    const voiceConnection = getVoiceConnection(this.guildId);
    if (!voiceConnection) {
      return;
    }

    voiceConnection.subscribe(this.audioPlayer);
    this.alertPlaying();

    if (this.nodeTimeout) {
      clearTimeout(this.nodeTimeout);
      this.nodeTimeout = null;
    }
  }

  private async onIdle() {
    this.audioPlayer.stop();
    this.playNextTrack();

    if (
      this.queue.getUpcomingItems().length === 0 &&
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

    try {
      const embed = new IdleDisconnectEmbed();
      this.lastMessage?.send({ embeds: [embed] });
    } catch (error) {
      console.log(error);
    }
  }

  private async alertPlaying(): Promise<void> {
    const currentTrack = this.getQueue().getCurrentItem();

    if (!currentTrack) return;

    const trackInfo = await currentTrack.getTrackInfo();
    const message = currentTrack.getRequest();

    if (!trackInfo || !message) return;

    const embed = new PlaySongEmbed(trackInfo, message);

    currentTrack.getRequest().send({ embeds: [embed] });
  }
}

import SoundBlasterManager from '@/src/audio/SoundBlasterManager';
import TrackFactory from '@/src/audio/TrackFactory';
import Commandable from '@/src/commands/Commandable';
import Connect from '@/src/commands/Connect';
import Disconnect from '@/src/commands/Disconnect';
import Help from '@/src/commands/Help';
import Jump from '@/src/commands/Jump';
import Ping from '@/src/commands/Ping';
import Play from '@/src/commands/Play';
import Queue from '@/src/commands/Queue';
import Skip from '@/src/commands/Skip';
import {
  ActivityType,
  Awaitable,
  Client,
  Events,
  GatewayIntentBits,
  Message
} from 'discord.js';

export default class StupidBot {
  private readonly token: string;
  private readonly client: Client;
  private readonly commandByAlias: Map<string, Commandable> = new Map();
  private readonly prefix = ';';

  public constructor(token: string) {
    this.token = token;
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions
      ]
    });

    const soundBlasterManager = new SoundBlasterManager();
    const trackFactory = new TrackFactory();

    this.bindEvent(Events.ClientReady, this.onReady);
    this.bindEvent(Events.MessageCreate, this.onMessageCreate);

    this.bindCommands([
      new Ping(),
      new Play(soundBlasterManager, trackFactory),
      new Connect(soundBlasterManager),
      new Disconnect(soundBlasterManager),
      new Skip(soundBlasterManager),
      new Queue(soundBlasterManager),
      new Jump(soundBlasterManager)
    ]);

    const help = new Help(this.commandByAlias, this.prefix);
    this.bindCommands([help]);

    this.start();
  }

  public bindEvent = (
    event: string,
    listener: (...args: any[]) => Awaitable<void>
  ): void => {
    this.client.on(event, listener);
  };

  public bindCommands = (commands: Commandable[]) => {
    commands.forEach((command) => {
      command.aliases.forEach((alias) => {
        this.commandByAlias.set(alias, command);
      });
    });
  };

  public start = (): void => {
    this.client.login(this.token);
  };

  private onReady = (client: Client): void => {
    console.log('wake up again');
    client.user?.setActivity(';help', {
      type: ActivityType.Streaming,
      name: 'with my self',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    });
  };

  private onMessageCreate = async (message: Message) => {
    const prefix = this.prefix;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift()?.toLowerCase();
    if (!command) return;

    const commandable = this.commandByAlias.get(command);
    if (!commandable) return;

    await commandable.execute(message, args);
  };
}

// again

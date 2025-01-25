import {
  ActivityType,
  Awaitable,
  Client,
  Events,
  GatewayIntentBits,
  Interaction,
  Message,
  Routes,
} from 'discord.js';
import dotenv from 'dotenv';

import { ConfigContainer } from '@/src/ConfigContainer';
import SoundBlasterManager from '@/src/audio/SoundBlasterManager';
import TrackFactory from '@/src/audio/TrackFactory';
import About from '@/src/commands/About';
import Clear from '@/src/commands/Clear';
import ClearAll from '@/src/commands/ClearAll';
import Commandable from '@/src/commands/Commandable';
import Connect from '@/src/commands/Connect';
import Disconnect from '@/src/commands/Disconnect';
import Help from '@/src/commands/Help';
import Jump from '@/src/commands/Jump';
import Ping from '@/src/commands/Ping';
import Play from '@/src/commands/Play';
import Prune from '@/src/commands/Prune';
import Queue from '@/src/commands/Queue';
import Remove from '@/src/commands/Remove';
import Skip from '@/src/commands/Skip';
import { InteractionDiscordRequest } from '@/src/discord_request/InteractionDiscordRequest';
import { MessageDiscordRequest } from '@/src/discord_request/MessageDiscordRequest';

dotenv.config();
export default class StupidBot {
  private readonly token: string;
  private readonly client: Client;
  private readonly commandByAlias: Map<string, Commandable> = new Map();
  private readonly commandByName: Map<string, Commandable> = new Map();
  private readonly config: ConfigContainer;

  public constructor(token: string, config: ConfigContainer) {
    this.config = config;
    this.token = token;
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
      ],
    });

    const soundBlasterManager = new SoundBlasterManager(
      this.config.timeoutInMS,
    );
    const trackFactory = new TrackFactory(this.config.ytldlpPath);

    this.bindEvent(Events.ClientReady, this.onReady.bind(this));
    this.bindEvent(
      Events.InteractionCreate,
      this.onInteractionCreate.bind(this),
    );
    this.bindEvent(Events.MessageCreate, this.onMessageCreate.bind(this));

    this.bindCommands([
      new Ping(),
      new About(config.ytldlpPath),
      new Play(soundBlasterManager, trackFactory),
      new Connect(soundBlasterManager),
      new Disconnect(soundBlasterManager),
      new Skip(soundBlasterManager),
      new Queue(soundBlasterManager),
      new Jump(soundBlasterManager),
      new Clear(soundBlasterManager),
      new ClearAll(soundBlasterManager),
      new Prune(soundBlasterManager),
      new Remove(soundBlasterManager),
    ]);

    const help = new Help(this.commandByAlias, this.config.prefix);
    this.bindCommands([help]);

    this.start();
  }

  public bindEvent(
    event: string,
    listener: (...args: any[]) => Awaitable<void>,
  ): void {
    this.client.on(event, listener);
  }

  public bindCommands(commands: Commandable[]) {
    commands.forEach((command) => {
      command.aliases.forEach((alias) => {
        this.commandByAlias.set(alias, command);
      });
      this.commandByName.set(command.name, command);
    });
  }

  public async registerCommands() {
    const clientId = this.client.user?.id;
    const devGuildId = process.env.DEV_GUILD_ID;

    if (devGuildId === undefined) {
      console.log('registering global command');
    } else {
      console.log(`registering dev command guildId: ${devGuildId}`);
    }

    if (clientId === undefined) {
      console.log('cannot register command');
      return;
    }

    const commands = Array.from(this.commandByName.values()).map((e) =>
      e.slashCommand.toJSON(),
    );

    const route =
      devGuildId !== undefined
        ? Routes.applicationGuildCommands(clientId, devGuildId)
        : Routes.applicationCommands(clientId);

    await this.client.rest.put(route, { body: commands });

    console.log('done register commands');
  }

  public async start(): Promise<void> {
    await this.client.login(this.token);
    await this.registerCommands();
  }

  private onReady(client: Client): void {
    console.log('wake up again');
    client.user?.setActivity(`${this.config.prefix}help or /help`, {
      type: ActivityType.Streaming,
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    });
  }

  private async onMessageCreate(message: Message) {
    const prefix = this.config.prefix;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift()?.toLowerCase();
    if (!command) return;

    const commandable = this.commandByAlias.get(command);
    if (!commandable) return;

    await commandable.execute(new MessageDiscordRequest(message), args);
  }

  private async onInteractionCreate(interaction: Interaction) {
    if (!interaction.isCommand()) {
      return;
    }

    const commandable = this.commandByName.get(interaction.commandName);
    if (commandable === undefined) {
      return;
    }

    await interaction.deferReply();
    const args = interaction.options.data.map((e) => e.value);
    await commandable.execute(
      new InteractionDiscordRequest(interaction),
      args as string[],
    );
  }
}

import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import Commandable from '@/src/commands/Commandable';
import { DiscordRequest } from '@/src/discord_request/base/DiscordRequest';

export default class Help implements Commandable {
  public name = 'help';
  public aliases = ['help', 'h'];
  public description = 'list the command';

  public slashCommand: SlashCommandBuilder = new SlashCommandBuilder()
    .setName('help')
    .setDescription('list the command');

  private readonly embed: EmbedBuilder;
  private readonly prefix: string;

  private readonly commandMap: Map<string, Commandable>;

  public constructor(commandMap: Map<string, Commandable>, prefix: string) {
    this.commandMap = commandMap;
    this.prefix = prefix;

    const header = 'just type the `/` and the autocomplete will show up\n';
    const header2 =
      'if you are not familiar with slash command the below command can be used too!!!\n\n';

    const stringsByCommandAble = Array.from(this.commandMap.values()).map(
      (command) => {
        return {
          name: command.name,
          aliases: command.aliases,
          description: command.description,
        };
      },
    );

    const uniqueStringsByCommandAble = stringsByCommandAble.filter(
      (command, index, self) => {
        return (
          index ===
          self.findIndex((t) => {
            return t.name === command.name;
          })
        );
      },
    );

    const astringsByCommandAble = uniqueStringsByCommandAble.map((command) => {
      return `[\`${this.prefix}${command.aliases.join(
        `\`][\`${this.prefix}`,
      )}\`]\n${command.description}`;
    });

    const final =
      header +
      header2 +
      astringsByCommandAble.join('\n\n').replaceAll('{{PREFIX}}', this.prefix);

    const embed = new EmbedBuilder().setDescription(final).setTitle('HELP');

    this.embed = embed;
  }

  public getEmbed(): EmbedBuilder {
    return this.embed;
  }

  public async execute(request: DiscordRequest, args: string[]): Promise<void> {
    request.reply({ embeds: [this.embed] });
  }
}

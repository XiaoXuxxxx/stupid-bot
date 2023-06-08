import Commandable from '@/src/commands/Commandable';
import { EmbedBuilder, Message } from 'discord.js';

export default class Help implements Commandable {
  public name = 'help';
  public aliases = ['help', 'h'];
  public description = 'list the command';

  private readonly embed: EmbedBuilder;
  private readonly prefix: string;

  private readonly commandMap: Map<string, Commandable>;

  public constructor(commandMap: Map<string, Commandable>, prefix: string) {
    this.commandMap = commandMap;
    this.prefix = prefix;

    const stringsByCommandAble = Array.from(this.commandMap.values()).map(
      (command) => {
        return {
          name: command.name,
          aliases: command.aliases,
          description: command.description
        };
      }
    );

    const uniqueStringsByCommandAble = stringsByCommandAble.filter(
      (command, index, self) => {
        return (
          index ===
          self.findIndex((t) => {
            return t.name === command.name;
          })
        );
      }
    );

    const astringsByCommandAble = uniqueStringsByCommandAble.map((command) => {
      return `[\`${this.prefix}${command.aliases.join(
        `\`][\`${this.prefix}`
      )}\`]\n${command.description}`;
    });

    const final = astringsByCommandAble
      .join('\n\n')
      .replace('{{PREFIX}}', this.prefix);

    const embed = new EmbedBuilder().setDescription(final).setTitle('HELP');

    this.embed = embed;
  }

  public getEmbed(): EmbedBuilder {
    return this.embed;
  }

  public async execute(
    message: Message<boolean>,
    args: string[]
  ): Promise<void> {
    message.reply({ embeds: [this.embed] });
  }
}

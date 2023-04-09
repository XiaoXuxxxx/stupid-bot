import { EmbedBuilder } from 'discord.js';

export default class DisconnectEmbed extends EmbedBuilder {
  public constructor() {
    super();
    this.setColor('#FF0000');
    this.setTitle('Disconnected');
    this.setDescription('Disconnected from the voice channel. see u later!');
  }
}

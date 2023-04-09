import { ColorResolvable, EmbedBuilder } from 'discord.js';

export default class CommonEmbed extends EmbedBuilder {
  public constructor(title: string, message: string, color: ColorResolvable) {
    super();
    this.setColor(color);
    this.setTitle(title === '' ? null : title);
    this.setDescription(message === '' ? null : message);

    return this;
  }
}

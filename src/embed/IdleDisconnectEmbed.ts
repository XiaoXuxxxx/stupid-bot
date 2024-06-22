import { EmbedBuilder } from 'discord.js';

export default class IdleDisconnectEmbed extends EmbedBuilder {
  public constructor() {
    super();
    this.setColor('#FF0000');
    this.setTitle('Disconnected');
    this.setDescription(
      "I'm idle for amount of time, so I disconnect from the voice channel to sleep. see u later! Zzz...",
    );
  }
}

import SoundBlasterManager from '@/src/audio/SoundBlasterManager';
import Commandable from '@/src/commands/Commandable';
import { DiscordRequest } from '@/src/discord_request/base/DiscordRequest';
import { SlashCommandBuilder } from 'discord.js';

export default class Remove implements Commandable {
    public name: string = 'remove';
    public aliases: string[] = ['rm'];
    public description: string = 'Remove a song from the queue';
    public slashCommand = new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a song from the queue')
        .addIntegerOption((option) =>
            option
                .setName('from-position')
                .setDescription('position to remove')
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option
                .setName('to-position')
                .setDescription('position to remove')
                .setRequired(false)
        );



    private soundBlasterManager: SoundBlasterManager;

    public constructor(soundBlasterManager: SoundBlasterManager) {
        this.soundBlasterManager = soundBlasterManager;
    }

    public async execute(request: DiscordRequest, args: string[]): Promise<void> {
        const channel = request.getVoiceChannel();
        const guild = request.getSenderGuild();
        if (!channel || !guild) {
            request.reply('join voice channel first!');
            request.react('👎');
            return;
        }

        const from = parseInt(args[0], 10);
        const to = args[1] !== undefined ? parseInt(args[1], 10) : from;

        if (Math.sign(from) !== Math.sign(to)) {
            request.reply('position number must have the same sign');
            return;
        }

        const amount = Math.abs(to - from) + 1;

        const soundBlaster = this.soundBlasterManager.getSoundBlaster(guild.id);

        const infectedAmount = await soundBlaster.removeTracks(Math.min(from, to), amount);

        request.reply(
            infectedAmount > 0
                ? `Removed ${infectedAmount} songs`
                : 'index out of bound :('
        );
    }

}

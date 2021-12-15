const play = require('play-dl')
const { Client, Intents } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');

require('dotenv').config();

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS
  ]
});

const PREFIX = ';'

///////////////////////////////////////////////////////////////////////////////////////

const getVoiceChannel = (message) => {
  const guild = client.guilds.cache.get(message.guildId);
  const member = guild.members.cache.get(message.author.id);
  return member.voice.channel;
}

const createConnection = (channel) => {
  return joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });
}

const playNextQueue = async (connectionInfo) => {
  const currentSong = connectionInfo?.queue[0];

  if (!currentSong) {
    console.log('end of queue');
    connectionInfo?.player.stop();
    return;
  }


  console.log('======================');
  console.log('playing', currentSong);
  connectionInfo.queue.shift();
  console.log(connectionInfo?.queue);
  console.log('======================');





  try {
    var resource = await play.stream(currentSong)
  } catch (error) {
    playNextQueue(connectionInfo);
    return;
  }

  connectionInfo.player.play(createAudioResource(resource.stream));
  connectionInfo.connection.subscribe(connectionInfo.player);
}

const embedQueue = (connectionInfo, channelId) => {

  let message = connectionInfo && (connectionInfo?.queue.length != 0) ? connectionInfo.queue.join("\r\n") : '-------END------';
  client.channels.cache.get(channelId).send('```up next' + '\r\n' + message + '```');


}

const addSongToQueue = (connectionInfo, link) => {
  console.log('push the song to list')
  connectionInfo.queue.push(link);
}


///////////////////////////////////////////////////////////////////////////////////////

// key: guildId
// value: {
//   connection
//   player
//   queue[]
// }

///////////////////////////////////////////////////////////////////////////////////////

const connectionInfoByChannelId = new Map();

client.once('ready', () => {
  console.log('wake up again huh');
  client.user.setActivity("type ;help", { type: 'WATCHING' })

});

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith(PREFIX) || message.author.bot) return;

  const channel = getVoiceChannel(message);
  if (!channel) {
    message.reply({
      embeds: [
        {
          color: 10038562,
          title: 'Please Join voice channel first!!!',
        }
      ]
    });
    return;
  }



  let connectionInfo = connectionInfoByChannelId.get(message.guildId);

  if (message.content === ';d') {
    const connection = getVoiceConnection(message.guildId);
    connection && (connection.destroy() || message.react('👋'));

  } else if (message.content.startsWith(';p')) {
    let argument = message.content.slice(2).trim();

    if (!argument) {
      message.react('❌');
      message.reply(`try \`;p https://www.youtube.com/watch?v=-QuVe-hjMs0\` or \`;p le frestin\``);
      return;
    }


    let argumentType = play.yt_validate(argument);
    let url;

    if (argumentType == 'video') {
      url = argument

      try {
        var videoInfo = await play.video_info(url)
      } catch (error) {
        message.react('❌');
        message.reply({
          embeds: [
            {
              color: 10038562,
              title: 'something went wrong!!!!',
            }
          ]
        });
        return;
      }
















      message.reply({
        embeds: [
          {
            color: 15844367,
            title: videoInfo.video_details.title,
            url: videoInfo.video_details.url,
            description: `request by <@${message.author.id}>`,
            author: {
              name: videoInfo.video_details.channel.name,
              url: videoInfo.video_details.channel.url,
              // icon_url: videoInfo.video_details.channel.icon.url
            },
            thumbnail: {
              url: videoInfo.video_details.thumbnail.url
            },
            timestamp: new Date(),
            footer: {
              text: `duration: ${videoInfo.video_details.durationRaw}`
            }
          }
        ]
      });

    } else if (!argumentType) {
      const searchInfo = await play.search(argument, { limit: 1 })
      if (searchInfo.length == 0) { // why? : I don't know
        message.react('❌');
        message.reply({
          embeds: [
            {
              color: 10038562,
              title: 'query not found!!!',
            }
          ]
        });
        return;
      }

      url = searchInfo[0]?.url
      message.reply({
        embeds: [
          {
            color: 15844367,
            title: searchInfo[0].title,
            url: searchInfo[0].url,
            description: `request by <@${message.author.id}>`,
            author: {
              name: searchInfo[0].channel.name,
              url: searchInfo[0].channel.url,
              icon_url: searchInfo[0].channel.icon.url
            },
            thumbnail: {
              url: searchInfo[0].thumbnail.url
            },
            timestamp: new Date(),
            footer: {
              text: `duration: ${searchInfo[0].durationRaw}`
            }
          }
        ]
      });
    } else {
      message.react('❌');
      message.reply({
        embeds: [
          {
            color: 10038562,
            title: 'not supported playlist (soon!!!)',
          }
        ]
      });
      return;
    }
    message.react('👌');

    if (!connectionInfo) {
      ///////////////////////////////////////////////
      console.log('create new connectionInfo')

      const connection = createConnection(channel);
      const player = createAudioPlayer();
      connectionInfoByChannelId.set(message.guildId, { connection: connection, player: player, queue: [] })

      connectionInfo = connectionInfoByChannelId.get(message.guildId);
      addSongToQueue(connectionInfo, url);
      playNextQueue(connectionInfo);

      connectionInfo.player.on(AudioPlayerStatus.Idle, async () => {
        playNextQueue(connectionInfo);
      });
      ///////////////////////////////////////////////

    } else {
      addSongToQueue(connectionInfo, url);

      if (connectionInfo.connection._state.status == 'disconnected') {
        connectionInfo.connection.destroy()

        // const channel = getVoiceChannel(message);
        const connection = createConnection(channel);
        const player = createAudioPlayer();
        connectionInfoByChannelId.set(message.guildId, { connection: connection, player: player, queue: connectionInfo.queue })

        connectionInfo = connectionInfoByChannelId.get(message.guildId);
        playNextQueue(connectionInfo);
      } else if (connectionInfo.connection._state.status == 'destroyed') {
        ///////////////////////////////////////////////
        console.log('create new connectionInfo')
        const connection = createConnection(channel);
        const player = createAudioPlayer();
        connectionInfoByChannelId.set(message.guildId, { connection: connection, player: player, queue: [] })

        connectionInfo = connectionInfoByChannelId.get(message.guildId);
        addSongToQueue(connectionInfo, url);
        playNextQueue(connectionInfo);

        connectionInfo.player.on(AudioPlayerStatus.Idle, async () => {
          playNextQueue(connectionInfo);
        });
        ///////////////////////////////////////////////

      } else if (connectionInfo.player._state.status == 'idle') {
        playNextQueue(connectionInfo);
      }
    }
  } else if (message.content == ';s') {
    playNextQueue(connectionInfo);
    message.react('⏭️');
  } else if (message.content == ';c') {
    if (connectionInfo) {
      message.react('🗑️');
      connectionInfo.queue = [];
    }
  } else if (message.content == ';q') {
    message.react('👌');
    embedQueue(connectionInfo, message.channelId)
  } else if (message.content == ';help' || message.content.startsWith(';')) {
    message.react('👌');
    message.reply({
      embeds: [
        {
          color: 15277667,
          title: 'Command Lists',
          fields: [
            {
              name: '`;p <song>`',
              value: '*[P]*lay',
            },
            {
              name: '`;s`',
              value: '*[S]*kip',
            },
            {
              name: '`;q`',
              value: 'view *[Q]*ueue',
            },
            {
              name: '`;c`',
              value: '*[C]*lear all queue',
            },
            {
              name: '`;d`',
              value: '*[D]*isconnect',
            },
            {
              name: '`;help`',
              value: 'you are watching it',
            },


          ],
        }
      ]
    });
  }
});

client.login(process.env.TOKEN);

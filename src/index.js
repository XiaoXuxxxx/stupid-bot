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

const PREFIX = '!'

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
    connectionInfo?.player.stop();
    return;
  }


  connectionInfo.queue.shift();


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

  // if message is too long, then ...
  if (message.length > 2000) {
    message = message.slice(0, 1980);
    message += '...';
  }

  client.channels.cache.get(channelId).send('```up next' + '\r\n' + message + '```');


}

const addSongToQueue = (connectionInfo, link) => {
  connectionInfo.queue.push(link);
}

const addPlayelistToQueue = (connectionInfo, links) => {
  connectionInfo.queue.push(...links);
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
const cookieByChannelId = new Map();

client.once('ready', () => {
  console.log('wake up again huh');
  client.user.setActivity(`type ${PREFIX}help`, { type: 'WATCHING' })

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

  if (message.content === `${PREFIX}d`) {
    const connection = getVoiceConnection(message.guildId);
    connection && (connection.destroy() || message.react('👋'));

  } else if (message.content.startsWith(`${PREFIX}p`)) {
    let argument = message.content.slice(2).trim();

    if (!argument) {
      message.react('❌');
      message.reply(`try \`;p https://www.youtube.com/watch?v=-QuVe-hjMs0\` or \`;p le frestin\``);
      return;
    }


    let argumentType = play.yt_validate(argument);
    let url;
    let urls;

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
              description: error.message,
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
    } else if (argumentType == 'playlist') {
      const playlistInfo = await  play.playlist_info(argument)
      urls = playlistInfo.fetched_videos.get('1').map((video) => video.url)
      const plalyListDurationInsec = playlistInfo.fetched_videos.get('1').reduce((acc, video) => acc + video.durationInSec, 0)
      const plalyListDuration = Math.floor(plalyListDurationInsec / 60) + ':' + (plalyListDurationInsec % 60).toString().padStart(2, '0')
      message.reply({
        embeds: [
          {
            color: 15844367,
            title: playlistInfo.title,
            url: playlistInfo.url,
            description: `request by <@${message.author.id}>`,
            author: {
              name: playlistInfo.channel.name,
              url: playlistInfo.channel.url,
              icon_url: playlistInfo.channel?.icon
            },
            thumbnail: {
              url: playlistInfo.thumbnail
            },
            timestamp: new Date(),
            "fields": [
              {
                "name": "Playlist added!!!",
                "value": `type ${PREFIX}q to see the queue`,
                "inline": true
              },
            ],
            footer: {
              text: `duration: ${plalyListDuration} | count: ${urls.length}`
            }
          }
        ]
      });

    }
    message.react('👌');

    if (!connectionInfo) {
      ///////////////////////////////////////////////

      const connection = createConnection(channel);
      const player = createAudioPlayer();
      connectionInfoByChannelId.set(message.guildId, { connection: connection, player: player, queue: [] })

      connectionInfo = connectionInfoByChannelId.get(message.guildId);
      if (argumentType == 'playlist') {
        addPlayelistToQueue(connectionInfo, urls)
      } else {
        addSongToQueue(connectionInfo, url);
      }
      
      playNextQueue(connectionInfo);

      connectionInfo.player.on(AudioPlayerStatus.Idle, async () => {
        playNextQueue(connectionInfo);
      });
      ///////////////////////////////////////////////

    } else {
      if (argumentType == 'playlist') {
        addPlayelistToQueue(connectionInfo, urls)
      } else {
        addSongToQueue(connectionInfo, url);
      }

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
        const connection = createConnection(channel);
        const player = createAudioPlayer();
        connectionInfoByChannelId.set(message.guildId, { connection: connection, player: player, queue: [] })

        connectionInfo = connectionInfoByChannelId.get(message.guildId);
        if (argumentType == 'playlist') {
          addPlayelistToQueue(connectionInfo, urls)
        } else {
          addSongToQueue(connectionInfo, url);
        }
        playNextQueue(connectionInfo);

        connectionInfo.player.on(AudioPlayerStatus.Idle, async () => {
          playNextQueue(connectionInfo);
        });
        ///////////////////////////////////////////////

      } else if (connectionInfo.player._state.status == 'idle') {
        playNextQueue(connectionInfo);
      }
    }
  } else if (message.content == `${PREFIX}s`) {
    playNextQueue(connectionInfo);
    message.react('⏭️');
  } else if (message.content == `${PREFIX}c`) {
    if (connectionInfo) {
      message.react('🗑️');
      connectionInfo.queue = [];
    }
  } else if (message.content == `${PREFIX}q`) {
    message.react('👌');
    embedQueue(connectionInfo, message.channelId)
  } else if (message.content == `${PREFIX}help` || message.content.startsWith(`${PREFIX}`)) {
    message.react('👌');
    message.reply({
      embeds: [
        {
          color: 15277667,
          title: 'Command Lists',
          fields: [
            {
              name: `\`${PREFIX}p song\``,
              value: '*[P]*lay',
            },
            {
              name: `\`${PREFIX}s\``,
              value: '*[S]*kip',
            },
            {
              name: `\`${PREFIX}q\``,
              value: 'view *[Q]*ueue',
            },
            {
              name: `\`${PREFIX}c\``,
              value: '*[C]*lear all queue',
            },
            {
              name: `\`${PREFIX}d\``,
              value: '*[D]*isconnect',
            },
            {
              name: `\`${PREFIX}help\``,
              value: 'you are watching it',
            },


          ],
        }
      ]
    });
  }
});

client.login(process.env.TOKEN);

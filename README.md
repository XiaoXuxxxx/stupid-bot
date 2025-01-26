# stupid-bot

The poorly written music discord bot

## Requirement

The token of your discord bot that has the guild message permission and voice guild permission

## How to run

pass the env `TOKEN` to the container. for example, pass by the env file by creating `.env` file and the content is

```sh
TOKEN=your-discord-bot-token
```

then create config file name `config.yaml` and the content is

```yaml
prefix: ';'
voiceBehavior:
  timeoutInMS: 300000
```

then create docker compose file name `docker-compose-yaml` and the content is

```yaml
services:
  stupid-bot:
    image: ghcr.io/xiaoxuxxxx/stupid-bot
    container_name: stupid-bot
    volumes:
      - ./config.yaml:/app/config.yaml:ro
    env_file:
      - .env
    restart: unless-stopped
```

and then run

```sh
docker compose up -d
```

and your bot should work now

## How to update [yt-dlp](https://github.com/yt-dlp/yt-dlp)

If your bot isn't working, it might be because your yt-dlp is [outdated](https://github.com/yt-dlp/yt-dlp/releases). To update it, simply run:

```
docker exec -it <CONTAINER_NAME_OR_ID> yt-dlp -U
```

For example, if you're using my compose file, the command should be:

```
docker exec -it stupid-bot yt-dlp -U
```

For more information about updating yt-dlp, please check https://github.com/yt-dlp/yt-dlp?tab=readme-ov-file#update

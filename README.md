# stupid-bot
The poorly written music discord bot

## Requirement
The token of your discord bot that has the guild message permission and voice guild permission

## How to run

pass the env `TOKEN` to the container. for example, pass by the env file by creating `.env` file and the content is

```sh
TOKEN=your-discord-bot-token
```

and then run

```sh
docker run -d --env-file ./.env --name stupid-bot ghcr.io/xiaoxuxxxx/stupid-bot
```

and your bot should work now

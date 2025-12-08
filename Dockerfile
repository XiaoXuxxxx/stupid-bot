FROM oven/bun:1.2.23-alpine AS base

ARG YTDLP_VERSION=2025.12.08

WORKDIR /app

RUN apk add --no-cache ffmpeg python3
RUN wget https://github.com/yt-dlp/yt-dlp/releases/download/${YTDLP_VERSION}/yt-dlp -O /bin/yt-dlp
RUN chmod a+rx /bin/yt-dlp

COPY bun.lock package.json ./
RUN bun install --frozen-lockfile --production

COPY ./src ./src
COPY tsconfig.json ./

CMD ["bun", "src/Main.ts"]

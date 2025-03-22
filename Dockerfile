FROM oven/bun:1.2.5-alpine AS base

WORKDIR /app


RUN apk add --no-cache ffmpeg python3
RUN wget https://github.com/yt-dlp/yt-dlp/releases/download/2025.01.26/yt-dlp -O /bin/yt-dlp
RUN chmod a+rx /bin/yt-dlp

COPY bun.lockb package.json ./
RUN bun install --frozen-lockfile --production

COPY ./src ./src
COPY tsconfig.json ./

CMD ["bun", "src/Main.ts"]

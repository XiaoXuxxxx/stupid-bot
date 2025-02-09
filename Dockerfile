FROM node:22.13.1-alpine3.21 AS base

FROM base AS other-deps

RUN apk add --no-cache wget

# yt-dlp
RUN wget https://github.com/yt-dlp/yt-dlp/releases/download/2025.01.26/yt-dlp -O /bin/yt-dlp
RUN chmod a+rx /bin/yt-dlp


FROM base AS node-deps

RUN apk add --no-cache libc6-compat make build-base python3

RUN npm i -g corepack@0.31.0

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile


FROM base AS builder

WORKDIR /app

COPY --from=node-deps ./app/node_modules ./node_modules
COPY ./src/ ./src/
COPY tsconfig.json package.json pnpm-lock.yaml ./

RUN npm i -g corepack@0.31.0
RUN pnpm build


FROM base AS runner

RUN apk update
RUN apk upgrade
RUN apk add --no-cache ffmpeg python3

WORKDIR /app

COPY --from=node-deps ./app/node_modules ./node_modules
COPY --from=other-deps /bin/yt-dlp /bin/yt-dlp
COPY --from=builder ./app/dist ./dist
COPY --from=builder ./app/package.json ./package.json

CMD [ "node", "./dist/build/src/Main.js" ]

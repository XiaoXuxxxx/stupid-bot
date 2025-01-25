FROM node:22-alpine3.18 AS base

FROM base AS deps

RUN apk add --no-cache libc6-compat make build-base python3
RUN corepack enable

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile


FROM base AS builder

WORKDIR /app

COPY --from=deps ./app/node_modules ./node_modules
COPY ./src/ ./src/
COPY tsconfig.json package.json pnpm-lock.yaml ./

RUN corepack enable
RUN pnpm build


FROM base AS runner

RUN apk update
RUN apk upgrade
RUN apk add --no-cache ffmpeg
RUN apk add --no-cache yt-dlp-core

WORKDIR /app

COPY --from=deps ./app/node_modules ./node_modules
COPY --from=builder ./app/dist ./dist
COPY --from=builder ./app/package.json ./package.json

CMD [ "node", "./dist/build/src/Main.js" ]

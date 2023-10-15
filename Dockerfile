FROM node:18-alpine AS deps

RUN apk add --no-cache g++ make py3-pip libc6-compat
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile


FROM node:18-alpine AS prod-deps

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY --from=deps ./app/node_modules ./node_modules

RUN corepack enable
RUN pnpm install --production --frozen-lockfile --ignore-scripts


FROM node:18-alpine AS builder

WORKDIR /app

COPY --from=deps ./app/node_modules ./node_modules
COPY ./src/ ./src/
COPY tsconfig.json package.json pnpm-lock.yaml ./

RUN corepack enable
RUN pnpm build


FROM node:18-alpine AS runner

WORKDIR /app
COPY --from=prod-deps ./app/node_modules ./node_modules
COPY --from=builder ./app/dist ./dist
COPY --from=builder ./app/package.json ./package.json
RUN corepack enable
CMD [ "pnpm", "start" ]

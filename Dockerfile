FROM node:18-alpine AS deps

RUN apk add --no-cache g++ make py3-pip libc6-compat

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile


FROM node:18-alpine AS prod-deps

WORKDIR /app

COPY package.json yarn.lock ./
COPY --from=deps ./app/node_modules ./node_modules

RUN yarn install --production --frozen-lockfile --ignore-scripts


FROM node:18-alpine AS builder

WORKDIR /app

COPY --from=deps ./app/node_modules ./node_modules
COPY ./src/ ./src/
COPY .swcrc tsconfig.json package.json yarn.lock ./

RUN yarn build


FROM node:18-alpine AS runner

WORKDIR /app
COPY --from=prod-deps ./app/node_modules ./node_modules
COPY --from=builder ./app/dist ./dist
COPY --from=builder ./app/package.json ./package.json

CMD [ "yarn", "start" ]

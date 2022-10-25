FROM node:16-alpine AS deps

RUN apk add --no-cache g++ make py3-pip libc6-compat

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --prod

FROM node:16-alpine AS runner

WORKDIR /app
COPY --from=deps ./app/node_modules ./node_modules
COPY ./src/ ./src/
COPY ./package.json ./package.json

CMD [ "yarn", "start" ]

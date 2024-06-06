# Dockerfile
FROM node:18-alpine AS base

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN apk add --no-cache libc6-compat && \
    npm install -g pnpm && \
    pnpm install

FROM node:18-alpine AS build

WORKDIR /app
COPY --from=base /app /app
COPY . .
RUN pnpm run build

FROM node:18-alpine AS production

WORKDIR /app
COPY --from=build /app/dist /app/dist
COPY --from=base /app/node_modules /app/node_modules
COPY ecosystem.config.js ./
COPY .env ./

RUN npm install -g pm2

ARG DOCKER_IMAGE_URL
ARG GITHUB_TOKEN
ARG DOCKER_IMAGE_PORT
ARG DOCKER_CONTAINER_NAME

ENV DOCKER_IMAGE_URL=${DOCKER_IMAGE_URL}
ENV GITHUB_TOKEN=${GITHUB_TOKEN}
ENV DOCKER_IMAGE_PORT=${DOCKER_IMAGE_PORT}
ENV DOCKER_CONTAINER_NAME=${DOCKER_CONTAINER_NAME}

EXPOSE 5000

CMD ["pm2-runtime", "start", "ecosystem.config.js"]

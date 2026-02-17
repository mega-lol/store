FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_BASE_PATH=/mega/
ARG VITE_HANZO_COMMERCE_URL=
ARG VITE_HANZO_TENANT=
ARG VITE_HANZO_ORG=
ARG VITE_HANZO_PROJECT=
ARG VITE_ADXYZ_HOME_URL=https://ad.xyz
ENV VITE_BASE_PATH=$VITE_BASE_PATH
ENV VITE_HANZO_COMMERCE_URL=$VITE_HANZO_COMMERCE_URL
ENV VITE_HANZO_TENANT=$VITE_HANZO_TENANT
ENV VITE_HANZO_ORG=$VITE_HANZO_ORG
ENV VITE_HANZO_PROJECT=$VITE_HANZO_PROJECT
ENV VITE_ADXYZ_HOME_URL=$VITE_ADXYZ_HOME_URL

RUN pnpm build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

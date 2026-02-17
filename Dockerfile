FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_BASE_PATH=/mega/
ARG VITE_HANZO_COMMERCE_URL=
ARG VITE_ADXYZ_HOME_URL=https://ad.xyz
ENV VITE_BASE_PATH=$VITE_BASE_PATH
ENV VITE_HANZO_COMMERCE_URL=$VITE_HANZO_COMMERCE_URL
ENV VITE_ADXYZ_HOME_URL=$VITE_ADXYZ_HOME_URL

RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

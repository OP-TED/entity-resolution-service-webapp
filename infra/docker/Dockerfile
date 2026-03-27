FROM node:22 AS builder
WORKDIR /usr/app

ARG ENVIRONMENT

COPY package.json package-lock.json tsconfig.json tsconfig.app.json tsconfig.node.json ./

RUN npm ci

COPY . .

ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm run openapi:meaningfy && npm run build -- --mode=$ENVIRONMENT

FROM nginx:alpine

COPY --from=builder /usr/app/dist /usr/share/nginx/html

RUN rm -v /etc/nginx/conf.d/default.conf
COPY infra/docker/nginx.conf /etc/nginx/conf.d

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

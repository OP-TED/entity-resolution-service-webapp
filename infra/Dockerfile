# --- Stage 1: Schema Fetcher ---
# This stage isolates the network dependency and tool installation
FROM alpine:latest AS fetcher
# Default URL points to the main Meaningfy backend repo. 
# This can be overridden via --build-arg ERS_SCHEMA_URL=...
ARG ERS_SCHEMA_URL=https://raw.githubusercontent.com/OP-TED/entity-resolution-service/develop/resources/curation-openapi-schema.json
RUN apk add --no-cache curl && \
    curl -fsSL "$ERS_SCHEMA_URL" -o /tmp/schema.json

# --- Stage 2: Builder ---
FROM node:22-slim AS builder
WORKDIR /usr/app

ARG ENVIRONMENT

COPY package.json package-lock.json tsconfig.json tsconfig.app.json tsconfig.node.json ./

RUN npm ci

COPY . .

# Copy schema from fetcher if it was successfully retrieved.
# If the file exists in the local context (infra/curation-openapi-schema.json), 
# it will be overwritten by the fetched one, ensuring the latest version is used.
COPY --from=fetcher /tmp/schema.json* infra/curation-openapi-schema.json

ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm run build -- --mode=$ENVIRONMENT

# --- Stage 3: Production ---
FROM nginx:1.27-alpine AS production

RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
 && mkdir -p /usr/share/nginx/html /etc/nginx/templates \
 && chown -R appuser:appgroup /usr/share/nginx/html \
 && chown -R appuser:appgroup /var/cache/nginx \
 && chown -R appuser:appgroup /var/log/nginx \
 && chown -R appuser:appgroup /etc/nginx/conf.d \
 && chown -R appuser:appgroup /etc/nginx/templates \
 && touch /var/run/nginx.pid \
 && chown appuser:appgroup /var/run/nginx.pid

COPY --from=builder /usr/app/dist /usr/share/nginx/html
COPY --chmod=644 infra/nginx.conf /etc/nginx/templates/default.conf.template
COPY --chmod=755 infra/25-set-resolver.sh /docker-entrypoint.d/25-set-resolver.sh

USER appuser

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

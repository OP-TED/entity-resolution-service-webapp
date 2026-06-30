# --- Stage 1: Schema Fetcher ---
# This stage isolates the network dependency and tool installation
FROM docker.io/library/alpine:3.23.3 AS fetcher
# Default URL points to the ers backend repo.
# This can be overridden via --build-arg ERS_SCHEMA_URL=...
ARG ERS_SCHEMA_URL=https://raw.githubusercontent.com/OP-TED/entity-resolution-service/release/1.1.0/resources/curation-openapi-schema.json
RUN apk add --no-cache curl && \
    curl -fsSL "$ERS_SCHEMA_URL" -o /tmp/schema.json

# --- Stage 2: Builder ---
FROM docker.io/library/node:22.22.2-slim AS builder
WORKDIR /usr/app

ARG ENVIRONMENT

# Install dependencies first for better layer caching
COPY src/package.json src/package-lock.json ./

RUN npm ci
RUN ls
# Copy the rest of the application source
COPY src/ ./

# Copy schema from fetcher (used by openapi-ts via SCHEMA_FILE env var)
COPY --from=fetcher /tmp/schema.json /tmp/schema.json

ENV NODE_OPTIONS="--max-old-space-size=4096"

# Regenerate the API client from the fetched schema, then build
RUN SCHEMA_FILE=/tmp/schema.json npx openapi-ts && \
    npm run build -- --mode=$ENVIRONMENT

# --- Stage 3: Production ---
FROM docker.io/library/nginx:1.27.5-alpine AS production

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
COPY --chmod=644 src/infra/nginx.conf /etc/nginx/templates/default.conf.template
COPY --chmod=755 src/infra/25-set-resolver.sh /docker-entrypoint.d/25-set-resolver.sh

USER appuser

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

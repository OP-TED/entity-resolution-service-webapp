FROM node:22-slim AS builder
WORKDIR /usr/app

ARG ENVIRONMENT
ARG ERS_SCHEMA_URL

COPY package.json package-lock.json tsconfig.json tsconfig.app.json tsconfig.node.json ./

RUN npm ci

COPY . .

# Fetch the OpenAPI schema from the ERS backend repo so the API client can be
# generated without a running backend. When ERS_SCHEMA_URL is not set the build
# relies on infra/curation-openapi-schema.json already being present (e.g. via make fetch-schema).
RUN if [ -n "$ERS_SCHEMA_URL" ]; then \
      apt-get update -qq && apt-get install -y -qq curl > /dev/null && \
      curl -fsSL "$ERS_SCHEMA_URL" -o infra/curation-openapi-schema.json; \
    fi

ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm run build -- --mode=$ENVIRONMENT

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

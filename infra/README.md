# Infrastructure

Docker and CI configuration for the ERS Webapp.

## Structure

```
infra/
├── .env.example                # Environment template
├── compose.dev.yaml            # Dev compose file
├── Dockerfile                  # Multi-stage build (node + nginx)
├── nginx.conf                  # Nginx config for SPA routing
└── README.md
```

## Services

| Service | Image             | Port | Description                                    |
| ------- | ----------------- | ---- | ---------------------------------------------- |
| app     | nginx:1.27-alpine | 8080 | Serves the built SPA with gzip and SPA routing |

## Make targets

Run from the repo root:

**Quality:**

| Target               | Description                  |
| -------------------- | ---------------------------- |
| `make install`       | Install dependencies         |
| `make lint`          | Run ESLint                   |
| `make typecheck`     | Run TypeScript type check    |
| `make test`          | Run unit tests               |
| `make test-coverage` | Run unit tests + coverage    |
| `make check-quality` | Run lint + typecheck         |
| `make check-all`     | Run lint + typecheck + tests |

**Docker:**

| Target         | Description                    |
| -------------- | ------------------------------ |
| `make up`      | Start containers               |
| `make down`    | Stop containers                |
| `make rebuild` | Rebuild and restart containers |
| `make logs`    | Follow container logs          |
| `make help`    | Show available targets         |

All targets that start containers require `infra/.env` (copy from `infra/.env.example`).

## Environment variables

| Variable            | Used at    | Description                                                        |
| ------------------- | ---------- | ------------------------------------------------------------------ |
| `API_BACKEND_URL`   | Runtime    | Curation API address (`host:port`), resolved by nginx via envsubst |
| `ENVIRONMENT`       | Build time | Vite build mode (`development`, `staging`, `production`)           |
| `ERS_SCHEMA_URL`    | Build time | URL to fetch the OpenAPI schema (optional, for Dockerfile)         |
| `VITE_APP_MAIN_API` | Build time | Live API URL for local openapi-ts generation (optional, for dev)   |

# Infrastructure

Docker and CI configuration for the ERS Webapp.

## External Dependencies

The build process requires the ERS Backend OpenAPI schema.

- **File:** `infra/curation-openapi-schema.json`
- **Local acquisition:** Run `make fetch-schema` from the root directory.
- **Automated acquisition:** The `Dockerfile` automatically fetches the schema from the [entity-resolution-service](https://github.com/OP-TED/entity-resolution-service) repository during build. This can be overridden by providing the `ERS_SCHEMA_URL` build argument.

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

**Docker & Build:**

| Target              | Description                    |
| ------------------- | ------------------------------ |
| `make fetch-schema` | Fetch latest OpenAPI schema    |
| `make up`           | Start containers               |
| `make down`         | Stop containers                |
| `make rebuild`      | Rebuild and restart containers |
| `make logs`         | Follow container logs          |
| `make help`         | Show available targets         |

All targets that start containers require `infra/.env` (copy from `infra/.env.example`).

## Environment variables

| Variable                 | Used at    | Description                                                        |
| ------------------------ | ---------- | ------------------------------------------------------------------ |
| `API_BACKEND_URL`        | Runtime    | Curation API address (`host:port`), resolved by nginx via envsubst |
| `SCORE_LEVEL_LOW_MAX`    | Runtime    | Upper bound of the Low score range (default `0.4`)                 |
| `SCORE_LEVEL_MEDIUM_MAX` | Runtime    | Upper bound of the Medium score range (default `0.7`)              |
| `ENVIRONMENT`            | Build time | Vite build mode (`development`, `staging`, `production`)           |
| `ERS_SCHEMA_URL`         | Build time | URL to fetch the OpenAPI schema. Defaults to the backend repo.     |
| `VITE_APP_MAIN_API`      | Build time | Live API URL for local openapi-ts generation (optional, for dev)   |

## Score levels

Confidence and similarity share one three-level scale. Τhe boundaries between
the ranges are configurable, through the two `SCORE_LEVEL_*` variables above.

The ranges are contiguous — Low is `0..LOW_MAX`, Medium is `LOW_MAX..MEDIUM_MAX`,
High is `MEDIUM_MAX..1.0` — so the top level needs no maximum and gaps between the
levels are impossible. Set values that satisfy `0 < LOW_MAX < MEDIUM_MAX < 1`.

The values are read from the container environment at start-up by
`16-render-app-config.sh`, which writes `/tmp/appconfig/config.json`; nginx serves
it at `/config.json` with `Cache-Control: no-store` and the SPA fetches it before
the first render. Nothing is baked into the bundle, so a change needs a new
container (`make up` locally, a new deployment in AWS) but no rebuild — note that
`docker restart` keeps the old environment.

Under `npm run dev` there is no container and no nginx, so nothing renders that file.
The dev server serves the checked-in `src/public/config.json` instead — edit it to try
other boundaries locally. It is excluded from the Docker build context, so it can never
shadow the values an operator sets.

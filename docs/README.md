# Entity Resolution Service WebApp — Developer Docs

## Table of Contents

- [Local Development](#local-development)
- [Configuring the API URL](#configuring-the-api-url)
- [Configuring the Score Levels](#configuring-the-score-levels)
- [Regenerating the API Client](#regenerating-the-api-client)
- [Running with Docker](#running-with-docker)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)

---

## Local Development

### Prerequisites

- Node.js 22+
- npm 10+

### Setup

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Configuring the API URL

The app reads the backend API base URL from an environment variable.

1. Copy the example env file:

```bash
cp .env .env.example
```

2. Edit `.env.example` and set `VITE_APP_MAIN_API` to the desired API URL:

```env
VITE_APP_MAIN_API=https://your-api-host/
```

> `.env.example` is git-ignored and takes precedence over `.env` in Vite.

The variable is prefixed with `VITE_` so Vite injects it into the client bundle at build time.

---

## Configuring the Score Levels

Confidence and similarity share one three-level scale (Low / Medium / High). The three
levels, their labels and their colours are fixed in the code; the two boundaries between
them are configurable:

```env
SCORE_LEVEL_LOW_MAX=0.4      # Low is 0..LOW_MAX
SCORE_LEVEL_MEDIUM_MAX=0.7   # Medium is LOW_MAX..MEDIUM_MAX, High is MEDIUM_MAX..1.0
```

Unlike `VITE_APP_MAIN_API`, these are **not** baked into the bundle. The container
entrypoint `src/infra/16-render-app-config.sh` renders them into `/config.json` on every
start, nginx serves that file with `Cache-Control: no-store`, and `main.tsx` fetches it
once before the first render. A change therefore needs a new container (`make up` locally,
a new deployment in AWS) but no rebuild — note that `docker restart` keeps the old
environment. Missing or unreadable values fall back to the defaults shown above.

Set them in `src/infra/.env` for the Docker flow. `npm run dev` runs no container, so the
dev server serves the checked-in `src/public/config.json` instead — edit that file to try
other boundaries locally.

One `getScoreThresholds()` in `src/utils/appConfig.ts` backs every consumer: the score
classifiers in `utils/confidence.ts`, the review banner in `utils/reviewExplanation.ts`,
and the confidence/similarity filter dropdowns.

---

## Regenerating the API Client

The TypeScript API client in `src/api/` is auto-generated from the backend's OpenAPI schema.

### Steps

1. Make sure the target API server is reachable.
2. Update the schema URL in [VITE_APP_MAIN_API](../.env) if the endpoint has changed:
3. Run the generator:

```bash
npm run openapi:generate
```

This fetches the latest OpenAPI schema and regenerates all `*.gen.ts` files under `src/api/`.

> Do not edit `*.gen.ts` files manually — they will be overwritten on the next run.

---

## Running with Docker

A `docker-compose.yml` is provided at the project root for running the production build locally via Docker.

```bash
# Build and start the container (served on http://localhost:8080)
make up

# Stop the container
make down

# Rebuild and restart (use after code changes)
make rebuild
```

The Docker image is a multi-stage build: Node 22 compiles the app, then Nginx serves the static output.

To change the API URL for a Docker run, set the env variable before starting:

```bash
VITE_APP_MAIN_API=https://your-api-host/ make up
```

> Note: Because `VITE_APP_MAIN_API` is baked into the bundle at build time, changing it requires a full rebuild (`make rebuild`).

---

## Running Tests

### Unit & Component Tests (Vitest)

Tests live in `test/` and are organized by category.

```bash
# Run all unit/component tests once
npm test

# Watch mode (re-runs on file change)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

Coverage is collected for `src/**` (excluding auto-generated `src/api/`).

### End-to-End Tests (Playwright)

E2E tests live in `test/e2e/` and run against the live dev server. All API
calls are intercepted with mock responses so no real backend is required.

```bash
# Install browser binaries (first time only)
npx playwright install

# Run E2E tests headlessly
npm run test:e2e

# Open the interactive Playwright UI
npm run test:e2e:ui
```

---

## Project Structure

```
entity-resolution-service-webapp/
├── docs/               # Developer documentation
├── infra/
│   ├── ci/             # Additional CI job definitions
│   ├── docker/         # Dockerfile and nginx config
├── src/                # Application source code
│   ├── api/            # Auto-generated API client (do not edit *.gen.ts)
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── router/         # Route definitions
│   ├── styles/         # Global styles and theme
│   ├── types/          # Shared TypeScript types
│   └── utils/          # Pure utility functions
├── test/               # Unit tests
│   └── utils/
├── docker-compose.yml  # Local Docker Compose config
├── Makefile            # Shortcuts: up / down / rebuild
├── openapi-ts.config.ts # API client generation config
└── vite.config.ts      # Vite / Vitest config
```

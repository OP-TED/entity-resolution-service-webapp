# entity-resolution-service-webapp

The dedicated web application (frontend) for the Entity Resolution Service. It provides the user interface for entity curation.

---

## Quick Start

### Prerequisites

- Node.js 22+
- npm 10+

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the API URL

Copy the default environment file and set your API URL:

```bash
cp infra/.env.example infra/.env
```

Edit `infra/.env`:

```env
VITE_APP_MAIN_API=https://your-api-host/
```

### 3. Start the local development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Regenerating the API Client

The TypeScript client under `src/api/` is auto-generated from the backend's OpenAPI schema. Run this command whenever the API changes:

```bash
npm run openapi:meaningfy
```

> Never edit `*.gen.ts` files manually — they are overwritten on every run.

---

## Running with Docker

```bash
# Build and start (served on http://localhost:8080)
make up

# Stop
make down

# Rebuild after code or config changes
make rebuild
```

> `VITE_APP_MAIN_API` is baked into the bundle at build time. After changing it, run `make rebuild`.

---

## Running Tests

```bash
# Unit & component tests (Vitest)
npm test

# With coverage
npm run test:coverage

# End-to-end tests (Playwright) — install browsers once first
npx playwright install
npm run test:e2e
```

Unit/component tests live in `tests/`. E2E tests are in `tests/e2e/` and mock
all API calls so no backend is needed.

---

## Docs

Full developer documentation is in [docs/README.md](./docs/README.md).

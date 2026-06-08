# entity-resolution-service-webapp

The dedicated web application (frontend) for the Entity Resolution Service. It provides the user interface for entity curation.

---

## Getting Started

> **To set up the complete ERSys stack** (ERS + ERE + Webapp), see the
> [Installation Guide](https://github.com/OP-TED/entity-resolution-service/blob/develop/INSTALL.md).
> The instructions below cover this component only.

### Prerequisites

- Node.js 22+
- npm 10+
- Docker + Docker Compose

### 1. Install dependencies

```bash
make install
```

### 2. Configure the environment

```bash
cp src/infra/.env.example src/infra/.env
```

Edit `src/infra/.env` and set the backend address:

```env
API_BACKEND_URL=http://curation-api:8000
```

Note: use `http://curation-api:8000` when running in Docker, and `http://localhost:8000` when running with Node.js (`npm run dev`).

### 3. Start the stack

```bash
make up      # build image and start Nginx container
make logs    # follow container logs
make down    # stop

Note: `make up` creates a shared external network `ersys-local` used for cross-component communication.
To remove it manually: `docker network rm ersys-local`
```

The app will be available at `http://localhost:8080`.

### What this stack does NOT include

This repo starts only the web UI (served via Nginx). It does **not** include the ERS backend or the Entity Resolution Engine.

Without the ERS Curation API running and reachable at `API_BACKEND_URL`, the UI will start but all API calls will fail.

- To add the ERS backend: follow the Getting Started section in [entity-resolution-service](https://github.com/OP-TED/entity-resolution-service#getting-started).
- To add the ERE engine: follow the Getting Started section in [entity-resolution-engine-basic](https://github.com/OP-TED/entity-resolution-engine-basic#getting-started).

> **Note on `API_BACKEND_URL`:** This variable is injected at container **runtime** by Nginx — not baked into the bundle at build time. You can change it in `src/infra/.env` and run `make rebuild` without a full frontend rebuild.

---

## Regenerating the API Client

The TypeScript client under `src/api/` is auto-generated from the backend's OpenAPI schema. Run this command whenever the API changes:

```bash
make generate
```

> Never edit `*.gen.ts` files manually — they are overwritten on every run.

---

## Running with Docker

```bash
make up       # build and start (served on http://localhost:8080)
make down     # stop
make rebuild  # rebuild and restart after code or config changes
make logs     # follow container logs
```

---

## Running Tests

```bash
# Unit & component tests (Vitest)
make test

# With coverage
make test-coverage

# End-to-end tests (Playwright) — install browsers once first
npx playwright install
npm run test:e2e
```

Unit/component tests live in `src/test/`. E2E tests are in `src/test/e2e/` and mock
all API calls so no backend is needed.

---

## Docs

Full developer documentation is in [docs/README.md](./docs/README.md).

---

## License & Attribution

This project was developed as open source for the Publications Office of the European Union.

It is licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

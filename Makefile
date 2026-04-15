.PHONY: up down rebuild logs help check-env \
       install lint typecheck test test-coverage check-quality check-all \
       fetch-schema

COMPOSE_FILE := infra/compose.dev.yaml
ENV_FILE := infra/.env
ERS_SCHEMA_URL ?= https://raw.githubusercontent.com/OP-TED/entity-resolution-service/develop/resources/curation-openapi-schema.json
SCHEMA_FILE := infra/curation-openapi-schema.json

# ── Quality checks ──────────────────────────────────────────

install:
	npm ci

lint:
	npx eslint .

typecheck:
	npx tsc --noEmit

test:
	npx vitest run

test-coverage:
	npx vitest run --coverage

check-quality: lint typecheck

check-all: check-quality test

# ── Schema ──────────────────────────────────────────────────

fetch-schema:
	curl -fsSL $(ERS_SCHEMA_URL) -o $(SCHEMA_FILE)
	@echo "Schema saved to $(SCHEMA_FILE)"

# ── Docker ──────────────────────────────────────────────────

check-env:
	@test -f $(ENV_FILE) || (echo "ERROR: $(ENV_FILE) not found. Run: cp infra/.env.example infra/.env" && exit 1)

up: check-env
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) up -d

down:
	docker compose -f $(COMPOSE_FILE) down

rebuild: check-env
	docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE) up -d --build

logs:
	docker compose -f $(COMPOSE_FILE) logs -f

help:
	@echo ""
	@echo "Quality:"
	@echo "  install        Install dependencies"
	@echo "  lint           Run ESLint"
	@echo "  typecheck      Run TypeScript type check"
	@echo "  test           Run unit tests"
	@echo "  test-coverage  Run unit tests with coverage"
	@echo "  check-quality  Run lint + typecheck"
	@echo "  check-all      Run lint + typecheck + tests"
	@echo ""
	@echo "Schema:"
	@echo "  fetch-schema   Download ERS API schema from GitHub"
	@echo ""
	@echo "Docker:"
	@echo "  up             Start containers"
	@echo "  down           Stop containers"
	@echo "  rebuild        Rebuild and restart containers"
	@echo "  logs           Follow container logs"
	@echo "  help           Show this help"

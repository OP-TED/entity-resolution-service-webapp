.PHONY: up down rebuild logs help check-env \
       install lint typecheck test test-coverage check-quality check-all \
       fetch-schema generate

COMPOSE_FILE := src/infra/compose.dev.yaml
ENV_FILE := src/infra/.env
ERS_SCHEMA_URL ?= https://raw.githubusercontent.com/OP-TED/entity-resolution-service/develop/resources/curation-openapi-schema.json
SCHEMA_FILE := src/infra/curation-openapi-schema.json
APP_DIR := src

# ── Quality checks ──────────────────────────────────────────

install:
	npm --prefix $(APP_DIR) ci

lint:
	npm --prefix $(APP_DIR) run lint

typecheck:
	cd $(APP_DIR) && npx tsc --noEmit

generate: fetch-schema
	cd $(APP_DIR) && npx openapi-ts

test: generate
	npm --prefix $(APP_DIR) test

test-coverage: generate
	npm --prefix $(APP_DIR) run test:coverage

check-quality: lint typecheck

check-all: generate check-quality test

# ── Schema ──────────────────────────────────────────────────

fetch-schema:
	curl -fsSL $(ERS_SCHEMA_URL) -o $(SCHEMA_FILE)
	@echo "Schema saved to $(SCHEMA_FILE)"

# ── Docker ──────────────────────────────────────────────────

check-env:
	@test -f $(ENV_FILE) || (echo "ERROR: $(ENV_FILE) not found. Run: cp src/infra/.env.example src/infra/.env" && exit 1)

up: check-env
	@ docker network create ersys-local || true
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
	@echo "  generate       Fetch schema and regenerate src/api/ client code"
	@echo ""
	@echo "Docker:"
	@echo "  up             Start containers"
	@echo "  down           Stop containers"
	@echo "  rebuild        Rebuild and restart containers"
	@echo "  logs           Follow container logs"
	@echo "  help           Show this help"

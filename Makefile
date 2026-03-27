.PHONY: up down rebuild

up:
	docker compose up -d

down:
	docker compose down

rebuild:
	docker compose up -d --build

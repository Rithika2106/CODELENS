.PHONY: install dev build test docker-up docker-down clean

# Install dependencies for both backend and frontend
install:
	npm run install:all

# Run backend and frontend concurrently for local development
dev:
	npm run dev

# Run automated tests and evaluation benchmarks
test:
	npm run test:eval && node server/tests/ollama.test.js

# Build production bundle for client
build:
	npm run build

# Launch full stack with Docker Compose (Ollama + Backend + Frontend)
docker-up:
	docker-compose up -d --build
	@echo "CodeLens running at http://localhost:3000"

# Stop Docker Compose containers
docker-down:
	docker-compose down

# Clean build artifacts
clean:
	rm -rf client/dist

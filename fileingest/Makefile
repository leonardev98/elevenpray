SHELL := /bin/bash

BIN     := bin/fileingest
PKG     := ./cmd/server
GOFLAGS := -trimpath

.PHONY: run build tidy fmt vet test migrate docker

run:
	@go run $(PKG)

build:
	@mkdir -p bin
	go build $(GOFLAGS) -o $(BIN) $(PKG)

tidy:
	go mod tidy

fmt:
	go fmt ./...

vet:
	go vet ./...

test:
	go test ./... -count=1

# Apply migrations against $$DATABASE_URL using psql.
migrate:
	@if [ -z "$$DATABASE_URL" ]; then \
		echo "DATABASE_URL is not set"; exit 1; \
	fi
	@for f in migrations/*.sql; do \
		echo "--> applying $$f"; \
		psql "$$DATABASE_URL" -f $$f || exit 1; \
	done

docker:
	docker build -t fileingest:dev .

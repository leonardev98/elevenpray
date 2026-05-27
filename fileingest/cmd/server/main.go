package main

import (
	"context"
	"errors"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/elevenpray/fileingest/internal/config"
	"github.com/elevenpray/fileingest/internal/httpserver"
	"github.com/elevenpray/fileingest/internal/httpserver/handlers"
	"github.com/elevenpray/fileingest/internal/ingest"
	"github.com/elevenpray/fileingest/internal/ingest/chunker"
	"github.com/elevenpray/fileingest/internal/llm"
	"github.com/elevenpray/fileingest/internal/observability"
	"github.com/elevenpray/fileingest/internal/rag"
	"github.com/elevenpray/fileingest/internal/storage/postgres"
	s3client "github.com/elevenpray/fileingest/internal/storage/s3"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		// Logger isn't ready yet; standard log is acceptable here.
		// Using slog with default handler keeps the format consistent.
		observability.NewLogger("info").Error("config", "err", err)
		os.Exit(1)
	}

	logger := observability.NewLogger(cfg.LogLevel)
	logger.Info("starting",
		"port", cfg.Port,
		"chat_deployment", cfg.Azure.ChatDeployment,
		"embed_deployment", cfg.Azure.EmbedDeployment,
	)

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	pool, err := postgres.NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		logger.Error("postgres", "err", err)
		os.Exit(1)
	}
	defer pool.Close()

	docRepo := postgres.NewDocumentRepo(pool)
	chunkRepo := postgres.NewChunkRepo(pool)

	s3c, err := s3client.New(ctx, cfg.AWS.Region, cfg.AWS.AccessKeyID, cfg.AWS.SecretAccessKey, cfg.AWS.Bucket)
	if err != nil {
		logger.Error("s3", "err", err)
		os.Exit(1)
	}

	llmClient := llm.NewClient(
		cfg.Azure.Endpoint,
		cfg.Azure.APIKey,
		cfg.Azure.ChatDeployment,
		cfg.Azure.EmbedDeployment,
		cfg.Azure.EmbedDims,
		cfg.Azure.APIVersion,
	)

	chk, err := chunker.NewRecursive(cfg.Ingest.ChunkTokens, cfg.Ingest.ChunkOverlap)
	if err != nil {
		logger.Error("chunker", "err", err)
		os.Exit(1)
	}

	pipeline := ingest.New(logger, s3c, chk, llmClient, docRepo, chunkRepo, cfg.Ingest.MaxFileMB)
	retriever := rag.NewRetriever(llmClient, chunkRepo, cfg.RAG.TopKDefault)
	orch := rag.NewOrchestrator(retriever, llmClient)

	srv := httpserver.New(":"+cfg.Port, httpserver.Deps{
		Logger:           logger,
		InternalAPIToken: cfg.InternalAPIToken,
		Health: &handlers.HealthHandler{
			ChatDeployment:  cfg.Azure.ChatDeployment,
			EmbedDeployment: cfg.Azure.EmbedDeployment,
		},
		Ingest:    &handlers.IngestHandler{Pipeline: pipeline, Logger: logger},
		Documents: &handlers.DocumentsHandler{Repo: docRepo},
		Query:     &handlers.QueryHandler{Orchestrator: orch},
		Chat:      &handlers.ChatHandler{Orchestrator: orch, LLM: llmClient},
	})

	serverErr := make(chan error, 1)
	go func() {
		logger.Info("http_listen", "addr", srv.Addr)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			serverErr <- err
		}
	}()

	select {
	case <-ctx.Done():
		logger.Info("shutdown_signal")
	case err := <-serverErr:
		logger.Error("http_serve", "err", err)
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		logger.Error("shutdown", "err", err)
	}
	logger.Info("shutdown_complete")
}

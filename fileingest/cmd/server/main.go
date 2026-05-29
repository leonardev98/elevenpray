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
	"github.com/elevenpray/fileingest/internal/notify"
	"github.com/elevenpray/fileingest/internal/observability"
	"github.com/elevenpray/fileingest/internal/rag"
	"github.com/elevenpray/fileingest/internal/storage/milvus"
	"github.com/elevenpray/fileingest/internal/storage/postgres"
	s3client "github.com/elevenpray/fileingest/internal/storage/s3"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		observability.NewLogger("info").Error("config", "err", err)
		os.Exit(1)
	}

	logger := observability.NewLogger(cfg.LogLevel)
	logger.Info("starting",
		"port", cfg.Port,
		"chat_deployment", cfg.Azure.ChatDeployment,
		"embed_model", cfg.OpenAI.EmbedModel,
		"embed_provider", "openai",
		"milvus_collection", cfg.Milvus.Collection,
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

	s3c, err := s3client.New(ctx, cfg.AWS.Region, cfg.AWS.AccessKeyID, cfg.AWS.SecretAccessKey, cfg.AWS.Bucket)
	if err != nil {
		logger.Error("s3", "err", err)
		os.Exit(1)
	}

	milvusClient, err := milvus.New(ctx, milvus.Config{
		Host:       cfg.Milvus.Host,
		Port:       cfg.Milvus.Port,
		Collection: cfg.Milvus.Collection,
		Dim:        cfg.Milvus.EmbedDims,
	})
	if err != nil {
		logger.Error("milvus", "err", err)
		os.Exit(1)
	}
	defer milvusClient.Close()

	llmClient := llm.NewClient(
		cfg.Azure.Endpoint,
		cfg.Azure.APIKey,
		cfg.Azure.ChatDeployment,
		cfg.Azure.APIVersion,
		cfg.OpenAI.BaseURL,
		cfg.OpenAI.APIKey,
		cfg.OpenAI.EmbedModel,
		cfg.OpenAI.EmbedDims,
	)

	chk, err := chunker.NewRecursive(cfg.Ingest.ChunkTokens, cfg.Ingest.ChunkOverlap)
	if err != nil {
		logger.Error("chunker", "err", err)
		os.Exit(1)
	}

	backendNotify := notify.NewBackendClient(cfg.Backend.ResourceWebhookURL, cfg.Backend.ResourceWebhookToken)

	pipeline := ingest.New(logger, s3c, chk, llmClient, docRepo, milvusClient, cfg.Ingest.MaxFileMB)
	resourcePipeline := ingest.NewResourcePipeline(
		logger, s3c, cfg.AWS.Region, cfg.AWS.PublicBaseURL,
		chk, llmClient, milvusClient, backendNotify, cfg.Ingest.MaxFileMB,
	)

	pgRetriever := rag.NewRetriever(llmClient, milvusClient, docRepo, cfg.RAG.TopKDefault)
	milvusRetriever := rag.NewMilvusRetriever(llmClient, milvusClient, cfg.RAG.TopKDefault)
	orch := rag.NewOrchestrator(pgRetriever, milvusRetriever, llmClient)

	srv := httpserver.New(":"+cfg.Port, httpserver.Deps{
		Logger:           logger,
		InternalAPIToken: cfg.InternalAPIToken,
		Health: &handlers.HealthHandler{
			ChatDeployment:  cfg.Azure.ChatDeployment,
			EmbedDeployment: cfg.OpenAI.EmbedModel,
		},
		Ingest: &handlers.IngestHandler{Pipeline: pipeline, Logger: logger},
		ResourceUpload: &handlers.ResourceUploadHandler{
			Pipeline: resourcePipeline,
			Logger:   logger,
		},
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

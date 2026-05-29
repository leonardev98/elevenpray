package config

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

// Config holds all runtime configuration loaded from environment variables.
type Config struct {
	Port     string
	LogLevel string

	Azure  AzureConfig
	OpenAI OpenAIConfig

	DatabaseURL      string
	InternalAPIToken string

	AWS AWSConfig

	Milvus  MilvusConfig
	Backend BackendConfig

	Ingest IngestConfig
	RAG    RAGConfig
}

type AzureConfig struct {
	Endpoint       string
	APIKey         string
	ChatDeployment string
	APIVersion     string
}

// OpenAIConfig holds public OpenAI API settings used for embeddings only.
type OpenAIConfig struct {
	APIKey        string
	BaseURL       string
	EmbedModel    string
	EmbedDims     int
}

type AWSConfig struct {
	Region          string
	AccessKeyID     string
	SecretAccessKey string
	Bucket          string
	PublicBaseURL   string
}

// MilvusConfig holds vector DB connection settings.
type MilvusConfig struct {
	Host       string
	Port       string
	Collection string
	EmbedDims  int
}

// BackendConfig holds the NestJS webhook target.
type BackendConfig struct {
	ResourceWebhookURL   string
	ResourceWebhookToken string
}

type IngestConfig struct {
	ChunkTokens   int
	ChunkOverlap  int
	MaxFileMB     int
}

type RAGConfig struct {
	TopKDefault int
}

// Load reads configuration from the process environment, optionally seeded by
// a .env file located in the current working directory or any parent.
func Load() (*Config, error) {
	_ = godotenv.Load() // best-effort; production usually injects vars directly

	cfg := &Config{
		Port:             getEnv("PORT", "8090"),
		LogLevel:         strings.ToLower(getEnv("LOG_LEVEL", "info")),
		DatabaseURL:      os.Getenv("DATABASE_URL"),
		InternalAPIToken: os.Getenv("INTERNAL_API_TOKEN"),
		Azure: AzureConfig{
			Endpoint:       strings.TrimRight(os.Getenv("AZURE_OPENAI_ENDPOINT"), "/"),
			APIKey:         os.Getenv("AZURE_OPENAI_API_KEY"),
			ChatDeployment: os.Getenv("AZURE_OPENAI_CHAT_DEPLOYMENT"),
			APIVersion:     os.Getenv("AZURE_OPENAI_API_VERSION"),
		},
		OpenAI: OpenAIConfig{
			APIKey:     os.Getenv("OPENAI_API_KEY"),
			BaseURL:    strings.TrimRight(getEnv("OPENAI_BASE_URL", "https://api.openai.com/v1"), "/"),
			EmbedModel: getEnv("OPENAI_EMBED_MODEL", getEnv("AZURE_OPENAI_EMBED_DEPLOYMENT", "text-embedding-3-small")),
			EmbedDims:  getEnvInt("OPENAI_EMBED_DIMS", getEnvInt("AZURE_OPENAI_EMBED_DIMS", 1536)),
		},
		AWS: AWSConfig{
			Region:          getEnv("AWS_REGION", "us-east-1"),
			AccessKeyID:     os.Getenv("AWS_ACCESS_KEY_ID"),
			SecretAccessKey: os.Getenv("AWS_SECRET_ACCESS_KEY"),
			Bucket:          os.Getenv("S3_BUCKET"),
			PublicBaseURL:   strings.TrimRight(os.Getenv("S3_PUBLIC_BASE_URL"), "/"),
		},
		Milvus: MilvusConfig{
			Host:       os.Getenv("MILVUS_HOST"),
			Port:       getEnv("MILVUS_PORT", "19530"),
			Collection: getEnv("MILVUS_COLLECTION", "course_resource_chunks"),
			EmbedDims:  getEnvInt("MILVUS_EMBED_DIMS", 0),
		},
		Backend: BackendConfig{
			ResourceWebhookURL:   os.Getenv("BACKEND_RESOURCE_WEBHOOK_URL"),
			ResourceWebhookToken: os.Getenv("BACKEND_WEBHOOK_TOKEN"),
		},
		Ingest: IngestConfig{
			ChunkTokens:  getEnvInt("INGEST_CHUNK_TOKENS", 500),
			ChunkOverlap: getEnvInt("INGEST_CHUNK_OVERLAP", 80),
			MaxFileMB:    getEnvInt("INGEST_MAX_FILE_MB", 50),
		},
		RAG: RAGConfig{
			TopKDefault: getEnvInt("RAG_TOPK_DEFAULT", 5),
		},
	}

	if err := cfg.validate(); err != nil {
		return nil, err
	}
	return cfg, nil
}

func (c *Config) validate() error {
	var missing []string
	if c.DatabaseURL == "" {
		missing = append(missing, "DATABASE_URL")
	}
	if c.InternalAPIToken == "" {
		missing = append(missing, "INTERNAL_API_TOKEN")
	}
	if c.Azure.Endpoint == "" {
		missing = append(missing, "AZURE_OPENAI_ENDPOINT")
	}
	if c.Azure.APIKey == "" {
		missing = append(missing, "AZURE_OPENAI_API_KEY")
	}
	if c.Azure.ChatDeployment == "" {
		missing = append(missing, "AZURE_OPENAI_CHAT_DEPLOYMENT")
	}
	if c.OpenAI.APIKey == "" {
		missing = append(missing, "OPENAI_API_KEY")
	}
	if c.OpenAI.EmbedModel == "" {
		missing = append(missing, "OPENAI_EMBED_MODEL")
	}
	if c.AWS.Bucket == "" {
		missing = append(missing, "S3_BUCKET")
	}
	if c.Milvus.Host == "" {
		missing = append(missing, "MILVUS_HOST")
	}
	if c.Backend.ResourceWebhookURL == "" {
		missing = append(missing, "BACKEND_RESOURCE_WEBHOOK_URL")
	}
	if c.Backend.ResourceWebhookToken == "" {
		missing = append(missing, "BACKEND_WEBHOOK_TOKEN")
	}
	if len(missing) > 0 {
		return fmt.Errorf("missing required env vars: %s", strings.Join(missing, ", "))
	}
	if c.OpenAI.EmbedDims <= 0 {
		return errors.New("OPENAI_EMBED_DIMS must be > 0")
	}
	if c.Milvus.EmbedDims <= 0 {
		c.Milvus.EmbedDims = c.OpenAI.EmbedDims
	}
	if c.Milvus.EmbedDims != c.OpenAI.EmbedDims {
		return fmt.Errorf("MILVUS_EMBED_DIMS (%d) must match OPENAI_EMBED_DIMS (%d)", c.Milvus.EmbedDims, c.OpenAI.EmbedDims)
	}
	return nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return fallback
}

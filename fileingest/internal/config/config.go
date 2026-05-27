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

	Azure AzureConfig

	DatabaseURL      string
	InternalAPIToken string

	AWS AWSConfig

	Ingest IngestConfig
	RAG    RAGConfig
}

type AzureConfig struct {
	Endpoint        string
	APIKey          string
	ChatDeployment  string
	EmbedDeployment string
	EmbedDims       int
	APIVersion      string
}

type AWSConfig struct {
	Region          string
	AccessKeyID     string
	SecretAccessKey string
	Bucket          string
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
			Endpoint:        strings.TrimRight(os.Getenv("AZURE_OPENAI_ENDPOINT"), "/"),
			APIKey:          os.Getenv("AZURE_OPENAI_API_KEY"),
			ChatDeployment:  os.Getenv("AZURE_OPENAI_CHAT_DEPLOYMENT"),
			EmbedDeployment: os.Getenv("AZURE_OPENAI_EMBED_DEPLOYMENT"),
			EmbedDims:       getEnvInt("AZURE_OPENAI_EMBED_DIMS", 1536),
			APIVersion:      os.Getenv("AZURE_OPENAI_API_VERSION"),
		},
		AWS: AWSConfig{
			Region:          getEnv("AWS_REGION", "us-east-1"),
			AccessKeyID:     os.Getenv("AWS_ACCESS_KEY_ID"),
			SecretAccessKey: os.Getenv("AWS_SECRET_ACCESS_KEY"),
			Bucket:          os.Getenv("S3_BUCKET"),
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
	if c.Azure.EmbedDeployment == "" {
		missing = append(missing, "AZURE_OPENAI_EMBED_DEPLOYMENT")
	}
	if c.AWS.Bucket == "" {
		missing = append(missing, "S3_BUCKET")
	}
	if len(missing) > 0 {
		return fmt.Errorf("missing required env vars: %s", strings.Join(missing, ", "))
	}
	if c.Azure.EmbedDims <= 0 {
		return errors.New("AZURE_OPENAI_EMBED_DIMS must be > 0")
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

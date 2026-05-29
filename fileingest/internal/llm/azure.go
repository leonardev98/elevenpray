// Package llm wraps OpenAI-compatible APIs for chat and embeddings.
//
// Chat uses Azure OpenAI v1 ({AZURE_OPENAI_ENDPOINT}/chat/completions).
// Embeddings use the public OpenAI API ({OPENAI_BASE}/embeddings) with OPENAI_API_KEY.
package llm

import (
	"net/http"
	"time"
)

const defaultOpenAIBase = "https://api.openai.com/v1"

// Client calls Azure for chat and OpenAI for embeddings.
type Client struct {
	chatEndpoint   string
	chatAPIKey     string
	chatDeployment string
	apiVersion     string // ?api-version= on Azure chat requests

	embedEndpoint string
	embedAPIKey   string
	embedModel    string
	embedDims     int

	http *http.Client
}

// NewClient builds a client. `chatEndpoint` is the Azure v1 base URL;
// `embedEndpoint` is typically https://api.openai.com/v1.
func NewClient(
	chatEndpoint, chatAPIKey, chatDeployment, apiVersion string,
	embedEndpoint, embedAPIKey, embedModel string, embedDims int,
) *Client {
	if embedEndpoint == "" {
		embedEndpoint = defaultOpenAIBase
	}
	return &Client{
		chatEndpoint:   chatEndpoint,
		chatAPIKey:     chatAPIKey,
		chatDeployment: chatDeployment,
		apiVersion:     apiVersion,
		embedEndpoint:  embedEndpoint,
		embedAPIKey:    embedAPIKey,
		embedModel:     embedModel,
		embedDims:      embedDims,
		http: &http.Client{
			Timeout: 5 * time.Minute,
		},
	}
}

// ChatDeployment returns the configured chat deployment name (exposed for logs).
func (c *Client) ChatDeployment() string { return c.chatDeployment }

// EmbedDeployment returns the configured embeddings model name.
func (c *Client) EmbedDeployment() string { return c.embedModel }

// EmbedDims returns the embedding vector dimensions (must match the column).
func (c *Client) EmbedDims() int { return c.embedDims }

// Package llm wraps the Azure OpenAI v1 API (which is OpenAI-compatible).
//
// The endpoint shape used here is:
//
//	{AZURE_OPENAI_ENDPOINT}/chat/completions
//	{AZURE_OPENAI_ENDPOINT}/embeddings
//
// where AZURE_OPENAI_ENDPOINT already ends in "/openai/v1" (the "v1 API"
// surface introduced by Azure). The deployment name is sent as the `model`
// field in the request body, exactly like with public OpenAI.
package llm

import (
	"net/http"
	"time"
)

// Client is a thin Azure OpenAI v1 API client.
type Client struct {
	endpoint        string
	apiKey          string
	chatDeployment  string
	embedDeployment string
	embedDims       int
	apiVersion      string // appended as ?api-version=... for backwards-compatible Azure paths
	http            *http.Client
}

// NewClient builds a new Azure OpenAI client. `endpoint` should be the v1 base
// URL, e.g. "https://x.openai.azure.com/openai/v1".
func NewClient(endpoint, apiKey, chatDeployment, embedDeployment string, embedDims int, apiVersion string) *Client {
	return &Client{
		endpoint:        endpoint,
		apiKey:          apiKey,
		chatDeployment:  chatDeployment,
		embedDeployment: embedDeployment,
		embedDims:       embedDims,
		apiVersion:      apiVersion,
		http: &http.Client{
			Timeout: 5 * time.Minute, // streaming chats can be slow
		},
	}
}

// ChatDeployment returns the configured chat deployment name (exposed for logs).
func (c *Client) ChatDeployment() string { return c.chatDeployment }

// EmbedDeployment returns the configured embeddings deployment name.
func (c *Client) EmbedDeployment() string { return c.embedDeployment }

// EmbedDims returns the embedding vector dimensions (must match the column).
func (c *Client) EmbedDims() int { return c.embedDims }

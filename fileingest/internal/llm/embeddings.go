package llm

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type embeddingsRequest struct {
	Model      string   `json:"model"`
	Input      []string `json:"input"`
	Dimensions *int     `json:"dimensions,omitempty"`
}

type embeddingsResponse struct {
	Data []struct {
		Index     int       `json:"index"`
		Embedding []float32 `json:"embedding"`
	} `json:"data"`
	Model string `json:"model"`
	Usage struct {
		PromptTokens int `json:"prompt_tokens"`
		TotalTokens  int `json:"total_tokens"`
	} `json:"usage"`
	Error *apiError `json:"error,omitempty"`
}

type apiError struct {
	Message string `json:"message"`
	Type    string `json:"type"`
	Code    string `json:"code"`
}

// Embed generates one embedding vector per input string. Results are aligned to
// the input order (Azure returns "index" but we re-sort defensively).
func (c *Client) Embed(ctx context.Context, inputs []string) ([][]float32, error) {
	if len(inputs) == 0 {
		return nil, nil
	}

	body := embeddingsRequest{
		Model: c.embedDeployment,
		Input: inputs,
	}
	// Some embedding models (e.g. text-embedding-3-*) accept a "dimensions" override.
	dims := c.embedDims
	body.Dimensions = &dims

	raw, err := json.Marshal(body)
	if err != nil {
		return nil, fmt.Errorf("marshal embed body: %w", err)
	}

	url := c.endpoint + "/embeddings"
	if c.apiVersion != "" {
		url += "?api-version=" + c.apiVersion
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(raw))
	if err != nil {
		return nil, fmt.Errorf("build embed request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("api-key", c.apiKey)
	req.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("embed request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("embed http %d: %s", resp.StatusCode, string(b))
	}

	var out embeddingsResponse
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return nil, fmt.Errorf("decode embed response: %w", err)
	}
	if out.Error != nil {
		return nil, fmt.Errorf("embed api error: %s", out.Error.Message)
	}
	if len(out.Data) != len(inputs) {
		return nil, fmt.Errorf("embed length mismatch: got %d, want %d", len(out.Data), len(inputs))
	}

	vectors := make([][]float32, len(inputs))
	for _, d := range out.Data {
		if d.Index < 0 || d.Index >= len(inputs) {
			return nil, fmt.Errorf("embed index out of range: %d", d.Index)
		}
		vectors[d.Index] = d.Embedding
	}
	return vectors, nil
}

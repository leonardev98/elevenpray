package llm

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
)

// ChatMessage matches the OpenAI chat schema.
type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// ChatRequest collects all knobs we expose to handlers. Stream is set internally.
type ChatRequest struct {
	Messages    []ChatMessage `json:"messages"`
	Temperature *float32      `json:"temperature,omitempty"`
	MaxTokens   *int          `json:"max_tokens,omitempty"`
	TopP        *float32      `json:"top_p,omitempty"`
}

type chatRequestWire struct {
	Model       string        `json:"model"`
	Messages    []ChatMessage `json:"messages"`
	Stream      bool          `json:"stream"`
	Temperature *float32      `json:"temperature,omitempty"`
	MaxTokens   *int          `json:"max_tokens,omitempty"`
	TopP        *float32      `json:"top_p,omitempty"`
}

type chatResponse struct {
	Choices []struct {
		Message ChatMessage `json:"message"`
	} `json:"choices"`
	Error *apiError `json:"error,omitempty"`
}

type chatStreamDelta struct {
	Choices []struct {
		Delta struct {
			Content string `json:"content"`
		} `json:"delta"`
		FinishReason *string `json:"finish_reason"`
	} `json:"choices"`
	Error *apiError `json:"error,omitempty"`
}

// Chat sends a non-streaming completion and returns the assistant content.
func (c *Client) Chat(ctx context.Context, req ChatRequest) (string, error) {
	body := chatRequestWire{
		Model:       c.chatDeployment,
		Messages:    req.Messages,
		Stream:      false,
		Temperature: req.Temperature,
		MaxTokens:   req.MaxTokens,
		TopP:        req.TopP,
	}
	raw, err := json.Marshal(body)
	if err != nil {
		return "", fmt.Errorf("marshal chat body: %w", err)
	}

	httpReq, err := c.newChatRequest(ctx, raw)
	if err != nil {
		return "", err
	}
	resp, err := c.http.Do(httpReq)
	if err != nil {
		return "", fmt.Errorf("chat request: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 400 {
		b, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("chat http %d: %s", resp.StatusCode, string(b))
	}

	var out chatResponse
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return "", fmt.Errorf("decode chat response: %w", err)
	}
	if out.Error != nil {
		return "", fmt.Errorf("chat api error: %s", out.Error.Message)
	}
	if len(out.Choices) == 0 {
		return "", errors.New("chat returned no choices")
	}
	return out.Choices[0].Message.Content, nil
}

// ChatStream calls the model with stream=true and invokes onDelta for each
// content fragment received over SSE. The callback can return io.EOF to abort
// reading early.
func (c *Client) ChatStream(ctx context.Context, req ChatRequest, onDelta func(string) error) error {
	body := chatRequestWire{
		Model:       c.chatDeployment,
		Messages:    req.Messages,
		Stream:      true,
		Temperature: req.Temperature,
		MaxTokens:   req.MaxTokens,
		TopP:        req.TopP,
	}
	raw, err := json.Marshal(body)
	if err != nil {
		return fmt.Errorf("marshal chat body: %w", err)
	}

	httpReq, err := c.newChatRequest(ctx, raw)
	if err != nil {
		return err
	}
	httpReq.Header.Set("Accept", "text/event-stream")

	resp, err := c.http.Do(httpReq)
	if err != nil {
		return fmt.Errorf("chat stream request: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 400 {
		b, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("chat stream http %d: %s", resp.StatusCode, string(b))
	}

	reader := bufio.NewReader(resp.Body)
	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			if errors.Is(err, io.EOF) {
				return nil
			}
			return fmt.Errorf("read sse: %w", err)
		}
		line = strings.TrimSpace(line)
		if line == "" || !strings.HasPrefix(line, "data:") {
			continue
		}
		payload := strings.TrimSpace(strings.TrimPrefix(line, "data:"))
		if payload == "[DONE]" {
			return nil
		}
		var delta chatStreamDelta
		if err := json.Unmarshal([]byte(payload), &delta); err != nil {
			// non-fatal; skip malformed lines
			continue
		}
		if delta.Error != nil {
			return fmt.Errorf("stream api error: %s", delta.Error.Message)
		}
		for _, ch := range delta.Choices {
			if ch.Delta.Content != "" {
				if cbErr := onDelta(ch.Delta.Content); cbErr != nil {
					if errors.Is(cbErr, io.EOF) {
						return nil
					}
					return cbErr
				}
			}
		}
	}
}

func (c *Client) newChatRequest(ctx context.Context, body []byte) (*http.Request, error) {
	url := c.endpoint + "/chat/completions"
	if c.apiVersion != "" {
		url += "?api-version=" + c.apiVersion
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("build chat request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("api-key", c.apiKey)
	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	return req, nil
}

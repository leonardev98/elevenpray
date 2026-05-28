package notify

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// ResourceIngested is the webhook payload sent to the main backend.
type ResourceIngested struct {
	CourseID   string `json:"course_id"`
	ClassID    string `json:"class_id"`
	ResourceID string `json:"resource_id"`
	KeyURL     string `json:"key_url"`
}

// BackendClient POSTs ingest completion to NestJS.
type BackendClient struct {
	url   string
	token string
	http  *http.Client
}

// NewBackendClient builds a notifier. url and token must be non-empty.
func NewBackendClient(url, token string) *BackendClient {
	return &BackendClient{
		url:   url,
		token: token,
		http:  &http.Client{Timeout: 30 * time.Second},
	}
}

// NotifyResourceIngested calls the backend webhook (fail-fast on non-2xx).
func (c *BackendClient) NotifyResourceIngested(ctx context.Context, payload ResourceIngested) error {
	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshal webhook: %w", err)
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.url, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("webhook request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	if c.token != "" {
		req.Header.Set("X-Internal-Token", c.token)
	}

	res, err := c.http.Do(req)
	if err != nil {
		return fmt.Errorf("webhook post: %w", err)
	}
	defer res.Body.Close()

	if res.StatusCode < 200 || res.StatusCode >= 300 {
		b, _ := io.ReadAll(io.LimitReader(res.Body, 4096))
		return fmt.Errorf("webhook status %d: %s", res.StatusCode, string(b))
	}
	return nil
}

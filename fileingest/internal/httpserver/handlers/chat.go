package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/google/uuid"

	"github.com/elevenpray/fileingest/internal/llm"
	"github.com/elevenpray/fileingest/internal/rag"
)

// ChatHandler streams a RAG-augmented chat response over SSE.
type ChatHandler struct {
	Orchestrator *rag.Orchestrator
	LLM          *llm.Client
}

type chatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type chatRequest struct {
	WorkspaceID        string        `json:"workspaceId"`
	ContextDocumentIDs []string      `json:"contextDocumentIds,omitempty"`
	Messages           []chatMessage `json:"messages"`
	RAGEnabled         bool          `json:"ragEnabled"`
	TopK               int           `json:"topK,omitempty"`
}

func (h *ChatHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	var body chatRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}
	if len(body.Messages) == 0 {
		writeError(w, http.StatusBadRequest, "messages is required")
		return
	}

	flusher, ok := w.(http.Flusher)
	if !ok {
		writeError(w, http.StatusInternalServerError, "streaming not supported")
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")
	w.WriteHeader(http.StatusOK)

	messages := make([]llm.ChatMessage, len(body.Messages))
	for i, m := range body.Messages {
		messages[i] = llm.ChatMessage{Role: m.Role, Content: m.Content}
	}

	sendEvent := func(event, data string) {
		_, _ = fmt.Fprintf(w, "event: %s\ndata: %s\n\n", event, data)
		flusher.Flush()
	}

	onDelta := func(token string) error {
		payload, err := json.Marshal(map[string]string{"content": token})
		if err != nil {
			return err
		}
		sendEvent("delta", string(payload))
		return nil
	}

	if body.RAGEnabled {
		if body.WorkspaceID == "" {
			sendEvent("error", `{"error":"workspaceId required when ragEnabled is true"}`)
			return
		}
		workspaceID, err := uuid.Parse(body.WorkspaceID)
		if err != nil {
			sendEvent("error", `{"error":"invalid workspaceId"}`)
			return
		}
		docIDs, err := parseUUIDs(body.ContextDocumentIDs)
		if err != nil {
			sendEvent("error", `{"error":"invalid contextDocumentIds"}`)
			return
		}
		citations, err := h.Orchestrator.ChatRAGStream(r.Context(), workspaceID, docIDs, messages, body.TopK, onDelta)
		if err != nil {
			payload, _ := json.Marshal(map[string]string{"error": err.Error()})
			sendEvent("error", string(payload))
			return
		}
		cb, _ := json.Marshal(map[string]any{"citations": citations})
		sendEvent("citations", string(cb))
		sendEvent("done", `{}`)
		return
	}

	if err := h.LLM.ChatStream(r.Context(), llm.ChatRequest{Messages: messages}, onDelta); err != nil {
		payload, _ := json.Marshal(map[string]string{"error": err.Error()})
		sendEvent("error", string(payload))
		return
	}
	sendEvent("done", `{}`)
}

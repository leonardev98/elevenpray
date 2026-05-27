package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"

	"github.com/elevenpray/fileingest/internal/rag"
)

// QueryHandler answers a single question with RAG (non-streaming).
type QueryHandler struct {
	Orchestrator *rag.Orchestrator
}

type queryRequest struct {
	WorkspaceID string   `json:"workspaceId"`
	DocumentIDs []string `json:"documentIds,omitempty"`
	Question    string   `json:"question"`
	TopK        int      `json:"topK,omitempty"`
}

func (h *QueryHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	var body queryRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}
	if body.WorkspaceID == "" || body.Question == "" {
		writeError(w, http.StatusBadRequest, "workspaceId and question are required")
		return
	}
	workspaceID, err := uuid.Parse(body.WorkspaceID)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid workspaceId")
		return
	}
	docIDs, err := parseUUIDs(body.DocumentIDs)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid documentIds")
		return
	}

	result, err := h.Orchestrator.Answer(r.Context(), workspaceID, docIDs, body.Question, body.TopK)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func parseUUIDs(in []string) ([]uuid.UUID, error) {
	if len(in) == 0 {
		return nil, nil
	}
	out := make([]uuid.UUID, 0, len(in))
	for _, s := range in {
		u, err := uuid.Parse(s)
		if err != nil {
			return nil, err
		}
		out = append(out, u)
	}
	return out, nil
}

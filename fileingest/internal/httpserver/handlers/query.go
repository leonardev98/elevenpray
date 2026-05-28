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
	CourseID    string   `json:"courseId,omitempty"`
	ClassID     string   `json:"classId,omitempty"`
	Question    string   `json:"question"`
	TopK        int      `json:"topK,omitempty"`
}

func (h *QueryHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	var body queryRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}
	if body.Question == "" {
		writeError(w, http.StatusBadRequest, "question is required")
		return
	}

	var result *rag.QueryResult
	var err error
	if body.CourseID != "" && body.ClassID != "" {
		if _, err = uuid.Parse(body.CourseID); err != nil {
			writeError(w, http.StatusBadRequest, "invalid courseId")
			return
		}
		if _, err = uuid.Parse(body.ClassID); err != nil {
			writeError(w, http.StatusBadRequest, "invalid classId")
			return
		}
		result, err = h.Orchestrator.AnswerByCourseClass(r.Context(), body.CourseID, body.ClassID, body.Question, body.TopK)
	} else {
		if body.WorkspaceID == "" {
			writeError(w, http.StatusBadRequest, "workspaceId is required (or courseId+classId)")
			return
		}
		workspaceID, parseErr := uuid.Parse(body.WorkspaceID)
		if parseErr != nil {
			writeError(w, http.StatusBadRequest, "invalid workspaceId")
			return
		}
		docIDs, parseErr := parseUUIDs(body.DocumentIDs)
		if parseErr != nil {
			writeError(w, http.StatusBadRequest, "invalid documentIds")
			return
		}
		result, err = h.Orchestrator.Answer(r.Context(), workspaceID, docIDs, body.Question, body.TopK)
	}
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

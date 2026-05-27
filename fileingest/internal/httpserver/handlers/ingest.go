package handlers

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/google/uuid"

	"github.com/elevenpray/fileingest/internal/ingest"
)

// IngestHandler kicks off the ingest pipeline. The pipeline currently runs
// synchronously within the request; we return 202 + documentId so the API
// shape is ready for an async/queue migration later.
type IngestHandler struct {
	Pipeline *ingest.Pipeline
	Logger   *slog.Logger
}

type ingestSource struct {
	S3Key string `json:"s3Key"`
}

type ingestRequest struct {
	DocumentID  string       `json:"documentId,omitempty"` // optional; server can mint one
	WorkspaceID string       `json:"workspaceId"`
	UserID      string       `json:"userId"`
	Source      ingestSource `json:"source"`
	MimeType    string       `json:"mimeType"`
	Filename    string       `json:"filename"`
}

type ingestResponse struct {
	DocumentID string `json:"documentId"`
	Status     string `json:"status"`
}

func (h *IngestHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	var body ingestRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid json body")
		return
	}
	if body.WorkspaceID == "" || body.UserID == "" || body.Source.S3Key == "" || body.Filename == "" {
		writeError(w, http.StatusBadRequest, "workspaceId, userId, source.s3Key and filename are required")
		return
	}

	workspaceID, err := uuid.Parse(body.WorkspaceID)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid workspaceId")
		return
	}
	userID, err := uuid.Parse(body.UserID)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid userId")
		return
	}

	var documentID uuid.UUID
	if body.DocumentID == "" {
		documentID = uuid.New()
	} else {
		documentID, err = uuid.Parse(body.DocumentID)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid documentId")
			return
		}
	}

	req := ingest.IngestRequest{
		DocumentID:  documentID,
		WorkspaceID: workspaceID,
		UserID:      userID,
		S3Key:       body.Source.S3Key,
		Filename:    body.Filename,
		MimeType:    body.MimeType,
	}

	// Synchronous for now. To move async, replace this with a goroutine + queue
	// and respond 202 immediately; the response shape is already async-shaped.
	if err := h.Pipeline.Run(r.Context(), req); err != nil {
		if errors.Is(err, http.ErrAbortHandler) {
			return
		}
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusAccepted, ingestResponse{
		DocumentID: documentID.String(),
		Status:     "ready",
	})
}

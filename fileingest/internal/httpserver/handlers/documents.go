package handlers

import (
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"github.com/elevenpray/fileingest/internal/domain"
	"github.com/elevenpray/fileingest/internal/storage/postgres"
)

// DocumentsHandler exposes read-only metadata about ingested documents.
type DocumentsHandler struct {
	Repo *postgres.DocumentRepo
}

func (h *DocumentsHandler) Status(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid document id")
		return
	}
	doc, err := h.Repo.Get(r.Context(), id)
	if err != nil {
		if errors.Is(err, domain.ErrNotFound) {
			writeError(w, http.StatusNotFound, "document not found")
			return
		}
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"id":           doc.ID.String(),
		"workspaceId":  doc.WorkspaceID.String(),
		"userId":       doc.UserID.String(),
		"filename":     doc.Filename,
		"mimeType":     doc.MimeType,
		"status":       string(doc.Status),
		"totalChunks":  doc.TotalChunks,
		"error":        doc.Error,
		"createdAt":    doc.CreatedAt,
		"updatedAt":    doc.UpdatedAt,
	})
}

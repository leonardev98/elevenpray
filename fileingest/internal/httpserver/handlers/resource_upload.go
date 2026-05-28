package handlers

import (
	"io"
	"log/slog"
	"net/http"

	"github.com/google/uuid"

	"github.com/elevenpray/fileingest/internal/domain"
	"github.com/elevenpray/fileingest/internal/ingest"
)

// ResourceUploadHandler accepts multipart course/class file uploads.
type ResourceUploadHandler struct {
	Pipeline *ingest.ResourcePipeline
	Logger   *slog.Logger
}

type resourceUploadResponse struct {
	ResourceID string `json:"resource_id"`
	KeyURL     string `json:"key_url"`
}

func (h *ResourceUploadHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(64 << 20); err != nil {
		writeError(w, http.StatusBadRequest, "invalid multipart form")
		return
	}

	courseID := r.FormValue("course_id")
	classID := r.FormValue("class_id")
	if courseID == "" || classID == "" {
		writeError(w, http.StatusBadRequest, "course_id and class_id are required")
		return
	}
	if _, err := uuid.Parse(courseID); err != nil {
		writeError(w, http.StatusBadRequest, "invalid course_id")
		return
	}
	if _, err := uuid.Parse(classID); err != nil {
		writeError(w, http.StatusBadRequest, "invalid class_id")
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		writeError(w, http.StatusBadRequest, "file is required")
		return
	}
	defer file.Close()

	data, err := io.ReadAll(file)
	if err != nil {
		writeError(w, http.StatusBadRequest, "could not read file")
		return
	}

	contentType := header.Header.Get("Content-Type")
	validated, err := ingest.ValidateResourceFile(header.Filename, contentType, len(data), h.Pipeline.MaxFileMB())
	if err != nil {
		if domain.IsUnsupportedMIME(err) || domain.IsTooLarge(err) {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	result, err := h.Pipeline.Run(r.Context(), ingest.ResourceUploadRequest{
		CourseID: courseID,
		ClassID:  classID,
		File:     validated,
		Data:     data,
	})
	if err != nil {
		h.Logger.Error("resource_upload_failed",
			"course_id", courseID,
			"class_id", classID,
			"err", err,
		)
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, resourceUploadResponse{
		ResourceID: result.ResourceID,
		KeyURL:     result.KeyURL,
	})
}

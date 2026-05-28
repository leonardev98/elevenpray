package ingest

import (
	"fmt"
	"path/filepath"
	"strings"

	"github.com/elevenpray/fileingest/internal/domain"
)

const (
	mimePDF  = "application/pdf"
	mimeDOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
)

// ValidatedResourceFile holds normalized upload metadata after validation.
type ValidatedResourceFile struct {
	Filename    string
	MimeType    string
	Extension   string
	ContentType string
}

// ValidateResourceFile accepts only PDF and DOCX uploads.
func ValidateResourceFile(filename, contentType string, sizeBytes int, maxFileMB int) (ValidatedResourceFile, error) {
	if sizeBytes <= 0 {
		return ValidatedResourceFile{}, fmt.Errorf("empty file")
	}
	if maxFileMB > 0 && sizeBytes > maxFileMB*1024*1024 {
		return ValidatedResourceFile{}, fmt.Errorf("%w: %d bytes (limit %d MB)", domain.ErrTooLarge, sizeBytes, maxFileMB)
	}

	ext := strings.ToLower(filepath.Ext(filename))
	mime := strings.ToLower(strings.TrimSpace(contentType))

	switch {
	case mime == mimePDF || ext == ".pdf":
		return ValidatedResourceFile{
			Filename:    filename,
			MimeType:    mimePDF,
			Extension:   "pdf",
			ContentType: mimePDF,
		}, nil
	case mime == mimeDOCX || ext == ".docx":
		return ValidatedResourceFile{
			Filename:    filename,
			MimeType:    mimeDOCX,
			Extension:   "docx",
			ContentType: mimeDOCX,
		}, nil
	default:
		return ValidatedResourceFile{}, fmt.Errorf("%w: only .pdf and .docx are allowed", domain.ErrUnsupportedMIME)
	}
}

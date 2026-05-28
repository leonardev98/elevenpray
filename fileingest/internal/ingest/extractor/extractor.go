// Package extractor turns raw uploaded bytes into plain UTF-8 text.
package extractor

import (
	"context"
	"fmt"
	"strings"

	"github.com/elevenpray/fileingest/internal/domain"
)

// Extractor converts a file payload into normalized plain text.
type Extractor interface {
	Extract(ctx context.Context, data []byte) (string, error)
}

// Registry dispatches to a concrete extractor based on the MIME type.
type Registry struct {
	pdf      Extractor
	docx     Extractor
	pptx     Extractor
	xlsx     Extractor
	text     Extractor
	markdown Extractor
}

// NewRegistry wires the default set of extractors.
func NewRegistry() *Registry {
	return &Registry{
		pdf:      &PDFExtractor{},
		docx:     &DOCXExtractor{},
		pptx:     &PPTXExtractor{},
		xlsx:     &XLSXExtractor{},
		text:     &TextExtractor{},
		markdown: &MarkdownExtractor{},
	}
}

// Extract picks an extractor based on the mime type and optional filename hint.
// Returns ErrUnsupportedMIME if no extractor matches.
func (r *Registry) Extract(ctx context.Context, mimeType string, data []byte) (string, error) {
	return r.ExtractWithFilename(ctx, mimeType, "", data)
}

// ExtractWithFilename resolves MIME from filename when the type is empty or generic.
func (r *Registry) ExtractWithFilename(ctx context.Context, mimeType, filename string, data []byte) (string, error) {
	mt := normalizeMIME(mimeType, filename)
	switch {
	case strings.Contains(mt, "pdf"):
		return r.pdf.Extract(ctx, data)
	case isDOCX(mt):
		return r.docx.Extract(ctx, data)
	case isPPTX(mt):
		return r.pptx.Extract(ctx, data)
	case isXLSX(mt):
		return r.xlsx.Extract(ctx, data)
	case mt == "text/markdown" || strings.HasSuffix(mt, "+markdown"):
		return r.markdown.Extract(ctx, data)
	case strings.HasPrefix(mt, "text/"):
		return r.text.Extract(ctx, data)
	default:
		return "", fmt.Errorf("%w: %q", domain.ErrUnsupportedMIME, mimeType)
	}
}

func normalizeMIME(mimeType, filename string) string {
	mt := strings.ToLower(strings.TrimSpace(mimeType))
	if mt != "" && mt != "application/octet-stream" {
		return mt
	}
	ext := strings.ToLower(filename)
	if i := strings.LastIndex(ext, "."); i >= 0 {
		ext = ext[i:]
	}
	switch ext {
	case ".pdf":
		return "application/pdf"
	case ".docx":
		return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
	case ".pptx":
		return "application/vnd.openxmlformats-officedocument.presentationml.presentation"
	case ".xlsx":
		return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
	case ".md":
		return "text/markdown"
	case ".txt":
		return "text/plain"
	default:
		return mt
	}
}

func isDOCX(mt string) bool {
	return strings.Contains(mt, "wordprocessingml")
}

func isPPTX(mt string) bool {
	return strings.Contains(mt, "presentationml")
}

func isXLSX(mt string) bool {
	return strings.Contains(mt, "spreadsheetml")
}

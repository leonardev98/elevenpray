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
	text     Extractor
	markdown Extractor
}

// NewRegistry wires the default set of extractors.
func NewRegistry() *Registry {
	return &Registry{
		pdf:      &PDFExtractor{},
		text:     &TextExtractor{},
		markdown: &MarkdownExtractor{},
	}
}

// Extract picks an extractor based on the mime type. Returns ErrUnsupportedMIME
// if no extractor matches.
func (r *Registry) Extract(ctx context.Context, mimeType string, data []byte) (string, error) {
	mt := strings.ToLower(strings.TrimSpace(mimeType))
	switch {
	case strings.Contains(mt, "pdf"):
		return r.pdf.Extract(ctx, data)
	case mt == "text/markdown" || strings.HasSuffix(mt, "+markdown"):
		return r.markdown.Extract(ctx, data)
	case strings.HasPrefix(mt, "text/"):
		return r.text.Extract(ctx, data)
	default:
		return "", fmt.Errorf("%w: %q", domain.ErrUnsupportedMIME, mimeType)
	}
}

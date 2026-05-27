package extractor

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"strings"

	"github.com/ledongthuc/pdf"
)

// PDFExtractor reads text from PDF documents using ledongthuc/pdf (pure Go,
// no CGO required). For PDFs that rely heavily on embedded fonts/encodings we
// can later swap to gen2brain/go-fitz behind the same interface.
type PDFExtractor struct{}

func (PDFExtractor) Extract(_ context.Context, data []byte) (string, error) {
	reader := bytes.NewReader(data)
	r, err := pdf.NewReader(reader, int64(len(data)))
	if err != nil {
		return "", fmt.Errorf("open pdf: %w", err)
	}

	var sb strings.Builder
	totalPages := r.NumPage()
	for i := 1; i <= totalPages; i++ {
		page := r.Page(i)
		if page.V.IsNull() {
			continue
		}
		text, err := page.GetPlainText(nil)
		if err != nil {
			// One bad page should not fail the whole document.
			continue
		}
		sb.WriteString(text)
		sb.WriteString("\n\n")
	}

	out := strings.TrimSpace(sb.String())
	if out == "" {
		return "", fmt.Errorf("pdf produced empty text: %w", io.EOF)
	}
	return out, nil
}

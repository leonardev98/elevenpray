package extractor

import (
	"context"
	"strings"
	"unicode/utf8"
)

// TextExtractor handles plain UTF-8 text files.
type TextExtractor struct{}

func (TextExtractor) Extract(_ context.Context, data []byte) (string, error) {
	if !utf8.Valid(data) {
		// fallback: drop invalid bytes
		return strings.ToValidUTF8(string(data), ""), nil
	}
	return string(data), nil
}

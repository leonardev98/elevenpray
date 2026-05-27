package extractor

import (
	"context"
	"regexp"
	"strings"
)

// MarkdownExtractor strips common markdown syntax so the LLM sees cleaner text.
// We deliberately keep this simple; if richer normalization is needed later we
// can swap in a real markdown parser.
type MarkdownExtractor struct{}

var (
	mdCodeFence  = regexp.MustCompile("(?s)```.*?```")
	mdInlineCode = regexp.MustCompile("`[^`]*`")
	mdImage      = regexp.MustCompile(`!\[[^\]]*\]\([^)]*\)`)
	mdLink       = regexp.MustCompile(`\[([^\]]+)\]\([^)]+\)`)
	mdHeading    = regexp.MustCompile(`(?m)^#{1,6}\s+`)
	mdBold       = regexp.MustCompile(`\*\*([^*]+)\*\*`)
	mdItalic     = regexp.MustCompile(`\*([^*]+)\*`)
)

func (MarkdownExtractor) Extract(_ context.Context, data []byte) (string, error) {
	s := string(data)
	s = mdCodeFence.ReplaceAllString(s, "")
	s = mdInlineCode.ReplaceAllString(s, "")
	s = mdImage.ReplaceAllString(s, "")
	s = mdLink.ReplaceAllString(s, "$1")
	s = mdHeading.ReplaceAllString(s, "")
	s = mdBold.ReplaceAllString(s, "$1")
	s = mdItalic.ReplaceAllString(s, "$1")
	return strings.TrimSpace(s), nil
}

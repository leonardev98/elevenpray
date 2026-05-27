// Package chunker splits long documents into overlapping, token-bounded pieces.
package chunker

import (
	"strings"

	"github.com/pkoukk/tiktoken-go"
)

// Chunk is a single piece of text along with its token length.
type Chunk struct {
	Content    string
	TokenCount int
}

// Recursive splits text using a hierarchy of separators (paragraphs -> lines ->
// sentences -> words) until each piece fits within the configured token budget.
// It then merges adjacent pieces back together to honor MaxTokens and adds
// overlap tokens between consecutive chunks.
type Recursive struct {
	MaxTokens int
	Overlap   int
	encoder   *tiktoken.Tiktoken
}

// NewRecursive builds a chunker. If maxTokens <= 0, a sane default is used.
// We use cl100k_base, the same tokenizer family OpenAI uses for GPT-4/3.5 and
// text-embedding-3-*; it is a close-enough approximation for any LLM here.
func NewRecursive(maxTokens, overlap int) (*Recursive, error) {
	if maxTokens <= 0 {
		maxTokens = 500
	}
	if overlap < 0 {
		overlap = 0
	}
	if overlap >= maxTokens {
		overlap = maxTokens / 5
	}
	enc, err := tiktoken.GetEncoding("cl100k_base")
	if err != nil {
		return nil, err
	}
	return &Recursive{
		MaxTokens: maxTokens,
		Overlap:   overlap,
		encoder:   enc,
	}, nil
}

// Split returns the input split into chunks honoring MaxTokens and Overlap.
func (r *Recursive) Split(text string) []Chunk {
	text = strings.TrimSpace(text)
	if text == "" {
		return nil
	}
	tokens := r.encode(text)
	if len(tokens) <= r.MaxTokens {
		return []Chunk{{Content: text, TokenCount: len(tokens)}}
	}

	// Try hierarchical splitting on paragraph -> line -> sentence -> space.
	separators := []string{"\n\n", "\n", ". ", " "}
	pieces := r.split(text, separators)

	// Merge consecutive pieces while staying within MaxTokens, then attach overlap.
	return r.pack(pieces)
}

// encode counts tokens; safe to call with empty strings.
func (r *Recursive) encode(s string) []int {
	return r.encoder.Encode(s, nil, nil)
}

// split applies separators recursively until each piece fits in MaxTokens or
// no more separators are left.
func (r *Recursive) split(text string, separators []string) []string {
	if len(r.encode(text)) <= r.MaxTokens || len(separators) == 0 {
		return []string{text}
	}
	sep := separators[0]
	parts := strings.Split(text, sep)
	var out []string
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p == "" {
			continue
		}
		if len(r.encode(p)) <= r.MaxTokens {
			out = append(out, p)
		} else {
			out = append(out, r.split(p, separators[1:])...)
		}
	}
	return out
}

// pack merges pieces greedily so each chunk fills as much as possible, with a
// trailing overlap copied to the next chunk's prefix.
func (r *Recursive) pack(pieces []string) []Chunk {
	var chunks []Chunk
	var current []string
	currentTokens := 0

	flush := func() {
		if len(current) == 0 {
			return
		}
		text := strings.Join(current, " ")
		chunks = append(chunks, Chunk{Content: text, TokenCount: currentTokens})
		current = nil
		currentTokens = 0
	}

	for _, p := range pieces {
		pTokens := len(r.encode(p))
		if currentTokens+pTokens > r.MaxTokens && currentTokens > 0 {
			flush()
		}
		current = append(current, p)
		currentTokens += pTokens
	}
	flush()

	if r.Overlap <= 0 || len(chunks) < 2 {
		return chunks
	}

	// Attach overlap by prefixing each chunk (except the first) with the tail
	// tokens of the previous chunk.
	withOverlap := make([]Chunk, 0, len(chunks))
	for i, c := range chunks {
		if i == 0 {
			withOverlap = append(withOverlap, c)
			continue
		}
		prevTokens := r.encoder.Encode(chunks[i-1].Content, nil, nil)
		start := len(prevTokens) - r.Overlap
		if start < 0 {
			start = 0
		}
		overlapText := r.encoder.Decode(prevTokens[start:])
		merged := strings.TrimSpace(overlapText) + "\n" + c.Content
		withOverlap = append(withOverlap, Chunk{
			Content:    merged,
			TokenCount: len(r.encoder.Encode(merged, nil, nil)),
		})
	}
	return withOverlap
}

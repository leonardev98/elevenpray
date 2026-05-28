package extractor

import (
	"archive/zip"
	"bytes"
	"context"
	"encoding/xml"
	"fmt"
	"io"
	"sort"
	"strings"
)

// extractOOXMLZipText reads Office Open XML parts from a ZIP (docx/pptx) and
// concatenates text runs (elements with local name "t", e.g. w:t and a:t).
func extractOOXMLZipText(data []byte, match func(name string) bool) (string, error) {
	zr, err := zip.NewReader(bytes.NewReader(data), int64(len(data)))
	if err != nil {
		return "", fmt.Errorf("open ooxml zip: %w", err)
	}

	var names []string
	for _, f := range zr.File {
		if match(f.Name) {
			names = append(names, f.Name)
		}
	}
	sort.Strings(names)

	var sb strings.Builder
	for _, name := range names {
		f, err := zr.Open(name)
		if err != nil {
			continue
		}
		body, err := io.ReadAll(f)
		_ = f.Close()
		if err != nil {
			continue
		}
		text := extractXMLTextRuns(body)
		if strings.TrimSpace(text) != "" {
			sb.WriteString(text)
			sb.WriteString("\n\n")
		}
	}

	out := strings.TrimSpace(sb.String())
	if out == "" {
		return "", fmt.Errorf("ooxml zip produced empty text")
	}
	return out, nil
}

func extractXMLTextRuns(xmlData []byte) string {
	dec := xml.NewDecoder(bytes.NewReader(xmlData))
	var sb strings.Builder
	inTextRun := 0

	for {
		tok, err := dec.Token()
		if err != nil {
			break
		}
		switch el := tok.(type) {
		case xml.StartElement:
			if el.Name.Local == "t" {
				inTextRun++
			}
		case xml.CharData:
			if inTextRun > 0 {
				sb.Write(el)
			}
		case xml.EndElement:
			if el.Name.Local == "t" && inTextRun > 0 {
				inTextRun--
				sb.WriteByte('\n')
			}
		}
	}
	return sb.String()
}

func docxPartMatch(name string) bool {
	if !strings.HasPrefix(name, "word/") || !strings.HasSuffix(name, ".xml") {
		return false
	}
	base := strings.TrimPrefix(name, "word/")
	switch {
	case base == "document.xml":
		return true
	case strings.HasPrefix(base, "header"), strings.HasPrefix(base, "footer"):
		return true
	default:
		return false
	}
}

func pptxPartMatch(name string) bool {
	if !strings.HasSuffix(name, ".xml") {
		return false
	}
	return strings.HasPrefix(name, "ppt/slides/slide") ||
		strings.HasPrefix(name, "ppt/notesSlides/notesSlide")
}

// DOCXExtractor reads .docx (Office Open XML Word).
type DOCXExtractor struct{}

func (DOCXExtractor) Extract(_ context.Context, data []byte) (string, error) {
	return extractOOXMLZipText(data, docxPartMatch)
}

// PPTXExtractor reads .pptx (Office Open XML PowerPoint).
type PPTXExtractor struct{}

func (PPTXExtractor) Extract(_ context.Context, data []byte) (string, error) {
	return extractOOXMLZipText(data, pptxPartMatch)
}

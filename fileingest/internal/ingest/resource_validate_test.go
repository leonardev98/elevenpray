package ingest

import (
	"errors"
	"testing"

	"github.com/elevenpray/fileingest/internal/domain"
)

func TestValidateResourceFile_pdf(t *testing.T) {
	v, err := ValidateResourceFile("notes.pdf", "application/pdf", 100, 50)
	if err != nil {
		t.Fatal(err)
	}
	if v.Extension != "pdf" {
		t.Fatalf("ext=%s", v.Extension)
	}
}

func TestValidateResourceFile_docx(t *testing.T) {
	v, err := ValidateResourceFile("notes.docx", "", 100, 50)
	if err != nil {
		t.Fatal(err)
	}
	if v.Extension != "docx" {
		t.Fatalf("ext=%s", v.Extension)
	}
}

func TestValidateResourceFile_rejects_pptx(t *testing.T) {
	_, err := ValidateResourceFile("slides.pptx", "", 100, 50)
	if !errors.Is(err, domain.ErrUnsupportedMIME) {
		t.Fatalf("err=%v", err)
	}
}

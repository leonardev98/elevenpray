package extractor

import (
	"archive/zip"
	"bytes"
	"context"
	"testing"

	"github.com/xuri/excelize/v2"
)

func TestDOCXExtractor_minimal(t *testing.T) {
	var buf bytes.Buffer
	zw := zip.NewWriter(&buf)
	w, err := zw.Create("word/document.xml")
	if err != nil {
		t.Fatal(err)
	}
	_, _ = w.Write([]byte(`<?xml version="1.0"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body><w:p><w:r><w:t>Hola docx</w:t></w:r></w:p></w:body>
</w:document>`))
	if err := zw.Close(); err != nil {
		t.Fatal(err)
	}

	got, err := (DOCXExtractor{}).Extract(context.Background(), buf.Bytes())
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Contains([]byte(got), []byte("Hola docx")) {
		t.Fatalf("unexpected text: %q", got)
	}
}

func TestXLSXExtractor_minimal(t *testing.T) {
	f := excelize.NewFile()
	_ = f.SetCellValue("Sheet1", "A1", "Celda A1")
	_ = f.SetCellValue("Sheet1", "B1", "Celda B1")
	var buf bytes.Buffer
	if err := f.Write(&buf); err != nil {
		t.Fatal(err)
	}

	got, err := (XLSXExtractor{}).Extract(context.Background(), buf.Bytes())
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Contains([]byte(got), []byte("Celda A1")) {
		t.Fatalf("unexpected text: %q", got)
	}
}

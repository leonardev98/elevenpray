package extractor

import (
	"bytes"
	"context"
	"fmt"
	"strings"

	"github.com/xuri/excelize/v2"
)

// XLSXExtractor reads .xlsx spreadsheets (Office Open XML Excel).
type XLSXExtractor struct{}

func (XLSXExtractor) Extract(_ context.Context, data []byte) (string, error) {
	f, err := excelize.OpenReader(bytes.NewReader(data))
	if err != nil {
		return "", fmt.Errorf("open xlsx: %w", err)
	}
	defer func() { _ = f.Close() }()

	var sb strings.Builder
	for _, sheet := range f.GetSheetList() {
		rows, err := f.GetRows(sheet)
		if err != nil {
			continue
		}
		if len(rows) == 0 {
			continue
		}
		sb.WriteString("## ")
		sb.WriteString(sheet)
		sb.WriteString("\n\n")
		for _, row := range rows {
			if len(row) == 0 {
				continue
			}
			sb.WriteString(strings.Join(row, "\t"))
			sb.WriteString("\n")
		}
		sb.WriteString("\n")
	}

	out := strings.TrimSpace(sb.String())
	if out == "" {
		return "", fmt.Errorf("xlsx produced empty text")
	}
	return out, nil
}

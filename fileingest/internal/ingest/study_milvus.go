package ingest

import (
	"fmt"

	"github.com/google/uuid"

	"github.com/elevenpray/fileingest/internal/storage/milvus"
)

// Milvus key prefixes keep study documents separate from university course/class
// resources in the shared collection (course_id / class_id are VarChar filters).
const (
	studyCoursePrefix = "study:ws:"
	studyClassPrefix  = "study:doc:"
)

func studyCourseID(workspaceID uuid.UUID) string {
	return studyCoursePrefix + workspaceID.String()
}

func studyClassID(documentID uuid.UUID) string {
	return studyClassPrefix + documentID.String()
}

func studyChunkRow(
	documentID uuid.UUID,
	workspaceID uuid.UUID,
	chunkIndex int,
	content string,
	embedding []float32,
) milvus.ChunkRow {
	return milvus.ChunkRow{
		ID:         fmt.Sprintf("%s_%d", documentID.String(), chunkIndex),
		ResourceID: documentID.String(),
		CourseID:   studyCourseID(workspaceID),
		ClassID:    studyClassID(documentID),
		ChunkIndex: int64(chunkIndex),
		Content:    content,
		Embedding:  embedding,
	}
}

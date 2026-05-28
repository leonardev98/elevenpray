// Package milvus stores chunk embeddings for course/class resources.
package milvus

import (
	"context"
	"fmt"
	"strings"

	"github.com/milvus-io/milvus-sdk-go/v2/client"
	"github.com/milvus-io/milvus-sdk-go/v2/entity"
)

const maxContentLen = 65535

// ChunkRow is one indexed text chunk with its embedding.
type ChunkRow struct {
	ID           string
	ResourceID   string
	CourseID     string
	ClassID      string
	ChunkIndex   int64
	Content      string
	Embedding    []float32
}

// Client wraps Milvus collection lifecycle and inserts.
type Client struct {
	api        client.Client
	collection string
	dim        int
}

// Config for connecting to Milvus.
type Config struct {
	Host       string
	Port       string
	Collection string
	Dim        int
}

// New connects to Milvus and ensures the collection exists.
func New(ctx context.Context, cfg Config) (*Client, error) {
	addr := fmt.Sprintf("%s:%s", cfg.Host, cfg.Port)
	api, err := client.NewGrpcClient(ctx, addr)
	if err != nil {
		return nil, fmt.Errorf("milvus connect %s: %w", addr, err)
	}

	c := &Client{
		api:        api,
		collection: cfg.Collection,
		dim:        cfg.Dim,
	}
	if err := c.ensureCollection(ctx); err != nil {
		_ = api.Close()
		return nil, err
	}
	return c, nil
}

func (c *Client) ensureCollection(ctx context.Context) error {
	exists, err := c.api.HasCollection(ctx, c.collection)
	if err != nil {
		return fmt.Errorf("has collection: %w", err)
	}
	if exists {
		if err := c.api.LoadCollection(ctx, c.collection, false); err != nil {
			return fmt.Errorf("load collection: %w", err)
		}
		return nil
	}

	schema := &entity.Schema{
		CollectionName: c.collection,
		Description:    "Course/class resource chunks for RAG",
		Fields: []*entity.Field{
			entity.NewField().WithName("id").WithDataType(entity.FieldTypeVarChar).WithMaxLength(128).WithIsPrimaryKey(true),
			entity.NewField().WithName("resource_id").WithDataType(entity.FieldTypeVarChar).WithMaxLength(64),
			entity.NewField().WithName("course_id").WithDataType(entity.FieldTypeVarChar).WithMaxLength(64),
			entity.NewField().WithName("class_id").WithDataType(entity.FieldTypeVarChar).WithMaxLength(64),
			entity.NewField().WithName("chunk_index").WithDataType(entity.FieldTypeInt64),
			entity.NewField().WithName("content").WithDataType(entity.FieldTypeVarChar).WithMaxLength(maxContentLen),
			entity.NewField().WithName("embedding").WithDataType(entity.FieldTypeFloatVector).WithDim(int64(c.dim)),
		},
	}
	if err := c.api.CreateCollection(ctx, schema, entity.DefaultShardNumber); err != nil {
		return fmt.Errorf("create collection: %w", err)
	}

	idx, err := entity.NewIndexHNSW(entity.COSINE, 16, 200)
	if err != nil {
		return fmt.Errorf("hnsw index: %w", err)
	}
	if err := c.api.CreateIndex(ctx, c.collection, "embedding", idx, false); err != nil {
		return fmt.Errorf("create index: %w", err)
	}
	if err := c.api.LoadCollection(ctx, c.collection, false); err != nil {
		return fmt.Errorf("load new collection: %w", err)
	}
	return nil
}

// InsertChunks batch-inserts all chunk rows for a resource.
func (c *Client) InsertChunks(ctx context.Context, rows []ChunkRow) error {
	if len(rows) == 0 {
		return fmt.Errorf("no chunks to insert")
	}

	ids := make([]string, len(rows))
	resourceIDs := make([]string, len(rows))
	courseIDs := make([]string, len(rows))
	classIDs := make([]string, len(rows))
	chunkIndexes := make([]int64, len(rows))
	contents := make([]string, len(rows))
	vectors := make([][]float32, len(rows))

	for i, r := range rows {
		ids[i] = r.ID
		resourceIDs[i] = r.ResourceID
		courseIDs[i] = r.CourseID
		classIDs[i] = r.ClassID
		chunkIndexes[i] = r.ChunkIndex
		contents[i] = truncate(r.Content, maxContentLen)
		vectors[i] = r.Embedding
	}

	_, err := c.api.Insert(ctx, c.collection, "",
		entity.NewColumnVarChar("id", ids),
		entity.NewColumnVarChar("resource_id", resourceIDs),
		entity.NewColumnVarChar("course_id", courseIDs),
		entity.NewColumnVarChar("class_id", classIDs),
		entity.NewColumnInt64("chunk_index", chunkIndexes),
		entity.NewColumnVarChar("content", contents),
		entity.NewColumnFloatVector("embedding", c.dim, vectors),
	)
	if err != nil {
		return fmt.Errorf("milvus insert: %w", err)
	}
	if err := c.api.Flush(ctx, c.collection, false); err != nil {
		return fmt.Errorf("milvus flush: %w", err)
	}
	return nil
}

// SearchSimilar returns top-K chunks filtered by course and class.
func (c *Client) SearchSimilar(
	ctx context.Context,
	courseID, classID string,
	vector []float32,
	topK int,
) ([]ChunkRow, error) {
	if topK <= 0 {
		topK = 5
	}
	expr := fmt.Sprintf(`course_id == "%s" && class_id == "%s"`, escapeExpr(courseID), escapeExpr(classID))
	sp, err := entity.NewIndexHNSWSearchParam(64)
	if err != nil {
		return nil, err
	}

	results, err := c.api.Search(
		ctx,
		c.collection,
		nil,
		expr,
		[]string{"id", "resource_id", "course_id", "class_id", "chunk_index", "content"},
		[]entity.Vector{entity.FloatVector(vector)},
		"embedding",
		entity.COSINE,
		topK,
		sp,
	)
	if err != nil {
		return nil, fmt.Errorf("milvus search: %w", err)
	}
	if len(results) == 0 {
		return nil, nil
	}

	r := results[0]
	out := make([]ChunkRow, 0, r.ResultCount)
	idCol := r.Fields.GetColumn("id")
	resCol := r.Fields.GetColumn("resource_id")
	courseCol := r.Fields.GetColumn("course_id")
	classCol := r.Fields.GetColumn("class_id")
	idxCol := r.Fields.GetColumn("chunk_index")
	contentCol := r.Fields.GetColumn("content")

	for i := 0; i < r.ResultCount; i++ {
		row := ChunkRow{}
		if idCol != nil {
			v, _ := idCol.GetAsString(i)
			row.ID = v
		}
		if resCol != nil {
			v, _ := resCol.GetAsString(i)
			row.ResourceID = v
		}
		if courseCol != nil {
			v, _ := courseCol.GetAsString(i)
			row.CourseID = v
		}
		if classCol != nil {
			v, _ := classCol.GetAsString(i)
			row.ClassID = v
		}
		if idxCol != nil {
			v, _ := idxCol.Get(i)
			if n, ok := v.(int64); ok {
				row.ChunkIndex = n
			}
		}
		if contentCol != nil {
			v, _ := contentCol.GetAsString(i)
			row.Content = v
		}
		out = append(out, row)
	}
	return out, nil
}

// Close releases the Milvus client.
func (c *Client) Close() error {
	return c.api.Close()
}

func truncate(s string, max int) string {
	if len(s) <= max {
		return s
	}
	return s[:max]
}

func escapeExpr(s string) string {
	return strings.ReplaceAll(s, `"`, `\"`)
}

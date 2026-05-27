package s3client

import (
	"context"
	"fmt"
	"io"

	awsv2 "github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

// Client wraps the AWS S3 SDK with the minimal surface fileingest needs.
type Client struct {
	api    *s3.Client
	bucket string
}

// New builds an S3 client using static credentials from config.
func New(ctx context.Context, region, accessKeyID, secretAccessKey, bucket string) (*Client, error) {
	cfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion(region),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKeyID, secretAccessKey, "")),
	)
	if err != nil {
		return nil, fmt.Errorf("load aws config: %w", err)
	}
	return &Client{
		api:    s3.NewFromConfig(cfg),
		bucket: bucket,
	}, nil
}

// GetObject downloads the entire object at key. For very large objects the
// caller should use GetObjectStream instead.
func (c *Client) GetObject(ctx context.Context, key string) ([]byte, string, error) {
	out, err := c.api.GetObject(ctx, &s3.GetObjectInput{
		Bucket: awsv2.String(c.bucket),
		Key:    awsv2.String(key),
	})
	if err != nil {
		return nil, "", fmt.Errorf("s3 get %s: %w", key, err)
	}
	defer out.Body.Close()

	data, err := io.ReadAll(out.Body)
	if err != nil {
		return nil, "", fmt.Errorf("read s3 body: %w", err)
	}
	ct := ""
	if out.ContentType != nil {
		ct = *out.ContentType
	}
	return data, ct, nil
}

// Bucket exposes the configured bucket name (used by logs / debug).
func (c *Client) Bucket() string { return c.bucket }

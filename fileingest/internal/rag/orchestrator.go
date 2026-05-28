package rag

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"

	"github.com/elevenpray/fileingest/internal/domain"
	"github.com/elevenpray/fileingest/internal/llm"
)

// Orchestrator combines a retriever with the chat client to answer questions
// grounded in the workspace's ingested documents.
type Orchestrator struct {
	retriever   *Retriever
	milvusRet   *MilvusRetriever
	llm         *llm.Client
}

func NewOrchestrator(retriever *Retriever, milvusRet *MilvusRetriever, client *llm.Client) *Orchestrator {
	return &Orchestrator{retriever: retriever, milvusRet: milvusRet, llm: client}
}

// QueryResult is the structured response returned by /v1/query.
type QueryResult struct {
	Answer   string                  `json:"answer"`
	Citations []domain.RetrievedChunk `json:"citations"`
}

// Answer runs retrieval + generation in non-streaming mode.
func (o *Orchestrator) Answer(
	ctx context.Context,
	workspaceID uuid.UUID,
	documentIDs []uuid.UUID,
	question string,
	topK int,
) (*QueryResult, error) {
	chunks, err := o.retriever.Query(ctx, workspaceID, documentIDs, question, topK)
	if err != nil {
		return nil, err
	}
	prompt := BuildPrompt(question, chunks)
	answer, err := o.llm.Chat(ctx, llm.ChatRequest{Messages: prompt})
	if err != nil {
		return nil, fmt.Errorf("chat: %w", err)
	}
	return &QueryResult{Answer: answer, Citations: chunks}, nil
}

// AnswerByCourseClass runs RAG scoped to Milvus chunks for a course/class pair.
func (o *Orchestrator) AnswerByCourseClass(
	ctx context.Context,
	courseID, classID, question string,
	topK int,
) (*QueryResult, error) {
	if o.milvusRet == nil {
		return nil, fmt.Errorf("milvus retriever not configured")
	}
	chunks, err := o.milvusRet.Query(ctx, courseID, classID, question, topK)
	if err != nil {
		return nil, err
	}
	prompt := BuildPrompt(question, chunks)
	answer, err := o.llm.Chat(ctx, llm.ChatRequest{Messages: prompt})
	if err != nil {
		return nil, fmt.Errorf("chat: %w", err)
	}
	return &QueryResult{Answer: answer, Citations: chunks}, nil
}

// ChatRAGStream retrieves context for the latest user message and streams the
// assistant response via onDelta.
func (o *Orchestrator) ChatRAGStream(
	ctx context.Context,
	workspaceID uuid.UUID,
	documentIDs []uuid.UUID,
	history []llm.ChatMessage,
	topK int,
	onDelta func(string) error,
) ([]domain.RetrievedChunk, error) {
	if len(history) == 0 {
		return nil, fmt.Errorf("no messages")
	}
	lastUser := ""
	for i := len(history) - 1; i >= 0; i-- {
		if history[i].Role == "user" {
			lastUser = history[i].Content
			break
		}
	}
	var chunks []domain.RetrievedChunk
	if lastUser != "" {
		var err error
		chunks, err = o.retriever.Query(ctx, workspaceID, documentIDs, lastUser, topK)
		if err != nil {
			return nil, err
		}
	}
	messages := injectContext(history, chunks)
	if err := o.llm.ChatStream(ctx, llm.ChatRequest{Messages: messages}, onDelta); err != nil {
		return chunks, err
	}
	return chunks, nil
}

// ChatRAGStreamByCourseClass streams a chat response using Milvus course/class context.
func (o *Orchestrator) ChatRAGStreamByCourseClass(
	ctx context.Context,
	courseID, classID string,
	history []llm.ChatMessage,
	topK int,
	onDelta func(string) error,
) ([]domain.RetrievedChunk, error) {
	if o.milvusRet == nil {
		return nil, fmt.Errorf("milvus retriever not configured")
	}
	if len(history) == 0 {
		return nil, fmt.Errorf("no messages")
	}
	lastUser := ""
	for i := len(history) - 1; i >= 0; i-- {
		if history[i].Role == "user" {
			lastUser = history[i].Content
			break
		}
	}
	var chunks []domain.RetrievedChunk
	if lastUser != "" {
		var err error
		chunks, err = o.milvusRet.Query(ctx, courseID, classID, lastUser, topK)
		if err != nil {
			return nil, err
		}
	}
	messages := injectContext(history, chunks)
	if err := o.llm.ChatStream(ctx, llm.ChatRequest{Messages: messages}, onDelta); err != nil {
		return chunks, err
	}
	return chunks, nil
}

// BuildPrompt produces a single system+user prompt pair for /v1/query.
func BuildPrompt(question string, chunks []domain.RetrievedChunk) []llm.ChatMessage {
	system := "You are a helpful assistant for the ElevenPray app. " +
		"Answer the user's question using ONLY the provided context excerpts. " +
		"If the context is insufficient, say so plainly. " +
		"Cite sources by their bracketed index, e.g. [1], [2]."

	var sb strings.Builder
	sb.WriteString("Context:\n")
	for i, c := range chunks {
		fmt.Fprintf(&sb, "[%d] (%s)\n%s\n\n", i+1, c.DocumentFilename, c.Content)
	}
	sb.WriteString("\nQuestion: ")
	sb.WriteString(question)

	return []llm.ChatMessage{
		{Role: "system", Content: system},
		{Role: "user", Content: sb.String()},
	}
}

// injectContext prepends a system message that exposes retrieved chunks so the
// model can ground its streamed answer.
func injectContext(history []llm.ChatMessage, chunks []domain.RetrievedChunk) []llm.ChatMessage {
	systemMsg := "You are a helpful assistant for the ElevenPray app. " +
		"Use the following context when relevant. Cite sources as [1], [2] when you use them.\n\n"
	if len(chunks) > 0 {
		var sb strings.Builder
		sb.WriteString(systemMsg)
		sb.WriteString("Context:\n")
		for i, c := range chunks {
			fmt.Fprintf(&sb, "[%d] (%s)\n%s\n\n", i+1, c.DocumentFilename, c.Content)
		}
		systemMsg = sb.String()
	}

	out := make([]llm.ChatMessage, 0, len(history)+1)
	out = append(out, llm.ChatMessage{Role: "system", Content: systemMsg})
	// If the caller already provided their own system message, append it after
	// ours so it can override behavior.
	out = append(out, history...)
	return out
}

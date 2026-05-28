import { getAuthHeaders, getBaseUrl } from "./api";
import { uploadToS3 } from "./community-api";

const baseStudyAi = (workspaceId: string) =>
  `${getBaseUrl()}/study-university/workspaces/${workspaceId}/study-ai`;

export interface StudyPdfDocumentDto {
  id: string;
  documentId: string;
  fileingestDocumentId: string;
  courseId: string;
  filename: string;
  status: string;
  summaryText?: string | null;
  totalChunks?: number | null;
  error?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PresignStudyPdfResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

export interface StudyChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

async function studyJson<T>(
  token: string,
  workspaceId: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${baseStudyAi(workspaceId)}${path}`, {
    ...init,
    headers: {
      ...getAuthHeaders(token),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ??
        (err as { error?: string }).error ??
        `Error ${res.status}`,
    );
  }
  return res.json() as Promise<T>;
}

export async function presignStudyPdf(
  token: string,
  workspaceId: string,
  contentType: string,
): Promise<PresignStudyPdfResponse> {
  return studyJson(token, workspaceId, "/documents/presign", {
    method: "POST",
    body: JSON.stringify({ contentType }),
  });
}

export async function ingestStudyPdf(
  token: string,
  workspaceId: string,
  payload: { s3Key: string; filename: string; mimeType?: string },
): Promise<StudyPdfDocumentDto> {
  return studyJson(token, workspaceId, "/documents/ingest", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listStudyDocuments(
  token: string,
  workspaceId: string,
): Promise<StudyPdfDocumentDto[]> {
  return studyJson(token, workspaceId, "/documents");
}

export async function getStudyDocumentStatus(
  token: string,
  workspaceId: string,
  documentId: string,
): Promise<StudyPdfDocumentDto> {
  return studyJson(token, workspaceId, `/documents/${documentId}/status`);
}

export async function uploadStudyPdf(
  token: string,
  workspaceId: string,
  file: File,
  mimeType?: string,
): Promise<StudyPdfDocumentDto> {
  const mime = mimeType || file.type || "application/pdf";
  const presign = await presignStudyPdf(token, workspaceId, mime);
  await uploadToS3(presign.uploadUrl, file);
  return ingestStudyPdf(token, workspaceId, {
    s3Key: presign.key,
    filename: file.name,
    mimeType: mime,
  });
}

export type GenerateStudyType = "flashcards" | "quiz" | "summary";

export async function generateStudyContent(
  token: string,
  workspaceId: string,
  documentId: string,
  type: GenerateStudyType,
): Promise<unknown> {
  return studyJson(token, workspaceId, "/generate", {
    method: "POST",
    body: JSON.stringify({ documentId, type }),
  });
}

export interface StudyChatStreamCallbacks {
  onDelta: (content: string) => void;
  onDone?: () => void;
  onError?: (message: string) => void;
}

function parseSseChunk(
  block: string,
  callbacks: StudyChatStreamCallbacks,
): void {
  let event = "message";
  let data = "";
  for (const line of block.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) data = line.slice(5).trim();
  }
  if (!data) return;
  if (event === "delta") {
    try {
      const parsed = JSON.parse(data) as { content?: string };
      if (parsed.content) callbacks.onDelta(parsed.content);
    } catch {
      /* ignore malformed */
    }
  } else if (event === "error") {
    try {
      const parsed = JSON.parse(data) as { error?: string };
      callbacks.onError?.(parsed.error ?? data);
    } catch {
      callbacks.onError?.(data);
    }
  } else if (event === "done") {
    callbacks.onDone?.();
  }
}

export async function streamStudyChat(
  token: string,
  workspaceId: string,
  body: {
    documentId: string;
    messages: StudyChatMessage[];
    ragEnabled?: boolean;
  },
  callbacks: StudyChatStreamCallbacks,
): Promise<void> {
  const res = await fetch(`${baseStudyAi(workspaceId)}/chat`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({
      documentId: body.documentId,
      messages: body.messages,
      ragEnabled: body.ragEnabled !== false,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ??
        (err as { error?: string }).error ??
        `Chat error ${res.status}`,
    );
  }

  if (!res.body) {
    throw new Error("Empty chat stream");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      if (part.trim()) parseSseChunk(part, callbacks);
    }
  }
  if (buffer.trim()) parseSseChunk(buffer, callbacks);
  callbacks.onDone?.();
}

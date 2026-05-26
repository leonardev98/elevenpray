import { getAuthHeaders, getBaseUrl } from "./api";

export type CommunityPostType = "apunte" | "plantilla" | "pdf";

export type CommunityReportTargetType =
  | "post"
  | "question"
  | "answer"
  | "comment";

export interface CommunityAuthor {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface CommunityPostDto {
  id: string;
  type: CommunityPostType;
  title: string;
  body: string | null;
  course: string | null;
  university: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  attachmentSizeBytes: number | null;
  attachmentMime: string | null;
  likeCount: number;
  commentCount: number;
  liked: boolean;
  createdAt: string;
  updatedAt: string;
  author: CommunityAuthor;
}

export interface CommunityCommentDto {
  id: string;
  postId: string;
  parentId: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: CommunityAuthor;
  replies: CommunityCommentDto[];
}

export interface CommunityAnswerDto {
  id: string;
  questionId: string;
  parentId: string | null;
  body: string;
  upvoteCount: number;
  upvoted: boolean;
  createdAt: string;
  updatedAt: string;
  author: CommunityAuthor;
  replies: CommunityAnswerDto[];
}

export interface CommunityQuestionDto {
  id: string;
  title: string;
  body: string | null;
  course: string | null;
  university: string | null;
  viewCount: number;
  answerCount: number;
  acceptedAnswerId: string | null;
  createdAt: string;
  updatedAt: string;
  author: CommunityAuthor;
  answers?: CommunityAnswerDto[];
}

export interface CreatePostInput {
  type: CommunityPostType;
  title: string;
  body?: string;
  course?: string;
  university?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSizeBytes?: number;
  attachmentMime?: string;
}

export interface UpdatePostInput {
  title?: string;
  body?: string;
  course?: string;
  university?: string;
}

export interface CreateQuestionInput {
  title: string;
  body?: string;
  course?: string;
  university?: string;
}

export interface UpdateQuestionInput {
  title?: string;
  body?: string;
  course?: string;
  university?: string;
}

export interface CreateCommentInput {
  body: string;
  parentId?: string;
}

export interface CreateAnswerInput {
  body: string;
  parentId?: string;
}

export interface CreateReportInput {
  targetType: CommunityReportTargetType;
  targetId: string;
  reason: string;
  details?: string;
}

export interface PresignAttachmentResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

async function request<T>(
  token: string | null,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...getAuthHeaders(token),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Error en ${path}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ---------- posts ----------

export function listPosts(
  token: string | null,
  opts: { university?: string; course?: string; limit?: number; offset?: number } = {},
): Promise<CommunityPostDto[]> {
  const qs = new URLSearchParams();
  if (opts.university) qs.set("university", opts.university);
  if (opts.course) qs.set("course", opts.course);
  if (opts.limit) qs.set("limit", String(opts.limit));
  if (opts.offset) qs.set("offset", String(opts.offset));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return request(token, `/community/posts${suffix}`);
}

export function getPost(token: string | null, id: string): Promise<CommunityPostDto> {
  return request(token, `/community/posts/${id}`);
}

export function createPost(
  token: string | null,
  input: CreatePostInput,
): Promise<CommunityPostDto> {
  return request(token, `/community/posts`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updatePost(
  token: string | null,
  id: string,
  input: UpdatePostInput,
): Promise<CommunityPostDto> {
  return request(token, `/community/posts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deletePost(token: string | null, id: string): Promise<{ success: true }> {
  return request(token, `/community/posts/${id}`, { method: "DELETE" });
}

// ---------- likes ----------

export function likePost(
  token: string | null,
  id: string,
): Promise<{ liked: boolean; likeCount: number }> {
  return request(token, `/community/posts/${id}/like`, { method: "POST" });
}

export function unlikePost(
  token: string | null,
  id: string,
): Promise<{ liked: boolean; likeCount: number }> {
  return request(token, `/community/posts/${id}/like`, { method: "DELETE" });
}

// ---------- comments ----------

export function listComments(
  token: string | null,
  postId: string,
): Promise<CommunityCommentDto[]> {
  return request(token, `/community/posts/${postId}/comments`);
}

export function createComment(
  token: string | null,
  postId: string,
  input: CreateCommentInput,
): Promise<CommunityCommentDto> {
  return request(token, `/community/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateComment(
  token: string | null,
  id: string,
  body: string,
): Promise<CommunityCommentDto> {
  return request(token, `/community/comments/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ body }),
  });
}

export function deleteComment(token: string | null, id: string): Promise<{ success: true }> {
  return request(token, `/community/comments/${id}`, { method: "DELETE" });
}

// ---------- attachments ----------

export function presignAttachment(
  token: string | null,
  contentType: string,
  filename?: string,
): Promise<PresignAttachmentResponse> {
  return request(token, `/community/attachments/presign`, {
    method: "POST",
    body: JSON.stringify({ contentType, filename }),
  });
}

export async function uploadToS3(
  uploadUrl: string,
  file: File,
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) {
    throw new Error("Error al subir el archivo");
  }
}

// ---------- questions ----------

export function listQuestions(
  token: string | null,
  opts: {
    filter?: "all" | "unanswered" | "top" | "week";
    university?: string;
    course?: string;
    limit?: number;
    offset?: number;
  } = {},
): Promise<CommunityQuestionDto[]> {
  const qs = new URLSearchParams();
  if (opts.filter) qs.set("filter", opts.filter);
  if (opts.university) qs.set("university", opts.university);
  if (opts.course) qs.set("course", opts.course);
  if (opts.limit) qs.set("limit", String(opts.limit));
  if (opts.offset) qs.set("offset", String(opts.offset));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return request(token, `/community/questions${suffix}`);
}

export function getQuestion(
  token: string | null,
  id: string,
): Promise<CommunityQuestionDto> {
  return request(token, `/community/questions/${id}`);
}

export function createQuestion(
  token: string | null,
  input: CreateQuestionInput,
): Promise<CommunityQuestionDto> {
  return request(token, `/community/questions`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateQuestion(
  token: string | null,
  id: string,
  input: UpdateQuestionInput,
): Promise<CommunityQuestionDto> {
  return request(token, `/community/questions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteQuestion(
  token: string | null,
  id: string,
): Promise<{ success: true }> {
  return request(token, `/community/questions/${id}`, { method: "DELETE" });
}

// ---------- answers ----------

export function createAnswer(
  token: string | null,
  questionId: string,
  input: CreateAnswerInput,
): Promise<CommunityAnswerDto> {
  return request(token, `/community/questions/${questionId}/answers`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateAnswer(
  token: string | null,
  id: string,
  body: string,
): Promise<CommunityAnswerDto> {
  return request(token, `/community/answers/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ body }),
  });
}

export function deleteAnswer(token: string | null, id: string): Promise<{ success: true }> {
  return request(token, `/community/answers/${id}`, { method: "DELETE" });
}

export function voteAnswer(
  token: string | null,
  id: string,
): Promise<{ upvoted: boolean; upvoteCount: number }> {
  return request(token, `/community/answers/${id}/vote`, { method: "POST" });
}

export function unvoteAnswer(
  token: string | null,
  id: string,
): Promise<{ upvoted: boolean; upvoteCount: number }> {
  return request(token, `/community/answers/${id}/vote`, { method: "DELETE" });
}

export function acceptAnswer(
  token: string | null,
  questionId: string,
  answerId: string,
): Promise<{ acceptedAnswerId: string }> {
  return request(token, `/community/questions/${questionId}/accept-answer`, {
    method: "POST",
    body: JSON.stringify({ answerId }),
  });
}

// ---------- reports ----------

export function createReport(
  token: string | null,
  input: CreateReportInput,
): Promise<{ id: string }> {
  return request(token, `/community/reports`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

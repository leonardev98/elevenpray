export const STUDY_UPLOAD_ACCEPT =
  "application/pdf,text/plain,text/markdown,.md,.txt,.docx,.pptx,.xlsx," +
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document," +
  "application/vnd.openxmlformats-officedocument.presentationml.presentation," +
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export const STUDY_UPLOAD_MIME_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

const EXTENSION_MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export function isStudyUploadMime(type: string, filename?: string): boolean {
  if (STUDY_UPLOAD_MIME_TYPES.has(type)) return true;
  if (filename) {
    const ext = extensionOf(filename);
    if (ext && EXTENSION_MIME[ext]) return true;
  }
  return false;
}

function extensionOf(filename: string): string {
  const name = filename.toLowerCase();
  const i = name.lastIndexOf(".");
  if (i < 0) return "";
  return name.slice(i);
}

export function defaultMimeForStudyFile(file: File): string {
  if (file.type && file.type !== "application/octet-stream") return file.type;
  const ext = extensionOf(file.name);
  return EXTENSION_MIME[ext] ?? "application/pdf";
}

export const STUDY_PROCESSING_STATUSES = new Set([
  "pending",
  "extracting",
  "embedding",
]);

export function isStudyDocumentProcessing(status: string): boolean {
  return STUDY_PROCESSING_STATUSES.has(status);
}

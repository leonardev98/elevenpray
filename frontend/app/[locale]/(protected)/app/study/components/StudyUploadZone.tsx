"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { FileUp, Loader2 } from "lucide-react";
import type { StudyPdfDocumentDto } from "@/app/lib/study-ai-api";
import { cn } from "@/lib/utils";
import { STUDY_UPLOAD_ACCEPT, isStudyDocumentProcessing } from "../lib/study-document-types";

interface StudyUploadZoneProps {
  uploading: boolean;
  documentProcessing?: boolean;
  documents: StudyPdfDocumentDto[];
  activeDocumentId: string | null;
  onSelect: (doc: StudyPdfDocumentDto) => void;
  onUpload: (file: File) => void;
  disabled?: boolean;
}

function statusLabel(t: ReturnType<typeof useTranslations>, status: string): string {
  switch (status) {
    case "pending":
      return t("status_pending");
    case "extracting":
      return t("status_extracting");
    case "embedding":
      return t("status_embedding");
    case "ready":
      return t("status_ready");
    case "failed":
      return t("status_failed");
    default:
      return status;
  }
}

export function StudyUploadZone({
  uploading,
  documentProcessing,
  documents,
  activeDocumentId,
  onSelect,
  onUpload,
  disabled,
}: StudyUploadZoneProps) {
  const t = useTranslations("studentStudy");
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="student-card mb-6 p-6">
      <button
        type="button"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-[var(--app-border)] p-8 transition-colors",
          !disabled && !uploading && "hover:border-[var(--app-primary)] hover:bg-[var(--app-surface-soft)]",
          (disabled || uploading) && "cursor-not-allowed opacity-70",
        )}
      >
        {uploading ? (
          <Loader2 className="mb-3 h-10 w-10 animate-spin text-[var(--app-primary)]" />
        ) : (
          <FileUp className="mb-3 h-10 w-10 text-[var(--app-fg-muted)]" aria-hidden />
        )}
        <p className="font-medium text-[var(--app-fg)]">{t("uploadTitle")}</p>
        <p className="mt-1 text-center text-sm text-[var(--app-fg-secondary)]">{t("uploadDesc")}</p>
        {(uploading || documentProcessing) && (
          <p className="mt-3 text-sm text-[var(--app-primary)]">
            {uploading ? t("uploadUploading") : t("uploadProcessing")}
          </p>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={STUDY_UPLOAD_ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = "";
        }}
      />

      {documents.length > 0 && (
        <ul className="mt-4 space-y-2">
          {documents.map((doc) => (
            <li key={doc.id}>
              <button
                type="button"
                onClick={() => onSelect(doc)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  doc.id === activeDocumentId
                    ? "bg-[var(--app-primary-soft)] text-[var(--app-fg)]"
                    : "bg-[var(--app-surface-soft)] text-[var(--app-fg-secondary)] hover:bg-[var(--app-surface-elevated)]",
                )}
              >
                <span className="truncate font-medium">{doc.filename}</span>
                <span
                  className={cn(
                    "ml-2 shrink-0 text-xs",
                    doc.status === "ready" && "text-emerald-600 dark:text-emerald-400",
                    doc.status === "failed" && "text-red-600 dark:text-red-400",
                    isStudyDocumentProcessing(doc.status) && "text-[var(--app-primary)]",
                  )}
                >
                  {isStudyDocumentProcessing(doc.status) && doc.id === activeDocumentId ? (
                    <Loader2 className="inline h-3 w-3 animate-spin" aria-hidden />
                  ) : null}{" "}
                  {statusLabel(t, doc.status)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { FileUp, Loader2 } from "lucide-react";
import type { StudyPdfDocumentDto } from "@/app/lib/study-ai-api";
import { cn } from "@/lib/utils";

interface StudyUploadZoneProps {
  uploading: boolean;
  documents: StudyPdfDocumentDto[];
  activeDocumentId: string | null;
  onSelect: (doc: StudyPdfDocumentDto) => void;
  onUpload: (file: File) => void;
  disabled?: boolean;
}

export function StudyUploadZone({
  uploading,
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
        {uploading && (
          <p className="mt-3 text-sm text-[var(--app-primary)]">{t("uploadProcessing")}</p>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
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
                <span className="ml-2 shrink-0 text-xs capitalize">{doc.status}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

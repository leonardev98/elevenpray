"use client";

import { Download, File, FileText, Image as ImageIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { courseHex } from "../course-detail-utils";
import type { MockCourseExtended, MockCourseFile } from "../../../../lib/mock-course-data";

interface ArchivosTabProps {
  course: MockCourseExtended;
  files: MockCourseFile[];
}

function FileBigIcon({ type }: { type: MockCourseFile["type"] }) {
  if (type === "pdf") return <FileText className="h-10 w-10 text-[var(--error)]" aria-hidden />;
  if (type === "image") return <ImageIcon className="h-10 w-10 text-[var(--course-3-fg)]" aria-hidden />;
  return <File className="h-10 w-10 text-[var(--text-muted)]" aria-hidden />;
}

export function ArchivosTab({ course, files }: ArchivosTabProps) {
  const hex = courseHex(course);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Archivos del curso</h2>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border-[0.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Subir archivo
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {files.map((file) => (
          <div
            key={file.id}
            className={cn(
              "flex flex-col rounded-[var(--radius-lg)] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-4 transition-all duration-150",
              "hover:-translate-y-0.5 hover:border-l-[3px]",
            )}
            style={{ borderLeftColor: hex }}
          >
            <div className="mb-3 flex justify-center">
              <FileBigIcon type={file.type} />
            </div>
            <p className="truncate text-center text-sm font-semibold text-[var(--text-primary)]">{file.name}</p>
            <p className="mt-1 text-center text-xs text-[var(--text-muted)]">
              {file.size} · {file.uploadedAt}
            </p>
            {file.classLabel ? (
              <span className="mt-3 self-center rounded-full bg-[var(--bg-input)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
                {file.classLabel}
              </span>
            ) : null}
            <button
              type="button"
              className="mt-4 inline-flex items-center justify-center gap-1 rounded-[var(--radius-md)] border-[0.5px] border-[var(--border-strong)] py-2 text-xs text-[var(--text-body)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
            >
              <Download className="h-3.5 w-3.5" aria-hidden />
              Descargar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

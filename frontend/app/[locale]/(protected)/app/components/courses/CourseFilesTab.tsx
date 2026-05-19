"use client";

import { FileImage, FileText, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { MockCourseFile } from "../../lib/mock-course-data";

interface CourseFilesTabProps {
  files: MockCourseFile[];
}

export function CourseFilesTab({ files }: CourseFilesTabProps) {
  const t = useTranslations("studentCourses");

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm font-medium text-[var(--app-fg)] transition hover:border-[var(--app-primary)]/40"
        >
          <Plus className="h-4 w-4" />
          {t("uploadFile")}
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="student-card flex items-center gap-3 p-4"
          >
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                file.type === "pdf"
                  ? "bg-red-500/15 text-red-400"
                  : "bg-sky-500/15 text-sky-400",
              )}
            >
              {file.type === "pdf" ? (
                <FileText className="h-5 w-5" />
              ) : (
                <FileImage className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[var(--app-fg)]">
                {file.name}
              </p>
              <p className="text-xs text-[var(--app-fg-muted)]">
                {file.size} · {file.uploadedAt}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

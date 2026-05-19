"use client";

import { MoreHorizontal, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import type { MockCourseNote } from "../../lib/mock-course-data";

interface CourseNotesTabProps {
  notes: MockCourseNote[];
  onSelectNote: (noteId: string) => void;
}

export function CourseNotesTab({ notes, onSelectNote }: CourseNotesTabProps) {
  const t = useTranslations("studentCourses");

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm font-medium text-[var(--app-fg)] transition hover:border-[var(--app-primary)]/40"
        >
          <Plus className="h-4 w-4" />
          {t("newNote")}
        </button>
      </div>
      <ul className="space-y-3">
        {notes.map((note) => (
          <li key={note.id}>
            <button
              type="button"
              onClick={() => onSelectNote(note.id)}
              className="student-card flex w-full items-start gap-3 p-4 text-left transition hover:border-[var(--app-primary)]/30"
            >
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-[var(--app-fg)]">{note.title}</h3>
                <p className="mt-0.5 text-xs text-[var(--app-fg-muted)]">{note.dateLabel}</p>
                <p className="mt-2 line-clamp-2 text-sm text-[var(--app-fg-secondary)]">
                  {note.preview}
                </p>
              </div>
              <span
                className="shrink-0 rounded-lg p-1.5 text-[var(--app-fg-muted)]"
                aria-hidden
              >
                <MoreHorizontal className="h-4 w-4" />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

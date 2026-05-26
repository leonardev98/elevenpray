"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Clock, MoreHorizontal, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { courseHex } from "../course-detail-utils";
import type { MockCourseExtended, MockCourseNote } from "../../../../lib/mock-course-data";

interface ApuntesTabProps {
  course: MockCourseExtended;
  notes: MockCourseNote[];
  selectedNoteId: string | null;
  onSelectNote: (id: string | null) => void;
}

export function ApuntesTab({ course, notes, selectedNoteId, onSelectNote }: ApuntesTabProps) {
  const hex = courseHex(course);
  const selected = notes.find((n) => n.id === selectedNoteId) ?? null;
  const [editTitle, setEditTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  useEffect(() => {
    if (selected) setTitleDraft(selected.title);
  }, [selected]);

  function openNote(n: MockCourseNote) {
    setEditTitle(false);
    setTitleDraft(n.title);
    onSelectNote(n.id);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Apuntes</h2>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-[var(--radius-md)] bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-[var(--accent-fg)] hover:bg-[var(--accent-hover)]"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Nueva nota
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="mb-4 h-14 w-14 text-[var(--text-muted)]" aria-hidden />
          <p className="text-[var(--text-primary)]">Aún no tienes apuntes en este curso</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Crea tu primera nota para empezar</p>
          <button
            type="button"
            className="mt-6 inline-flex items-center gap-1 rounded-[var(--radius-md)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] hover:bg-[var(--accent-hover)]"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Nueva nota
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li key={note.id}>
              <button
                type="button"
                onClick={() => openNote(note)}
                className={cn(
                  "group flex w-full flex-col rounded-[var(--radius-lg)] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-4 text-left transition-all duration-150",
                  "border-l-[3px] hover:-translate-y-px hover:bg-[var(--bg-elevated)]",
                )}
                style={{ borderLeftColor: hex }}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-[var(--text-primary)]">{note.title}</h3>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-[var(--text-muted)]">{note.dateLabel}</span>
                    <MoreHorizontal className="h-4 w-4 text-[var(--text-muted)]" aria-hidden />
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-[var(--text-body)]">{note.preview}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                  {note.classLabel ? (
                    <span className="rounded-full bg-[var(--bg-input)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
                      {note.classLabel}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" aria-hidden />
                    {note.readMinutes ?? 5} min lectura
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <AnimatePresence>
        {selected && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[200] bg-black/50"
              aria-label="Cerrar"
              onClick={() => onSelectNote(null)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed right-0 top-0 z-[210] flex h-full w-full flex-col border-l-[0.5px] border-[var(--border)] bg-[var(--bg-elevated)] shadow-[var(--shadow-md)] sm:w-[40%] sm:min-w-[320px] sm:max-w-[560px]"
            >
              <div className="flex items-start justify-between gap-2 border-b-[0.5px] border-[var(--border)] px-4 py-3">
                {editTitle ? (
                  <input
                    autoFocus
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    onBlur={() => setEditTitle(false)}
                    className="min-w-0 flex-1 border-0 bg-transparent text-lg font-semibold text-[var(--text-primary)] outline-none"
                  />
                ) : (
                  <button
                    type="button"
                    className="min-w-0 flex-1 truncate text-left text-lg font-semibold text-[var(--text-primary)]"
                    onClick={() => {
                      setTitleDraft(selected.title);
                      setEditTitle(true);
                    }}
                  >
                    {titleDraft || selected.title}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onSelectNote(null)}
                  className="shrink-0 rounded-[var(--radius-md)] p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]"
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <textarea
                key={selected.id}
                defaultValue={selected.body}
                placeholder="Escribe tu apunte aquí..."
                className="min-h-[240px] flex-1 resize-none border-0 bg-[var(--bg-elevated)] px-4 py-4 text-sm leading-relaxed text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 border-t-[0.5px] border-[var(--border)] px-4 py-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                  {selected.classLabel ? (
                    <span className="rounded-full bg-[var(--bg-input)] px-2 py-0.5 text-[10px]">{selected.classLabel}</span>
                  ) : null}
                  <span>{selected.dateLabel}</span>
                </div>
                <button
                  type="button"
                  className="rounded-[var(--radius-md)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] hover:bg-[var(--accent-hover)]"
                >
                  Guardar
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

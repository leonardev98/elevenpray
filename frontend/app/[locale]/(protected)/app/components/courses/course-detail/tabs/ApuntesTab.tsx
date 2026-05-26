"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Clock,
  FlaskConical,
  Lightbulb,
  NotebookPen,
  Pin,
  Plus,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { courseHex } from "../course-detail-utils";
import type { MockCourseExtended } from "../../../../lib/mock-course-data";
import {
  relativeTimeFromNow,
  useCourseNotes,
  useCourseNotesStore,
  type CourseNote,
  type CourseNoteIcon,
} from "../../../../lib/course-notes-store";
import { NoteEditor } from "../editor/NoteEditor";

interface ApuntesTabProps {
  course: MockCourseExtended;
  /** Si se quiere preseleccionar una nota desde fuera. */
  selectedNoteId: string | null;
  onSelectNote: (id: string | null) => void;
}

function NoteIconGlyph({ name, className }: { name: CourseNoteIcon; className?: string }) {
  switch (name) {
    case "lightbulb":
      return <Lightbulb className={className} aria-hidden />;
    case "pin":
      return <Pin className={className} aria-hidden />;
    case "target":
      return <Target className={className} aria-hidden />;
    case "sparkles":
      return <Sparkles className={className} aria-hidden />;
    case "flask":
      return <FlaskConical className={className} aria-hidden />;
    case "book":
    default:
      return <BookOpen className={className} aria-hidden />;
  }
}

export function ApuntesTab({ course, selectedNoteId, onSelectNote }: ApuntesTabProps) {
  const hex = courseHex(course);
  const notes = useCourseNotes(course.id);
  const createNote = useCourseNotesStore((s) => s.createNote);
  const updateNote = useCourseNotesStore((s) => s.updateNote);
  const deleteNote = useCourseNotesStore((s) => s.deleteNote);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) => n.title.toLowerCase().includes(q) || n.preview.toLowerCase().includes(q),
    );
  }, [notes, query]);

  const selectedNote: CourseNote | null = useMemo(() => {
    if (!selectedNoteId) return null;
    return notes.find((n) => n.id === selectedNoteId) ?? null;
  }, [notes, selectedNoteId]);

  function handleCreate() {
    const note = createNote(course.id, {
      title: "Nota sin título",
      colorAccent: hex,
      icon: "book",
    });
    onSelectNote(note.id);
  }

  function handleDelete(noteId: string) {
    deleteNote(noteId);
    onSelectNote(null);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Apuntes</h2>
          <p className="mt-1 text-[11px] text-[var(--text-muted)]">
            {notes.length === 0
              ? "Crea tu primer apunte para este curso"
              : `${notes.length} ${notes.length === 1 ? "apunte" : "apuntes"} guardado${notes.length === 1 ? "" : "s"} localmente`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search
              className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en apuntes…"
              className="w-56 rounded-md border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] py-1.5 pl-7 pr-3 text-xs text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)]"
            />
          </div>
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center gap-1 rounded-[var(--radius-md)] bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-[var(--accent-fg)] transition-colors hover:bg-[var(--accent-hover)]"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Nueva nota
          </button>
        </div>
      </div>

      {notes.length === 0 ? (
        <EmptyState onCreate={handleCreate} hex={hex} />
      ) : filtered.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border-[0.5px] border-dashed border-[var(--border)] bg-[var(--bg-surface)] p-8 text-center">
          <p className="text-sm text-[var(--text-muted)]">No encontramos apuntes con “{query}”.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              accentHex={note.colorAccent ?? hex}
              onClick={() => onSelectNote(note.id)}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedNote ? (
          <NoteEditor
            key={selectedNote.id}
            noteId={selectedNote.id}
            title={selectedNote.title}
            contentJson={selectedNote.contentJson}
            accentHex={selectedNote.colorAccent ?? hex}
            meta={{
              classLabel: selectedNote.classLabel,
              dateText: relativeTimeFromNow(selectedNote.updatedAt),
            }}
            onTitleChange={(next) => updateNote(selectedNote.id, { title: next })}
            onContentChange={(next) => updateNote(selectedNote.id, { contentJson: next })}
            onClose={() => onSelectNote(null)}
            onDelete={() => handleDelete(selectedNote.id)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function NoteCard({
  note,
  accentHex,
  onClick,
}: {
  note: CourseNote;
  accentHex: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      layout
      onClick={onClick}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "group relative flex flex-col items-stretch overflow-hidden rounded-[var(--radius-lg)] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-4 text-left transition-colors",
        "hover:bg-[var(--bg-elevated)] hover:border-[var(--border-strong)]",
      )}
    >
      <span
        className="absolute left-0 top-0 h-full w-[3px]"
        style={{ backgroundColor: accentHex }}
        aria-hidden
      />

      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
            style={{
              backgroundColor: `color-mix(in srgb, ${accentHex} 14%, transparent)`,
              color: accentHex,
            }}
          >
            <NoteIconGlyph name={note.icon} className="h-3.5 w-3.5" />
          </span>
          <h3 className="truncate text-sm font-semibold text-[var(--text-primary)]">{note.title}</h3>
        </div>
      </div>

      <p className="mt-3 line-clamp-3 min-h-[3.6rem] text-xs leading-relaxed text-[var(--text-body)]">
        {note.preview || "Sin contenido todavía."}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] text-[var(--text-muted)]">
        {note.classLabel ? (
          <span className="rounded-full bg-[var(--bg-input)] px-2 py-0.5">{note.classLabel}</span>
        ) : null}
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" aria-hidden />
          {note.readMinutes} min lectura
        </span>
        <span className="ml-auto text-[var(--text-muted)]">{relativeTimeFromNow(note.updatedAt)}</span>
      </div>
    </motion.button>
  );
}

function EmptyState({ onCreate, hex }: { onCreate: () => void; hex: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border-[0.5px] border-dashed border-[var(--border)] bg-[var(--bg-surface)] px-6 py-16 text-center">
      <span
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          backgroundColor: `color-mix(in srgb, ${hex} 14%, transparent)`,
          color: hex,
        }}
      >
        <NotebookPen className="h-6 w-6" aria-hidden />
      </span>
      <p className="text-[var(--text-primary)]">Aún no tienes apuntes en este curso</p>
      <p className="mt-1 max-w-[26ch] text-xs text-[var(--text-muted)]">
        Crea tu primera nota: usa títulos, listas, callouts y checklists para estructurar tus apuntes.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-6 inline-flex items-center gap-1 rounded-[var(--radius-md)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] transition-colors hover:bg-[var(--accent-hover)]"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Nueva nota
      </button>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import type { Assignment, ClassSession, Course } from "@/app/lib/study-university/types";

function normalizeTime(value: string): string {
  const [h = "09", m = "00"] = String(value).split(":");
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function ClassSessionDetailModal({
  open,
  session,
  course,
  assignments,
  onClose,
  onSaveNotes,
  onUpdateSession,
}: {
  open: boolean;
  session: ClassSession | null;
  course: Course | null;
  assignments: Assignment[];
  onClose: () => void;
  onSaveNotes: (payload: { notesHtml?: string; aiSummaryMock?: string }) => Promise<void>;
  onUpdateSession?: (payload: { sessionDate: string; startTime: string; endTime: string; classroom?: string }) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [summary, setSummary] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editClassroom, setEditClassroom] = useState("");
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: session?.notesHtml ?? "<p>Apuntes de clase...</p>",
    editorProps: {
      attributes: {
        class:
          "min-h-[220px] rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4 text-sm outline-none",
      },
    },
  });

  useEffect(() => {
    if (!editor || !session) return;
    editor.commands.setContent(session.notesHtml ?? "<p>Apuntes de clase...</p>");
    setSummary(session.aiSummaryMock ?? "");
  }, [editor, session]);

  useEffect(() => {
    if (!session) return;
    setEditDate(session.sessionDate);
    setEditStartTime(normalizeTime(session.startTime));
    setEditEndTime(normalizeTime(session.endTime));
    setEditClassroom(session.classroom ?? "");
    setScheduleError(null);
  }, [session]);

  const title = useMemo(
    () => `${course?.name ?? "Class session"} · ${session?.sessionDate ?? ""}`,
    [course?.name, session?.sessionDate],
  );

  if (!open || !session) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div
          className="w-full max-w-5xl rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-xl"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--app-fg)]/50">Class Session</p>
              <h3 className="text-xl font-semibold text-[var(--app-fg)]">{title}</h3>
            </div>
            <Button variant="outline" onClick={onClose}>Cerrar</Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-fg)]/55">Editor de notas</p>
              <EditorContent editor={editor} />
              <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-3">
                <p className="mb-2 text-xs uppercase tracking-[0.12em] text-[var(--app-fg)]/55">Resumen IA mock</p>
                <textarea
                  className="min-h-[90px] w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-2 text-sm"
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  placeholder="Resumen automático de la sesión..."
                />
              </div>
            </div>

            <div className="space-y-3">
              {onUpdateSession && (
                <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-3">
                  <p className="mb-3 text-xs uppercase tracking-[0.12em] text-[var(--app-fg)]/55">Editar horario</p>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--app-fg)]/60">Fecha</label>
                      <DatePicker value={editDate} onChange={setEditDate} className="w-full" placeholder="Seleccionar fecha" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <TimePicker label="Inicio" value={editStartTime} onChange={setEditStartTime} className="w-full" />
                      </div>
                      <div>
                        <TimePicker
                          label="Fin"
                          value={editEndTime}
                          onChange={setEditEndTime}
                          className="w-full"
                          isInvalid={editStartTime >= editEndTime}
                        />
                      </div>
                    </div>
                    {editStartTime >= editEndTime && (
                      <p className="text-[11px] text-destructive">La hora de fin debe ser posterior a la de inicio.</p>
                    )}
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--app-fg)]/60">Aula</label>
                      <input
                        type="text"
                        className="h-10 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-sm text-[var(--app-fg)] transition focus:border-[var(--app-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]/15"
                        placeholder="Ej. B201"
                        value={editClassroom}
                        onChange={(e) => setEditClassroom(e.target.value)}
                      />
                    </div>
                    {scheduleError && <p className="text-[11px] text-destructive">{scheduleError}</p>}
                    <Button
                      size="sm"
                      disabled={savingSchedule || editStartTime >= editEndTime || !editDate}
                      onClick={async () => {
                        setScheduleError(null);
                        setSavingSchedule(true);
                        try {
                          await onUpdateSession({
                            sessionDate: editDate,
                            startTime: `${editStartTime}:00`,
                            endTime: `${editEndTime}:00`,
                            classroom: editClassroom.trim() || undefined,
                          });
                        } catch (err) {
                          setScheduleError(err instanceof Error ? err.message : "Error al guardar");
                        } finally {
                          setSavingSchedule(false);
                        }
                      }}
                    >
                      {savingSchedule ? "Guardando..." : "Guardar horario"}
                    </Button>
                  </div>
                </div>
              )}
              <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-3">
                <p className="mb-2 text-xs uppercase tracking-[0.12em] text-[var(--app-fg)]/55">Tareas asociadas</p>
                <ul className="space-y-2 text-sm">
                  {assignments.length > 0 ? (
                    assignments.map((assignment) => (
                      <li key={assignment.id} className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1.5">
                        {assignment.title}
                      </li>
                    ))
                  ) : (
                    <li className="text-[var(--app-fg)]/60">Sin tareas asociadas</li>
                  )}
                </ul>
              </div>
              <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--app-fg)]/55">Adjuntos</p>
                <p className="mt-2 text-sm text-[var(--app-fg)]/65">Mock listo para futura integración S3.</p>
              </div>
              <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-[var(--app-fg)]/55">Flashcards rápidas</p>
                <p className="mt-2 text-sm text-[var(--app-fg)]/65">Próximamente: generar deck desde esta sesión.</p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <Button
              onClick={async () => {
                setSaving(true);
                try {
                  await onSaveNotes({
                    notesHtml: editor?.getHTML() ?? undefined,
                    aiSummaryMock: summary,
                  });
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? "Guardando..." : "Guardar notas"}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

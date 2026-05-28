"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, Trash2 } from "lucide-react";
import { useAuth } from "@/app/providers/auth-provider";
import { useStudyUniversity } from "@/app/lib/study-university/hooks";
import type { GradeItem } from "@/app/lib/study-university/types";
import { cn } from "@/lib/utils";
import type { MockCourseExtended } from "../../../../lib/mock-course-data";
import { useStudyBackendLink } from "../../../../lib/study-backend-link";
import { useStudentTasks } from "../../../../tasks/context/student-tasks-context";
import { courseHex } from "../course-detail-utils";

interface ExamenesTabProps {
  course: MockCourseExtended;
}

type ExamForm = {
  name: string;
  gradeDate: string;
  weight: string;
  score: string;
  maxScore: string;
};

const emptyForm = (): ExamForm => ({
  name: "",
  gradeDate: "",
  weight: "0",
  score: "",
  maxScore: "",
});

export function ExamenesTab({ course }: ExamenesTabProps) {
  const hex = courseHex(course);
  const { token } = useAuth();
  const { resolveServerCourseId } = useStudentTasks();
  const { workspaceId, ensureWorkspace } = useStudyBackendLink(token);
  const study = useStudyUniversity(workspaceId ?? "", token);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GradeItem | null>(null);
  const [form, setForm] = useState<ExamForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const serverCourseId = resolveServerCourseId(course.id) ?? course.id;

  const exams = useMemo(
    () =>
      study.state.gradeItems.filter(
        (g) => g.courseId === serverCourseId && g.type === "exam",
      ),
    [study.state.gradeItems, serverCourseId],
  );

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setError(null);
    setModalOpen(true);
  }

  function openEdit(exam: GradeItem) {
    setEditing(exam);
    setForm({
      name: exam.name,
      gradeDate: exam.gradeDate ?? "",
      weight: String(exam.weight),
      score: exam.score != null ? String(exam.score) : "",
      maxScore: exam.maxScore != null ? String(exam.maxScore) : "",
    });
    setError(null);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.gradeDate) {
      setError("Nombre y fecha son obligatorios.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await ensureWorkspace();
      const payload = {
        courseId: serverCourseId,
        name: form.name.trim(),
        gradeDate: form.gradeDate,
        weight: Number(form.weight) || 0,
        ...(form.score ? { score: Number(form.score) } : {}),
        ...(form.maxScore ? { maxScore: Number(form.maxScore) } : {}),
      };
      if (editing) {
        await study.updateExam(editing.id, payload);
      } else {
        await study.createExam(payload);
      }
      setModalOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar el examen.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(examId: string) {
    if (!confirm("¿Eliminar este examen?")) return;
    setSaving(true);
    try {
      await study.deleteExam(examId);
    } finally {
      setSaving(false);
    }
  }

  function formatExamDate(iso: string | null): string {
    if (!iso) return "Sin fecha";
    const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
    return format(d, "d MMM yyyy", { locale: es });
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          Exámenes del curso
        </h2>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border-[0.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
          style={{ borderColor: `color-mix(in srgb, ${hex} 35%, var(--border))` }}
        >
          Añadir examen
        </button>
      </div>

      {study.loading && exams.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">Cargando…</p>
      ) : exams.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--bg-input)] px-6 py-10 text-center">
          <CalendarDays className="mx-auto h-8 w-8 text-[var(--text-muted)]" />
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            Aún no hay exámenes. Añade uno para verlo en el calendario.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {exams.map((exam) => (
            <li
              key={exam.id}
              className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3"
            >
              <button
                type="button"
                onClick={() => openEdit(exam)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                  {exam.name}
                </p>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  {formatExamDate(exam.gradeDate)}
                  {exam.score != null && exam.maxScore != null
                    ? ` · ${exam.score}/${exam.maxScore}`
                    : ""}
                </p>
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(exam.id)}
                disabled={saving}
                className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[color-mix(in_srgb,var(--error)_10%,transparent)] hover:text-[var(--error)]"
                aria-label="Eliminar examen"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <button type="button" className="absolute inset-0" aria-label="Cerrar" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-t-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-xl sm:rounded-2xl">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              {editing ? "Editar examen" : "Nuevo examen"}
            </h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs text-[var(--text-muted)]">Nombre</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[var(--text-muted)]">Fecha del examen</label>
                <input
                  type="date"
                  value={form.gradeDate}
                  onChange={(e) => setForm((f) => ({ ...f, gradeDate: e.target.value }))}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="mb-1 block text-xs text-[var(--text-muted)]">Peso %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.weight}
                    onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[var(--text-muted)]">Nota</label>
                  <input
                    type="number"
                    min={0}
                    value={form.score}
                    onChange={(e) => setForm((f) => ({ ...f, score: e.target.value }))}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[var(--text-muted)]">Máx.</label>
                  <input
                    type="number"
                    min={0}
                    value={form.maxScore}
                    onChange={(e) => setForm((f) => ({ ...f, maxScore: e.target.value }))}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 text-sm"
                  />
                </div>
              </div>
              {error && <p className="text-xs text-[var(--error)]">{error}</p>}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleSave()}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-semibold text-white",
                  saving && "opacity-60",
                )}
                style={{ backgroundColor: hex }}
              >
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

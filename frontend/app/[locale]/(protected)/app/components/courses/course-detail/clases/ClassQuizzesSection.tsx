"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  CheckCircle2,
  ClipboardCheck,
  Plus,
  Sparkles,
  Trash2,
  X,
  Type as TypeIcon,
  ListChecks,
  ToggleLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/providers/auth-provider";
import { useCourseQuizzes } from "../../../../lib/course-quizzes-store";
import { useStudyBackendLink } from "../../../../lib/study-backend-link";
import type { CreateQuizPayload } from "@/app/lib/study-university/api";
import type { CourseClass } from "../../../../lib/course-classes-store";
import type { MockCourseExtended } from "../../../../lib/mock-course-data";

interface ClassQuizzesSectionProps {
  course: MockCourseExtended;
  cls: CourseClass;
  hex: string;
}

type DraftQuestionType = "multiple_choice" | "true_false" | "short_answer";

interface DraftOption {
  id: string;
  label: string;
  text: string;
  isCorrect: boolean;
}

interface DraftQuestion {
  id: string;
  type: DraftQuestionType;
  prompt: string;
  expectedAnswer: string;
  options: DraftOption[];
}

const QUESTION_TYPE_OPTIONS: Array<{
  id: DraftQuestionType;
  label: string;
  icon: typeof TypeIcon;
  description: string;
}> = [
  { id: "multiple_choice", label: "Opción múltiple", icon: ListChecks, description: "4 opciones, 1 correcta" },
  { id: "true_false", label: "Verdadero / Falso", icon: ToggleLeft, description: "Solo 2 opciones" },
  { id: "short_answer", label: "Respuesta corta", icon: TypeIcon, description: "Texto libre" },
];

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function newQuestion(type: DraftQuestionType): DraftQuestion {
  if (type === "multiple_choice") {
    return {
      id: uid("q"),
      type,
      prompt: "",
      expectedAnswer: "",
      options: ["A", "B", "C", "D"].map((label, idx) => ({
        id: uid("opt"),
        label,
        text: "",
        isCorrect: idx === 0,
      })),
    };
  }
  if (type === "true_false") {
    return {
      id: uid("q"),
      type,
      prompt: "",
      expectedAnswer: "",
      options: [
        { id: uid("opt"), label: "V", text: "Verdadero", isCorrect: true },
        { id: uid("opt"), label: "F", text: "Falso", isCorrect: false },
      ],
    };
  }
  return {
    id: uid("q"),
    type,
    prompt: "",
    expectedAnswer: "",
    options: [],
  };
}

export function ClassQuizzesSection({ course, cls, hex }: ClassQuizzesSectionProps) {
  const { token } = useAuth();
  const { workspaceId, classMap, courseMap, ensureClassSession } = useStudyBackendLink(token);
  const serverCourseId = courseMap[course.id] ?? null;
  const serverSessionId = classMap[cls.id] ?? null;

  const { items, loading, create, remove } = useCourseQuizzes(
    token,
    workspaceId,
    serverCourseId,
  );

  const classQuizzes = useMemo(
    () => items.filter((q) => q.classSessionId === serverSessionId),
    [items, serverSessionId],
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<number>(3);
  const [questions, setQuestions] = useState<DraftQuestion[]>([newQuestion("multiple_choice")]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (token && course && cls && !serverSessionId) {
      void ensureClassSession(course, cls);
    }
  }, [token, course, cls, serverSessionId, ensureClassSession]);

  function closeModal() {
    setModalOpen(false);
    setTitle("");
    setDifficulty(3);
    setQuestions([newQuestion("multiple_choice")]);
    setSaving(false);
    setErrorMsg(null);
  }

  function addQuestion(type: DraftQuestionType) {
    setQuestions((prev) => [...prev, newQuestion(type)]);
  }

  function removeQuestion(id: string) {
    setQuestions((prev) => (prev.length > 1 ? prev.filter((q) => q.id !== id) : prev));
  }

  function updateQuestion(id: string, patch: Partial<DraftQuestion>) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }

  function updateOption(questionId: string, optionId: string, patch: Partial<DraftOption>) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((o) => (o.id === optionId ? { ...o, ...patch } : o)),
            }
          : q,
      ),
    );
  }

  function setCorrect(questionId: string, optionId: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((o) => ({ ...o, isCorrect: o.id === optionId })),
            }
          : q,
      ),
    );
  }

  function validateDraft(): string | null {
    if (!title.trim()) return "El quiz necesita un título";
    if (questions.length === 0) return "Agrega al menos una pregunta";
    for (const q of questions) {
      if (!q.prompt.trim()) return "Todas las preguntas necesitan enunciado";
      if (q.type === "multiple_choice") {
        if (q.options.length < 2) return "Cada pregunta de opción múltiple necesita ≥2 opciones";
        if (q.options.some((o) => !o.text.trim()))
          return "Llena el texto de todas las opciones";
        if (!q.options.some((o) => o.isCorrect))
          return "Marca al menos una opción como correcta";
      }
      if (q.type === "true_false") {
        if (!q.options.some((o) => o.isCorrect))
          return "Selecciona Verdadero o Falso como respuesta";
      }
      if (q.type === "short_answer") {
        if (!q.expectedAnswer.trim()) return "Indica la respuesta esperada para texto corto";
      }
    }
    return null;
  }

  async function handleSave() {
    const validation = validateDraft();
    if (validation) {
      setErrorMsg(validation);
      return;
    }
    setErrorMsg(null);
    setSaving(true);
    try {
      const sessionId: string | null =
        serverSessionId ?? (await ensureClassSession(course, cls));
      const payload: CreateQuizPayload = {
        title: title.trim(),
        difficulty,
        classSessionId: sessionId ?? undefined,
        questions: questions.map((q) => ({
          type: q.type,
          prompt: q.prompt.trim(),
          expectedAnswer: q.type === "short_answer" ? q.expectedAnswer.trim() : undefined,
          options:
            q.type === "short_answer"
              ? undefined
              : q.options.map((o) => ({
                  label: o.label,
                  text: o.text.trim() || o.label,
                  isCorrect: o.isCorrect,
                })),
        })),
      };
      await create(payload);
      closeModal();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al guardar quiz";
      setErrorMsg(message);
      setSaving(false);
    }
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4" style={{ color: hex }} aria-hidden />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Quizzes de esta clase
          </h3>
          <span className="rounded-full bg-[var(--bg-input)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
            {classQuizzes.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1 rounded-[var(--radius-md)] px-3 py-1.5 text-xs font-medium text-[var(--accent-fg)] transition-colors hover:opacity-90"
          style={{ backgroundColor: hex }}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Nuevo quiz
        </button>
      </div>

      {loading ? (
        <p className="py-6 text-center text-xs text-[var(--text-muted)]">Cargando…</p>
      ) : classQuizzes.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--bg-surface)] p-6 text-center">
          <Sparkles className="mx-auto mb-2 h-5 w-5 text-[var(--text-muted)]" aria-hidden />
          <p className="text-sm text-[var(--text-primary)]">Aún no hay quizzes</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Crea un quiz para evaluar lo aprendido en esta clase.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {classQuizzes.map((quiz) => (
            <li
              key={quiz.id}
              className="flex items-center gap-3 rounded-[var(--radius-md)] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-3"
              style={{ borderLeftWidth: 3, borderLeftColor: hex }}
            >
              <ClipboardCheck className="h-4 w-4 shrink-0" style={{ color: hex }} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                  {quiz.title}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {quiz.questionCount} preguntas · Dificultad {quiz.difficulty}/5
                </p>
              </div>
              <button
                type="button"
                onClick={() => void remove(quiz.id)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--error)]"
                aria-label="Eliminar quiz"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      <AnimatePresence>
        {modalOpen ? (
          <motion.div
            key="qz-class-modal-overlay"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[400] flex items-center justify-center bg-black/50 p-4"
            onClick={closeModal}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="max-h-[92vh] w-full max-w-[640px] overflow-y-auto rounded-[var(--radius-xl)] border-[0.5px] border-[var(--border-strong)] bg-[var(--bg-elevated)] p-7 shadow-[var(--shadow-md)]"
              onClick={(e) => e.stopPropagation()}
              style={{ borderTopColor: hex, borderTopWidth: 3 }}
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">Nuevo quiz</h2>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Clase {cls.number} · {course.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-[var(--radius-md)] p-2 text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]"
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-[1fr,auto]">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[var(--text-primary)]">
                      Título del quiz
                    </label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value.slice(0, 120))}
                      placeholder="Ej. Repaso clase 2 — Derivadas"
                      className="w-full rounded-[var(--radius-md)] border-[0.5px] border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[var(--text-primary)]">
                      Dificultad
                    </label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setDifficulty(n)}
                          className={cn(
                            "h-7 w-7 rounded-[var(--radius-sm)] text-xs font-medium",
                            difficulty >= n
                              ? "text-[var(--accent-fg)]"
                              : "border-[0.5px] border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-muted)]",
                          )}
                          style={difficulty >= n ? { backgroundColor: hex } : undefined}
                          aria-label={`Dificultad ${n}`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Preguntas
                  </p>
                  {questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="rounded-[var(--radius-md)] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-4"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[var(--text-primary)]">
                          Pregunta {idx + 1}
                        </span>
                        {questions.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => removeQuestion(q.id)}
                            className="inline-flex h-6 w-6 items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--error)]"
                            aria-label="Eliminar pregunta"
                          >
                            <Trash2 className="h-3 w-3" aria-hidden />
                          </button>
                        ) : null}
                      </div>

                      <div className="mb-3 flex flex-wrap gap-2">
                        {QUESTION_TYPE_OPTIONS.map((t) => {
                          const Icon = t.icon;
                          const active = q.type === t.id;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => updateQuestion(q.id, { ...newQuestion(t.id), id: q.id, prompt: q.prompt })}
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full border-[0.5px] px-2.5 py-1 text-[11px] font-medium transition-colors",
                                active
                                  ? "text-[var(--text-primary)]"
                                  : "border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                              )}
                              style={
                                active
                                  ? { borderColor: hex, backgroundColor: `${hex}22` }
                                  : undefined
                              }
                            >
                              <Icon className="h-3 w-3" aria-hidden />
                              {t.label}
                            </button>
                          );
                        })}
                      </div>

                      <textarea
                        value={q.prompt}
                        onChange={(e) => updateQuestion(q.id, { prompt: e.target.value.slice(0, 500) })}
                        placeholder="Escribe el enunciado…"
                        rows={2}
                        className="mb-3 w-full rounded-[var(--radius-md)] border-[0.5px] border-[var(--border)] bg-[var(--bg-input)] p-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                      />

                      {q.type === "multiple_choice" && (
                        <div className="space-y-2">
                          {q.options.map((opt) => (
                            <div
                              key={opt.id}
                              className="flex items-center gap-2 rounded-[var(--radius-md)] border-[0.5px] border-[var(--border)] bg-[var(--bg-input)] px-2 py-1.5"
                            >
                              <button
                                type="button"
                                onClick={() => setCorrect(q.id, opt.id)}
                                className={cn(
                                  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                                  opt.isCorrect
                                    ? "text-[var(--accent-fg)]"
                                    : "bg-[var(--bg-surface)] text-[var(--text-muted)]",
                                )}
                                style={opt.isCorrect ? { backgroundColor: hex } : undefined}
                                aria-label="Marcar como correcta"
                              >
                                {opt.isCorrect ? <CheckCircle2 className="h-4 w-4" /> : opt.label}
                              </button>
                              <input
                                value={opt.text}
                                onChange={(e) =>
                                  updateOption(q.id, opt.id, { text: e.target.value.slice(0, 200) })
                                }
                                placeholder={`Opción ${opt.label}`}
                                className="flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {q.type === "true_false" && (
                        <div className="flex gap-2">
                          {q.options.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setCorrect(q.id, opt.id)}
                              className={cn(
                                "flex-1 rounded-[var(--radius-md)] border-[0.5px] px-3 py-2 text-sm font-medium transition-colors",
                                opt.isCorrect
                                  ? "text-[var(--accent-fg)]"
                                  : "border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)]",
                              )}
                              style={opt.isCorrect ? { backgroundColor: hex } : undefined}
                            >
                              {opt.text}
                            </button>
                          ))}
                        </div>
                      )}

                      {q.type === "short_answer" && (
                        <div>
                          <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                            Respuesta esperada
                          </p>
                          <input
                            value={q.expectedAnswer}
                            onChange={(e) =>
                              updateQuestion(q.id, { expectedAnswer: e.target.value.slice(0, 200) })
                            }
                            placeholder="Ej. nxⁿ⁻¹"
                            className="w-full rounded-[var(--radius-md)] border-[0.5px] border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                          />
                          <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                            Se comparará ignorando mayúsculas y espacios.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="flex flex-wrap gap-2">
                    {QUESTION_TYPE_OPTIONS.map((t) => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => addQuestion(t.id)}
                          className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border-[0.5px] border-dashed border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                        >
                          <Plus className="h-3 w-3" aria-hidden />
                          <Icon className="h-3 w-3" aria-hidden />
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {errorMsg ? (
                  <p className="rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--error)_12%,transparent)] px-3 py-2 text-xs text-[var(--error)]">
                    {errorMsg}
                  </p>
                ) : null}

                <div className="flex items-center justify-end gap-3 border-t-[0.5px] border-[var(--border)] pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-[var(--radius-md)] px-5 py-2.5 text-sm font-medium text-[var(--accent-fg)] disabled:opacity-40"
                    style={{ backgroundColor: hex }}
                  >
                    <Check className="h-4 w-4" aria-hidden />
                    {saving ? "Guardando…" : "Crear quiz"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Play,
  Sparkles,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/providers/auth-provider";
import { courseHex } from "../course-detail-utils";
import type {
  CombinedQuizPreview,
  CombinedQuizQuestion,
} from "@/app/lib/study-university/types";
import type { MockCourseExtended } from "../../../../lib/mock-course-data";
import { useCourseClasses } from "../../../../lib/course-classes-store";
import { useStudyBackendLink } from "../../../../lib/study-backend-link";
import { useCourseQuizzes } from "../../../../lib/course-quizzes-store";

interface QuizzesTabProps {
  course: MockCourseExtended;
}

function DifficultyDots({ filled, total, hex }: { filled: number; total: number; hex: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[var(--text-muted)]">Dificultad</span>
      <div className="flex gap-1">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn("h-2 w-2 rounded-full", i < filled ? "" : "bg-[var(--bg-input)]")}
            style={i < filled ? { backgroundColor: hex } : undefined}
          />
        ))}
      </div>
    </div>
  );
}

interface PlayerProps {
  open: boolean;
  onClose: () => void;
  hex: string;
  title: string;
  questions: CombinedQuizQuestion[];
  onComplete: (
    payload: {
      durationSeconds: number;
      answers: Array<{
        questionId: string;
        selectedOptionId?: string;
        selectedOptionIds?: string[];
        textAnswer?: string;
      }>;
    },
  ) => Promise<{ correct: number; total: number; passed: boolean } | null>;
}

function QuizFullscreen({ open, onClose, hex, title, questions, onComplete }: PlayerProps) {
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [answers, setAnswers] = useState<Record<string, { selectedOptionId?: string; textAnswer?: string }>>({});
  const [startedAt] = useState(() => Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [finished, setFinished] = useState<{ correct: number; total: number; passed: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset al cerrar el modal
      setQIdx(0);
      setPicked(null);
      setTextAnswer("");
      setAnswers({});
      setFinished(null);
      setElapsedSeconds(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open || finished) return;
    const id = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [open, finished, startedAt]);

  if (!open) return null;
  const q = questions[qIdx];
  if (!q) return null;

  const correctId =
    q.type === "multiple_choice" || q.type === "true_false"
      ? q.options.find((o) => o.isCorrect)?.id ?? null
      : null;

  function recordAnswer() {
    if (q.type === "short_answer") {
      setAnswers((prev) => ({ ...prev, [q.id]: { textAnswer } }));
    } else if (picked) {
      setAnswers((prev) => ({ ...prev, [q.id]: { selectedOptionId: picked } }));
    }
  }

  async function handleNext() {
    recordAnswer();
    if (qIdx < questions.length - 1) {
      setQIdx((i) => i + 1);
      setPicked(null);
      setTextAnswer("");
      return;
    }
    setSubmitting(true);
    const merged = { ...answers };
    if (q.type === "short_answer") {
      merged[q.id] = { textAnswer };
    } else if (picked) {
      merged[q.id] = { selectedOptionId: picked };
    }
    const payload = {
      durationSeconds: Math.round((Date.now() - startedAt) / 1000),
      answers: questions.map((qq) => ({
        questionId: qq.id,
        selectedOptionId: merged[qq.id]?.selectedOptionId,
        textAnswer: merged[qq.id]?.textAnswer,
      })),
    };
    const result = await onComplete(payload);
    if (result) {
      setFinished(result);
    }
    setSubmitting(false);
  }

  if (finished) {
    const pct = finished.total > 0 ? Math.round((finished.correct / finished.total) * 100) : 0;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 z-[500] flex flex-col items-center justify-center bg-[var(--bg-base)] px-6"
      >
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="mb-4"
        >
          <Trophy className="h-16 w-16" style={{ color: hex }} />
        </motion.div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">¡Quiz completado!</h2>
        <p className="mt-4 text-3xl font-semibold text-[var(--text-primary)]">
          {finished.correct} / {finished.total}
        </p>
        <p className="text-sm text-[var(--text-muted)]">{pct}% de aciertos</p>
        <span
          className={cn(
            "mt-3 rounded-full px-4 py-1 text-sm font-medium",
            finished.passed
              ? "border-[0.5px] border-[color-mix(in_srgb,var(--success)_30%,transparent)] bg-[color-mix(in_srgb,var(--success)_14%,transparent)] text-[var(--success)]"
              : "border-[0.5px] border-[color-mix(in_srgb,var(--error)_30%,transparent)] bg-[color-mix(in_srgb,var(--error)_12%,transparent)] text-[var(--error)]",
          )}
        >
          {finished.passed ? "Aprobado" : "Reprobado"}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="mt-8 rounded-[var(--radius-md)] bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--accent-fg)] hover:bg-[var(--accent-hover)]"
        >
          Terminar
        </button>
      </motion.div>
    );
  }

  const canAdvance =
    q.type === "short_answer" ? textAnswer.trim().length > 0 : Boolean(picked);

  return (
    <div className="fixed inset-0 z-[500] flex flex-col bg-[var(--bg-base)]">
      <header className="shrink-0 border-b-[0.5px] border-[var(--border)] px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--radius-md)] p-2 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-sm font-medium text-[var(--text-primary)]">{title}</p>
            <p className="text-xs text-[var(--text-muted)]">
              Pregunta {qIdx + 1} de {questions.length}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Clock className="h-3.5 w-3.5" />
            {Math.floor(elapsedSeconds / 60)}:
            {String(elapsedSeconds % 60).padStart(2, "0")}
          </span>
        </div>
        <div className="mx-auto mt-2 h-1 max-w-3xl overflow-hidden rounded-full bg-[var(--bg-input)]">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${((qIdx + 1) / questions.length) * 100}%`, backgroundColor: hex }}
          />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
        <div className="mb-3 flex items-center justify-center gap-2">
          {q.classNumber != null ? (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ color: hex, backgroundColor: `${hex}22` }}
            >
              Clase {q.classNumber}
            </span>
          ) : null}
          <span className="rounded-full bg-[var(--bg-input)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            {q.type === "multiple_choice"
              ? "Opción múltiple"
              : q.type === "true_false"
                ? "V/F"
                : "Respuesta corta"}
          </span>
        </div>
        <p className="mb-6 text-center text-xl font-semibold leading-snug text-[var(--text-primary)]">
          <span className="text-[var(--text-muted)]">{qIdx + 1}.</span> {q.prompt}
        </p>

        {q.type === "short_answer" ? (
          <input
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            placeholder="Escribe tu respuesta"
            className="rounded-[var(--radius-md)] border-[0.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-3 text-base text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
          />
        ) : (
          <div className="space-y-3">
            {q.options.map((opt) => {
              const chosen = picked === opt.id;
              const showGreen = !!picked && opt.id === correctId;
              const showRed = !!picked && chosen && opt.id !== correctId;
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={!!picked}
                  onClick={() => setPicked(opt.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-[var(--radius-md)] border-[0.5px] px-4 py-3.5 text-left text-sm transition-colors",
                    !picked &&
                      "border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--accent)]",
                    showGreen &&
                      "border-[var(--success)] bg-[color-mix(in_srgb,var(--success)_14%,transparent)] text-[var(--text-primary)]",
                    showRed &&
                      "border-[var(--error)] bg-[color-mix(in_srgb,var(--error)_12%,transparent)] text-[var(--text-primary)]",
                  )}
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-[var(--accent-fg)]"
                    style={{ backgroundColor: hex }}
                  >
                    {opt.label}
                  </span>
                  <span className="flex-1">{opt.text}</span>
                  {picked && opt.id === correctId ? (
                    <Check className="h-5 w-5 shrink-0 text-[var(--success)]" />
                  ) : null}
                  {picked && chosen && opt.id !== correctId ? (
                    <X className="h-5 w-5 shrink-0 text-[var(--error)]" />
                  ) : null}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            disabled={!canAdvance || submitting}
            onClick={handleNext}
            className="rounded-[var(--radius-md)] bg-[var(--accent)] px-8 py-3 text-sm font-semibold text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] disabled:opacity-40"
          >
            {qIdx >= questions.length - 1 ? "Finalizar" : "Siguiente"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function QuizzesTab({ course }: QuizzesTabProps) {
  const hex = courseHex(course);
  const { token } = useAuth();
  const { workspaceId, courseMap, classMap, ensureCourse } = useStudyBackendLink(token);
  const serverCourseId = courseMap[course.id] ?? null;

  const {
    items,
    attempts,
    loading,
    remove,
    reload,
    fetchDetail,
    fetchCombined,
    submitAttempt,
  } = useCourseQuizzes(token, workspaceId, serverCourseId);

  const classes = useCourseClasses(course.id);

  useEffect(() => {
    if (token && course && !serverCourseId) {
      void ensureCourse(course);
    }
  }, [token, course, serverCourseId, ensureCourse]);

  useEffect(() => {
    if (serverCourseId) {
      void reload();
    }
  }, [serverCourseId, reload]);

  const allClassNumbers = useMemo(() => {
    const set = new Set<number>();
    classes.forEach((c) => set.add(c.number));
    items.forEach((q) => {
      if (q.classNumber != null) set.add(q.classNumber);
    });
    return [...set].sort((a, b) => a - b);
  }, [classes, items]);

  const sessionToNumber = useMemo(() => {
    const m = new Map<string, number>();
    classes.forEach((c) => {
      const serverId = classMap[c.id];
      if (serverId) m.set(serverId, c.number);
    });
    items.forEach((q) => {
      if (q.classSessionId && q.classNumber != null) {
        m.set(q.classSessionId, q.classNumber);
      }
    });
    return m;
  }, [classes, classMap, items]);

  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [rangeFrom, setRangeFrom] = useState<number | null>(null);
  const [rangeTo, setRangeTo] = useState<number | null>(null);
  const [combined, setCombined] = useState<CombinedQuizPreview | null>(null);
  const [combinedTitle, setCombinedTitle] = useState<string>("");
  const [playing, setPlaying] = useState(false);

  const selectedQuizIds = useMemo(
    () => Object.entries(selectedIds).filter(([, v]) => v).map(([k]) => k),
    [selectedIds],
  );

  const selectedQuestionCount = useMemo(() => {
    const map = new Map(items.map((q) => [q.id, q.questionCount]));
    return selectedQuizIds.reduce((sum, id) => sum + (map.get(id) ?? 0), 0);
  }, [items, selectedQuizIds]);

  function toggleSelect(id: string) {
    setSelectedIds((s) => ({ ...s, [id]: !s[id] }));
  }

  function clearSelection() {
    setSelectedIds({});
  }

  function selectByRange() {
    if (rangeFrom == null || rangeTo == null) return;
    const min = Math.min(rangeFrom, rangeTo);
    const max = Math.max(rangeFrom, rangeTo);
    const next: Record<string, boolean> = {};
    for (const q of items) {
      const num = q.classNumber ?? sessionToNumber.get(q.classSessionId ?? "") ?? null;
      if (num != null && num >= min && num <= max) next[q.id] = true;
    }
    setSelectedIds(next);
  }

  async function studySelected() {
    if (selectedQuizIds.length === 0) return;
    const preview = await fetchCombined(selectedQuizIds);
    if (!preview || preview.questions.length === 0) return;
    setCombined(preview);
    const titles = items
      .filter((q) => selectedQuizIds.includes(q.id))
      .map((q) => q.title);
    setCombinedTitle(
      titles.length === 1 ? titles[0] : `Estudio combinado (${selectedQuizIds.length} quizzes)`,
    );
    setPlaying(true);
  }

  async function studySingle(quizId: string) {
    const detail = await fetchDetail(quizId);
    if (!detail) return;
    setCombined({
      quizIds: [detail.id],
      classSessionIds: detail.classSessionId ? [detail.classSessionId] : [],
      classNumbers: detail.classNumber != null ? [detail.classNumber] : [],
      courseId: detail.courseId,
      questions: detail.questions.map((q) => ({
        id: q.id,
        quizId: detail.id,
        quizTitle: detail.title,
        classNumber: detail.classNumber,
        type: q.type,
        prompt: q.prompt,
        explanation: q.explanation,
        expectedAnswer: q.expectedAnswer,
        options: q.options,
      })),
    });
    setCombinedTitle(detail.title);
    setPlaying(true);
  }

  async function handleComplete(payload: {
    durationSeconds: number;
    answers: Array<{
      questionId: string;
      selectedOptionId?: string;
      selectedOptionIds?: string[];
      textAnswer?: string;
    }>;
  }) {
    if (!combined) return null;
    const result = await submitAttempt({
      sourceKind: combined.quizIds.length > 1 ? "combined" : "quiz",
      sourceQuizIds: combined.quizIds,
      classSessionIds: combined.classSessionIds,
      answers: payload.answers,
      durationSeconds: payload.durationSeconds,
    });
    if (!result) return null;
    return { correct: result.correctCount, total: result.totalQuestions, passed: result.passed };
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
            Quizzes
          </h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {items.length} totales · selección {selectedQuizIds.length}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedQuizIds.length > 0 ? (
            <>
              <button
                type="button"
                onClick={studySelected}
                className="inline-flex items-center gap-1 rounded-[var(--radius-md)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-fg)]"
                style={{ backgroundColor: hex }}
              >
                <Play className="h-3.5 w-3.5" aria-hidden />
                Estudiar clases seleccionadas ({selectedQuizIds.length} · {selectedQuestionCount}p)
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border-[0.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                Limpiar
              </button>
            </>
          ) : null}
        </div>
      </div>

      <div className="mb-4 rounded-[var(--radius-md)] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Estudiar rango de clases
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--text-muted)]">Desde</span>
          <select
            value={rangeFrom ?? ""}
            onChange={(e) => setRangeFrom(e.target.value ? Number(e.target.value) : null)}
            className="rounded-[var(--radius-sm)] border-[0.5px] border-[var(--border)] bg-[var(--bg-input)] px-2 py-1 text-xs text-[var(--text-primary)] focus:border-[var(--accent)]"
          >
            <option value="">—</option>
            {allClassNumbers.map((n) => (
              <option key={n} value={n}>
                Clase {n}
              </option>
            ))}
          </select>
          <span className="text-xs text-[var(--text-muted)]">hasta</span>
          <select
            value={rangeTo ?? ""}
            onChange={(e) => setRangeTo(e.target.value ? Number(e.target.value) : null)}
            className="rounded-[var(--radius-sm)] border-[0.5px] border-[var(--border)] bg-[var(--bg-input)] px-2 py-1 text-xs text-[var(--text-primary)] focus:border-[var(--accent)]"
          >
            <option value="">—</option>
            {allClassNumbers.map((n) => (
              <option key={n} value={n}>
                Clase {n}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={selectByRange}
            disabled={rangeFrom == null || rangeTo == null}
            className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border-[0.5px] border-[var(--accent)] px-3 py-1 text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent-subtle)] disabled:opacity-40"
          >
            <Sparkles className="h-3 w-3" aria-hidden />
            Seleccionar rango
          </button>
        </div>
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-[var(--text-muted)]">Cargando quizzes…</p>
      ) : items.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--bg-surface)] p-12 text-center">
          <Sparkles className="mx-auto mb-3 h-6 w-6 text-[var(--text-muted)]" aria-hidden />
          <p className="text-sm text-[var(--text-primary)]">No hay quizzes todavía</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Crea un quiz desde la vista de cada clase.
          </p>
        </div>
      ) : (
        <ul className="mb-8 space-y-3">
          {items.map((quiz) => {
            const isSel = selectedIds[quiz.id] ?? false;
            const num = quiz.classNumber ?? sessionToNumber.get(quiz.classSessionId ?? "") ?? null;
            return (
              <li
                key={quiz.id}
                className={cn(
                  "rounded-[var(--radius-md)] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-4",
                  isSel && "ring-1",
                )}
                style={
                  isSel
                    ? {
                        borderLeftWidth: 3,
                        borderLeftColor: hex,
                        boxShadow: `0 0 0 1px ${hex}`,
                      }
                    : { borderLeftWidth: 3, borderLeftColor: hex }
                }
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => toggleSelect(quiz.id)}
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border-[0.5px] text-[10px]",
                      isSel
                        ? "text-[var(--accent-fg)]"
                        : "border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-muted)]",
                    )}
                    style={isSel ? { backgroundColor: hex, borderColor: hex } : undefined}
                    aria-pressed={isSel}
                  >
                    {isSel ? <Check className="h-3 w-3" /> : null}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-[var(--text-primary)]">{quiz.title}</h4>
                      {num != null ? (
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                          style={{ color: hex, backgroundColor: `${hex}22` }}
                        >
                          Clase {num}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {quiz.questionCount} preguntas
                    </p>
                    <div className="mt-3">
                      <DifficultyDots filled={quiz.difficulty} total={5} hex={hex} />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <button
                      type="button"
                      onClick={() => void studySingle(quiz.id)}
                      className="inline-flex items-center gap-1 rounded-[var(--radius-md)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-fg)]"
                      style={{ backgroundColor: hex }}
                    >
                      <Play className="h-3 w-3" aria-hidden />
                      Iniciar
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(quiz.id)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--error)]"
                      aria-label="Eliminar quiz"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
        Historial
      </p>
      {attempts.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--text-muted)]">
          Aún no completas ningún quiz.
        </p>
      ) : (
        <ul className="space-y-3">
          {attempts.map((attempt) => {
            const exp = expanded === attempt.id;
            const percent =
              attempt.totalQuestions > 0
                ? Math.round((attempt.correctCount / attempt.totalQuestions) * 100)
                : 0;
            const completedAt = attempt.completedAt
              ? new Date(attempt.completedAt).toLocaleString()
              : "";
            return (
              <li
                key={attempt.id}
                className="overflow-hidden rounded-[var(--radius-lg)] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)]"
              >
                <button
                  type="button"
                  onClick={() => setExpanded(exp ? null : attempt.id)}
                  className="flex w-full items-start gap-3 p-4 text-left"
                >
                  <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0" style={{ color: hex }} />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-[var(--text-primary)]">
                      {attempt.sourceQuizTitles && attempt.sourceQuizTitles.length > 0
                        ? attempt.sourceQuizTitles.join(" + ")
                        : "Quiz"}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)]">{completedAt}</p>
                    {attempt.sourceKind === "combined" ? (
                      <p className="text-xs text-[var(--text-muted)]">
                        Sesión combinada · {attempt.sourceQuizIds?.length ?? 0} quizzes
                      </p>
                    ) : null}
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-[var(--bg-input)]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${percent}%`, backgroundColor: hex }}
                      />
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-lg font-semibold text-[var(--text-primary)]">
                      {attempt.correctCount}/{attempt.totalQuestions}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium",
                        attempt.passed
                          ? "bg-[color-mix(in_srgb,var(--success)_14%,transparent)] text-[var(--success)]"
                          : "bg-[color-mix(in_srgb,var(--error)_12%,transparent)] text-[var(--error)]",
                      )}
                    >
                      {attempt.passed ? "Aprobado" : "Reprobado"}
                    </span>
                    <ChevronRight
                      className={cn("mt-1 h-5 w-5 text-[var(--text-muted)]", exp && "rotate-90")}
                    />
                  </div>
                </button>
                {exp && attempt.answers ? (
                  <ul className="space-y-2 border-t-[0.5px] border-[var(--border)] px-4 py-3">
                    {attempt.answers.map((ans, i) => (
                      <li
                        key={`${attempt.id}-${i}`}
                        className="flex items-center gap-2 text-sm text-[var(--text-body)]"
                      >
                        {ans.correct ? (
                          <Check className="h-4 w-4 shrink-0 text-[var(--success)]" />
                        ) : (
                          <X className="h-4 w-4 shrink-0 text-[var(--error)]" />
                        )}
                        <span>Pregunta {i + 1}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <AnimatePresence>
        {playing && combined ? (
          <QuizFullscreen
            open={playing}
            onClose={() => setPlaying(false)}
            hex={hex}
            title={combinedTitle}
            questions={combined.questions}
            onComplete={handleComplete}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

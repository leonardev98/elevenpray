"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { courseHex } from "../course-detail-utils";
import type {
  MockCourseExtended,
  MockQuizHistoryItem,
  MockQuizQuestion,
} from "../../../../lib/mock-course-data";
import { QUIZ_ACTIVE_C1, QUIZ_ACTIVE_QUESTIONS_C1 } from "../../../../lib/mock-course-data";

interface QuizzesTabProps {
  course: MockCourseExtended;
  history: MockQuizHistoryItem[];
}

function DifficultyDots({ filled, total, hex }: { filled: number; total: number; hex: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-zinc-500">Dificultad</span>
      <div className="flex gap-1">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn("h-2 w-2 rounded-full", i < filled ? "" : "bg-zinc-700")}
            style={i < filled ? { backgroundColor: hex } : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function QuizFullscreen({
  open,
  onClose,
  hex,
  questions,
  title,
}: {
  open: boolean;
  onClose: () => void;
  hex: string;
  questions: MockQuizQuestion[];
  title: string;
}) {
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [showNext, setShowNext] = useState(false);
  const [finished, setFinished] = useState(false);
  const [barW, setBarW] = useState(0);

  const q = questions[qIdx];
  const correctId = q?.correctOptionId;

  useEffect(() => {
    if (!finished) return;
    const t = requestAnimationFrame(() => setBarW(80));
    return () => cancelAnimationFrame(t);
  }, [finished]);

  useEffect(() => {
    if (!open) {
      setQIdx(0);
      setPicked(null);
      setShowNext(false);
      setFinished(false);
      setBarW(0);
    }
  }, [open]);

  if (!open) return null;

  if (finished) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 z-[500] flex flex-col items-center justify-center bg-zinc-950 px-6"
      >
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="mb-4"
        >
          <Trophy className="h-16 w-16" style={{ color: hex }} />
        </motion.div>
        <h2 className="text-xl font-semibold text-white">¡Quiz completado!</h2>
        <p className="mt-4 text-3xl font-semibold text-white">8 / 10</p>
        <p className="text-sm text-zinc-500">80% de aciertos</p>
        <span className="mt-3 rounded-full border border-emerald-800/50 bg-emerald-950/40 px-4 py-1 text-sm font-medium text-emerald-300">
          Aprobado
        </span>
        <div className="mt-6 h-2 w-full max-w-sm overflow-hidden rounded-full bg-zinc-800">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: hex }}
            initial={{ width: 0 }}
            animate={{ width: `${barW}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="mt-8 grid max-w-sm grid-cols-2 gap-3 text-sm">
          <p className="text-emerald-400">Correctas: 8</p>
          <p className="text-red-400">Incorrectas: 2</p>
          <p className="text-zinc-500">Tiempo: 8:45</p>
          <p className="text-zinc-500">Clases: 3, 4, 6</p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            className="rounded-lg border border-[var(--app-primary)] px-5 py-2.5 text-sm font-medium text-[var(--app-primary)]"
          >
            Ver respuestas
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[var(--app-primary)] px-5 py-2.5 text-sm font-medium text-white"
          >
            Terminar
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="fixed inset-0 z-[500] flex flex-col bg-zinc-950">
      <header className="shrink-0 border-b border-zinc-800 px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800">
            <X className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-sm font-medium text-white">{title}</p>
            <p className="text-xs text-zinc-500">
              Pregunta {q?.number ?? qIdx + 1} de 10
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
            <Clock className="h-3.5 w-3.5" />
            12:34
          </span>
        </div>
        <div className="mx-auto mt-2 h-1 max-w-3xl overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${((qIdx + 1) / 10) * 100}%`, backgroundColor: hex }}
          />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
        <p className="mb-6 text-center text-xl font-semibold leading-snug text-white">
          <span className="text-zinc-500">{q?.number}.</span> {q?.prompt}
        </p>
        <div className="space-y-3">
          {q?.options.map((opt) => {
            const chosen = picked === opt.id;
            const isCorrect = opt.id === correctId;
            const showGreen = !!picked && isCorrect;
            const showRed = !!picked && chosen && !isCorrect;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={!!picked}
                onClick={() => {
                  if (picked) return;
                  setPicked(opt.id);
                  setShowNext(true);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-4 py-3.5 text-left text-sm transition-colors",
                  !picked && "border-zinc-700 bg-zinc-900/80 hover:border-zinc-500",
                  showGreen && "border-emerald-600 bg-emerald-950/50 text-white",
                  showRed && "border-red-600 bg-red-950/50 text-white",
                  picked && !chosen && isCorrect && "border-emerald-600 bg-emerald-950/40",
                )}
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: hex }}
                >
                  {opt.label}
                </span>
                <span className="flex-1">{opt.text}</span>
                {picked && isCorrect ? <Check className="h-5 w-5 shrink-0 text-emerald-400" /> : null}
                {picked && chosen && !isCorrect ? <X className="h-5 w-5 shrink-0 text-red-400" /> : null}
              </button>
            );
          })}
        </div>

        {showNext && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="mt-8 flex justify-center"
          >
            <button
              type="button"
              onClick={() => {
                if (qIdx >= questions.length - 1) {
                  setFinished(true);
                } else {
                  setQIdx((i) => i + 1);
                  setPicked(null);
                  setShowNext(false);
                }
              }}
              className="rounded-lg bg-[var(--app-primary)] px-8 py-3 text-sm font-semibold text-white"
            >
              Siguiente pregunta
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export function QuizzesTab({ course, history }: QuizzesTabProps) {
  const hex = courseHex(course);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);

  const featured = course.id === "c1" ? QUIZ_ACTIVE_C1 : null;
  const activeQuestions = course.id === "c1" ? QUIZ_ACTIVE_QUESTIONS_C1 : [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Quizzes</h2>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--app-primary)] px-3 py-2 text-xs font-semibold text-white"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Generar con IA
        </button>
      </div>

      {featured && (
        <div
          className="mb-8 rounded-xl border-2 bg-zinc-900/40 p-5"
          style={{ borderColor: hex }}
        >
          <span className="mb-2 inline-block rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
            Recomendado
          </span>
          <h3 className="text-lg font-semibold text-white">{featured.title}</h3>
          <p className="mt-1 text-xs text-zinc-500">{featured.subtitle}</p>
          <div className="mt-4">
            <DifficultyDots filled={featured.difficultyFilled} total={5} hex={hex} />
          </div>
          <button
            type="button"
            onClick={() => setQuizOpen(true)}
            className="mt-5 w-full rounded-lg bg-[var(--app-primary)] py-3 text-sm font-semibold text-white"
          >
            Iniciar quiz
          </button>
        </div>
      )}

      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">Historial</p>
      {history.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">No hay quizzes completados aún.</p>
      ) : (
      <ul className="space-y-3">
        {history.map((item) => {
          const exp = expanded === item.id;
          return (
            <li key={item.id} className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30">
              <button
                type="button"
                onClick={() => setExpanded(exp ? null : item.id)}
                className="flex w-full items-start gap-3 p-4 text-left"
              >
                <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0" style={{ color: hex }} />
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-white">{item.title}</h4>
                  <p className="text-xs text-zinc-500">{item.completedAt}</p>
                  <p className="text-xs text-zinc-500">{item.classesLine}</p>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-800">
                    <div className="h-full rounded-full" style={{ width: `${item.percent}%`, backgroundColor: hex }} />
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-lg font-semibold text-white">{item.scoreLabel}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium",
                      item.passed ? "bg-emerald-950/50 text-emerald-300" : "bg-red-950/50 text-red-300",
                    )}
                  >
                    {item.passed ? "Aprobado" : "Reprobado"}
                  </span>
                  <ChevronRight className={cn("mt-1 h-5 w-5 text-zinc-500", exp && "rotate-90")} />
                </div>
              </button>
              <div
                className={cn(
                  "overflow-hidden border-t border-zinc-800 transition-[max-height] duration-200",
                  exp ? "max-h-64" : "max-h-0",
                )}
              >
                <ul className="space-y-2 px-4 py-3">
                  {item.questions.map((qq) => (
                    <li key={qq.id} className="flex items-center gap-2 text-sm text-zinc-300">
                      {qq.correct ? (
                        <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <X className="h-4 w-4 shrink-0 text-red-500" />
                      )}
                      <span className="line-clamp-2">{qq.prompt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>
      )}

      <AnimatePresence>
        {quizOpen && activeQuestions.length > 0 && (
          <QuizFullscreen
            open={quizOpen}
            onClose={() => setQuizOpen(false)}
            hex={hex}
            questions={activeQuestions}
            title={featured?.title ?? "Quiz"}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

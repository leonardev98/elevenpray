"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Play,
  RotateCcw,
  Sparkles,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/providers/auth-provider";
import { courseHex } from "../course-detail-utils";
import type { CourseFlashcard } from "@/app/lib/study-university/types";
import type { MockCourseExtended } from "../../../../lib/mock-course-data";
import { useCourseClasses } from "../../../../lib/course-classes-store";
import { useStudyBackendLink } from "../../../../lib/study-backend-link";
import { useCourseFlashcards } from "../../../../lib/course-flashcards-store";
interface FlashcardStudyFullscreenProps {
  open: boolean;
  courseName: string;
  hex: string;
  cards: CourseFlashcard[];
  onClose: () => void;
}

export function FlashcardStudyFullscreen({
  open,
  courseName,
  hex,
  cards,
  onClose,
}: FlashcardStudyFullscreenProps) {
  const [order, setOrder] = useState<string[]>(() => cards.map((c) => c.id));
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [hint, setHint] = useState(true);
  const [done, setDone] = useState(false);
  const [counts, setCounts] = useState({ easy: 0, normal: 0, difficult: 0 });

  const reset = useCallback(() => {
    setOrder(cards.map((c) => c.id));
    setIdx(0);
    setFlipped(false);
    setHint(true);
    setDone(false);
    setCounts({ easy: 0, normal: 0, difficult: 0 });
  }, [cards]);

  const currentId = order[idx];
  const current = cards.find((c) => c.id === currentId) ?? cards[0];

  const nextFromRating = (kind: "easy" | "normal" | "difficult") => {
    setCounts((c) => ({ ...c, [kind]: c[kind] + 1 }));
    setFlipped(false);
    setHint(true);
    if (kind === "difficult") {
      setOrder((prev) => {
        const cur = prev[idx];
        const rest = prev.filter((_, i) => i !== idx);
        const next = [...rest, cur];
        const nextIdx = (idx + 1) % Math.max(next.length, 1);
        queueMicrotask(() => setIdx(nextIdx));
        return next;
      });
      return;
    }
    if (idx >= order.length - 1) {
      setDone(true);
    } else {
      setIdx((i) => i + 1);
    }
  };

  const goPrev = () => {
    setFlipped(false);
    setIdx((i) => Math.max(0, i - 1));
  };
  const goNext = () => {
    setFlipped(false);
    setIdx((i) => Math.min(order.length - 1, i + 1));
  };

  if (!open || cards.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] flex flex-col bg-[var(--bg-base)]"
    >
      {!done ? (
        <>
          <header className="shrink-0 border-b-[0.5px] border-[var(--border)] px-4 py-3">
            <div className="mx-auto flex max-w-4xl items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-[var(--radius-md)] p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="min-w-0 flex-1 text-center">
                <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                  Flashcards — {courseName}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {idx + 1} / {order.length}
                </p>
              </div>
            </div>
            <div className="mx-auto mt-2 h-1 max-w-4xl overflow-hidden rounded-full bg-[var(--bg-input)]">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${((idx + (flipped ? 0.5 : 0)) / Math.max(order.length, 1)) * 100}%`,
                  backgroundColor: hex,
                }}
              />
            </div>
          </header>

          <div className="relative flex flex-1 items-center justify-center gap-4 px-4 py-6">
            <button
              type="button"
              onClick={goPrev}
              disabled={idx === 0}
              className="hidden shrink-0 rounded-full border-[0.5px] border-[var(--border-strong)] p-3 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] disabled:opacity-30 sm:block"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              type="button"
              className="relative h-[min(50vh,420px)] w-[min(60vw,520px)] max-w-full [perspective:1200px]"
              onClick={() => {
                setFlipped((f) => !f);
                setHint(false);
              }}
            >
              <div
                className="relative h-full w-full transition-transform duration-300 [transform-style:preserve-3d]"
                style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
              >
                <div className="absolute inset-0 flex flex-col rounded-[var(--radius-lg)] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-6 [backface-visibility:hidden]">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                      Pregunta
                    </p>
                    {current?.classNumber != null ? (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{ color: hex, backgroundColor: `${hex}22` }}
                      >
                        Clase {current.classNumber}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-4 flex flex-1 items-center justify-center text-center text-lg font-semibold text-[var(--text-primary)]">
                    {current?.question}
                  </p>
                </div>
                <div className="absolute inset-0 flex flex-col rounded-[var(--radius-lg)] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                    Respuesta
                  </p>
                  <p
                    className="mt-4 flex flex-1 items-center justify-center text-center text-lg font-semibold"
                    style={{ color: hex }}
                  >
                    {current?.answer}
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        nextFromRating("easy");
                      }}
                      className="rounded-[var(--radius-md)] bg-[var(--accent-subtle)] px-4 py-2 text-sm font-medium text-[var(--accent)]"
                    >
                      Fácil
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        nextFromRating("normal");
                      }}
                      className="rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--warning)_14%,transparent)] px-4 py-2 text-sm font-medium text-[var(--warning)]"
                    >
                      Normal
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        nextFromRating("difficult");
                      }}
                      className="rounded-[var(--radius-md)] bg-[color-mix(in_srgb,var(--error)_12%,transparent)] px-4 py-2 text-sm font-medium text-[var(--error)]"
                    >
                      Difícil
                    </button>
                  </div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={goNext}
              disabled={idx >= order.length - 1}
              className="hidden shrink-0 rounded-full border-[0.5px] border-[var(--border-strong)] p-3 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] disabled:opacity-30 sm:block"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {hint && !flipped && (
            <p className="pb-4 text-center text-xs text-[var(--text-muted)]">
              Toca la tarjeta para revelar la respuesta
            </p>
          )}

          <div className="flex justify-center gap-1.5 pb-6">
            {order.map((id, i) => (
              <span
                key={`${id}-${i}`}
                className={cn(
                  "h-2 w-2 rounded-full bg-[var(--border-strong)]",
                  i === idx && "scale-110",
                )}
                style={i === idx ? { backgroundColor: hex } : undefined}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <Trophy className="mb-4 h-14 w-14" style={{ color: hex }} />
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">¡Sesión completada!</h2>
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            Fácil: {counts.easy} · Normal: {counts.normal} · Difícil: {counts.difficult}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-[var(--radius-md)] border-[0.5px] border-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--accent)] hover:bg-[var(--accent-subtle)]"
            >
              Repetir difíciles
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-[var(--radius-md)] bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--accent-fg)] hover:bg-[var(--accent-hover)]"
            >
              Terminar
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

interface FlashcardsTabProps {
  course: MockCourseExtended;
}

export function FlashcardsTab({ course }: FlashcardsTabProps) {
  const hex = courseHex(course);
  const { token } = useAuth();
  const { workspaceId, courseMap, classMap, ensureCourse } = useStudyBackendLink(token);
  const serverCourseId = courseMap[course.id] ?? null;
  const { items, loading, remove, reload } = useCourseFlashcards(
    token,
    workspaceId,
    serverCourseId,
  );

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
    items.forEach((f) => {
      if (f.classNumber != null) set.add(f.classNumber);
    });
    return [...set].sort((a, b) => a - b);
  }, [classes, items]);

  // server-session -> classNumber lookup
  const sessionToNumber = useMemo(() => {
    const m = new Map<string, number>();
    classes.forEach((c) => {
      const serverId = classMap[c.id];
      if (serverId) m.set(serverId, c.number);
    });
    items.forEach((f) => {
      if (f.classSessionId && f.classNumber != null) {
        m.set(f.classSessionId, f.classNumber);
      }
    });
    return m;
  }, [classes, classMap, items]);

  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [classFilter, setClassFilter] = useState<number | "all">("all");
  const [rangeFrom, setRangeFrom] = useState<number | null>(null);
  const [rangeTo, setRangeTo] = useState<number | null>(null);
  const [studyDeck, setStudyDeck] = useState<CourseFlashcard[] | null>(null);

  const filteredCards = useMemo(() => {
    if (classFilter === "all") return items;
    return items.filter((c) => {
      if (c.classNumber == null && c.classSessionId == null) return false;
      const num = c.classNumber ?? sessionToNumber.get(c.classSessionId ?? "") ?? null;
      return num === classFilter;
    });
  }, [items, classFilter, sessionToNumber]);

  const selectedCount = useMemo(
    () => Object.values(selectedIds).filter(Boolean).length,
    [selectedIds],
  );

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
    for (const card of items) {
      const num = card.classNumber ?? sessionToNumber.get(card.classSessionId ?? "") ?? null;
      if (num != null && num >= min && num <= max) {
        next[card.id] = true;
      }
    }
    setSelectedIds(next);
  }

  function startStudy(cards: CourseFlashcard[]) {
    if (cards.length === 0) return;
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setStudyDeck(shuffled);
  }

  function studySelection() {
    const sel = items.filter((c) => selectedIds[c.id]);
    if (sel.length === 0) {
      startStudy(items);
      return;
    }
    startStudy(sel);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
            Flashcards
          </h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {items.length} totales · selección {selectedCount}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={items.length === 0}
            onClick={studySelection}
            className="inline-flex items-center gap-1 rounded-[var(--radius-md)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-fg)] disabled:opacity-40"
            style={{ backgroundColor: hex }}
          >
            <Play className="h-3.5 w-3.5" aria-hidden />
            {selectedCount > 0 ? `Estudiar selección (${selectedCount})` : "Estudiar todas"}
          </button>
          {selectedCount > 0 ? (
            <button
              type="button"
              onClick={clearSelection}
              className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border-[0.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              Limpiar
            </button>
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

      {allClassNumbers.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setClassFilter("all")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              classFilter === "all"
                ? "bg-[var(--accent-subtle)] text-[var(--accent)]"
                : "bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-primary)]",
            )}
          >
            Todas
          </button>
          {allClassNumbers.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setClassFilter(n)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                classFilter === n
                  ? "bg-[var(--accent-subtle)] text-[var(--accent)]"
                  : "bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-primary)]",
              )}
            >
              Clase {n}
            </button>
          ))}
        </div>
      ) : null}

      {loading ? (
        <p className="py-12 text-center text-sm text-[var(--text-muted)]">Cargando flashcards…</p>
      ) : filteredCards.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--bg-surface)] p-12 text-center">
          <Sparkles className="mx-auto mb-3 h-6 w-6 text-[var(--text-muted)]" aria-hidden />
          <p className="text-sm text-[var(--text-primary)]">
            No hay flashcards{classFilter !== "all" ? ` para la clase ${classFilter}` : " todavía"}
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Crea flashcards desde la vista de cada clase.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCards.map((c) => {
            const isFl = flipped[c.id] ?? false;
            const isSel = selectedIds[c.id] ?? false;
            const num = c.classNumber ?? sessionToNumber.get(c.classSessionId ?? "") ?? null;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.18 }}
                className={cn(
                  "relative h-[150px] overflow-hidden rounded-[var(--radius-md)] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] [perspective:1000px]",
                  isSel && "ring-1",
                )}
                style={
                  isSel
                    ? { boxShadow: `0 0 0 1px ${hex}, inset 0 0 40px ${hex}14`, borderLeftWidth: 3, borderLeftColor: hex }
                    : { borderLeftWidth: 3, borderLeftColor: hex }
                }
              >
                <button
                  type="button"
                  onClick={() => toggleSelect(c.id)}
                  className={cn(
                    "absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-[var(--radius-sm)] border-[0.5px] text-[10px]",
                    isSel
                      ? "text-[var(--accent-fg)]"
                      : "border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-muted)]",
                  )}
                  style={isSel ? { backgroundColor: hex, borderColor: hex } : undefined}
                  aria-pressed={isSel}
                >
                  {isSel ? <Check className="h-3 w-3" /> : null}
                </button>
                <button
                  type="button"
                  className="relative h-full w-full text-left transition-transform duration-300 [transform-style:preserve-3d]"
                  style={{ transform: isFl ? "rotateY(180deg)" : "rotateY(0deg)" }}
                  onClick={() => setFlipped((f) => ({ ...f, [c.id]: !f[c.id] }))}
                >
                  <div className="absolute inset-0 flex flex-col p-3 [backface-visibility:hidden]">
                    <p className="text-[9px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                      Pregunta
                    </p>
                    <p className="mt-1 line-clamp-3 flex-1 text-center text-sm font-semibold leading-snug text-[var(--text-primary)]">
                      {c.question}
                    </p>
                    <div className="flex items-end justify-between">
                      <span className="rounded-full bg-[var(--bg-input)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
                        {num != null ? `Clase ${num}` : "Sin clase"}
                      </span>
                      <span
                        className="rounded p-0.5 text-[var(--text-muted)]"
                        aria-hidden
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex flex-col p-3 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <p className="text-[9px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                      Respuesta
                    </p>
                    <p
                      className="mt-1 line-clamp-3 flex-1 text-center text-sm font-semibold"
                      style={{ color: hex }}
                    >
                      {c.answer}
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => void remove(c.id)}
                  className="absolute bottom-2 right-2 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--error)]"
                  aria-label="Eliminar flashcard"
                >
                  <Trash2 className="h-3 w-3" aria-hidden />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {studyDeck && (
          <FlashcardStudyFullscreen
            key={studyDeck.map((c) => c.id).join("-")}
            open
            courseName={course.name}
            hex={hex}
            cards={studyDeck}
            onClose={() => setStudyDeck(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

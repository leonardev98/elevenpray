"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Play, Plus, RotateCcw, Trophy, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { courseHex } from "../course-detail-utils";
import type { MockCourseExtended, MockFlashcard } from "../../../../lib/mock-course-data";

interface FlashcardStudyFullscreenProps {
  open: boolean;
  courseName: string;
  hex: string;
  cards: MockFlashcard[];
  onClose: () => void;
}

export function FlashcardStudyFullscreen({ open, courseName, hex, cards, onClose }: FlashcardStudyFullscreenProps) {
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
      className="fixed inset-0 z-[500] flex flex-col bg-zinc-950"
    >
      {!done ? (
        <>
          <header className="shrink-0 border-b border-zinc-800 px-4 py-3">
            <div className="mx-auto flex max-w-4xl items-center gap-3">
              <button type="button" onClick={onClose} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800">
                <X className="h-5 w-5" />
              </button>
              <div className="min-w-0 flex-1 text-center">
                <p className="truncate text-sm font-medium text-white">Flashcards — {courseName}</p>
                <p className="text-xs text-zinc-500">
                  {idx + 1} / {order.length}
                </p>
              </div>
              <span className="w-9" />
            </div>
            <div className="mx-auto mt-2 h-1 max-w-4xl overflow-hidden rounded-full bg-zinc-800">
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
              className="hidden shrink-0 rounded-full border border-zinc-700 p-3 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 sm:block"
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
                <div className="absolute inset-0 flex flex-col rounded-xl border border-zinc-800 bg-zinc-900 p-6 [backface-visibility:hidden]">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Pregunta</p>
                  <p className="mt-4 flex flex-1 items-center justify-center text-center text-lg font-semibold text-white">
                    {current?.question}
                  </p>
                </div>
                <div className="absolute inset-0 flex flex-col rounded-xl border border-zinc-800 bg-zinc-900 p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Respuesta</p>
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
                      className="rounded-lg bg-emerald-900/50 px-4 py-2 text-sm font-medium text-emerald-200"
                    >
                      Fácil
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        nextFromRating("normal");
                      }}
                      className="rounded-lg bg-amber-900/50 px-4 py-2 text-sm font-medium text-amber-200"
                    >
                      Normal
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        nextFromRating("difficult");
                      }}
                      className="rounded-lg bg-red-900/50 px-4 py-2 text-sm font-medium text-red-200"
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
              className="hidden shrink-0 rounded-full border border-zinc-700 p-3 text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 sm:block"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {hint && !flipped && (
            <p className="pb-4 text-center text-xs text-zinc-500">Toca la tarjeta para revelar la respuesta</p>
          )}

          <div className="flex justify-center gap-1.5 pb-6">
            {order.map((id, i) => (
              <span
                key={`${id}-${i}`}
                className={cn("h-2 w-2 rounded-full bg-zinc-700", i === idx && "scale-110")}
                style={i === idx ? { backgroundColor: hex } : undefined}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <Trophy className="mb-4 h-14 w-14" style={{ color: hex }} />
          <h2 className="text-xl font-semibold text-white">¡Sesión completada!</h2>
          <p className="mt-3 text-sm text-zinc-400">
            Fácil: {counts.easy} · Normal: {counts.normal} · Difícil: {counts.difficult}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                reset();
              }}
              className="rounded-lg border border-[var(--app-primary)] px-5 py-2.5 text-sm font-medium text-[var(--app-primary)]"
            >
              Repetir difíciles
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-[var(--app-primary)] px-5 py-2.5 text-sm font-medium text-white"
            >
              Terminar
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

const MAX_LEN = 200;
const CLASS_OPTIONS: (number | null)[] = [null, 1, 2, 3, 4, 5, 6];

function buildFilterPills(cards: MockFlashcard[]): string[] {
  const labels = new Set(cards.map((c) => c.classLabel));
  const ordered: string[] = [];
  for (const l of labels) {
    if (l !== "Sin clase") ordered.push(l);
  }
  ordered.sort((a, b) => {
    const na = Number.parseInt(a.replace(/\D+/g, ""), 10) || 0;
    const nb = Number.parseInt(b.replace(/\D+/g, ""), 10) || 0;
    return na - nb;
  });
  if (labels.has("Sin clase")) ordered.push("Sin clase");
  return ["Todas", ...ordered];
}

interface FlashcardsTabProps {
  course: MockCourseExtended;
  cards: MockFlashcard[];
  studyOpen: boolean;
  onStudyOpen: (open: boolean) => void;
  onAddFlashcard: (card: MockFlashcard) => void;
  onFlashcardNuevaEnd: (id: string) => void;
}

export function FlashcardsTab({
  course,
  cards,
  studyOpen,
  onStudyOpen,
  onAddFlashcard,
  onFlashcardNuevaEnd,
}: FlashcardsTabProps) {
  const hex = courseHex(course);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState("Todas");
  const [modalOpen, setModalOpen] = useState(false);
  const [claseSel, setClaseSel] = useState<number | null>(null);
  const [pregunta, setPregunta] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastClaseLabel, setToastClaseLabel] = useState("");

  const filterPills = useMemo(() => buildFilterPills(cards), [cards]);
  const activeFilter = filterPills.includes(filter) ? filter : "Todas";

  const filtered = useMemo(() => {
    if (activeFilter === "Todas") return cards;
    return cards.filter((c) => c.classLabel === activeFilter);
  }, [cards, activeFilter]);

  useEffect(() => {
    const nuevas = cards.filter((c) => c.nueva).map((c) => c.id);
    if (nuevas.length === 0) return;
    const t = window.setTimeout(() => {
      nuevas.forEach((id) => onFlashcardNuevaEnd(id));
    }, 500);
    return () => window.clearTimeout(t);
  }, [cards, onFlashcardNuevaEnd]);

  useEffect(() => {
    if (!toastVisible) return;
    const t = window.setTimeout(() => setToastVisible(false), 3000);
    return () => window.clearTimeout(t);
  }, [toastVisible]);

  function toggleSelect(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  function toggleFlip(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setFlipped((f) => ({ ...f, [id]: !f[id] }));
  }

  const studyDeck = useMemo(() => {
    const ids = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (ids.length) return cards.filter((c) => ids.includes(c.id));
    return cards;
  }, [cards, selected]);

  function closeModal() {
    setModalOpen(false);
    setClaseSel(null);
    setPregunta("");
    setRespuesta("");
  }

  function guardarFlashcard() {
    const q = pregunta.trim();
    const a = respuesta.trim();
    if (!q || !a) return;
    const classLabel = claseSel === null ? "Sin clase" : `Clase ${claseSel}`;
    const classFilter = claseSel === null ? 0 : claseSel;
    onAddFlashcard({
      id: String(Date.now()),
      question: q,
      answer: a,
      classLabel,
      classFilter,
      classId: claseSel,
    });
    setToastClaseLabel(classLabel);
    setToastVisible(true);
    closeModal();
  }

  const previewEmpty = !pregunta.trim() && !respuesta.trim();
  const canSave = Boolean(pregunta.trim() && respuesta.trim());

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Flashcards</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1 rounded-lg bg-[var(--app-primary)] px-2.5 py-1.5 text-xs font-medium text-white"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Crear flashcard
          </button>
          <button
            type="button"
            onClick={() => onStudyOpen(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--app-primary)] px-2.5 py-1.5 text-xs font-medium text-[var(--app-primary)]"
          >
            <Play className="h-3.5 w-3.5" aria-hidden />
            Estudiar selección
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {filterPills.map((pill) => (
          <button
            key={pill}
            type="button"
            onClick={() => setFilter(pill)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              activeFilter === pill ? "bg-zinc-700 text-white" : "bg-zinc-800/80 text-zinc-400 hover:text-zinc-200",
            )}
          >
            {pill}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => {
          const isFl = flipped[c.id] ?? false;
          const isSel = selected[c.id] ?? false;
          return (
            <motion.div
              key={c.id}
              initial={c.nueva ? { opacity: 0, scale: 0.9 } : undefined}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={cn(
                "relative h-[140px] overflow-hidden rounded-lg border border-zinc-800 bg-zinc-800/50 [perspective:1000px]",
                isSel && "ring-1",
              )}
              style={
                isSel
                  ? { boxShadow: `0 0 0 1px ${hex}, inset 0 0 40px ${hex}14` }
                  : { borderLeftWidth: 3, borderLeftColor: hex }
              }
            >
              <button
                type="button"
                onClick={() => toggleSelect(c.id)}
                className={cn(
                  "absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded border text-[10px]",
                  isSel ? "border-white/50 bg-white/20 text-white" : "border-zinc-600 bg-zinc-900/80 text-zinc-400",
                )}
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
                  <p className="text-[9px] font-medium uppercase tracking-wider text-zinc-500">Pregunta</p>
                  <p className="mt-1 line-clamp-3 flex-1 text-center text-sm font-semibold leading-snug text-white">
                    {c.question}
                  </p>
                  <div className="flex items-end justify-between">
                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">{c.classLabel}</span>
                    <button
                      type="button"
                      className="rounded p-0.5 text-zinc-500 hover:text-white"
                      onClick={(e) => toggleFlip(c.id, e)}
                      aria-label="Voltear"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="absolute inset-0 flex flex-col p-3 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <p className="text-[9px] font-medium uppercase tracking-wider text-zinc-500">Respuesta</p>
                  <p className="mt-1 line-clamp-3 flex-1 text-center text-sm font-semibold" style={{ color: hex }}>
                    {c.answer}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <span className="rounded bg-emerald-900/40 px-1.5 py-0.5 text-[9px] text-emerald-200">Fácil</span>
                    <span className="rounded bg-amber-900/40 px-1.5 py-0.5 text-[9px] text-amber-200">Normal</span>
                    <span className="rounded bg-red-900/40 px-1.5 py-0.5 text-[9px] text-red-200">Difícil</span>
                  </div>
                  <button type="button" className="absolute bottom-2 right-2 p-0.5" onClick={(e) => toggleFlip(c.id, e)} aria-label="Voltear">
                    <RotateCcw className="h-3.5 w-3.5 text-zinc-500" />
                  </button>
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {modalOpen ? (
          <motion.div
            key="fc-modal-overlay"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4"
            onClick={() => closeModal()}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="fc-modal-title"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="max-h-[90vh] w-full max-w-[480px] overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 p-7 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-start justify-between gap-3">
                <div>
                  <h2 id="fc-modal-title" className="text-lg font-semibold text-white">
                    Nueva Flashcard
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500">Curso: {course.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => closeModal()}
                  className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-white"
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="mb-2 text-xs font-semibold text-zinc-300">Clase</p>
                  <div className="flex flex-wrap gap-2">
                    {CLASS_OPTIONS.map((n) => {
                      const active = claseSel === n;
                      const label = n === null ? "Sin clase" : `Clase ${n}`;
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setClaseSel(n)}
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                            active ? "text-white" : "border-zinc-600 bg-zinc-900 text-zinc-400 hover:text-zinc-200",
                          )}
                          style={
                            active
                              ? {
                                  borderColor: hex,
                                  backgroundColor: `${hex}26`,
                                }
                              : undefined
                          }
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: hex }} aria-hidden />
                    <span className="text-xs font-semibold text-white">Pregunta</span>
                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">Frente</span>
                  </div>
                  <textarea
                    value={pregunta}
                    onChange={(e) => setPregunta(e.target.value.slice(0, MAX_LEN))}
                    rows={4}
                    placeholder="¿Qué quieres recordar? Ej: ¿Cuál es la derivada de xⁿ?"
                    className={cn(
                      "w-full rounded-md border border-zinc-700 bg-zinc-900 p-3 text-sm text-zinc-100 outline-none transition-[border-color,box-shadow] duration-150",
                      "placeholder:text-zinc-500",
                      "focus:border-[var(--app-primary)] focus:shadow-[0_0_0_3px_rgba(13,148,136,0.2)]",
                    )}
                  />
                  <p className="mt-1 text-right text-xs text-zinc-500">
                    {pregunta.length} / {MAX_LEN}
                  </p>
                </div>

                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full border-2 border-dashed border-zinc-600"
                      style={{ backgroundColor: `${hex}33` }}
                      aria-hidden
                    />
                    <span className="text-xs font-semibold text-white">Respuesta</span>
                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">Reverso</span>
                  </div>
                  <textarea
                    value={respuesta}
                    onChange={(e) => setRespuesta(e.target.value.slice(0, MAX_LEN))}
                    rows={4}
                    placeholder="La respuesta correcta. Ej: nxⁿ⁻¹"
                    className={cn(
                      "w-full rounded-md border border-zinc-700 bg-zinc-900 p-3 text-sm text-zinc-100 outline-none transition-[border-color,box-shadow] duration-150",
                      "placeholder:text-zinc-500",
                      "focus:border-[var(--app-primary)] focus:shadow-[0_0_0_3px_rgba(13,148,136,0.2)]",
                    )}
                  />
                  <p className="mt-1 text-right text-xs text-zinc-500">
                    {respuesta.length} / {MAX_LEN}
                  </p>
                </div>

                <div className="border-t border-zinc-800/80 pt-4">
                  <p className="mb-2 text-xs text-zinc-500">Vista previa</p>
                  <div className={cn("grid grid-cols-2 gap-2", previewEmpty && "opacity-40")}>
                    <div
                      className="flex h-20 flex-col rounded-md border p-2"
                      style={{ borderColor: hex }}
                    >
                      <p className="text-[9px] font-medium uppercase tracking-wider text-zinc-500">Pregunta</p>
                      <p className="mt-auto line-clamp-2 text-center text-sm text-white">
                        {pregunta.trim() ? (
                          pregunta.trim()
                        ) : (
                          <span className="text-zinc-500">Escribe la pregunta</span>
                        )}
                      </p>
                    </div>
                    <div
                      className="flex h-20 flex-col rounded-md border p-2"
                      style={{ borderColor: hex }}
                    >
                      <p className="text-[9px] font-medium uppercase tracking-wider text-zinc-500">Respuesta</p>
                      <p className="mt-auto line-clamp-2 text-center text-sm text-white">
                        {respuesta.trim() ? (
                          respuesta.trim()
                        ) : (
                          <span className="text-zinc-500">Escribe la respuesta</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <button type="button" onClick={() => closeModal()} className="text-sm text-zinc-500 hover:text-white">
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={!canSave}
                    onClick={guardarFlashcard}
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--app-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
                  >
                    <Check className="h-4 w-4" aria-hidden />
                    Guardar flashcard
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {toastVisible ? (
          <motion.div
            key="fc-toast"
            role="status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 left-6 z-[60] flex max-w-[min(100vw-2rem,320px)] items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 shadow-xl"
            style={{ borderLeftWidth: 3, borderLeftColor: hex }}
          >
            <Check className="mt-0.5 h-5 w-5 shrink-0" style={{ color: hex }} aria-hidden />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">Flashcard creada</p>
              <p className="text-xs text-zinc-500">{toastClaseLabel}</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {studyOpen && (
          <FlashcardStudyFullscreen
            key={studyDeck.map((c) => c.id).join("-")}
            open={studyOpen}
            courseName={course.name}
            hex={hex}
            cards={studyDeck}
            onClose={() => onStudyOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

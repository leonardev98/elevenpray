"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Layers, Plus, RotateCcw, Sparkles, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/providers/auth-provider";
import {
  useCourseFlashcards,
  type MissingMappingRecovery,
} from "../../../../lib/course-flashcards-store";
import { useStudyBackendLink } from "../../../../lib/study-backend-link";
import type { CourseClass } from "../../../../lib/course-classes-store";
import type { MockCourseExtended } from "../../../../lib/mock-course-data";

interface ClassFlashcardsSectionProps {
  course: MockCourseExtended;
  cls: CourseClass;
  hex: string;
}

const MAX_LEN = 280;

export function ClassFlashcardsSection({ course, cls, hex }: ClassFlashcardsSectionProps) {
  const { token } = useAuth();
  const {
    workspaceId,
    classMap,
    courseMap,
    ensureClassSession,
    refreshCourseMapping,
    refreshClassSessionMapping,
  } = useStudyBackendLink(token);
  const serverCourseId = courseMap[course.id] ?? null;
  const serverSessionId = classMap[cls.id] ?? null;

  const onMissingMapping = useCallback(
    async ({
      classSessionId,
    }: {
      kind: "course" | "class_session";
      classSessionId: string | null;
    }): Promise<MissingMappingRecovery | null> => {
      // Si la flashcard llevaba clase asociada hay que regenerar curso+clase.
      // En caso contrario basta con regenerar el curso.
      if (classSessionId) {
        const { courseId, classSessionId: newSessionId } =
          await refreshClassSessionMapping(course, cls);
        if (!courseId) return null;
        return { courseId, classSessionId: newSessionId };
      }
      const newCourseId = await refreshCourseMapping(course);
      if (!newCourseId) return null;
      return { courseId: newCourseId };
    },
    [course, cls, refreshCourseMapping, refreshClassSessionMapping],
  );

  const { items, loading, create, remove } = useCourseFlashcards(
    token,
    workspaceId,
    serverCourseId,
    { onMissingMapping },
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  const classCards = useMemo(
    () => items.filter((c) => c.classSessionId === serverSessionId),
    [items, serverSessionId],
  );

  useEffect(() => {
    if (token && course && cls && !serverSessionId) {
      void ensureClassSession(course, cls);
    }
  }, [token, course, cls, serverSessionId, ensureClassSession]);

  function closeModal() {
    setModalOpen(false);
    setQuestion("");
    setAnswer("");
    setSaving(false);
  }

  async function handleCreate() {
    if (!question.trim() || !answer.trim()) return;
    setSaving(true);
    try {
      const sessionId: string | null =
        serverSessionId ?? (await ensureClassSession(course, cls));
      await create({
        question: question.trim(),
        answer: answer.trim(),
        classSessionId: sessionId ?? undefined,
      });
      // `create` ya hace optimistic update y devuelve la flashcard con sus
      // datos hidratados (incluido `classNumber`/`classTitle`). Evitamos un
      // `reload()` adicional, que añade ~300-500 ms y puede usar un
      // `serverCourseId` desactualizado tras una recuperación de mapeo.
      closeModal();
    } catch (err) {
      console.error("Error creating flashcard:", err);
      setSaving(false);
    }
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4" style={{ color: hex }} aria-hidden />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Flashcards de esta clase
          </h3>
          <span className="rounded-full bg-[var(--bg-input)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
            {classCards.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1 rounded-[var(--radius-md)] px-3 py-1.5 text-xs font-medium text-[var(--accent-fg)] transition-colors hover:opacity-90"
          style={{ backgroundColor: hex }}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Nueva flashcard
        </button>
      </div>

      {loading ? (
        <p className="py-6 text-center text-xs text-[var(--text-muted)]">Cargando…</p>
      ) : classCards.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--bg-surface)] p-6 text-center">
          <Sparkles className="mx-auto mb-2 h-5 w-5 text-[var(--text-muted)]" aria-hidden />
          <p className="text-sm text-[var(--text-primary)]">Aún no hay flashcards</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Crea preguntas para repasar el contenido de esta clase.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {classCards.map((card) => {
            const isFlipped = flipped[card.id] ?? false;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className="relative h-[150px] overflow-hidden rounded-[var(--radius-md)] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] [perspective:1000px]"
                style={{ borderLeftWidth: 3, borderLeftColor: hex }}
              >
                <button
                  type="button"
                  className="relative h-full w-full text-left transition-transform duration-300 [transform-style:preserve-3d]"
                  style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
                  onClick={() =>
                    setFlipped((f) => ({ ...f, [card.id]: !f[card.id] }))
                  }
                >
                  <div className="absolute inset-0 flex flex-col p-3 [backface-visibility:hidden]">
                    <p className="text-[9px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                      Pregunta
                    </p>
                    <p className="mt-1 line-clamp-4 flex-1 text-center text-sm font-semibold leading-snug text-[var(--text-primary)]">
                      {card.question}
                    </p>
                    <span className="self-start rounded-full bg-[var(--bg-input)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
                      Toca para voltear
                    </span>
                  </div>
                  <div className="absolute inset-0 flex flex-col p-3 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <p className="text-[9px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                      Respuesta
                    </p>
                    <p
                      className="mt-1 line-clamp-4 flex-1 text-center text-sm font-semibold"
                      style={{ color: hex }}
                    >
                      {card.answer}
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => void remove(card.id)}
                  className="absolute right-2 top-2 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--error)]"
                  aria-label="Eliminar flashcard"
                >
                  <Trash2 className="h-3 w-3" aria-hidden />
                </button>
                <span className="absolute bottom-2 right-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--bg-input)] text-[var(--text-muted)]">
                  <RotateCcw className="h-3 w-3" aria-hidden />
                </span>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {modalOpen ? (
          <motion.div
            key="fc-class-modal-overlay"
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
              className="max-h-[90vh] w-full max-w-[480px] overflow-y-auto rounded-[var(--radius-xl)] border-[0.5px] border-[var(--border-strong)] bg-[var(--bg-elevated)] p-7 shadow-[var(--shadow-md)]"
              onClick={(e) => e.stopPropagation()}
              style={{ borderTopColor: hex, borderTopWidth: 3 }}
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    Nueva flashcard
                  </h2>
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

              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-xs font-semibold text-[var(--text-primary)]">Pregunta</p>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value.slice(0, MAX_LEN))}
                    rows={3}
                    placeholder="¿Qué quieres recordar?"
                    className={cn(
                      "w-full rounded-[var(--radius-md)] border-[0.5px] border-[var(--border)] bg-[var(--bg-input)] p-3 text-sm text-[var(--text-primary)] outline-none transition-[border-color]",
                      "placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]",
                    )}
                  />
                  <p className="mt-1 text-right text-xs text-[var(--text-muted)]">
                    {question.length} / {MAX_LEN}
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold text-[var(--text-primary)]">Respuesta</p>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value.slice(0, MAX_LEN))}
                    rows={3}
                    placeholder="La respuesta correcta"
                    className={cn(
                      "w-full rounded-[var(--radius-md)] border-[0.5px] border-[var(--border)] bg-[var(--bg-input)] p-3 text-sm text-[var(--text-primary)] outline-none transition-[border-color]",
                      "placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]",
                    )}
                  />
                  <p className="mt-1 text-right text-xs text-[var(--text-muted)]">
                    {answer.length} / {MAX_LEN}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={!question.trim() || !answer.trim() || saving}
                    onClick={handleCreate}
                    className="inline-flex items-center gap-2 rounded-[var(--radius-md)] px-5 py-2.5 text-sm font-medium text-[var(--accent-fg)] disabled:opacity-40"
                    style={{ backgroundColor: hex }}
                  >
                    <Check className="h-4 w-4" aria-hidden />
                    {saving ? "Guardando…" : "Guardar"}
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

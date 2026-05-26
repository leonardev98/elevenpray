"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/app/providers/auth-provider";
import {
  deleteQuestion,
  listQuestions,
  type CommunityQuestionDto,
} from "@/app/lib/community-api";
import type { PostType } from "../../community-types";
import { QuestionCard } from "./QuestionCard";
import { EditQuestionModal } from "./EditQuestionModal";

type Filter = "all" | "unanswered" | "top" | "week";

const FILTER_PILLS: { id: Filter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "unanswered", label: "Sin responder" },
  { id: "top", label: "Más respondidas" },
  { id: "week", label: "Esta semana" },
];

interface QuestionsTabProps {
  onOpenModal: (type: PostType) => void;
  refreshKey: number;
}

export function QuestionsTab({ onOpenModal, refreshKey }: QuestionsTabProps) {
  const { token, user } = useAuth();
  const [filter, setFilter] = useState<Filter>("all");
  const [questions, setQuestions] = useState<CommunityQuestionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<CommunityQuestionDto | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    listQuestions(token, { filter })
      .then((data) => {
        if (!cancelled) setQuestions(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Error al cargar preguntas");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, filter, refreshKey]);

  const handleDelete = useCallback(
    async (q: CommunityQuestionDto) => {
      if (!token) return;
      if (!window.confirm("¿Eliminar esta pregunta y todas sus respuestas?")) return;
      try {
        await deleteQuestion(token, q.id);
        setQuestions((curr) => curr.filter((x) => x.id !== q.id));
      } catch (err) {
        window.alert(err instanceof Error ? err.message : "No se pudo eliminar");
      }
    },
    [token],
  );

  const handleEdit = useCallback((q: CommunityQuestionDto) => {
    setEditing(q);
  }, []);

  const handleUpdated = useCallback((updated: CommunityQuestionDto) => {
    setQuestions((curr) => curr.map((q) => (q.id === updated.id ? updated : q)));
    setEditing(null);
  }, []);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-[var(--app-fg)]">
          Preguntas de la comunidad
        </h2>
        <button
          type="button"
          onClick={() => onOpenModal("pregunta")}
          className="rounded-[var(--radius-md)] bg-[var(--accent)] px-[18px] py-[10px] text-sm font-medium text-[var(--accent-fg)] transition-colors hover:bg-[var(--accent-hover)]"
        >
          + Hacer pregunta
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTER_PILLS.map((pill) => {
          const active = filter === pill.id;
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => setFilter(pill.id)}
              className={
                active
                  ? "rounded-full bg-[var(--app-primary-soft)] px-3 py-1 text-xs font-medium text-[var(--app-primary)]"
                  : "rounded-full border border-[var(--app-border)] px-3 py-1 text-xs text-[var(--app-fg-muted)] transition-colors hover:text-[var(--app-fg)]"
              }
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {loading && (
        <p className="rounded-xl border border-[var(--app-border)] p-6 text-center text-sm text-[var(--app-fg-muted)]">
          Cargando preguntas...
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-[var(--error)]/30 bg-[var(--error-subtle)] p-4 text-sm text-[var(--error)]"
        >
          {error}
        </p>
      )}
      {!loading && !error && questions.length === 0 && (
        <div className="student-card flex flex-col items-center gap-2 p-8 text-center">
          <p className="text-sm font-medium text-[var(--app-fg)]">
            No hay preguntas con este filtro
          </p>
          <p className="text-xs text-[var(--app-fg-muted)]">
            Sé el primero en preguntar a la comunidad.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {questions.map((q) => (
          <QuestionCard
            key={q.id}
            question={q}
            currentUserId={user?.id ?? null}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <EditQuestionModal
        question={editing}
        onClose={() => setEditing(null)}
        onUpdated={handleUpdated}
      />
    </div>
  );
}

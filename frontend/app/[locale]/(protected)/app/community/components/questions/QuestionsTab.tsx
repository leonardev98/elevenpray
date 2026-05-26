"use client";

import type { PostType } from "../../community-types";
import { MOCK_QUESTIONS } from "../../community-mock-data";
import { QuestionCard } from "./QuestionCard";

const FILTER_PILLS = ["Todas", "Sin responder", "Más votadas", "Esta semana"] as const;

export function QuestionsTab({ onOpenModal }: { onOpenModal: (type: PostType) => void }) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-[var(--app-fg)]">Preguntas de la comunidad</h2>
        <button
          type="button"
          onClick={() => onOpenModal("pregunta")}
          className="rounded-[var(--radius-md)] bg-[var(--accent)] px-[18px] py-[10px] text-sm font-medium text-[var(--accent-fg)] transition-colors hover:bg-[var(--accent-hover)]"
        >
          + Hacer pregunta
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTER_PILLS.map((pill, i) => (
          <span
            key={pill}
            className={
              i === 0
                ? "rounded-full bg-[var(--app-primary-soft)] px-3 py-1 text-xs font-medium text-[var(--app-primary)]"
                : "rounded-full border border-[var(--app-border)] px-3 py-1 text-xs text-[var(--app-fg-muted)]"
            }
          >
            {pill}
          </span>
        ))}
      </div>

      <div className="space-y-4">
        {MOCK_QUESTIONS.map((q) => (
          <QuestionCard key={q.id} question={q} />
        ))}
      </div>
    </div>
  );
}

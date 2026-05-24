"use client";

import { MOCK_TEMPLATES } from "../../community-mock-data";
import { TemplateCard } from "./TemplateCard";

const FILTER_PILLS = ["Todas", "Medicina", "Ingeniería", "Humanidades", "Ciencias"] as const;

export function TemplatesTab() {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-[var(--app-fg)]">Plantillas de la comunidad</h2>
        <button
          type="button"
          className="rounded-xl bg-[var(--app-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--app-primary-hover)]"
        >
          + Subir plantilla
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {MOCK_TEMPLATES.map((t) => (
          <TemplateCard key={t.id} template={t} />
        ))}
      </div>
    </div>
  );
}

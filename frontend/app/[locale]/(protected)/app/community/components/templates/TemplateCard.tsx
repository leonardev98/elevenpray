"use client";

import { Download, LayoutTemplate, Star } from "lucide-react";
import type { CommunityTemplate } from "../../community-types";

export function TemplateCard({ template }: { template: CommunityTemplate }) {
  return (
    <article className="student-card flex flex-col overflow-hidden transition hover:-translate-y-px hover:border-[var(--app-primary)]/40">
      <div className="flex h-[100px] items-center justify-center bg-[var(--app-surface-soft)]">
        <LayoutTemplate className="h-12 w-12 text-[var(--app-primary)] opacity-40" aria-hidden />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-[var(--app-fg)]">{template.name}</h3>
        <p className="mt-1 text-xs text-[var(--app-fg-muted)]">
          {template.author} · {template.university}
        </p>
        <div className="mt-3 flex items-center gap-4 text-xs text-[var(--app-fg-muted)]">
          <span className="flex items-center gap-1">
            <Download className="h-3.5 w-3.5" aria-hidden />
            {template.downloads} descargas
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5" aria-hidden />
            {template.rating}
          </span>
        </div>
        <button
          type="button"
          className="mt-4 w-full rounded-xl border border-[var(--app-primary)] py-2 text-sm font-medium text-[var(--app-primary)] transition-colors hover:bg-[var(--app-primary)] hover:text-white"
        >
          Usar plantilla
        </button>
      </div>
    </article>
  );
}

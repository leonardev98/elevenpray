"use client";

import { useState } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const FILTERS = ["Todas", "Pendientes", "En progreso", "Completadas"] as const;

export function TaskFiltersBar() {
  const [activeFilter, setActiveFilter] = useState<string>("Todas");

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              activeFilter === filter
                ? "bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
                : "bg-[var(--app-surface-soft)] text-[var(--app-fg-muted)] hover:text-[var(--app-fg)]",
            )}
          >
            {filter}
          </button>
        ))}
        <span className="hidden h-5 w-px bg-[var(--app-border)] sm:block" aria-hidden />
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-1.5 text-xs text-[var(--app-fg-secondary)]"
        >
          <ArrowUpDown className="h-3.5 w-3.5" aria-hidden />
          Ordenar: Fecha límite ↑
        </button>
      </div>

      <div className="relative w-full sm:w-48">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--app-fg-muted)]"
          aria-hidden
        />
        <input
          type="search"
          placeholder="Buscar..."
          readOnly
          className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-soft)] py-1.5 pl-8 pr-3 text-xs text-[var(--app-fg)] placeholder:text-[var(--app-fg-muted)] focus:outline-none"
        />
      </div>
    </div>
  );
}

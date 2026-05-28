"use client";

import { useMemo } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudentTasks } from "../../context/student-tasks-context";
import type { TaskFilterId } from "../../lib/task-types";

const FILTERS: { id: TaskFilterId; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "pending", label: "Pendientes" },
  { id: "in_progress", label: "En progreso" },
  { id: "done", label: "Completadas" },
];

export function TaskFiltersBar() {
  const { activeFilter, setActiveFilter, searchQuery, setSearchQuery, filteredTasks } =
    useStudentTasks();

  const sortedHint = useMemo(() => {
    const next = [...filteredTasks]
      .filter((t) => t.status !== "done")
      .sort((a, b) => a.dueDateIso.localeCompare(b.dueDateIso))[0];
    return next ? `Próxima: ${next.dueDateLabel}` : "Sin pendientes";
  }, [filteredTasks]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveFilter(id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              activeFilter === id
                ? "bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
                : "bg-[var(--app-surface-soft)] text-[var(--app-fg-muted)] hover:text-[var(--app-fg)]",
            )}
          >
            {label}
          </button>
        ))}
        <span className="hidden h-5 w-px bg-[var(--app-border)] sm:block" aria-hidden />
        <span className="flex items-center gap-1.5 text-xs text-[var(--app-fg-muted)]">
          <ArrowUpDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {sortedHint}
        </span>
      </div>

      <div className="relative w-full sm:w-48">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--app-fg-muted)]"
          aria-hidden
        />
        <input
          type="search"
          placeholder="Buscar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-soft)] py-1.5 pl-8 pr-3 text-xs text-[var(--app-fg)] placeholder:text-[var(--app-fg-muted)] focus:border-[var(--app-primary)] focus:outline-none"
        />
      </div>
    </div>
  );
}

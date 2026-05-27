"use client";

import { CalendarDays, Columns, List, Menu, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useStudentShell } from "../../components/student-shell-context";
import { cn } from "@/lib/utils";
import type { TaskViewMode } from "../lib/tasks-mock-data";

const VIEW_OPTIONS: {
  id: TaskViewMode;
  icon: typeof List;
  tooltip: string;
}[] = [
  { id: "list", icon: List, tooltip: "Vista lista" },
  { id: "kanban", icon: Columns, tooltip: "Vista kanban" },
  { id: "calendar", icon: CalendarDays, tooltip: "Vista calendario" },
];

interface TasksPageHeaderProps {
  viewMode: TaskViewMode;
  onViewChange: (mode: TaskViewMode) => void;
  onNewTask: () => void;
}

export function TasksPageHeader({ viewMode, onViewChange, onNewTask }: TasksPageHeaderProps) {
  const { openMobileMenu } = useStudentShell();
  const t = useTranslations("studentHome");

  return (
    <header className="grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
      <div className="flex min-w-0 items-center gap-2 md:justify-self-start">
        {openMobileMenu && (
          <button
            type="button"
            onClick={openMobileMenu}
            className="rounded-[var(--radius-md)] p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] lg:hidden"
            aria-label={t("openMenu")}
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-2xl font-semibold text-[var(--app-fg)]">Tareas</h1>
      </div>

      <div className="flex items-center justify-center gap-1 justify-self-center rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-1">
        {VIEW_OPTIONS.map(({ id, icon: Icon, tooltip }) => {
          const active = viewMode === id;
          return (
            <button
              key={id}
              type="button"
              title={tooltip}
              aria-label={tooltip}
              aria-pressed={active}
              onClick={() => onViewChange(id)}
              className={cn(
                "rounded-lg p-2 transition-colors duration-150",
                active
                  ? "bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
                  : "text-[var(--app-fg-muted)] hover:text-[var(--app-fg-secondary)]",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onNewTask}
        className="inline-flex items-center justify-center gap-2 justify-self-center rounded-[var(--radius-md)] bg-[var(--accent)] px-[18px] py-[10px] text-sm font-medium text-[var(--accent-fg)] transition-colors hover:bg-[var(--accent-hover)] md:justify-self-end"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Nueva tarea
      </button>
    </header>
  );
}

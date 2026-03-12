"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { CheckSquare, Circle, CircleDot } from "lucide-react";
import { MOCK_TASKS } from "@/app/lib/developer-workspace";
import type { Task, TaskStatus } from "@/app/lib/developer-workspace/types";
import { cn } from "@/lib/utils";

const STATUSES: TaskStatus[] = ["todo", "inProgress", "done"];

export default function TasksPage() {
  const t = useTranslations("developerWorkspace.tasks");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");

  const filtered = useMemo(() => {
    if (statusFilter === "all") return MOCK_TASKS;
    return MOCK_TASKS.filter((task) => task.status === statusFilter);
  }, [statusFilter]);

  const statusIcon = (status: TaskStatus) => {
    switch (status) {
      case "done":
        return <CheckSquare className="h-4 w-4 text-emerald-500" />;
      case "inProgress":
        return <CircleDot className="h-4 w-4 text-[var(--app-navy)]" />;
      default:
        return <Circle className="h-4 w-4 text-[var(--app-fg)]/40" />;
    }
  };

  const statusLabel = (status: TaskStatus) => {
    switch (status) {
      case "todo":
        return t("todo");
      case "inProgress":
        return t("inProgress");
      case "done":
        return t("done");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--app-fg)]">{t("title")}</h1>
        <p className="mt-1 text-[var(--app-fg)]/60">
          Simple, Linear-style task list.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            statusFilter === "all"
              ? "bg-[var(--app-navy)]/15 text-[var(--app-navy)]"
              : "text-[var(--app-fg)]/70 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
          )}
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              statusFilter === s
                ? "bg-[var(--app-navy)]/15 text-[var(--app-navy)]"
                : "text-[var(--app-fg)]/70 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
            )}
          >
            {statusLabel(s)}
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {filtered.map((task) => (
          <li
            key={task.id}
            className={cn(
              "flex items-center gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3",
              task.status === "done" && "opacity-70"
            )}
          >
            <span className="shrink-0">{statusIcon(task.status)}</span>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "font-medium text-[var(--app-fg)]",
                  task.status === "done" && "line-through text-[var(--app-fg)]/60"
                )}
              >
                {task.title}
              </p>
              <div className="mt-0.5 flex gap-2 text-xs text-[var(--app-fg)]/50">
                {task.tag && <span>{task.tag}</span>}
                {task.priority && <span>Priority: {task.priority}</span>}
                {task.dueToday && <span>Due today</span>}
              </div>
            </div>
            <span className="rounded-md bg-[var(--app-bg)] px-2 py-0.5 text-xs text-[var(--app-fg)]/70">
              {statusLabel(task.status)}
            </span>
          </li>
        ))}
      </ul>
      {filtered.length === 0 && (
        <p className="py-12 text-center text-[var(--app-fg)]/50">No tasks.</p>
      )}
    </div>
  );
}

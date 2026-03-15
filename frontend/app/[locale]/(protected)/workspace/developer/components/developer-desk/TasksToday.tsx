"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CheckSquare } from "lucide-react";
import { MOCK_TASKS } from "@/app/lib/developer-workspace";
import { cn } from "@/lib/utils";

const MAX_TASKS = 3;

export interface TasksTodayProps {
  className?: string;
}

export function TasksToday({ className }: TasksTodayProps) {
  const t = useTranslations("developerWorkspace.dashboard");
  const tasksToday = MOCK_TASKS.filter(
    (task) => task.dueToday && task.status !== "done"
  ).slice(0, MAX_TASKS);

  return (
    <section
      className={cn(
        "rounded-2xl border border-[var(--dev-border-subtle)] bg-[var(--dev-surface-elevated)] p-4 shadow-[var(--dev-shadow-card)]",
        className
      )}
    >
      <h2 className="text-[length:var(--dev-font-label-size)] font-medium tracking-[var(--dev-font-label-tracking)] text-[var(--app-fg)]/80">
        {t("tasksToday")}
      </h2>
      {tasksToday.length === 0 ? (
        <p
          className="mt-3 text-[length:var(--dev-font-meta-size)] text-[var(--app-fg)]"
          style={{ opacity: 0.6 }}
        >
          {t("noTasksToday")}
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {tasksToday.map((task) => (
            <li key={task.id}>
              <Link
                href="/workspace/developer/tasks"
                className="block rounded-lg border border-[var(--dev-border-subtle)] bg-[var(--app-bg)]/50 px-3 py-2 text-[length:var(--dev-font-body-size)] text-[var(--app-fg)] transition-colors hover:border-[var(--app-navy)]/20 hover:bg-[var(--app-navy)]/5 hover:text-[var(--app-navy)]"
              >
                <span className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 shrink-0 text-[var(--app-fg)]/50" />
                  {task.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/workspace/developer/tasks"
        className="mt-3 block text-[length:var(--dev-font-meta-size)] font-medium text-[var(--app-navy)] hover:underline"
      >
        {t("viewAllTasks")}
      </Link>
    </section>
  );
}

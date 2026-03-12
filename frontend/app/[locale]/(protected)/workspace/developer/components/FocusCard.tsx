"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CheckSquare, FolderKanban } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MOCK_TASKS } from "@/app/lib/developer-workspace";
import { MOCK_PROJECTS } from "@/app/lib/developer-workspace";

interface FocusCardProps {
  className?: string;
}

export function FocusCard({ className }: FocusCardProps) {
  const t = useTranslations("developerWorkspace.dashboard");
  const tasksToday = MOCK_TASKS.filter((x) => x.dueToday && x.status !== "done");
  const activeProjects = MOCK_PROJECTS.filter((p) => p.status === "active").slice(0, 3);
  const totalTasks = tasksToday.length;
  const doneCount = MOCK_TASKS.filter((x) => x.dueToday && x.status === "done").length;
  const progress = totalTasks + doneCount > 0 ? Math.round((doneCount / (totalTasks + doneCount)) * 100) : 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "rounded-2xl border border-[var(--dev-border-subtle)] bg-[var(--dev-surface-elevated)] p-6 shadow-[var(--dev-shadow-card)]",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-[length:var(--dev-font-display-size)] font-medium tracking-[var(--dev-font-display-tracking)] text-[var(--app-fg)]">
          {t("focusPanel")}
        </h2>
        {totalTasks + doneCount > 0 && (
          <span
            className="text-[length:var(--dev-font-meta-size)] font-medium text-[var(--app-fg)]"
            style={{ opacity: "var(--dev-font-meta-opacity)" }}
          >
            {doneCount}/{totalTasks + doneCount} tareas
          </span>
        )}
      </div>
      {totalTasks + doneCount > 0 && (
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[var(--app-bg)]">
          <motion.div
            className="h-full rounded-full bg-[var(--app-navy)]/20"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      )}
      <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <h3 className="flex items-center gap-2 text-[length:var(--dev-font-label-size)] font-medium tracking-[var(--dev-font-label-tracking)] text-[var(--app-fg)]/70">
            <CheckSquare className="h-3.5 w-3.5" />
            Tasks today
          </h3>
          <ul className="mt-2.5 space-y-1.5">
            {tasksToday.length === 0 ? (
              <li>
                <p className="text-[length:var(--dev-font-body-size)] text-[var(--app-fg)]" style={{ opacity: "var(--dev-font-meta-opacity)" }}>
                  All clear for today.
                </p>
                <Link
                  href="/workspace/developer/tasks"
                  className="mt-1 inline-block text-[length:var(--dev-font-meta-size)] font-medium text-[var(--app-navy)] hover:underline"
                >
                  Ver tareas →
                </Link>
              </li>
            ) : (
              tasksToday.slice(0, 4).map((task, i) => (
                <li key={task.id}>
                  <Link
                    href="/workspace/developer/tasks"
                    className={cn(
                      "block text-[length:var(--dev-font-body-size)] transition-colors hover:text-[var(--app-navy)]",
                      i === 0 ? "font-medium text-[var(--app-fg)]" : "text-[var(--app-fg)]"
                    )}
                  >
                    {task.title}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
        <div>
          <h3 className="flex items-center gap-2 text-[length:var(--dev-font-label-size)] font-medium tracking-[var(--dev-font-label-tracking)] text-[var(--app-fg)]/70">
            <FolderKanban className="h-3.5 w-3.5" />
            Active projects
          </h3>
          <ul className="mt-2.5 space-y-1.5">
            {activeProjects.length === 0 ? (
              <li>
                <p className="text-[length:var(--dev-font-body-size)] text-[var(--app-fg)]" style={{ opacity: "var(--dev-font-meta-opacity)" }}>
                  No active projects
                </p>
                <Link
                  href="/workspace/developer/projects"
                  className="mt-1 inline-block text-[length:var(--dev-font-meta-size)] font-medium text-[var(--app-navy)] hover:underline"
                >
                  Abrir proyectos →
                </Link>
              </li>
            ) : (
              activeProjects.map((p) => (
                <li key={p.id}>
                  <Link
                    href="/workspace/developer/projects"
                    className="block text-[length:var(--dev-font-body-size)] text-[var(--app-fg)] transition-colors hover:text-[var(--app-navy)]"
                  >
                    {p.name}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </motion.section>
  );
}

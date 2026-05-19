"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { MockCourseTask, TaskDueStatus } from "../../lib/mock-course-data";

interface CourseTasksTabProps {
  initialTasks: MockCourseTask[];
}

const DUE_CHIP: Record<TaskDueStatus, string> = {
  overdue: "bg-red-500/15 text-red-300 border-red-500/30",
  soon: "bg-amber-500/15 text-amber-200 border-amber-500/30",
  ok: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
};

export function CourseTasksTab({ initialTasks }: CourseTasksTabProps) {
  const t = useTranslations("studentCourses");
  const [tasks, setTasks] = useState(initialTasks);

  const dueLabel: Record<TaskDueStatus, string> = {
    overdue: t("dueOverdue"),
    soon: t("dueSoon"),
    ok: t("dueOk"),
  };

  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
    );
  }

  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="student-card flex items-center gap-3 px-4 py-3"
        >
          <input
            type="checkbox"
            checked={task.done}
            onChange={() => toggleTask(task.id)}
            className="h-4 w-4 shrink-0 rounded border-[var(--app-border)] bg-[var(--app-surface-soft)] accent-[var(--app-primary)]"
          />
          <span
            className={cn(
              "min-w-0 flex-1 text-sm transition-all duration-200",
              task.done
                ? "text-[var(--app-fg-muted)] line-through opacity-70"
                : "text-[var(--app-fg)]",
            )}
          >
            {task.title}
          </span>
          <span
            className={cn(
              "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
              DUE_CHIP[task.dueStatus],
            )}
          >
            {task.dueDate} · {dueLabel[task.dueStatus]}
          </span>
        </li>
      ))}
    </ul>
  );
}

"use client";

import { useState } from "react";
import { AlertCircle, Calendar, ChevronDown, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MockStudentTask } from "../../lib/tasks-mock-data";
import { TaskCard } from "./TaskCard";

const SECTION_ICONS = {
  alert: { Icon: AlertCircle, className: "text-[var(--error)]" },
  clock: { Icon: Clock, className: "text-[var(--warning)]" },
  calendar: { Icon: Calendar, className: "text-[var(--text-muted)]" },
} as const;

interface TaskSectionProps {
  label: string;
  icon: keyof typeof SECTION_ICONS;
  tasks: MockStudentTask[];
}

export function TaskSection({ label, icon, tasks }: TaskSectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { Icon, className } = SECTION_ICONS[icon];

  return (
    <section className="space-y-2">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center gap-2 py-1 text-left"
      >
        <Icon className={cn("h-4 w-4 shrink-0", className)} aria-hidden />
        <span className="text-sm font-medium text-[var(--app-fg)]">
          {label}
          <span className="ml-1 text-[var(--app-fg-muted)]">({tasks.length})</span>
        </span>
        <ChevronDown
          className={cn(
            "ml-auto h-4 w-4 text-[var(--app-fg-muted)] transition-transform duration-150",
            collapsed && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      <div
        className={cn(
          "space-y-2 overflow-hidden transition-[max-height] duration-200 ease-in-out",
          collapsed ? "max-h-0" : "max-h-[2000px]",
        )}
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </section>
  );
}

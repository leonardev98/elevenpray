"use client";

import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import type { StudentTask } from "../../lib/task-types";
import { KanbanCard } from "./KanbanCard";

type ColumnDef = {
  id: "pending" | "in_progress" | "done";
  label: string;
  dotColor: string;
  barColor: string;
};

interface KanbanColumnProps {
  column: ColumnDef;
  tasks: StudentTask[];
  onAddTask: () => void;
}

export function KanbanColumn({ column, tasks, onAddTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[320px] flex-col rounded-xl p-3 transition-colors duration-200 ${
        isOver ? "bg-[var(--app-primary-soft)]/40 ring-1 ring-[var(--app-primary)]/30" : "bg-[var(--app-surface-soft)]/50"
      }`}
    >
      <header className="mb-3 flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${column.dotColor}`} aria-hidden />
        <h3 className="text-sm font-medium text-[var(--app-fg)]">{column.label}</h3>
        <span className="text-xs text-[var(--app-fg-muted)]">({tasks.length})</span>
      </header>

      <div className="flex flex-1 flex-col gap-2">
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} barColor={column.barColor} />
        ))}
      </div>

      <button
        type="button"
        onClick={onAddTask}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs text-[var(--app-fg-muted)] transition-colors hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-fg)]"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
        Agregar tarea
      </button>
    </div>
  );
}

"use client";

import { Plus } from "lucide-react";
import {
  KANBAN_COLUMNS,
  getKanbanTasks,
  type KanbanColumnId,
  type TaskStatus,
} from "../../lib/tasks-mock-data";
import { KanbanCard } from "./KanbanCard";

const COLUMN_STATUS: Record<KanbanColumnId, TaskStatus> = {
  pending: "pending",
  in_progress: "in_progress",
  done: "done",
};

interface TasksKanbanViewProps {
  onAddTask: (status: TaskStatus) => void;
}

export function TasksKanbanView({ onAddTask }: TasksKanbanViewProps) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid min-w-[720px] grid-cols-3 gap-4">
        {KANBAN_COLUMNS.map((column) => {
          const tasks = getKanbanTasks(column.id);
          return (
            <div key={column.id} className="flex min-h-[320px] flex-col rounded-xl bg-[var(--app-surface-soft)]/50 p-3">
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
                onClick={() => onAddTask(COLUMN_STATUS[column.id])}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs text-[var(--app-fg-muted)] transition-colors hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-fg)]"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden />
                Agregar tarea
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

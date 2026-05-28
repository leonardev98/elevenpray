"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useStudentTasks } from "../../context/student-tasks-context";
import { getKanbanTasks } from "../../lib/map-assignment";
import { KANBAN_COLUMNS, type KanbanColumnId, type StudentTask, type TaskStatus } from "../../lib/task-types";
import { KanbanCard } from "./KanbanCard";
import { KanbanColumn } from "./KanbanColumn";
import { TasksKanbanSkeleton } from "../TasksSkeleton";

const COLUMN_STATUS: Record<KanbanColumnId, TaskStatus> = {
  pending: "pending",
  in_progress: "in_progress",
  done: "done",
};

interface TasksKanbanViewProps {
  onAddTask: (status: TaskStatus) => void;
}

export function TasksKanbanView({ onAddTask }: TasksKanbanViewProps) {
  const { filteredTasks, setStatus, loading } = useStudentTasks();
  const [activeTask, setActiveTask] = useState<StudentTask | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const tasksByColumn = useMemo(() => {
    const map: Record<KanbanColumnId, StudentTask[]> = {
      pending: getKanbanTasks(filteredTasks, "pending"),
      in_progress: getKanbanTasks(filteredTasks, "in_progress"),
      done: getKanbanTasks(filteredTasks, "done"),
    };
    return map;
  }, [filteredTasks]);

  function handleDragStart(event: DragStartEvent) {
    const task = filteredTasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;
    const taskId = String(active.id);
    const newColumn = over.id as KanbanColumnId;
    const task = filteredTasks.find((t) => t.id === taskId);
    if (!task || task.status === COLUMN_STATUS[newColumn]) return;
    await setStatus(taskId, COLUMN_STATUS[newColumn]);
  }

  if (loading) return <TasksKanbanSkeleton />;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={(e) => void handleDragEnd(e)}>
      <div className="overflow-x-auto pb-2">
        <motion.div
          className="grid min-w-[720px] grid-cols-3 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.04 } },
          }}
        >
          {KANBAN_COLUMNS.map((column) => (
            <motion.div
              key={column.id}
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            >
              <KanbanColumn
                column={column}
                tasks={tasksByColumn[column.id]}
                onAddTask={() => onAddTask(COLUMN_STATUS[column.id])}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
      <DragOverlay>
        {activeTask ? <KanbanCard task={activeTask} barColor="bg-[var(--app-primary)]" isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}

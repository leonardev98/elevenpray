"use client";

import { AnimatePresence } from "framer-motion";
import { useStudentTasks } from "../../context/student-tasks-context";
import { getTasksBySection } from "../../lib/map-assignment";
import { SECTION_CONFIG } from "../../lib/task-types";
import { TaskFiltersBar } from "./TaskFiltersBar";
import { TaskSection } from "./TaskSection";
import { TasksListSkeleton } from "../TasksSkeleton";

export function TasksListView() {
  const { filteredTasks, loading } = useStudentTasks();

  if (loading) return <TasksListSkeleton />;

  return (
    <div className="space-y-4">
      <TaskFiltersBar />
      <div className="space-y-6">
        {SECTION_CONFIG.map(({ id, label, icon }) => {
          const sectionTasks = getTasksBySection(filteredTasks, id);
          if (sectionTasks.length === 0) return null;
          return (
            <TaskSection
              key={id}
              label={label}
              icon={icon}
              tasks={sectionTasks}
            />
          );
        })}
        <AnimatePresence>
          {filteredTasks.filter((t) => t.status === "done").length > 0 && (
            <TaskSection
              label="Completadas"
              icon="calendar"
              tasks={filteredTasks.filter((t) => t.status === "done")}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { StudentPageShell } from "../components/StudentPageShell";
import { StudentTasksProvider } from "./context/student-tasks-context";
import { NewTaskModal } from "./components/NewTaskModal";
import { TasksCalendarView } from "./components/calendar/TasksCalendarView";
import { TasksKanbanView } from "./components/kanban/TasksKanbanView";
import { TasksListView } from "./components/list/TasksListView";
import { TasksPageHeader } from "./components/TasksPageHeader";
import { TasksSidebar } from "./components/TasksSidebar";
import { TasksEmptyState } from "./components/TasksEmptyState";
import { TasksStateBanner } from "./components/TasksStateBanner";
import { useStudentTasks } from "./context/student-tasks-context";
import type { TaskStatus, TaskViewMode } from "./lib/task-types";

function TasksPageContent() {
  const { tasks, loading, error, workspaceId } = useStudentTasks();
  const [viewMode, setViewMode] = useState<TaskViewMode>("list");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDefaultStatus, setModalDefaultStatus] = useState<TaskStatus>("pending");

  const showEmpty =
    !loading && !error && Boolean(workspaceId) && tasks.length === 0;

  function openModal(status: TaskStatus = "pending") {
    setModalDefaultStatus(status);
    setModalOpen(true);
  }

  return (
    <StudentPageShell hideTopBar maxWidth="max-w-7xl">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-[7] space-y-4">
          <TasksPageHeader
            viewMode={viewMode}
            onViewChange={setViewMode}
            onNewTask={() => openModal("pending")}
          />

          <TasksStateBanner />

          {showEmpty ? (
            <TasksEmptyState onNewTask={() => openModal("pending")} />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="tasks-view-fade"
              >
                {viewMode === "list" && <TasksListView />}
                {viewMode === "kanban" && <TasksKanbanView onAddTask={openModal} />}
                {viewMode === "calendar" && <TasksCalendarView />}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        <div className="min-w-0 flex-[3] shrink-0 lg:sticky lg:top-20">
          <TasksSidebar />
        </div>
      </div>

      <NewTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultStatus={modalDefaultStatus}
      />
    </StudentPageShell>
  );
}

export default function StudentTasksPage() {
  return (
    <StudentTasksProvider>
      <TasksPageContent />
    </StudentTasksProvider>
  );
}

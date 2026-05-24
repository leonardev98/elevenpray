"use client";

import { useState } from "react";
import { StudentPageShell } from "../components/StudentPageShell";
import { NewTaskModal } from "./components/NewTaskModal";
import { TasksCalendarView } from "./components/calendar/TasksCalendarView";
import { TasksKanbanView } from "./components/kanban/TasksKanbanView";
import { TasksListView } from "./components/list/TasksListView";
import { TasksPageHeader } from "./components/TasksPageHeader";
import { TasksSidebar } from "./components/TasksSidebar";
import type { TaskStatus, TaskViewMode } from "./lib/tasks-mock-data";

export default function StudentTasksPage() {
  const [viewMode, setViewMode] = useState<TaskViewMode>("list");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDefaultStatus, setModalDefaultStatus] = useState<TaskStatus>("pending");

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

          <div
            key={viewMode}
            className="tasks-view-fade"
          >
            {viewMode === "list" && <TasksListView />}
            {viewMode === "kanban" && <TasksKanbanView onAddTask={openModal} />}
            {viewMode === "calendar" && <TasksCalendarView />}
          </div>
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

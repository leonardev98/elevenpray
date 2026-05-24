"use client";

import { SECTION_CONFIG, getTasksBySection } from "../../lib/tasks-mock-data";
import { TaskFiltersBar } from "./TaskFiltersBar";
import { TaskSection } from "./TaskSection";

export function TasksListView() {
  return (
    <div className="space-y-4">
      <TaskFiltersBar />
      <div className="space-y-6">
        {SECTION_CONFIG.map(({ id, label, icon }) => (
          <TaskSection
            key={id}
            label={label}
            icon={icon}
            tasks={getTasksBySection(id)}
          />
        ))}
      </div>
    </div>
  );
}

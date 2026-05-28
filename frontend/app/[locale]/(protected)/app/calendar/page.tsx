"use client";

import { StudentCalendarShell } from "../components/StudentCalendarShell";
import { StudentPageShell } from "../components/StudentPageShell";
import { StudentTasksProvider } from "../tasks/context/student-tasks-context";

export default function StudentCalendarPage() {
  return (
    <StudentTasksProvider>
      <StudentPageShell hideTopBar maxWidth="max-w-[1400px]">
        <StudentCalendarShell />
      </StudentPageShell>
    </StudentTasksProvider>
  );
}

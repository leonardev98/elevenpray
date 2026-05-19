"use client";

import { StudentCalendarShell } from "../components/StudentCalendarShell";
import { StudentPageShell } from "../components/StudentPageShell";

export default function StudentCalendarPage() {
  return (
    <StudentPageShell hideTopBar maxWidth="max-w-[1400px]">
      <StudentCalendarShell />
    </StudentPageShell>
  );
}

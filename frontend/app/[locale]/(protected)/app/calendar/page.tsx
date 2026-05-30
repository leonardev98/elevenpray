"use client";

import { useTranslations } from "next-intl";
import { StudentCalendarShell } from "../components/StudentCalendarShell";
import { StudentPageShell } from "../components/StudentPageShell";
import { StudentTasksProvider } from "../tasks/context/student-tasks-context";

export default function StudentCalendarPage() {
  const t = useTranslations("studentCalendar");

  return (
    <StudentTasksProvider>
      <StudentPageShell hideTopBar title={t("title")} maxWidth="max-w-[1400px]">
        <StudentCalendarShell />
      </StudentPageShell>
    </StudentTasksProvider>
  );
}

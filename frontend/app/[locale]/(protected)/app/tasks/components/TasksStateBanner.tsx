"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useStudentTasks } from "../context/student-tasks-context";

export function TasksStateBanner() {
  const t = useTranslations("studentTasks");
  const { loading, error, workspaceId, refresh } = useStudentTasks();

  if (loading) return null;

  if (error) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--error)]/30 bg-[color-mix(in_srgb,var(--error)_8%,transparent)] px-4 py-3 text-sm text-[var(--error)]">
        <span>{error}</span>
        <button
          type="button"
          onClick={() => void refresh()}
          className="rounded-lg bg-[var(--app-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--app-fg)]"
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  if (!workspaceId) {
    return (
      <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)]/60 px-4 py-4 text-sm text-[var(--app-fg-secondary)]">
        <p>{t("setupWorkspace")}</p>
        <Link href="/app/study" className="mt-2 inline-block text-[var(--app-primary)] hover:underline">
          {t("goToStudy")}
        </Link>
      </div>
    );
  }

  return null;
}

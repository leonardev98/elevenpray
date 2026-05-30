"use client";

import { BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface CoursesEmptyStateProps {
  subtitle?: string;
}

export function CoursesEmptyState({ subtitle }: CoursesEmptyStateProps) {
  const t = useTranslations("studentCourses");

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)]">
        <BookOpen className="h-10 w-10 text-[var(--app-fg-muted)]" />
      </div>
      <h2 className="text-xl font-semibold text-[var(--app-fg)]">{t("emptyTitle")}</h2>
      <p className="mt-2 max-w-sm text-sm text-[var(--app-fg-secondary)]">
        {subtitle ?? t("emptySubtitle")}
      </p>
      <Link
        href="/app/malla"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[var(--app-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--app-bg)] transition hover:bg-[var(--app-primary-hover)]"
      >
        {t("emptyGoToMalla")}
      </Link>
    </div>
  );
}

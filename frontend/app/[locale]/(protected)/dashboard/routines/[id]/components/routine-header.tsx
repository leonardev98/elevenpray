"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

interface RoutineHeaderProps {
  title: string;
  subtitle: string;
  saveStatus: "idle" | "saving" | "saved" | "error";
  onSave: () => void;
  onOpenPreview: () => void;
  onOpenAutoBuild: () => void;
}

export function RoutineHeader({
  title,
  subtitle,
  saveStatus,
  onSave,
  onOpenPreview,
  onOpenAutoBuild,
}: RoutineHeaderProps) {
  const t = useTranslations("routineBuilder");
  const saveLabel =
    saveStatus === "saving"
      ? t("autosaving")
      : saveStatus === "saved"
        ? t("saveSaved")
        : saveStatus === "error"
          ? t("saveIssue")
          : t("saveReady");
  return (
    <header className="pb-6 pt-2">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link
            href="/dashboard/routines"
            className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--app-fg)]/55 hover:text-[var(--app-gold)]"
          >
            {t("backToRoutines")}
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--app-fg)] md:text-3xl">{title}</h1>
          <p className="mt-1.5 text-sm text-[var(--app-fg)]/65">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-[var(--app-fg)]/60">{saveLabel}</span>
          <button
            type="button"
            onClick={onOpenPreview}
            className="rounded-lg border border-[var(--app-border)] bg-transparent px-3 py-2 text-sm text-[var(--app-fg)] transition hover:border-[var(--app-gold)]/50 hover:text-[var(--app-gold)]"
          >
            {t("previewWeek")}
          </button>
          <button
            type="button"
            onClick={onOpenAutoBuild}
            className="rounded-lg border border-[var(--app-gold)]/40 bg-[var(--app-gold)]/10 px-3 py-2 text-sm font-medium text-[var(--app-gold)] transition hover:bg-[var(--app-gold)]/20"
          >
            {t("autoBuildRoutine")}
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-lg bg-[var(--app-gold)] px-4 py-2 text-sm font-semibold text-[var(--app-black)] transition hover:opacity-90"
          >
            {t("save")}
          </button>
        </div>
      </div>
    </header>
  );
}

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
  /** Vacía todos los productos de la rutina (solo se muestra si la rutina tiene contenido) */
  onClearRoutine?: () => void;
  /** Si se pasa, el enlace "Volver" va al dashboard del workspace en lugar de a la lista de rutinas */
  backHref?: string;
  backLabel?: string;
}

export function RoutineHeader({
  title,
  subtitle,
  saveStatus,
  onSave,
  onOpenPreview,
  onOpenAutoBuild,
  onClearRoutine,
  backHref,
  backLabel,
}: RoutineHeaderProps) {
  const t = useTranslations("routineBuilder");
  const href = backHref ?? "/dashboard/routines";
  const label = backLabel ?? t("backToRoutines");
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
            href={href}
            className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--app-fg-secondary)] hover:text-[var(--app-primary)]"
          >
            {label}
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal text-[var(--app-fg-title)] md:text-3xl">{title}</h1>
          <p className="mt-1.5 text-sm text-[var(--app-fg-secondary)]">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-[var(--app-fg-muted)]">{saveLabel}</span>
          <button
            type="button"
            onClick={onOpenPreview}
            className="rounded-[10px] border border-[var(--app-border)] bg-[var(--app-surface-elevated)] px-3 py-2 text-sm text-[var(--app-fg)] transition hover:bg-[var(--app-surface-elevated)]/80 hover:border-[var(--app-border)]"
          >
            {t("previewWeek")}
          </button>
          <button
            type="button"
            onClick={onOpenAutoBuild}
            className="rounded-[10px] border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-3 py-2 text-sm font-medium text-[var(--app-primary)] transition hover:bg-[var(--app-primary-soft)]/80"
          >
            {t("autoBuildRoutine")}
          </button>
          {onClearRoutine ? (
            <button
              type="button"
              onClick={onClearRoutine}
              className="rounded-[10px] border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-500/20 dark:text-red-400 dark:border-red-400/40 dark:bg-red-400/10 dark:hover:bg-red-400/20"
            >
              {t("clearRoutine")}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onSave}
            className="rounded-[10px] bg-[var(--app-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--app-primary-hover)]"
          >
            {t("save")}
          </button>
        </div>
      </div>
    </header>
  );
}

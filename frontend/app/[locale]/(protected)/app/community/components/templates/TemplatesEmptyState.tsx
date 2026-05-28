"use client";

import { LayoutTemplate } from "lucide-react";
import { useTranslations } from "next-intl";

interface TemplatesEmptyStateProps {
  variant: "filtered" | "mine" | "saved";
  careerLabel?: string;
  onAction: () => void;
  onBrowse?: () => void;
}

export function TemplatesEmptyState({
  variant,
  careerLabel,
  onAction,
  onBrowse,
}: TemplatesEmptyStateProps) {
  const t = useTranslations("studentCommunity");

  const title =
    variant === "filtered"
      ? t("emptyFilteredTitle", { career: careerLabel ?? t("careerAll") })
      : variant === "mine"
        ? t("emptyMineTitle")
        : t("emptySavedTitle");

  const subtitle =
    variant === "filtered"
      ? t("emptyFilteredSubtitle")
      : variant === "mine"
        ? t("emptyMineSubtitle")
        : t("emptySavedSubtitle");

  const cta =
    variant === "filtered"
      ? t("emptyFilteredCta")
      : variant === "mine"
        ? t("emptyMineCta")
        : t("emptySavedCta");

  return (
    <div className="student-card flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--app-primary-soft)]">
        <LayoutTemplate
          className="h-8 w-8 text-[var(--app-primary)] opacity-60"
          aria-hidden
        />
      </div>
      <h3 className="text-base font-semibold text-[var(--app-fg)]">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-[var(--app-fg-muted)]">{subtitle}</p>
      <button
        type="button"
        onClick={variant === "saved" ? onBrowse : onAction}
        className="mt-6 rounded-[var(--radius-md)] bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--accent-fg)] transition-colors hover:bg-[var(--accent-hover)]"
      >
        {cta}
      </button>
    </div>
  );
}

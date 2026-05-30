"use client";

import { GraduationCap, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

export function CreatingAccountScreen() {
  const t = useTranslations("onboardingStudent");

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[var(--app-primary)]/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[var(--app-primary)]/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md text-center">
        <div className="relative mx-auto mb-8 flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-2xl bg-[var(--app-primary)]/20" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--app-primary)] to-[var(--app-primary-hover)] text-[var(--app-white)] shadow-lg shadow-[var(--app-primary)]/30">
            <GraduationCap className="size-9 animate-pulse" aria-hidden />
          </div>
        </div>

        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-1 text-xs font-medium text-[var(--app-fg-secondary)]">
          <Sparkles className="size-3.5 text-[var(--app-primary)]" aria-hidden />
          {t("creatingBadge")}
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-[var(--app-fg)] sm:text-3xl">
          {t("creatingTitle")}
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-[var(--app-fg-secondary)]">
          {t("creatingSubtitle")}
        </p>

        <div className="mx-auto mt-8 h-1.5 w-48 overflow-hidden rounded-full bg-[var(--app-border)]">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-[var(--app-primary)]" />
        </div>
      </div>
    </div>
  );
}

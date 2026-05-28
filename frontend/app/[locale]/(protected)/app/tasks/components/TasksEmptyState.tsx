"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Plus,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface TasksEmptyStateProps {
  onNewTask: () => void;
}

const GHOST_CARDS = [
  { code: "MAT", titleKey: "emptyPreview1" as const, delay: 0 },
  { code: "CS", titleKey: "emptyPreview2" as const, delay: 0.08 },
  { code: "FIS", titleKey: "emptyPreview3" as const, delay: 0.16 },
];

export function TasksEmptyState({ onNewTask }: TasksEmptyStateProps) {
  const t = useTranslations("studentTasks");
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-soft)]/50 px-6 py-10 sm:px-10 sm:py-14"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[var(--app-primary-soft)] opacity-60 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-12 h-40 w-40 rounded-full bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-col items-center text-center lg:flex-row lg:items-center lg:gap-12 lg:text-left">
        <div className="mb-8 flex shrink-0 flex-col items-center lg:mb-0 lg:items-start">
          <motion.div
            animate={
              reduceMotion
                ? undefined
                : {
                    y: [0, -6, 0],
                  }
            }
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm"
          >
            <ClipboardList className="h-8 w-8 text-[var(--app-primary)]" aria-hidden />
          </motion.div>

          <div className="hidden w-full max-w-[280px] flex-col gap-2 lg:flex">
            {GHOST_CARDS.map(({ code, titleKey, delay }) => (
              <motion.div
                key={code}
                initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + delay, duration: 0.4 }}
                className="flex items-center gap-3 rounded-xl border border-dashed border-[var(--app-border)] bg-[var(--app-surface)]/80 px-3 py-2.5 opacity-70"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--app-primary-soft)] text-[10px] font-bold text-[var(--app-primary)]">
                  {code}
                </span>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-xs font-medium text-[var(--app-fg)]">
                    {t(titleKey)}
                  </p>
                  <p className="text-[10px] text-[var(--app-fg-muted)]">{t("emptyPreviewDue")}</p>
                </div>
                <Circle className="h-4 w-4 shrink-0 text-[var(--app-fg-muted)]/40" />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="max-w-md flex-1">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--app-primary-soft)] px-3 py-1 text-[11px] font-medium text-[var(--app-primary)]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {t("emptyBadge")}
          </div>
          <h2 className="text-xl font-semibold text-[var(--app-fg)] sm:text-2xl">
            {t("emptyTitle")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--app-fg-secondary)]">
            {t("emptySubtitle")}
          </p>

          <ul className="mt-6 space-y-3 text-left">
            {(
              [
                { icon: Plus, key: "emptyTip1" as const },
                { icon: CalendarDays, key: "emptyTip2" as const },
                { icon: CheckCircle2, key: "emptyTip3" as const },
              ] as const
            ).map(({ icon: Icon, key }, i) => (
              <motion.li
                key={key}
                initial={reduceMotion ? false : { opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.07 }}
                className="flex items-start gap-3 text-sm text-[var(--app-fg-secondary)]"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--app-surface)] border border-[var(--app-border)]">
                  <Icon className="h-3.5 w-3.5 text-[var(--app-primary)]" aria-hidden />
                </span>
                {t(key)}
              </motion.li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
            <button
              type="button"
              onClick={onNewTask}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-fg)] transition hover:bg-[var(--accent-hover)] sm:w-auto"
            >
              <Plus className="h-4 w-4" aria-hidden />
              {t("emptyCta")}
            </button>
            <Link
              href="/app/courses"
              className="inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--app-border)] bg-[var(--app-surface)] px-5 py-2.5 text-sm font-medium text-[var(--app-fg)] transition hover:bg-[var(--app-surface-soft)] sm:w-auto"
            >
              <BookOpen className="h-4 w-4 text-[var(--app-fg-muted)]" aria-hidden />
              {t("emptyFromCourse")}
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Circle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

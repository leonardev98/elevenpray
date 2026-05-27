"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { STRETCH_BREAK_TIPS } from "../pomodoro-data";
import { formatPomodoroTime } from "../usePomodoroTimer";
import type { PomodoroPhase } from "../usePomodoroTimer";

interface StretchBreakModalProps {
  open: boolean;
  secondsLeft: number;
  phase: PomodoroPhase;
  onClose: () => void;
}

export function StretchBreakModal({
  open,
  secondsLeft,
  phase,
  onClose,
}: StretchBreakModalProps) {
  const t = useTranslations("pomodoro");

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && phase === "break" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[600] flex items-center justify-center bg-black/55 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="stretch-break-title"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2 }}
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[var(--radius-xl)] border-[0.5px] border-[var(--border-strong)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow-md)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={t("close")}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-5 flex items-start gap-3 pr-8">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)]">
                <Activity className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h2
                  id="stretch-break-title"
                  className="text-lg font-semibold text-[var(--text-primary)]"
                >
                  {t("breakTitle")}
                </h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{t("breakSubtitle")}</p>
              </div>
            </div>

            <p className="mb-4 text-center font-mono text-2xl font-semibold tabular-nums text-[var(--accent)]">
              {formatPomodoroTime(secondsLeft)}
            </p>

            <ul className="space-y-3">
              {STRETCH_BREAK_TIPS.map((tip, i) => (
                <li
                  key={tip.id}
                  className="rounded-[var(--radius-md)] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3"
                >
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {i + 1}. {tip.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
                    {tip.description}
                  </p>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-[var(--radius-md)] bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-[var(--accent-fg)] transition-colors hover:bg-[var(--accent-hover)]"
            >
              {t("continueBreak")}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

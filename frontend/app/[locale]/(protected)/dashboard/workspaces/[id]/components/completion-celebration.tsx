"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";

interface CompletionCelebrationProps {
  show: boolean;
  onClose?: () => void;
  autoHideMs?: number;
}

export function CompletionCelebration({
  show,
  onClose,
  autoHideMs = 3500,
}: CompletionCelebrationProps) {
  const t = useTranslations("workspaceNav");
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
  }, [show]);

  useEffect(() => {
    if (!visible || !show) return;
    const id = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, autoHideMs);
    return () => clearTimeout(id);
  }, [show, visible, autoHideMs, onClose]);

  return (
    <AnimatePresence>
      {visible && show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-live="polite"
          aria-label={t("routineCompleted")}
        >
          <div
            className="pointer-events-none absolute inset-0 bg-black/20"
            aria-hidden
          />
          <motion.div
            initial={{ y: 10 }}
            animate={{ y: 0 }}
            className="relative rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-8 py-6 shadow-xl dark:border-zinc-600 dark:bg-zinc-900"
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="text-4xl"
                aria-hidden
              >
                ✨
              </motion.span>
              <h3 className="text-lg font-semibold text-[var(--app-fg)] dark:text-zinc-200">
                {t("routineCompleted")}
              </h3>
              <p className="text-sm font-normal text-[var(--app-fg)]/80 dark:text-slate-300">
                {t("skinThanksYou")}
              </p>
              <p className="text-xs font-medium text-[var(--app-navy)] dark:text-sky-400">
                {t("streakMaintained")} 🔥
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

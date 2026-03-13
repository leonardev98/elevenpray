"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface ClearRoutineConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const WAIT_SECONDS = 3;

export function ClearRoutineConfirmModal({ isOpen, onClose, onConfirm }: ClearRoutineConfirmModalProps) {
  const t = useTranslations("routineBuilder");
  const tCommon = useTranslations("common");
  const [countdown, setCountdown] = useState(WAIT_SECONDS);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(WAIT_SECONDS);
      return;
    }
    setCountdown(WAIT_SECONDS);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const canConfirm = countdown === 0;

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-3xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-[var(--app-fg)]">{t("clearRoutineModalTitle")}</h3>
        <p className="mt-3 text-sm text-[var(--app-fg)]/80">{t("confirmClearRoutine")}</p>
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
            {countdown > 0
              ? t("confirmClearWaitSeconds", { seconds: countdown })
              : t("confirmClearReady")}
          </p>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-elevated)] px-4 py-2.5 text-sm font-medium text-[var(--app-fg)] transition hover:bg-[var(--app-surface-elevated)]/80"
          >
            {tCommon("cancel")}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="rounded-xl border border-red-500/50 bg-red-500/15 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:border-red-400/50 dark:bg-red-400/15 dark:hover:bg-red-400/25"
          >
            {t("clearRoutineConfirmButton")}
          </button>
        </div>
      </div>
    </div>
  );
}

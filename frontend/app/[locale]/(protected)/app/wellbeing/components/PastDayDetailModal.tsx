"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/providers/auth-provider";
import { getDayEntries, type DayEntryDto } from "@/app/lib/day-entries-api";
import { DayTimeline } from "./DayTimeline";

interface PastDayDetailModalProps {
  open: boolean;
  date: string | null;
  onClose: () => void;
}

export function PastDayDetailModal({ open, date, onClose }: PastDayDetailModalProps) {
  const t = useTranslations("studentWellbeing");
  const { token } = useAuth();
  const [entries, setEntries] = useState<DayEntryDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !date || !token) return;
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const data = await getDayEntries(token, date);
        if (!cancelled) setEntries(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, date, token]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--app-bg)]/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="relative w-full max-w-2xl rounded-2xl border border-[var(--app-border)]/70 bg-[var(--app-surface)] p-5 sm:p-6"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={t("journal.close")}
              className="absolute right-3 top-3 rounded-md p-1.5 text-[var(--app-fg-muted)] hover:text-[var(--app-fg)]"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="mb-4 text-lg font-semibold text-[var(--app-fg)]">
              {t("progress.viewDay")} {date}
            </h3>
            {loading ? (
              <p className="text-sm text-[var(--app-fg-muted)]">{t("progress.loading")}</p>
            ) : (
              <DayTimeline entries={entries} title={t("timeline.title")} />
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

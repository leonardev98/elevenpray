"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/providers/auth-provider";
import { saveCheckIn } from "../lib/student-storage";
import { useGamification } from "../gamification/gamification-context";
import { useCheckIn } from "./check-in-context";

const MOODS = [
  { id: "excellent", emoji: "😄" },
  { id: "good", emoji: "🙂" },
  { id: "normal", emoji: "😐" },
  { id: "low", emoji: "😟" },
  { id: "bad", emoji: "😞" },
  { id: "overwhelmed", emoji: "😣" },
] as const;

export function EmotionalCheckInGate() {
  const t = useTranslations("checkin");
  const { user } = useAuth();
  const { gateOpen, closeGate, refreshCheckIn } = useCheckIn();
  const { recordActivity } = useGamification();

  function handleSelect(moodId: string) {
    saveCheckIn(moodId, user?.id);
    void recordActivity("checkin");
    refreshCheckIn();
    closeGate();
  }

  return (
    <AnimatePresence>
      {gateOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--app-bg)]/95 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkin-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="w-full max-w-lg rounded-[var(--app-radius-lg,1.25rem)] border border-[var(--app-border)] bg-[var(--app-surface)] p-8 shadow-app-modal"
          >
            <p className="text-center text-sm font-medium uppercase tracking-wider text-[var(--app-primary)]">
              {t("subtitle")}
            </p>
            <h2 id="checkin-title" className="mt-2 text-center text-2xl font-semibold text-[var(--app-fg)]">
              {t("title")}
            </h2>
            <p className="mt-2 text-center text-sm text-[var(--app-fg-secondary)]">
              {t("description")}
            </p>

            <motion.div
              className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-6"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.05 } },
              }}
            >
              {MOODS.map(({ id, emoji }) => (
                <motion.button
                  key={id}
                  type="button"
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  onClick={() => handleSelect(id)}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-2 py-4 transition hover:border-[var(--app-primary)]/50 hover:bg-[var(--app-primary-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]/40"
                >
                  <span className="text-3xl" aria-hidden>
                    {emoji}
                  </span>
                  <span className="text-center text-[10px] font-medium leading-tight text-[var(--app-fg-secondary)] sm:text-xs">
                    {t(`moods.${id}`)}
                  </span>
                </motion.button>
              ))}
            </motion.div>

            <p className="mt-8 text-center text-[11px] leading-relaxed text-[var(--app-fg-muted)]">
              {t("disclaimer")}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Zap, Smile, Meh, Frown, Moon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/app/providers/auth-provider";
import { upsertTodayEmotionalCheckIn } from "@/app/lib/emotional-checkins-api";
import { saveTodayCheckIn } from "../lib/student-storage";
import type { MoodId } from "../wellbeing/wellbeing-types";
import { useCheckIn } from "./check-in-context";

const MOODS: { id: MoodId; Icon: LucideIcon }[] = [
  { id: "excellent", Icon: Zap },
  { id: "good", Icon: Smile },
  { id: "normal", Icon: Meh },
  { id: "low", Icon: Frown },
  { id: "bad", Icon: Moon },
];

export function EmotionalCheckInGate() {
  const t = useTranslations("checkin");
  const tMoods = useTranslations("checkin.moods");
  const { user, token } = useAuth();
  const { gateOpen, closeGate, refreshCheckIn } = useCheckIn();

  async function handleSelect(moodId: MoodId) {
    saveTodayCheckIn(moodId, undefined, undefined, user?.id);
    if (token) {
      try {
        await upsertTodayEmotionalCheckIn(token, { mood: moodId });
      } catch {
        /* local saved */
      }
    }
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
              className="mt-8 flex flex-wrap justify-center gap-3"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.05 } },
              }}
            >
              {MOODS.map(({ id, Icon }) => (
                <motion.button
                  key={id}
                  type="button"
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  onClick={() => void handleSelect(id)}
                  className="flex min-w-[4.5rem] flex-col items-center gap-2 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-4 transition hover:scale-105 hover:border-[var(--app-primary)]/50 hover:bg-[var(--app-primary-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]/40 motion-reduce:hover:scale-100"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--app-primary)]/10">
                    <Icon className="h-5 w-5 text-[var(--app-primary)]" aria-hidden />
                  </div>
                  <span className="text-center text-xs font-medium text-[var(--app-fg-secondary)]">
                    {tMoods(id)}
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

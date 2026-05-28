"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Flame, Lightbulb, Target } from "lucide-react";
import { useTranslations } from "next-intl";
import { SectionLabel } from "../../components/SectionLabel";
import { StreakCard } from "../../gamification/components/StreakCard";

export function TasksSidebarEmpty() {
  const t = useTranslations("studentTasks");
  const reduceMotion = useReducedMotion();

  const tips = [
    { icon: Target, text: t("sidebarTip1") },
    { icon: Lightbulb, text: t("sidebarTip2") },
    { icon: Flame, text: t("sidebarTip3") },
  ];

  return (
    <aside className="space-y-6">
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <SectionLabel>{t("sidebarEmptyTitle")}</SectionLabel>
        <div className="student-card space-y-3 p-4">
          {tips.map(({ icon: Icon, text }, i) => (
            <motion.div
              key={text}
              initial={reduceMotion ? false : { opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              className="flex gap-3 text-sm text-[var(--app-fg-secondary)]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--app-primary-soft)]">
                <Icon className="h-4 w-4 text-[var(--app-primary)]" aria-hidden />
              </span>
              <p className="pt-1 leading-snug">{text}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <SectionLabel>{t("sidebarStreakLabel")}</SectionLabel>
        <p className="mb-2 text-xs text-[var(--app-fg-muted)]">{t("sidebarStreakHint")}</p>
        <StreakCard variant="tareas" compact />
      </motion.section>
    </aside>
  );
}

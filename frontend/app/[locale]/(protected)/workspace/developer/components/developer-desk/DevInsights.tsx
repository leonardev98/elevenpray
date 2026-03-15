"use client";

import { useTranslations } from "next-intl";
import { MessageSquare, CheckSquare, StickyNote } from "lucide-react";
import { MOCK_TASKS } from "@/app/lib/developer-workspace";
import { cn } from "@/lib/utils";

const DEV_PROMPTS_USED_KEY = "elevenpray_dev_prompts_used";
const DEV_NOTES_WRITTEN_KEY = "elevenpray_dev_notes_written";

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getPromptsUsedToday(): number {
  try {
    const key = `${DEV_PROMPTS_USED_KEY}_${getTodayKey()}`;
    return parseInt(localStorage.getItem(key) ?? "0", 10);
  } catch {
    return 0;
  }
}

function getNotesWrittenToday(): number {
  try {
    const key = `${DEV_NOTES_WRITTEN_KEY}_${getTodayKey()}`;
    return parseInt(localStorage.getItem(key) ?? "0", 10);
  } catch {
    return 0;
  }
}

export interface DevInsightsProps {
  className?: string;
}

export function DevInsights({ className }: DevInsightsProps) {
  const t = useTranslations("developerWorkspace.dashboard");
  const promptsUsed = getPromptsUsedToday();
  const tasksCompleted = MOCK_TASKS.filter(
    (x) => x.dueToday && x.status === "done"
  ).length;
  const notesWritten = getNotesWrittenToday();

  const items = [
    { key: "promptsUsedToday", value: promptsUsed, icon: MessageSquare },
    { key: "tasksCompleted", value: tasksCompleted, icon: CheckSquare },
    { key: "notesWritten", value: notesWritten, icon: StickyNote },
  ] as const;

  return (
    <section
      className={cn(
        "rounded-2xl border border-[var(--dev-border-subtle)] bg-[var(--dev-surface-elevated)] p-4 shadow-[var(--dev-shadow-card)]",
        className
      )}
    >
      <h2 className="text-[length:var(--dev-font-label-size)] font-medium tracking-[var(--dev-font-label-tracking)] text-[var(--app-fg)]/80">
        {t("devInsights")}
      </h2>
      <ul className="mt-3 space-y-2">
        {items.map(({ key, value, icon: Icon }) => (
          <li
            key={key}
            className="flex items-center gap-3 rounded-lg border border-[var(--dev-border-subtle)] bg-[var(--app-bg)]/50 px-3 py-2"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--app-navy)]/10">
              <Icon className="h-4 w-4 text-[var(--app-navy)]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[length:var(--dev-font-body-size)] font-semibold text-[var(--app-fg)]">
                {value}
              </p>
              <p
                className="text-[length:var(--dev-font-meta-size)] text-[var(--app-fg)]"
                style={{ opacity: 0.7 }}
              >
                {t(key)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

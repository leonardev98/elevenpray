"use client";

import { useTranslations } from "next-intl";
import { MOCK_SELF_HELP, MOCK_WELLBEING_TIMELINE } from "../lib/mock-student-data";
import { StudentPageShell } from "../components/StudentPageShell";

export default function StudentWellbeingPage() {
  const t = useTranslations("studentWellbeing");

  return (
    <StudentPageShell title={t("title")}>
      <section className="mb-8">
        <h2 className="mb-4 text-sm font-medium text-[var(--app-fg-secondary)]">{t("emotionalDiary")}</h2>
        <div className="student-card flex justify-between gap-2 p-4">
          {MOCK_WELLBEING_TIMELINE.map((entry) => (
            <div key={entry.date} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-2xl" aria-hidden>
                {entry.mood}
              </span>
              <span className="text-[10px] text-[var(--app-fg-muted)]">{entry.date}</span>
              <span className="text-xs text-[var(--app-fg-secondary)]">{entry.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-medium text-[var(--app-fg-secondary)]">{t("selfHelpLibrary")}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_SELF_HELP.map((item) => (
            <button
              key={item.id}
              type="button"
              className="student-card p-5 text-left transition hover:border-[var(--app-primary)]/30"
            >
              <p className="font-medium text-[var(--app-fg)]">{item.title}</p>
              <p className="mt-2 text-sm text-[var(--app-fg-secondary)]">{item.duration}</p>
              <p className="mt-3 text-xs text-[var(--app-primary)]">{t("startExercise")}</p>
            </button>
          ))}
        </div>
      </section>

      <p className="mt-8 text-center text-xs text-[var(--app-fg-muted)]">{t("disclaimer")}</p>
    </StudentPageShell>
  );
}

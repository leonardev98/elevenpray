"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { BookOpen, Wind } from "lucide-react";
import { useTranslations } from "next-intl";
import { BREATHING_EXERCISES, QUICK_PAUSE_EXERCISE } from "../wellbeing-mock-data";
import type { BreathingExercise } from "../wellbeing-types";
import { BreathingModal } from "./BreathingModal";
import { getJournalPromptKeyForDate } from "../lib/journal-prompts";
import { useWellbeingDayContext } from "./WellbeingDayProvider";

type BreathingKind = "normal" | "sos";

const CARD_CLASS =
  "wellbeing-dashboard-tile flex h-full min-h-[22rem] flex-col rounded-2xl border border-[var(--app-border)]/70 bg-[var(--app-surface)] p-4 shadow-sm sm:p-5";

function getBreathingInstruction(exercise: BreathingExercise): string {
  const mapped = exercise.phases
    .map((phase) => {
      if (phase.type === "inhale") return `Inhala ${phase.seconds} seg`;
      if (phase.type === "hold") return `sostiene ${phase.seconds}`;
      return `exhala ${phase.seconds}`;
    })
    .slice(0, 3);

  return mapped.join(", ");
}

function ActionCardHeader({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
}) {
  return (
    <div className="mb-3 flex shrink-0 items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-base font-semibold text-[var(--app-fg)]">{title}</p>
        <p className="text-sm text-[var(--app-fg-muted)]">{subtitle}</p>
      </div>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--app-primary)]/12 text-[var(--app-primary)]">
        {icon}
      </span>
    </div>
  );
}

export function WellbeingActionsGrid({ index = 0 }: { index?: number }) {
  const t = useTranslations("studentWellbeing");
  const { addEntry } = useWellbeingDayContext();
  const [activeExercise, setActiveExercise] = useState<BreathingExercise | null>(null);
  const [breathingKind, setBreathingKind] = useState<BreathingKind>("normal");
  const [journalExpanded, setJournalExpanded] = useState(false);
  const [journalContent, setJournalContent] = useState("");
  const [journalSaving, setJournalSaving] = useState(false);
  const promptText = t(`journalPrompts.${getJournalPromptKeyForDate()}`);
  const primaryExercise = BREATHING_EXERCISES[0];
  const breathingInstruction = getBreathingInstruction(primaryExercise);
  const delayStyle = { "--wellbeing-delay": `${index * 80}ms` } as React.CSSProperties;

  async function registerBreathingCompletion(meta: { exerciseId: string; durationMinutes: number }) {
    await addEntry({
      entryType: breathingKind === "sos" ? "sos" : "breathing",
      payload: meta,
    });
  }

  async function handleInlineJournalSave() {
    const trimmed = journalContent.trim();
    if (!trimmed) return;
    setJournalSaving(true);
    try {
      await addEntry({
        entryType: "journal",
        payload: {
          prompt: promptText,
          content: trimmed,
        },
      });
      setJournalContent("");
      setJournalExpanded(false);
    } finally {
      setJournalSaving(false);
    }
  }

  return (
    <section className="wellbeing-calm-block" style={delayStyle}>
      <h3 className="mb-3 text-base font-semibold text-[var(--app-fg)]">{t("actions.sectionTitle")}</h3>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
        <article className={CARD_CLASS}>
          <ActionCardHeader
            title={t("actions.breatheTitle")}
            subtitle={t("actions.breatheSubtitle")}
            icon={<Wind className="h-5 w-5" />}
          />
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 py-1 text-center">
            <div className="flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full border-[3px] border-[var(--app-primary)]/35 bg-[var(--app-primary)]/5">
              <div
                className="wellbeing-breathe-circle h-12 w-12 rounded-full border-2 border-[var(--app-primary)]/60 bg-[var(--app-primary)]/10"
                style={{ "--breathe-duration": "4s" } as React.CSSProperties}
              />
            </div>
            <div className="max-w-[18rem]">
              <p className="text-sm font-semibold text-[var(--app-fg)]">{primaryExercise.title}</p>
              <p className="text-xs text-[var(--app-fg-muted)]">{primaryExercise.durationLabel}</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--app-fg-secondary)]">
                {breathingInstruction}.
              </p>
            </div>
          </div>
          <div className="mt-auto flex w-full flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setBreathingKind("normal");
                setActiveExercise(primaryExercise);
              }}
              className="w-full rounded-xl bg-[var(--app-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--app-bg)]"
            >
              {t("actions.breatheCta")}
            </button>
            <button
              type="button"
              onClick={() => {
                setBreathingKind("sos");
                setActiveExercise(QUICK_PAUSE_EXERCISE);
              }}
              className="w-full rounded-lg border border-[var(--app-border)] px-3 py-1.5 text-xs font-medium text-[var(--app-fg-secondary)] transition hover:border-[var(--app-primary)]/40 hover:text-[var(--app-primary)]"
            >
              {t("actions.quickPauseCta")}
            </button>
          </div>
        </article>

        <article className={CARD_CLASS}>
          <ActionCardHeader
            title={t("actions.journalTitle")}
            subtitle={t("actions.journalSubtitle")}
            icon={<BookOpen className="h-5 w-5" />}
          />
          <div className="flex min-h-0 flex-1 flex-col py-1">
            <p className="text-base font-medium leading-snug text-[var(--app-fg)]">{promptText}</p>
            {journalExpanded ? (
              <div className="mt-3 flex min-h-0 flex-1 flex-col gap-2">
                <textarea
                  value={journalContent}
                  onChange={(event) => setJournalContent(event.target.value)}
                  placeholder={t("journal.placeholder")}
                  className="min-h-[7rem] w-full flex-1 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg-muted)] focus:border-[var(--app-primary)]/50 focus:outline-none"
                />
              </div>
            ) : (
              <div className="flex-1" aria-hidden />
            )}
          </div>
          {journalExpanded ? (
            <div className="mt-auto flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => void handleInlineJournalSave()}
                disabled={journalSaving || journalContent.trim().length === 0}
                className="flex-1 rounded-xl bg-[var(--app-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--app-bg)] disabled:opacity-60 sm:flex-none"
              >
                {journalSaving ? t("savingCheckIn") : t("journal.save")}
              </button>
              <button
                type="button"
                onClick={() => setJournalExpanded(false)}
                className="flex-1 rounded-xl border border-[var(--app-border)] px-4 py-2.5 text-sm text-[var(--app-fg-secondary)] sm:flex-none"
              >
                {t("journal.close")}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setJournalExpanded(true)}
              className="mt-auto w-full rounded-xl bg-[var(--app-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--app-bg)]"
            >
              {t("actions.journalCta")}
            </button>
          )}
        </article>
      </div>

      <BreathingModal
        exercise={activeExercise}
        open={activeExercise !== null}
        onClose={() => setActiveExercise(null)}
        onComplete={(meta) => void registerBreathingCompletion(meta)}
        fullscreen
      />
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getJournalPromptKeyForDate } from "../lib/journal-prompts";
import { useWellbeingDayContext } from "./WellbeingDayProvider";

interface GuidedJournalModalProps {
  open: boolean;
  onClose: () => void;
}

export function GuidedJournalModal({ open, onClose }: GuidedJournalModalProps) {
  const t = useTranslations("studentWellbeing");
  const { entries, addEntry } = useWellbeingDayContext();
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const promptKey = getJournalPromptKeyForDate();
  const promptText = t(`journalPrompts.${promptKey}`);

  const todayJournals = useMemo(
    () => entries.filter((entry) => entry.entryType === "journal"),
    [entries],
  );

  async function handleSave() {
    const trimmed = content.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      await addEntry({
        entryType: "journal",
        payload: {
          prompt: promptText,
          content: trimmed,
        },
      });
      setContent("");
      onClose();
    } finally {
      setSaving(false);
    }
  }

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
            initial={{ opacity: 0, y: 12 }}
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

            <h3 className="text-lg font-semibold text-[var(--app-fg)]">{t("journal.title")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--app-fg-secondary)]">{promptText}</p>

            {todayJournals.length > 0 ? (
              <div className="mt-4 rounded-xl border border-[var(--app-border)]/60 bg-[var(--app-surface-soft)] p-3">
                <p className="mb-2 text-xs font-medium text-[var(--app-fg-muted)]">
                  {t("journal.previousToday")}
                </p>
                <div className="space-y-2">
                  {todayJournals.map((entry) => (
                    <div key={entry.id} className="rounded-lg bg-[var(--app-surface)] p-2.5">
                      <p className="text-[11px] text-[var(--app-fg-muted)]">
                        {format(new Date(entry.occurredAt), "HH:mm", { locale: es })}
                      </p>
                      <p className="line-clamp-2 text-xs text-[var(--app-fg-secondary)]">
                        {typeof entry.payload.content === "string" ? entry.payload.content : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t("journal.placeholder")}
              className="mt-4 min-h-40 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg-muted)] focus:border-[var(--app-primary)]/50 focus:outline-none"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[var(--app-border)] px-4 py-2 text-sm text-[var(--app-fg-secondary)]"
              >
                {t("journal.close")}
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving || content.trim().length === 0}
                className="rounded-xl bg-[var(--app-primary)] px-4 py-2 text-sm font-semibold text-[var(--app-bg)] disabled:opacity-60"
              >
                {t("journal.save")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

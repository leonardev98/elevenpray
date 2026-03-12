"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { StickyNote, Sparkles } from "lucide-react";
import { MOCK_NOTES } from "@/app/lib/developer-workspace";
import { cn } from "@/lib/utils";

const NOTE_TYPE_LABELS: Record<string, string> = {
  idea: "Idea",
  command: "Command",
  debugNote: "Debug note",
  architectureThought: "Architecture",
  meetingTakeaway: "Meeting",
  todoThought: "Todo thought",
  promptDraft: "Prompt draft",
};

export default function NotesPage() {
  const t = useTranslations("developerWorkspace.notes");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--app-fg)]">{t("title")}</h1>
        <p className="mt-1 text-[var(--app-fg)]/60">
          Quick capture: ideas, commands, debug notes. Use “Send to AI” to convert to task, prompt, or snippet.
        </p>
      </div>

      <ul className="space-y-4">
        {MOCK_NOTES.map((note) => (
          <li
            key={note.id}
            className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <StickyNote className="h-4 w-4 text-[var(--app-fg)]/50" />
                  <span className="rounded bg-[var(--app-bg)] px-2 py-0.5 text-xs font-medium text-[var(--app-fg)]/70">
                    {NOTE_TYPE_LABELS[note.type] ?? note.type}
                  </span>
                </div>
                <h3 className="mt-2 font-medium text-[var(--app-fg)]">{note.title}</h3>
                <p className="mt-1 text-sm text-[var(--app-fg)]/70">{note.content}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-[var(--app-bg)] px-1.5 py-0.5 text-xs text-[var(--app-fg)]/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)]/50 px-3 py-1.5 text-xs font-medium text-[var(--app-fg)]/70 hover:bg-[var(--app-bg)] hover:text-[var(--app-navy)]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {t("sendToAI")}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

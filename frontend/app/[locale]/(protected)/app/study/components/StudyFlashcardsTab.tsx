"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Layers, Loader2 } from "lucide-react";
import { generateStudyContent } from "@/app/lib/study-ai-api";
import { listCourseFlashcards } from "@/app/lib/study-university/api";
import type { CourseFlashcard } from "@/app/lib/study-university/types";

interface StudyFlashcardsTabProps {
  token: string | null;
  workspaceId: string | null;
  courseId: string | null;
  documentId: string | null;
  documentReady: boolean;
}

export function StudyFlashcardsTab({
  token,
  workspaceId,
  courseId,
  documentId,
  documentReady,
}: StudyFlashcardsTabProps) {
  const t = useTranslations("studentStudy");
  const [cards, setCards] = useState<CourseFlashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    if (!token || !workspaceId || !courseId) return;
    setLoading(true);
    try {
      const list = await listCourseFlashcards(token, workspaceId, courseId);
      setCards(list);
    } finally {
      setLoading(false);
    }
  }, [token, workspaceId, courseId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleGenerate() {
    if (!token || !workspaceId || !documentId) return;
    setGenerating(true);
    try {
      await generateStudyContent(token, workspaceId, documentId, "flashcards");
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : t("generateError"));
    } finally {
      setGenerating(false);
    }
  }

  if (!documentReady) {
    return (
      <p className="student-card p-8 text-center text-sm text-[var(--app-fg-secondary)]">
        {t("needPdfReady")}
      </p>
    );
  }

  return (
    <div className="student-card space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[var(--app-fg-secondary)]">{t("flashcardsHint")}</p>
        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--app-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
          {t("generateFlashcards")}
        </button>
      </div>

      {loading && (
        <p className="text-center text-sm text-[var(--app-fg-muted)]">{t("loading")}</p>
      )}

      {!loading && cards.length === 0 && (
        <p className="text-center text-sm text-[var(--app-fg-muted)]">{t("flashcardsEmpty")}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((card) => {
          const isFlipped = flipped[card.id];
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setFlipped((f) => ({ ...f, [card.id]: !f[card.id] }))}
              className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-4 text-left transition-shadow hover:shadow-md"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--app-fg-muted)]">
                {isFlipped ? t("answer") : t("question")}
              </p>
              <p className="mt-2 text-sm text-[var(--app-fg)]">
                {isFlipped ? card.answer : card.question}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

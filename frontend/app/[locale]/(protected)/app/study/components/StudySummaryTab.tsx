"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Sparkles } from "lucide-react";
import { generateStudyContent } from "@/app/lib/study-ai-api";
import type { StudyPdfDocumentDto } from "@/app/lib/study-ai-api";

interface StudySummaryTabProps {
  token: string | null;
  workspaceId: string | null;
  documentId: string | null;
  documentReady: boolean;
  activeDocument: StudyPdfDocumentDto | null;
  onSummaryUpdated: () => void;
}

export function StudySummaryTab({
  token,
  workspaceId,
  documentId,
  documentReady,
  activeDocument,
  onSummaryUpdated,
}: StudySummaryTabProps) {
  const t = useTranslations("studentStudy");
  const [generating, setGenerating] = useState(false);
  const [summary, setSummary] = useState(activeDocument?.summaryText ?? "");

  useEffect(() => {
    setSummary(activeDocument?.summaryText ?? "");
  }, [activeDocument?.id, activeDocument?.summaryText]);

  async function handleGenerate() {
    if (!token || !workspaceId || !documentId) return;
    setGenerating(true);
    try {
      const result = (await generateStudyContent(
        token,
        workspaceId,
        documentId,
        "summary",
      )) as { summary?: string };
      setSummary(result.summary ?? "");
      onSummaryUpdated();
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
        <p className="text-sm text-[var(--app-fg-secondary)]">{t("summaryHint")}</p>
        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--app-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {t("generateSummary")}
        </button>
      </div>
      {summary ? (
        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-[var(--app-fg)]">
          {summary}
        </div>
      ) : (
        <p className="text-center text-sm text-[var(--app-fg-muted)]">{t("summaryEmpty")}</p>
      )}
    </div>
  );
}

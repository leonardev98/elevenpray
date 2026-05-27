"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { HelpCircle, Loader2 } from "lucide-react";
import { generateStudyContent } from "@/app/lib/study-ai-api";
import { getQuizDetail, listCourseQuizzes } from "@/app/lib/study-university/api";
import type { QuizDetail, QuizSummary } from "@/app/lib/study-university/types";

interface StudyQuizzesTabProps {
  token: string | null;
  workspaceId: string | null;
  courseId: string | null;
  documentId: string | null;
  documentReady: boolean;
}

export function StudyQuizzesTab({
  token,
  workspaceId,
  courseId,
  documentId,
  documentReady,
}: StudyQuizzesTabProps) {
  const t = useTranslations("studentStudy");
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<QuizDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!token || !workspaceId || !courseId) return;
    setLoading(true);
    try {
      const list = await listCourseQuizzes(token, workspaceId, courseId);
      setQuizzes(list);
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
      await generateStudyContent(token, workspaceId, documentId, "quiz");
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : t("generateError"));
    } finally {
      setGenerating(false);
    }
  }

  async function openQuiz(quizId: string) {
    if (!token || !workspaceId) return;
    const detail = await getQuizDetail(token, workspaceId, quizId);
    setActiveQuiz(detail);
    setAnswers({});
  }

  if (!documentReady) {
    return (
      <p className="student-card p-8 text-center text-sm text-[var(--app-fg-secondary)]">
        {t("needPdfReady")}
      </p>
    );
  }

  if (activeQuiz) {
    return (
      <div className="student-card space-y-4 p-4">
        <button
          type="button"
          onClick={() => setActiveQuiz(null)}
          className="text-sm text-[var(--app-primary)] hover:underline"
        >
          {t("backToQuizzes")}
        </button>
        <h3 className="text-lg font-semibold text-[var(--app-fg)]">{activeQuiz.title}</h3>
        {activeQuiz.questions.map((q, qi) => (
          <div key={q.id} className="rounded-xl border border-[var(--app-border)] p-4">
            <p className="text-sm font-medium text-[var(--app-fg)]">
              {qi + 1}. {q.prompt}
            </p>
            <div className="mt-3 space-y-2">
              {q.options?.map((opt) => (
                <label
                  key={opt.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[var(--app-surface-soft)]"
                >
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === opt.id}
                    onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt.id }))}
                  />
                  <span className="text-sm text-[var(--app-fg)]">
                    {opt.label}. {opt.text}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="student-card space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[var(--app-fg-secondary)]">{t("quizzesHint")}</p>
        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--app-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <HelpCircle className="h-4 w-4" />}
          {t("generateQuiz")}
        </button>
      </div>

      {loading && (
        <p className="text-center text-sm text-[var(--app-fg-muted)]">{t("loading")}</p>
      )}

      {!loading && quizzes.length === 0 && (
        <p className="text-center text-sm text-[var(--app-fg-muted)]">{t("quizzesEmpty")}</p>
      )}

      <ul className="space-y-2">
        {quizzes.map((q) => (
          <li key={q.id}>
            <button
              type="button"
              onClick={() => void openQuiz(q.id)}
              className="flex w-full items-center justify-between rounded-lg bg-[var(--app-surface-soft)] px-4 py-3 text-left hover:bg-[var(--app-surface-elevated)]"
            >
              <span className="font-medium text-[var(--app-fg)]">{q.title}</span>
              <span className="text-xs text-[var(--app-fg-muted)]">
                {q.questionCount} {t("questions")}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

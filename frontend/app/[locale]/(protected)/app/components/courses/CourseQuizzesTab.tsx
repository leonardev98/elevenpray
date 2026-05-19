"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { MockCourseQuiz } from "../../lib/mock-course-data";

interface CourseQuizzesTabProps {
  quizzes: MockCourseQuiz[];
}

export function CourseQuizzesTab({ quizzes }: CourseQuizzesTabProps) {
  const t = useTranslations("studentCourses");

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--app-primary)] px-3 py-2 text-sm font-semibold text-[var(--app-bg)] transition hover:bg-[var(--app-primary-hover)]"
        >
          <Sparkles className="h-4 w-4" />
          {t("generateQuiz")}
        </button>
      </div>
      <ul className="space-y-3">
        {quizzes.map((quiz) => (
          <li key={quiz.id} className="student-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-medium text-[var(--app-fg)]">{quiz.title}</h3>
                <p className="mt-1 text-xs text-[var(--app-fg-muted)]">{quiz.date}</p>
                {quiz.status === "completed" && quiz.score && (
                  <p className="mt-2 text-sm text-[var(--app-fg-secondary)]">
                    {t("score", { score: quiz.score })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-xs font-medium",
                    quiz.status === "completed"
                      ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-200"
                      : "border-amber-500/30 bg-amber-500/15 text-amber-200",
                  )}
                >
                  {quiz.status === "completed" ? t("completed") : t("pending")}
                </span>
                {quiz.status === "pending" && (
                  <button
                    type="button"
                    className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-1.5 text-xs font-medium text-[var(--app-fg)] transition hover:border-[var(--app-primary)]/40"
                  >
                    {t("startQuiz")}
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

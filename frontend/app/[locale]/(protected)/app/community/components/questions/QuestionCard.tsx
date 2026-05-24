"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, MessageCircle, ThumbsUp } from "lucide-react";
import type { CommunityQuestion } from "../../community-types";
import { UNIVERSITY_TAG } from "../../community-constants";
import { UserAvatar } from "../UserAvatar";
import { cn } from "@/lib/utils";

export function QuestionCard({ question }: { question: CommunityQuestion }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="student-card overflow-hidden transition hover:-translate-y-px hover:border-[var(--app-primary)]/40">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-start gap-4 p-5 text-left"
      >
        <motion.div
          className={cn(
            "flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5",
            question.hasAcceptedAnswer ? "text-green-500" : "text-[var(--app-fg-muted)]",
          )}
        >
          {question.hasAcceptedAnswer ? (
            <CheckCircle2 className="h-5 w-5" aria-hidden />
          ) : (
            <MessageCircle className="h-5 w-5" aria-hidden />
          )}
          <span className="text-xs font-semibold">{question.answerCount}</span>
        </motion.div>

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-[var(--app-fg)]">{question.title}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                UNIVERSITY_TAG[question.university],
              )}
            >
              {question.university}
            </span>
            <span className="rounded-full bg-[var(--app-surface-soft)] px-2.5 py-0.5 text-xs text-[var(--app-fg-secondary)]">
              {question.course}
            </span>
          </div>
          <p className="mt-2 text-xs text-[var(--app-fg-muted)]">
            Preguntado por {question.author} · {question.timeAgo} · {question.views} vistas
          </p>
        </div>
      </button>

      <motion.div
        initial={false}
        animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="border-t border-[var(--app-border)] px-5 pb-5 pt-4">
          <p className="mb-4 text-sm text-[var(--app-fg-secondary)]">{question.body}</p>
          <ul className="space-y-4">
            {question.answers.map((answer) => (
              <li key={answer.id} className="flex gap-3">
                <UserAvatar
                  initial={answer.authorInitial}
                  colorClass={answer.authorColor}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--app-fg)]">{answer.author}</p>
                  <p className="mt-1 text-sm text-[var(--app-fg-secondary)]">{answer.text}</p>
                  <button
                    type="button"
                    className="mt-2 flex items-center gap-1 text-xs text-[var(--app-fg-muted)] hover:text-[var(--app-primary)]"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
                    {answer.upvotes}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </article>
  );
}

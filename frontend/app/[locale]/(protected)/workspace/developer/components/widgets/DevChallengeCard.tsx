"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DEV_CHALLENGE_QUESTIONS } from "../../data/dev-challenge-questions";
import { cn } from "@/lib/utils";

export function DevChallengeCard({ className }: { className?: string }) {
  const t = useTranslations("developerWorkspace.dashboard");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const question = DEV_CHALLENGE_QUESTIONS[questionIndex % DEV_CHALLENGE_QUESTIONS.length];
  const correct = selectedIndex !== null && selectedIndex === question.correctIndex;

  const handleSelect = (index: number) => {
    if (revealed) return;
    setSelectedIndex(index);
    setRevealed(true);
  };

  const handleNext = () => {
    setSelectedIndex(null);
    setRevealed(false);
    setQuestionIndex((i) => i + 1);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.1 }}
      className={cn("dev-dash-card p-4", className)}
    >
      <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--dev-dash-fg-muted)] mb-3">
        {t("devChallenge")}
      </h2>
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-3"
        >
          <p className="text-sm text-[var(--dev-dash-fg)]">{question.question}</p>
          {question.code && (
            <pre className="rounded-lg border border-[var(--dev-dash-border)] bg-[var(--dev-dash-inner-bg)] px-3 py-2 text-xs text-[var(--dev-dash-fg-muted)] font-mono overflow-x-auto">
              {question.code}
            </pre>
          )}
          <ul className="space-y-2">
            {question.options.map((opt, i) => {
              const isSelected = selectedIndex === i;
              const isCorrect = i === question.correctIndex;
              const showResult = revealed && isSelected;
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => handleSelect(i)}
                    disabled={revealed}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm font-mono transition",
                      "border-[var(--dev-dash-border)] bg-[var(--dev-dash-row-bg)] text-[var(--dev-dash-fg)]",
                      "hover:border-[var(--dev-dash-accent-indigo)]/40 hover:bg-[var(--dev-dash-hover-bg)] disabled:pointer-events-none",
                      showResult && isCorrect && "border-[var(--dev-dash-accent-green)] bg-[var(--dev-dash-accent-green)]/10",
                      showResult && !isCorrect && "border-red-500/60 bg-red-500/10"
                    )}
                  >
                    <span className="min-w-0 truncate">{opt}</span>
                    {showResult && (
                      <span className="shrink-0">
                        {isCorrect ? (
                          <Check className="h-4 w-4 text-[var(--dev-dash-accent-green)]" />
                        ) : (
                          <X className="h-4 w-4 text-red-400" />
                        )}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          {revealed && (
            <button
              type="button"
              onClick={handleNext}
              className="text-xs font-medium text-[var(--dev-dash-accent-blue)] hover:underline"
            >
              {t("nextQuestion")}
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.section>
  );
}

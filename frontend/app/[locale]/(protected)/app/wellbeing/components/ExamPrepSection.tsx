"use client";

import { useState } from "react";
import { BookOpen, Clock, CheckCircle2, BrainCircuit } from "lucide-react";
import { EXAM_PREP_CHECKLIST } from "../wellbeing-mock-data";

export function ExamPrepSection() {
  const [expanded, setExpanded] = useState(false);
  const [checklist, setChecklist] = useState(EXAM_PREP_CHECKLIST);

  const toggleCheck = (id: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedCount = checklist.filter(item => item.completed).length;

  return (
    <section className="rounded-2xl border-2 border-[var(--app-primary)]/30 bg-gradient-to-br from-[var(--app-primary)]/5 to-[var(--app-surface-elevated)] p-4 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-[var(--app-primary)]/50">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--app-primary)]/20">
            <BrainCircuit className="h-5 w-5 text-[var(--app-primary)]" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-[var(--app-fg)]">Antes del examen</h3>
            <p className="text-[10px] text-[var(--app-fg-muted)]">
              {completedCount}/{checklist.length} completado
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[var(--app-primary)]" />
          <span className="text-xs font-medium text-[var(--app-primary)]">30 min</span>
        </div>
      </button>

      {expanded && (
        <div className="mt-4 space-y-3 border-t border-[var(--app-border)] pt-4">
          <div className="grid gap-2">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-[var(--app-primary)]/10 px-3 py-2 text-left transition-all duration-200 hover:bg-[var(--app-primary)]/20"
            >
              <BookOpen className="h-4 w-4 text-[var(--app-primary)]" />
              <span className="text-xs font-medium text-[var(--app-fg)]">
                Respiración anti-ansiedad
              </span>
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-[var(--app-primary)]/10 px-3 py-2 text-left transition-all duration-200 hover:bg-[var(--app-primary)]/20"
            >
              <Clock className="h-4 w-4 text-[var(--app-primary)]" />
              <span className="text-xs font-medium text-[var(--app-fg)]">
                Temporizador de repaso
              </span>
            </button>
          </div>

          <div className="rounded-xl bg-[var(--app-surface)] p-3">
            <p className="mb-2 text-xs font-semibold text-[var(--app-fg)]">Checklist mental</p>
            <div className="space-y-2">
              {checklist.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleCheck(item.id)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left transition-all duration-200 hover:bg-[var(--app-surface-soft)]"
                >
                  <CheckCircle2
                    className={`h-4 w-4 flex-shrink-0 ${
                      item.completed ? "text-[var(--app-primary)]" : "text-[var(--app-border)]"
                    }`}
                  />
                  <span
                    className={`text-xs ${
                      item.completed
                        ? "text-[var(--app-fg-muted)] line-through"
                        : "text-[var(--app-fg)]"
                    }`}
                  >
                    {item.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

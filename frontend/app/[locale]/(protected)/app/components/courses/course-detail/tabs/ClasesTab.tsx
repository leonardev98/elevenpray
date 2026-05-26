"use client";

import { useState } from "react";
import { BookOpen, Check, ChevronRight, Layers, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { courseHex } from "../course-detail-utils";
import type { MockCourseClassSession, MockCourseExtended } from "../../../../lib/mock-course-data";

interface ClasesTabProps {
  course: MockCourseExtended;
  classes: MockCourseClassSession[];
}

export function ClasesTab({ course, classes }: ClasesTabProps) {
  const hex = courseHex(course);
  const [openId, setOpenId] = useState<string | null>(null);
  const completed = classes.filter((c) => c.completed).length;
  const total = classes.length;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Clases del curso</h2>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border-[0.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Nueva clase
        </button>
      </div>

      {classes.length === 0 ? (
        <p className="py-12 text-center text-sm text-[var(--text-muted)]">No hay clases en este curso.</p>
      ) : (
        <ul className="space-y-3">
          {classes.map((cl) => {
            const open = openId === cl.id;
            return (
              <li
                key={cl.id}
                className="overflow-hidden rounded-[var(--radius-lg)] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)]"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : cl.id)}
                  className="flex w-full items-stretch gap-3 p-4 text-left transition-colors hover:bg-[var(--bg-elevated)]"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold"
                    style={{
                      borderColor: hex,
                      color: hex,
                      backgroundColor: `${hex}33`,
                    }}
                  >
                    {cl.number}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[var(--text-primary)]">
                      Clase {cl.number} — {cl.title}
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {cl.dateLine} · {cl.timeRange}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-input)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
                        <BookOpen className="h-3 w-3" aria-hidden />
                        {cl.notesCount} apuntes
                      </span>
                      {cl.flashcardsCount > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-input)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
                          <Layers className="h-3 w-3" aria-hidden />
                          {cl.flashcardsCount} flashcards
                        </span>
                      ) : null}
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border-[0.5px] px-2 py-0.5 text-[10px]",
                          cl.completed
                            ? "border-[color-mix(in_srgb,var(--success)_30%,transparent)] bg-[color-mix(in_srgb,var(--success)_14%,transparent)] text-[var(--success)]"
                            : "border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-muted)]",
                        )}
                      >
                        <Check className="h-3 w-3" aria-hidden />
                        {cl.completed ? "completada" : "pendiente"}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className={cn("mt-1 h-5 w-5 shrink-0 text-[var(--text-muted)] transition-transform", open && "rotate-90")}
                    aria-hidden
                  />
                </button>
                <div
                  className={cn(
                    "overflow-hidden transition-[max-height] duration-200 ease-out",
                    open ? "max-h-[300px]" : "max-h-0",
                  )}
                >
                  <div className="space-y-4 border-t-[0.5px] border-[var(--border)] px-4 pb-4 pt-3">
                      <div>
                        <p className="mb-2 text-xs font-medium text-[var(--text-muted)]">Apuntes de esta clase</p>
                        {cl.linkedNoteTitles.length ? (
                          <ul className="list-inside list-disc text-sm text-[var(--text-body)]">
                            {cl.linkedNoteTitles.map((t) => (
                              <li key={t}>{t}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-[var(--text-muted)]">Sin apuntes vinculados.</p>
                        )}
                        <button
                          type="button"
                          className="mt-2 text-xs text-[var(--text-muted)] underline hover:text-[var(--text-primary)]"
                        >
                          Ver todo
                        </button>
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-medium text-[var(--text-muted)]">Flashcards de esta clase</p>
                        <p className="text-sm text-[var(--text-body)]">{cl.flashcardsCount} flashcards</p>
                        <button
                          type="button"
                          className="mt-2 text-xs text-[var(--text-muted)] underline hover:text-[var(--text-primary)]"
                        >
                          Ver todo
                        </button>
                      </div>
                      <button
                        type="button"
                        className="w-full rounded-[var(--radius-md)] border-[0.5px] border-[color-mix(in_srgb,var(--accent)_50%,transparent)] py-2 text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent-subtle)]"
                      >
                        <Plus className="mr-1 inline h-3.5 w-3.5" aria-hidden />
                        Agregar apunte a esta clase
                      </button>
                    </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {classes.length > 0 && (
        <div className="mt-8 space-y-2">
          <p className="text-xs text-[var(--text-muted)]">
            {completed} de {total} clases completadas
          </p>
          <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--bg-input)]">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: hex }} />
          </div>
        </div>
      )}
    </div>
  );
}

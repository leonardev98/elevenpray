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
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Clases del curso</h2>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-200 hover:border-zinc-500"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Nueva clase
        </button>
      </div>

      {classes.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-500">No hay clases en este curso.</p>
      ) : (
        <ul className="space-y-3">
          {classes.map((cl) => {
            const open = openId === cl.id;
            return (
              <li key={cl.id} className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : cl.id)}
                  className="flex w-full items-stretch gap-3 p-4 text-left transition-colors hover:bg-zinc-800/40"
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
                    <p className="font-semibold text-white">
                      Clase {cl.number} — {cl.title}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {cl.dateLine} · {cl.timeRange}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                        <BookOpen className="h-3 w-3" aria-hidden />
                        {cl.notesCount} apuntes
                      </span>
                      {cl.flashcardsCount > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                          <Layers className="h-3 w-3" aria-hidden />
                          {cl.flashcardsCount} flashcards
                        </span>
                      ) : null}
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]",
                          cl.completed
                            ? "border border-emerald-800/50 bg-emerald-950/40 text-emerald-300"
                            : "border border-zinc-700 bg-zinc-800 text-zinc-400",
                        )}
                      >
                        <Check className="h-3 w-3" aria-hidden />
                        {cl.completed ? "completada" : "pendiente"}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className={cn("mt-1 h-5 w-5 shrink-0 text-zinc-500 transition-transform", open && "rotate-90")}
                    aria-hidden
                  />
                </button>
                <div
                  className={cn(
                    "overflow-hidden transition-[max-height] duration-200 ease-out",
                    open ? "max-h-[300px]" : "max-h-0",
                  )}
                >
                  <div className="space-y-4 border-t border-zinc-800 px-4 pb-4 pt-3">
                      <div>
                        <p className="mb-2 text-xs font-medium text-zinc-500">Apuntes de esta clase</p>
                        {cl.linkedNoteTitles.length ? (
                          <ul className="list-inside list-disc text-sm text-zinc-300">
                            {cl.linkedNoteTitles.map((t) => (
                              <li key={t}>{t}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-zinc-500">Sin apuntes vinculados.</p>
                        )}
                        <button type="button" className="mt-2 text-xs text-zinc-400 underline hover:text-white">
                          Ver todo
                        </button>
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-medium text-zinc-500">Flashcards de esta clase</p>
                        <p className="text-sm text-zinc-300">{cl.flashcardsCount} flashcards</p>
                        <button type="button" className="mt-2 text-xs text-zinc-400 underline hover:text-white">
                          Ver todo
                        </button>
                      </div>
                      <button
                        type="button"
                        className="w-full rounded-lg border border-[var(--app-primary)]/50 py-2 text-xs font-medium text-[var(--app-primary)] hover:bg-[var(--app-primary)]/10"
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
          <p className="text-xs text-zinc-500">
            {completed} de {total} clases completadas
          </p>
          <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: hex }} />
          </div>
        </div>
      )}
    </div>
  );
}

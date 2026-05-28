"use client";

import { Skeleton } from "@/components/ui/skeleton";

function TaskCardSkeleton() {
  return (
    <div className="student-card overflow-hidden" aria-hidden>
      <div className="flex gap-3 p-4">
        <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-5 w-14 rounded-md" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function TaskSectionSkeleton({ cards }: { cards: number }) {
  return (
    <section className="space-y-3" aria-hidden>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: cards }, (_, i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

export function TasksListSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Cargando tareas">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" aria-hidden>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-9 w-full max-w-xs rounded-xl sm:w-48" />
      </div>
      <div className="space-y-6">
        <TaskSectionSkeleton cards={2} />
        <TaskSectionSkeleton cards={3} />
      </div>
    </div>
  );
}

function KanbanColumnSkeleton() {
  return (
    <div className="flex min-h-[320px] flex-col rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)]/40 p-3" aria-hidden>
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-7 rounded-lg" />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function TasksKanbanSkeleton() {
  return (
    <div className="overflow-x-auto pb-2" aria-busy="true" aria-label="Cargando tablero">
      <div className="grid min-w-[720px] grid-cols-3 gap-4">
        <KanbanColumnSkeleton />
        <KanbanColumnSkeleton />
        <KanbanColumnSkeleton />
      </div>
    </div>
  );
}

export function TasksCalendarSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Cargando calendario">
      <div className="flex items-center justify-between" aria-hidden>
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="space-y-2 rounded-xl border border-[var(--app-border)] p-2">
            <Skeleton className="mx-auto h-3 w-6" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-8 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TasksCourseTabSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Cargando tareas del curso">
      <div className="flex items-center justify-between" aria-hidden>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
      <div className="space-y-2">
        <TaskCardSkeleton />
        <TaskCardSkeleton />
        <TaskCardSkeleton />
      </div>
    </div>
  );
}

export function TasksSidebarSkeleton() {
  return (
    <aside className="space-y-6" aria-busy="true" aria-label="Cargando resumen">
      <section aria-hidden>
        <Skeleton className="mb-3 h-3 w-16" />
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="student-card space-y-2 p-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-14" />
            </div>
          ))}
        </div>
      </section>
      <section aria-hidden>
        <Skeleton className="mb-3 h-3 w-24" />
        <div className="student-card space-y-3 p-4">
          <Skeleton className="h-5 w-4/5" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-14 rounded-md" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
      </section>
      <section aria-hidden>
        <Skeleton className="mb-3 h-3 w-20" />
        <div className="student-card space-y-2 p-4">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </section>
      <section aria-hidden>
        <Skeleton className="mb-3 h-3 w-28" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </section>
    </aside>
  );
}

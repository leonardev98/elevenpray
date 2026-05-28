"use client";

import { Skeleton } from "@/components/ui/skeleton";

function MallaCourseCardSkeleton() {
  return (
    <Skeleton className="min-h-[108px] w-[min(100%,168px)] min-w-[140px] max-w-[200px] rounded-2xl" />
  );
}

function MallaCycleSectionSkeleton({ cards }: { cards: number }) {
  return (
    <section className="space-y-3" aria-hidden>
      <div className="flex flex-wrap items-end gap-3 border-b border-[var(--border)] pb-2">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-28" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: cards }, (_, i) => (
          <MallaCourseCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

function MallaStatsPanelSkeleton() {
  return (
    <aside
      className="sticky top-4 space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 shadow-sm"
      aria-hidden
    >
      <div>
        <Skeleton className="h-3 w-32" />
        <div className="mt-3 flex items-center gap-4">
          <Skeleton className="h-20 w-20 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full max-w-[140px]" />
            <Skeleton className="h-3 w-[90%]" />
            <Skeleton className="h-3 w-[75%]" />
            <Skeleton className="h-3 w-[60%]" />
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--border)] pt-4">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="mt-2 h-3 w-4/5" />
      </div>
      <div className="border-t border-[var(--border)] pt-4 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-full rounded-lg" />
        <Skeleton className="h-9 w-full rounded-lg" />
        <Skeleton className="h-9 w-4/5 rounded-lg" />
      </div>
    </aside>
  );
}

export function MallaSkeleton() {
  return (
    <div
      className="grid gap-8 lg:grid-cols-[1fr_280px]"
      aria-busy="true"
      aria-label="Cargando malla curricular"
    >
      <div className="space-y-8">
        <MallaCycleSectionSkeleton cards={4} />
        <MallaCycleSectionSkeleton cards={5} />
        <MallaCycleSectionSkeleton cards={3} />
      </div>
      <MallaStatsPanelSkeleton />
    </div>
  );
}

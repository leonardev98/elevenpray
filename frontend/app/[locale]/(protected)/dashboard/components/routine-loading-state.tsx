"use client";

export function RoutineLoadingState() {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-6 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-8">
      <div className="app-loading-spinner" aria-hidden />
      <p className="text-sm font-medium text-[var(--app-fg)]/70">Cargando tu rutina…</p>
    </div>
  );
}

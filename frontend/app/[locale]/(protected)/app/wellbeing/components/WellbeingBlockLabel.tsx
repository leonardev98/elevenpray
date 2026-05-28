export function WellbeingBlockLabel({ children }: { children: string }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span
        className="h-4 w-0.5 shrink-0 rounded-full bg-[var(--app-primary)]"
        aria-hidden
      />
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--app-fg-muted)]">
        {children}
      </h2>
    </div>
  );
}

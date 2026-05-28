export function SectionLabel({ children }: { children: string }) {
  return (
    <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-[var(--app-fg-muted)]">
      {children}
    </h2>
  );
}

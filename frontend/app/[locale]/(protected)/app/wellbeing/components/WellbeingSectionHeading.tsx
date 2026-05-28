import type { LucideIcon } from "lucide-react";

export function WellbeingSectionHeading({
  icon: Icon,
  title,
}: {
  icon: LucideIcon;
  title: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon className="h-5 w-5 shrink-0 text-[var(--app-primary)]" aria-hidden />
      <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--app-fg-muted)]">
        {title}
      </h2>
    </div>
  );
}

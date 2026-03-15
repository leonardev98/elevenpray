"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";

export default function UniversityWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const workspaceId = params.id as string;
  const sections = useMemo(
    () => [
      { label: "Dashboard", href: `/workspace/university/${workspaceId}` },
      { label: "Back to workspace", href: `/dashboard/workspaces/${workspaceId}` },
    ],
    [workspaceId],
  );

  return (
    <div className="university-dashboard space-y-4 rounded-2xl p-1">
      <header className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--app-fg)]/50">Study / University</p>
            <h1 className="text-lg font-semibold text-[var(--app-fg)]">Student Operating System</h1>
          </div>
          <nav className="flex items-center gap-2">
            {sections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="rounded-lg border border-[var(--app-border)] px-3 py-1.5 text-sm text-[var(--app-fg)]/80 transition hover:border-[var(--app-navy)]/40 hover:text-[var(--app-fg)]"
              >
                {section.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}

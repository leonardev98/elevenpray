"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { DeveloperHeader } from "../../developer/components/DeveloperHeader";
import { useSidebar } from "../../../sidebar-context";

export default function UniversityWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const workspaceId = params.id as string;
  const sidebar = useSidebar();
  const sections = useMemo(
    () => [
      { label: "Dashboard", href: `/workspace/university/${workspaceId}` },
      { label: "Back to workspace", href: `/dashboard/workspaces/${workspaceId}` },
    ],
    [workspaceId],
  );

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <DeveloperHeader
        onOpenMobileNav={() => sidebar?.openMobileNav()}
        showFocusBreak={false}
      />
      <div className="university-dashboard min-h-0 flex-1 space-y-4 rounded-2xl p-4 sm:p-6">
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
    </div>
  );
}

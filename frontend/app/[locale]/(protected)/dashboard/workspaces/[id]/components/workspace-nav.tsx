"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  getWorkspaceNavSections,
  getActiveSection,
} from "../../../../../../lib/workspace-navigation";
import type { WorkspaceApi } from "../../../../../../lib/workspaces-api";

const ICON_CLASS = "h-[1.125rem] w-[1.125rem] shrink-0";

const icons: Record<string, React.ReactNode> = {
  home: (
    <svg className={ICON_CLASS} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  droplets: (
    <svg className={ICON_CLASS} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  scan: (
    <svg className={ICON_CLASS} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  flask: (
    <svg className={ICON_CLASS} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  book: (
    <svg className={ICON_CLASS} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  user: (
    <svg className={ICON_CLASS} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
};

interface WorkspaceNavProps {
  workspaceId: string;
  workspace: WorkspaceApi;
}

export function WorkspaceNav({ workspaceId, workspace }: WorkspaceNavProps) {
  const pathname = usePathname();
  const t = useTranslations("workspaceNav");
  const base = `/dashboard/workspaces/${workspaceId}`;
  const sections = getWorkspaceNavSections(workspace.workspaceType);
  const activeSection = getActiveSection(sections, pathname, base);

  return (
    <nav
      className="flex flex-wrap gap-1 border-b border-[var(--app-border)] -mb-px"
      aria-label="Secciones del espacio"
    >
      {sections.map((section) => {
        const href = section.href ? `${base}/${section.href}` : base;
        const isActive = activeSection?.id === section.id;
        return (
          <Link
            key={section.id}
            href={href}
            className={`
              flex items-center gap-2 rounded-t-lg px-4 py-3 text-sm font-medium transition-colors
              border-b-2 border-transparent -mb-[2px]
              ${isActive
                ? "border-[var(--app-gold)] text-[var(--app-fg)] bg-[var(--app-gold)]/5"
                : "text-[var(--app-fg)]/55 hover:text-[var(--app-fg)]/85 hover:bg-[var(--app-bg)]/80"
              }
            `}
          >
            {icons[section.icon] ?? null}
            <span>{t(section.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}


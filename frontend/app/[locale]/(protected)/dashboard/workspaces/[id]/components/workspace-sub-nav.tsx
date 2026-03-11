"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import type { NavSection } from "../../../../../../lib/workspace-navigation";

interface WorkspaceSubNavProps {
  workspaceId: string;
  section: NavSection;
}

export function WorkspaceSubNav({ workspaceId, section }: WorkspaceSubNavProps) {
  const pathname = usePathname();
  const t = useTranslations("workspaceNav");
  const base = `/dashboard/workspaces/${workspaceId}`;

  if (!section.children?.length) return null;

  return (
    <nav
      className="mt-3 flex flex-wrap gap-1"
      aria-label={t("subNavLabel")}
    >
      {section.children.map((child) => {
        const href = child.href ? `${base}/${child.href}` : base;
        const isActive =
          href === base
            ? pathname === base
            : pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={child.href}
            href={href}
            className={`
              rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors
              ${isActive
                ? "bg-[var(--app-navy)]/15 text-[var(--app-navy)] ring-1 ring-[var(--app-navy)]/25"
                : "text-[var(--app-fg)]/55 hover:text-[var(--app-fg)] hover:bg-[var(--app-bg)]"
              }
            `}
          >
            {t(child.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}

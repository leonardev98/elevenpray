"use client";

import { usePathname } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  ChevronDown,
  Droplets,
  FlaskConical,
  House,
  ScanLine,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getWorkspaceNavSections,
  getActiveSection,
} from "../../../../../../lib/workspace-navigation";
import type { WorkspaceApi } from "../../../../../../lib/workspaces-api";

const ICON_CLASS = "h-4 w-4 shrink-0";

const icons: Record<string, LucideIcon> = {
  home: House,
  droplets: Droplets,
  scan: ScanLine,
  flask: FlaskConical,
  book: BookOpen,
  user: User,
};

interface WorkspaceNavProps {
  workspaceId: string;
  workspace: WorkspaceApi;
}

export function WorkspaceNav({ workspaceId, workspace }: WorkspaceNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("workspaceNav");
  const base = `/dashboard/workspaces/${workspaceId}`;
  const sections = getWorkspaceNavSections(workspace.workspaceType);
  const activeSection = getActiveSection(sections, pathname, base);

  return (
    <nav className="flex items-center gap-1 overflow-x-auto" aria-label={t("sectionsAriaLabel")}>
      {sections.map((section) => {
        const href = section.href ? `${base}/${section.href}` : base;
        const isActive = activeSection?.id === section.id;
        const Icon = icons[section.icon];

        if (section.children?.length) {
          return (
            <DropdownMenu key={section.id}>
              <DropdownMenuTrigger
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-navy)]/30",
                  "data-[state=open]:bg-[var(--app-navy)]/10 data-[state=open]:text-[var(--app-navy)] data-[state=open]:shadow-sm",
                  isActive
                    ? "bg-[var(--app-navy)]/10 text-[var(--app-navy)] shadow-sm dark:text-sky-400"
                    : "text-[var(--app-fg)]/70 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)] dark:text-slate-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                )}
                aria-label={t(section.labelKey)}
              >
                {Icon ? <Icon className={ICON_CLASS} aria-hidden /> : null}
                <span>{t(section.labelKey)}</span>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={6}
                className="min-w-[200px] rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] py-1.5 shadow-lg ring-1 ring-[var(--app-border)]/50"
              >
                {section.children.map((child) => {
                  const childHref = child.href ? `${base}/${child.href}` : base;
                  return (
                    <DropdownMenuItem
                      key={`${section.id}-${child.href}`}
                      onClick={() => setTimeout(() => router.push(childHref), 0)}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm font-medium outline-none",
                        "text-[var(--app-fg)] focus:bg-[var(--app-navy)]/10 focus:text-[var(--app-navy)]",
                        "hover:bg-[var(--app-navy)]/10 hover:text-[var(--app-navy)]"
                      )}
                    >
                      {Icon ? <Icon className={ICON_CLASS} aria-hidden /> : null}
                      <span>{t(child.labelKey)}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }

        return (
          <Link
            key={section.id}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-all duration-150",
              isActive
                ? "bg-[var(--app-navy)]/10 text-[var(--app-navy)] shadow-sm dark:text-sky-400"
                : "text-[var(--app-fg)]/70 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)] dark:text-slate-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            )}
          >
            {Icon ? <Icon className={ICON_CLASS} aria-hidden /> : null}
            <span>{t(section.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}


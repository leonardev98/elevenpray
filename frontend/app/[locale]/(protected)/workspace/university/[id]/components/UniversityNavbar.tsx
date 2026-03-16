"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { LayoutDashboard, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_CLASS = "h-4 w-4 shrink-0";

interface UniversityNavbarProps {
  workspaceId: string;
}

export function UniversityNavbar({ workspaceId }: UniversityNavbarProps) {
  const pathname = usePathname();
  const tNav = useTranslations("nav");
  const tWorkspace = useTranslations("workspace");

  const dashboardHref = `/workspace/university/${workspaceId}`;
  const backHref = `/dashboard/workspaces/${workspaceId}`;
  const isDashboard = pathname === dashboardHref || pathname?.startsWith?.(dashboardHref + "/");

  const triggerClass = cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-t-lg border-b-2 border-transparent px-4 py-2.5 text-sm font-medium transition-all duration-200",
    "hover:text-[var(--app-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-navy)]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-bg)]"
  );
  const activeClass =
    "border-[var(--app-navy)] text-[var(--app-navy)] font-medium dark:text-sky-400";
  const inactiveClass = "border-transparent text-[var(--app-fg)]/70";

  return (
    <nav
      className="flex-shrink-0 border-b border-[var(--app-border)] bg-[var(--app-bg)]/80"
      aria-label="University workspace navigation"
    >
      <div
        role="tablist"
        className={cn(
          "inline-flex h-10 w-full items-center justify-start gap-0 overflow-x-auto rounded-none border-0 bg-transparent p-0 text-[var(--app-fg)]/70",
          "scrollbar-thin scrollbar-thumb-[var(--app-border)]"
        )}
      >
        <Link
          href={dashboardHref}
          className={cn(
            triggerClass,
            isDashboard ? activeClass : inactiveClass
          )}
        >
          <LayoutDashboard className={ICON_CLASS} aria-hidden />
          {tNav("dashboard")}
        </Link>
        <Link href={backHref} className={cn(triggerClass, inactiveClass)}>
          <ArrowLeft className={ICON_CLASS} aria-hidden />
          {tWorkspace("backToWorkspace")}
        </Link>
      </div>
    </nav>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  BookOpen,
  Calendar,
  ClipboardList,
  Heart,
  Home,
  Menu,
  Sparkles,
  User,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/app", key: "home", icon: Home, exact: true },
  { href: "/app/calendar", key: "calendar", icon: Calendar },
  { href: "/app/courses", key: "courses", icon: BookOpen },
  { href: "/app/tasks", key: "tasks", icon: ClipboardList },
  { href: "/app/wellbeing", key: "wellbeing", icon: Heart },
  { href: "/app/study", key: "study", icon: Sparkles },
  { href: "/app/community", key: "community", icon: Users },
  { href: "/app/profile", key: "profile", icon: User },
] as const;

interface StudentSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function StudentSidebar({
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}: StudentSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("studentNav");

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-[var(--app-border)] bg-[var(--app-surface-soft)]",
        collapsed ? "w-[76px]" : "w-64",
        mobileOpen ? "flex" : "hidden lg:flex",
      )}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-5">
        <Link href="/app" onClick={onCloseMobile} className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--app-primary-soft)] text-lg font-bold text-[var(--app-primary)]">
            M
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold tracking-tight text-[var(--app-fg)]">Mitsyy</span>
          )}
        </Link>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden rounded-xl p-2 text-[var(--app-fg-secondary)] hover:bg-[var(--app-surface-elevated)] lg:flex"
            aria-label={collapsed ? t("expand") : t("collapse")}
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-xl p-2 text-[var(--app-fg-secondary)] hover:bg-[var(--app-surface-elevated)] lg:hidden"
            aria-label={t("close")}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2 pb-4" aria-label={t("label")}>
        {NAV_ITEMS.map((item) => {
          const { href, key, icon: Icon } = item;
          const exact = "exact" in item ? item.exact : false;
          const active = isActive(href, exact);

          return (
            <Link
              key={href}
              href={href}
              onClick={onCloseMobile}
              title={collapsed ? t(key) : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-2 py-2 transition",
                collapsed && "justify-center px-2",
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition",
                  active
                    ? "bg-[var(--app-primary)] text-[var(--app-bg)] shadow-sm"
                    : "bg-transparent text-[var(--app-fg-secondary)] group-hover:text-[var(--app-fg)]",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 2} aria-hidden />
              </span>
              {!collapsed && (
                <span
                  className={cn(
                    "text-sm font-medium",
                    active ? "text-[var(--app-primary)]" : "text-[var(--app-fg-secondary)]",
                  )}
                >
                  {t(key)}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

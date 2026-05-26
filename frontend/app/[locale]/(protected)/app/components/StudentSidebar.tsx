"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  BookOpen,
  Calendar,
  ClipboardList,
  CreditCard,
  Heart,
  Home,
  Menu,
  Moon,
  Sparkles,
  Sun,
  Trophy,
  User,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarStreakCompact } from "../gamification/components/SidebarStreakCompact";
import { useTheme } from "@/app/providers/theme-provider";

const NAV_ITEMS = [
  { href: "/app", key: "home", icon: Home, exact: true },
  { href: "/app/calendar", key: "calendar", icon: Calendar },
  { href: "/app/courses", key: "courses", icon: BookOpen },
  { href: "/app/tasks", key: "tasks", icon: ClipboardList },
  { href: "/app/wellbeing", key: "wellbeing", icon: Heart },
  { href: "/app/logros", key: "achievements", icon: Trophy },
  { href: "/app/study", key: "study", icon: Sparkles },
  { href: "/app/community", key: "community", icon: Users },
  { href: "/app/plan", key: "plan", icon: CreditCard },
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
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r-[0.5px] border-[var(--border)] bg-[var(--bg-surface)]",
        collapsed ? "w-[76px]" : "w-64",
        mobileOpen ? "flex" : "hidden lg:flex",
      )}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-5">
        <Link href="/app" onClick={onCloseMobile} className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-subtle)] text-lg font-semibold text-[var(--accent)]">
            M
          </div>
          {!collapsed && (
            <span className="text-[1.35rem] font-semibold text-[var(--text-primary)]">
              Mitsyy
            </span>
          )}
        </Link>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden rounded-[var(--radius-md)] p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] lg:flex"
            aria-label={collapsed ? t("expand") : t("collapse")}
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-[var(--radius-md)] p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] lg:hidden"
            aria-label={t("close")}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2" aria-label={t("label")}>
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
                "group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 transition-colors",
                active
                  ? "bg-[var(--accent-subtle)] text-[var(--accent)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]",
                collapsed && "justify-center px-2",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.25 : 2} aria-hidden />
              {!collapsed && (
                <span className="text-sm font-medium">
                  {t(key)}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <SidebarStreakCompact collapsed={collapsed} />

      <div className="border-t-[0.5px] border-[var(--border)] px-2 py-3">
        <button
          type="button"
          onClick={toggleTheme}
          title={collapsed ? t(isDark ? "themeLight" : "themeDark") : undefined}
          aria-label={t(isDark ? "themeLight" : "themeDark")}
          className={cn(
            "group flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]",
            collapsed && "justify-center px-2",
          )}
        >
          {isDark ? (
            <Sun className="h-5 w-5 shrink-0" aria-hidden />
          ) : (
            <Moon className="h-5 w-5 shrink-0" aria-hidden />
          )}
          {!collapsed && (
            <span className="text-sm font-medium">
              {t(isDark ? "themeLight" : "themeDark")}
            </span>
          )}
        </button>
      </div>

      <div className="border-t-[0.5px] border-[var(--border)] px-3 py-4">
        <Link
          href="/app"
          onClick={onCloseMobile}
          className={cn(
            "flex items-center gap-2.5",
            collapsed && "justify-center",
          )}
          aria-label="Mitsyy"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-subtle)] text-sm font-semibold text-[var(--accent)]">
            M
          </div>
          {!collapsed && (
            <span className="text-xs text-[var(--text-muted)]">Mitsyy</span>
          )}
        </Link>
      </div>
    </aside>
  );
}

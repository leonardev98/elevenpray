"use client";

import { useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Sun,
  Lock,
  MessageSquare,
  Code2,
  FolderKanban,
  CheckSquare,
  Wrench,
  Sparkles,
  Rss,
  StickyNote,
  User,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS: { href: string; key: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { href: "/workspace/developer", key: "dashboard", icon: LayoutDashboard },
  { href: "/workspace/developer", key: "today", icon: Sun },
  { href: "/workspace/developer/vault", key: "vault", icon: Lock },
  { href: "/workspace/developer/prompts", key: "prompts", icon: MessageSquare },
  { href: "/workspace/developer/snippets", key: "snippets", icon: Code2 },
  { href: "/workspace/developer/projects", key: "projects", icon: FolderKanban },
  { href: "/workspace/developer/tasks", key: "tasks", icon: CheckSquare },
  { href: "/workspace/developer/tools", key: "tools", icon: Wrench },
  { href: "/workspace/developer/ai-actions", key: "aiActions", icon: Sparkles },
  { href: "/workspace/developer/tech-feed", key: "techFeed", icon: Rss },
  { href: "/workspace/developer/notes", key: "notes", icon: StickyNote },
  { href: "/workspace/developer/profile", key: "profile", icon: User },
  { href: "/workspace/developer/settings", key: "settings", icon: Settings },
];

interface DeveloperSidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  isMobileDrawer?: boolean;
  onCloseMobile?: () => void;
}

export function DeveloperSidebar({
  collapsed = false,
  onCollapsedChange,
  isMobileDrawer = false,
  onCloseMobile,
}: DeveloperSidebarProps) {
  const t = useTranslations("developerWorkspace.sidebar");
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-[var(--app-border)] bg-[var(--app-surface)] transition-[width]",
        collapsed ? "w-[72px]" : "w-56",
        isMobileDrawer && "fixed inset-y-0 left-0 z-50 w-64"
      )}
      aria-label="Developer workspace navigation"
    >
      {/* Collapse toggle — desktop only */}
      {!isMobileDrawer && onCollapsedChange && (
        <div className="flex h-12 flex-shrink-0 items-center justify-end border-b border-[var(--app-border)] px-2">
          <button
            type="button"
            onClick={() => onCollapsedChange(!collapsed)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--app-fg)]/60 transition-colors hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>
      )}

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
        {NAV_ITEMS.map(({ href, key, icon: Icon }) => {
          const isDashboardOrToday = key === "dashboard" || key === "today";
          const active = isDashboardOrToday
            ? pathname === "/workspace/developer"
            : pathname === href;

          return (
            <Link
              key={key}
              href={href}
              onClick={isMobileDrawer ? onCloseMobile : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-[var(--app-navy)]/10 text-[var(--app-navy)]"
                  : "text-[var(--app-fg)]/70 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{t(key)}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

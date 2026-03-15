"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavGroupDropdown, type NavGroupItem } from "./NavGroupDropdown";

const PRIMARY: NavGroupItem[] = [
  { href: "/workspace/developer", key: "today", icon: Sun },
  { href: "/workspace/developer/projects", key: "projects", icon: FolderKanban },
  { href: "/workspace/developer/tasks", key: "tasks", icon: CheckSquare },
];

const KNOWLEDGE_ITEMS: NavGroupItem[] = [
  { href: "/workspace/developer/vault", key: "vault", icon: Lock },
  { href: "/workspace/developer/prompts", key: "prompts", icon: MessageSquare },
  { href: "/workspace/developer/snippets", key: "snippets", icon: Code2 },
  { href: "/workspace/developer/notes", key: "notes", icon: StickyNote },
];

const TOOLS_ITEMS: NavGroupItem[] = [
  { href: "/workspace/developer/tools", key: "tools", icon: Wrench },
  { href: "/workspace/developer/ai-actions", key: "aiActions", icon: Sparkles },
  { href: "/workspace/developer/tech-feed", key: "techFeed", icon: Rss },
];

function isPathActive(pathname: string, href: string, key: string): boolean {
  if (key === "today") return pathname === "/workspace/developer";
  return pathname === href;
}

export function DeveloperNavHorizontal() {
  const t = useTranslations("developerWorkspace.sidebar");
  const pathname = usePathname();

  const knowledgeActive = KNOWLEDGE_ITEMS.some((i) => isPathActive(pathname, i.href, i.key));
  const toolsActive = TOOLS_ITEMS.some((i) => isPathActive(pathname, i.href, i.key));

  return (
    <nav
      className="flex items-center gap-1 overflow-x-auto border-b border-[var(--dev-border-subtle)] bg-[var(--app-bg)]/80 px-3 py-2 scrollbar-thin scrollbar-thumb-[var(--app-border)]"
      aria-label="Developer workspace navigation"
    >
      {/* Primer nivel: Hoy, Proyectos, Tareas */}
      <div className="flex shrink-0 items-center gap-0.5">
        {PRIMARY.map(({ href, key, icon: Icon }) => {
          const active = isPathActive(pathname, href, key);
          return (
            <Link
              key={key}
              href={href}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[length:var(--dev-font-body-size)] font-medium transition-all duration-150 whitespace-nowrap",
                active
                  ? "bg-[var(--app-navy)]/10 text-[var(--app-navy)] shadow-sm"
                  : "text-[var(--app-fg)]/70 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{t(key)}</span>
            </Link>
          );
        })}
      </div>

      <span
        className="mx-1 h-4 w-px shrink-0 bg-[var(--dev-border-subtle)]"
        aria-hidden
      />

      {/* Knowledge dropdown */}
      <NavGroupDropdown
        labelKey="knowledge"
        items={KNOWLEDGE_ITEMS}
        isActive={knowledgeActive}
        renderLabel={(key) => t(key)}
      />

      {/* Tools dropdown */}
      <NavGroupDropdown
        labelKey="toolsGroup"
        items={TOOLS_ITEMS}
        isActive={toolsActive}
        renderLabel={(key) => t(key)}
      />

    </nav>
  );
}

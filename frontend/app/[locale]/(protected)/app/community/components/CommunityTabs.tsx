"use client";

import { HelpCircle, LayoutTemplate, Newspaper } from "lucide-react";
import type { CommunityTab } from "../community-types";
import { cn } from "@/lib/utils";

const TABS: { id: CommunityTab; label: string; icon: typeof Newspaper }[] = [
  { id: "feed", label: "Feed", icon: Newspaper },
  { id: "questions", label: "Preguntas", icon: HelpCircle },
  { id: "templates", label: "Plantillas", icon: LayoutTemplate },
];

export function CommunityTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: CommunityTab;
  onTabChange: (tab: CommunityTab) => void;
}) {
  return (
    <nav className="mb-6 flex gap-1 border-b-[0.5px] border-[var(--border)]" aria-label="Secciones de comunidad">
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            className={cn(
              "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors -mb-px",
              isActive
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </button>
        );
      })}
    </nav>
  );
}

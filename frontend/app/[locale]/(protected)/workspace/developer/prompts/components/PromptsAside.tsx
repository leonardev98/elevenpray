"use client";

import { useTranslations } from "next-intl";
import { FolderPlus, Star, Clock, Archive, FolderOpen, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PromptFolderApi, PromptCategoryApi } from "@/app/lib/developer-workspace";

interface PromptsAsideProps {
  folders: PromptFolderApi[];
  categories: PromptCategoryApi[];
  selectedFolderId: string | null;
  selectedCategoryId: string | null;
  viewMode: "all" | "favorites" | "recent" | "archived" | null;
  onSelectFolder: (id: string | null) => void;
  onSelectCategory: (id: string | null) => void;
  onViewMode: (mode: "all" | "favorites" | "recent" | "archived" | null) => void;
  onNewFolder: () => void;
}

export function PromptsAside({
  folders,
  categories,
  selectedFolderId,
  selectedCategoryId,
  viewMode,
  onSelectFolder,
  onSelectCategory,
  onViewMode,
  onNewFolder,
}: PromptsAsideProps) {
  const t = useTranslations("developerWorkspace.prompts");

  return (
    <aside className="flex min-h-0 w-[220px] shrink-0 flex-col gap-4 overflow-y-auto border-r border-[var(--dev-border-subtle)] bg-[var(--app-bg)]/50 py-4 pl-4 pr-2 sm:w-[240px]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--app-fg)]/50">
          {t("allFolders")}
        </span>
        <button
          type="button"
          onClick={onNewFolder}
          className="rounded p-1.5 text-[var(--app-fg)]/50 hover:bg-[var(--app-surface)] hover:text-[var(--app-fg)]"
          title={t("newFolder")}
        >
          <FolderPlus className="h-4 w-4" />
        </button>
      </div>
      <nav className="flex flex-col gap-0.5">
        <button
          type="button"
          onClick={() => {
            onViewMode(null);
            onSelectFolder(null);
            onSelectCategory(null);
          }}
          className={cn(
            "flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors",
            !viewMode && !selectedFolderId && !selectedCategoryId
              ? "bg-[var(--app-navy)]/10 text-[var(--app-navy)]"
              : "text-[var(--app-fg)]/70 hover:bg-[var(--app-surface)] hover:text-[var(--app-fg)]"
          )}
        >
          <FolderOpen className="h-4 w-4 shrink-0" />
          Todos
        </button>
        <button
          type="button"
          onClick={() => {
            onViewMode("favorites");
            onSelectFolder(null);
            onSelectCategory(null);
          }}
          className={cn(
            "flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors",
            viewMode === "favorites"
              ? "bg-[var(--app-navy)]/10 text-[var(--app-navy)]"
              : "text-[var(--app-fg)]/70 hover:bg-[var(--app-surface)] hover:text-[var(--app-fg)]"
          )}
        >
          <Star className="h-4 w-4 shrink-0" />
          {t("favorites")}
        </button>
        <button
          type="button"
          onClick={() => {
            onViewMode("recent");
            onSelectFolder(null);
            onSelectCategory(null);
          }}
          className={cn(
            "flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors",
            viewMode === "recent"
              ? "bg-[var(--app-navy)]/10 text-[var(--app-navy)]"
              : "text-[var(--app-fg)]/70 hover:bg-[var(--app-surface)] hover:text-[var(--app-fg)]"
          )}
        >
          <Clock className="h-4 w-4 shrink-0" />
          {t("recent")}
        </button>
        <button
          type="button"
          onClick={() => {
            onViewMode("archived");
            onSelectFolder(null);
            onSelectCategory(null);
          }}
          className={cn(
            "flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors",
            viewMode === "archived"
              ? "bg-[var(--app-navy)]/10 text-[var(--app-navy)]"
              : "text-[var(--app-fg)]/70 hover:bg-[var(--app-surface)] hover:text-[var(--app-fg)]"
          )}
        >
          <Archive className="h-4 w-4 shrink-0" />
          {t("archived")}
        </button>
      </nav>

      {folders.length > 0 && (
        <>
          <span className="text-xs font-medium uppercase tracking-wide text-[var(--app-fg)]/50">
            Carpetas
          </span>
          <div className="flex flex-col gap-0.5">
            {folders.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  onViewMode(null);
                  onSelectFolder(selectedFolderId === f.id ? null : f.id);
                  onSelectCategory(null);
                }}
                className={cn(
                  "rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors",
                  selectedFolderId === f.id
                    ? "bg-[var(--app-navy)]/10 text-[var(--app-navy)]"
                    : "text-[var(--app-fg)]/70 hover:bg-[var(--app-surface)] hover:text-[var(--app-fg)]"
                )}
              >
                {f.name}
              </button>
            ))}
          </div>
        </>
      )}

      {categories.length > 0 && (
        <>
          <span className="text-xs font-medium uppercase tracking-wide text-[var(--app-fg)]/50">
            {t("categories")}
          </span>
          <div className="flex flex-col gap-0.5">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onViewMode(null);
                  onSelectFolder(null);
                  onSelectCategory(selectedCategoryId === c.id ? null : c.id);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors",
                  selectedCategoryId === c.id
                    ? "bg-[var(--app-navy)]/10 text-[var(--app-navy)]"
                    : "text-[var(--app-fg)]/70 hover:bg-[var(--app-surface)] hover:text-[var(--app-fg)]"
                )}
              >
                <Tag className="h-3.5 w-3.5 shrink-0 opacity-60" />
                {c.name || c.code}
              </button>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}

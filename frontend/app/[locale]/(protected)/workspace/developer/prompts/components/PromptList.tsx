"use client";

import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { PromptRow } from "./PromptRow";
import type { PromptApi, PromptFolderApi, PromptCategoryApi, DeveloperProjectApi } from "@/app/lib/developer-workspace";

export type SortOption = "updated_at" | "last_used_at" | "created_at" | "title";

interface PromptListProps {
  prompts: PromptApi[];
  folders: PromptFolderApi[];
  categories: PromptCategoryApi[];
  projects: DeveloperProjectApi[];
  selectedId: string | null;
  search: string;
  sortBy: SortOption;
  sortOrder: "asc" | "desc";
  copiedId: string | null;
  onSearchChange: (v: string) => void;
  onSortChange: (by: SortOption, order: "asc" | "desc") => void;
  onSelect: (prompt: PromptApi) => void;
  onCopy: (prompt: PromptApi) => void;
  onToggleFavorite: (prompt: PromptApi) => void;
  onTogglePin: (prompt: PromptApi) => void;
  onEdit: (prompt: PromptApi) => void;
  onDuplicate: (prompt: PromptApi) => void;
  onArchive: (prompt: PromptApi) => void;
  onDelete: (prompt: PromptApi) => void;
  /** Called when user clicks the main CTA in the empty state (create first prompt). */
  onEmptyCreateClick?: () => void;
  isLoading?: boolean;
  /** When true, show full empty state with CTA. When false and prompts.length===0, show noResults. */
  isInitialEmpty?: boolean;
}

export function PromptList({
  prompts,
  folders,
  categories,
  projects,
  selectedId,
  search,
  sortBy,
  sortOrder,
  copiedId,
  onSearchChange,
  onSortChange,
  onSelect,
  onCopy,
  onToggleFavorite,
  onTogglePin,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  onEmptyCreateClick,
  isLoading,
  isInitialEmpty,
}: PromptListProps) {
  const t = useTranslations("developerWorkspace.prompts");

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[var(--dev-border-subtle)] pb-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-fg)]/50" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] py-2 pl-9 pr-3 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:border-[var(--app-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/20"
          />
        </div>
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [by, order] = e.target.value.split("-") as [SortOption, "asc" | "desc"];
            onSortChange(by, order);
          }}
          className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-navy)] focus:outline-none"
        >
          <option value="updated_at-desc">{t("updatedAt")} (nuevo)</option>
          <option value="updated_at-asc">{t("updatedAt")} (antiguo)</option>
          <option value="last_used_at-desc">{t("lastUsed")} (reciente)</option>
          <option value="created_at-desc">Creado (nuevo)</option>
          <option value="title-asc">Título A–Z</option>
          <option value="title-desc">Título Z–A</option>
        </select>
      </div>
      <div className="mt-2 flex flex-1 flex-col gap-1 overflow-auto">
        {isLoading ? (
          <div className="flex flex-col gap-2 py-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-lg bg-[var(--app-surface)]"
              />
            ))}
          </div>
        ) : prompts.length === 0 ? (
          isInitialEmpty ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--dev-border-subtle)] bg-[var(--app-bg)]/20 py-12 text-center">
              <p className="max-w-sm text-sm text-[var(--app-fg)]/60">
                {t("empty")}
              </p>
              <p className="mt-2 text-xs text-[var(--app-fg)]/50">
                {t("emptyHint")}
              </p>
              {onEmptyCreateClick && (
                <button
                  type="button"
                  onClick={onEmptyCreateClick}
                  className="mt-6 rounded-xl bg-[var(--app-navy)] px-6 py-3.5 text-base font-medium text-white shadow-sm transition-opacity hover:opacity-95"
                >
                  {t("emptyCreateCta")}
                </button>
              )}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-[var(--app-fg)]/50">
              {t("noResults")}
            </p>
          )
        ) : (
          prompts.map((prompt) => (
            <PromptRow
              key={prompt.id}
              prompt={prompt}
              isSelected={selectedId === prompt.id}
              onSelect={() => onSelect(prompt)}
              onCopy={() => onCopy(prompt)}
              onToggleFavorite={() => onToggleFavorite(prompt)}
              onTogglePin={() => onTogglePin(prompt)}
              onEdit={() => onEdit(prompt)}
              onDuplicate={() => onDuplicate(prompt)}
              onArchive={() => onArchive(prompt)}
              onDelete={() => onDelete(prompt)}
              copied={copiedId === prompt.id}
            />
          ))
        )}
      </div>
    </div>
  );
}

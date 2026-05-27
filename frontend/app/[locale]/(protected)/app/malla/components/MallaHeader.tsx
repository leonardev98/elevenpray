"use client";

import { Plus, Search, Upload } from "lucide-react";
import { useTranslations } from "next-intl";

interface MallaHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onAddCourse: () => void;
  onImportTemplate: () => void;
}

export function MallaHeader({
  searchQuery,
  onSearchChange,
  onAddCourse,
  onImportTemplate,
}: MallaHeaderProps) {
  const t = useTranslations("studentMalla");

  return (
    <header className="mb-8 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] lg:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--text-body)]">{t("subtitle")}</p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]/80 py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] backdrop-blur-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onImportTemplate}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]/80 px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] backdrop-blur-sm transition hover:bg-[var(--bg-elevated)]"
          >
            <Upload className="h-4 w-4" />
            {t("importTemplate")}
          </button>
          <button
            type="button"
            onClick={onAddCourse}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-fg)] shadow-md transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            {t("addCourse")}
          </button>
        </div>
      </div>
    </header>
  );
}

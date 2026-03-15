"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PromptApi, PromptFolderApi, PromptCategoryApi, DeveloperProjectApi } from "@/app/lib/developer-workspace/types";

/** Sentinel value for "None" in Select (Radix forbids empty string). */
const SELECT_NONE_VALUE = "__none__";

export interface PromptFormValues {
  title: string;
  slug: string;
  description: string;
  content: string;
  folderId: string | null;
  categoryId: string | null;
  projectId: string | null;
  repositoryName: string;
  promptType: string;
  status: "active" | "archived" | "draft";
  isFavorite: boolean;
  isPinned: boolean;
  tagNames: string[];
}

const DEFAULT_VALUES: PromptFormValues = {
  title: "",
  slug: "",
  description: "",
  content: "",
  folderId: null,
  categoryId: null,
  projectId: null,
  repositoryName: "",
  promptType: "",
  status: "active",
  isFavorite: false,
  isPinned: false,
  tagNames: [],
};

interface PromptFormProps {
  value: PromptFormValues;
  onChange: (v: PromptFormValues) => void;
  folders: PromptFolderApi[];
  categories: PromptCategoryApi[];
  projects: DeveloperProjectApi[];
  tagSuggestions: string[];
  onAddTag: (name: string) => void;
  errors?: Partial<Record<keyof PromptFormValues, string>>;
  disabled?: boolean;
}

export function getDefaultValues(prompt?: PromptApi | null): PromptFormValues {
  if (!prompt) return { ...DEFAULT_VALUES };
  return {
    title: prompt.title,
    slug: prompt.slug ?? "",
    description: prompt.description ?? "",
    content: prompt.content,
    folderId: prompt.folderId ?? null,
    categoryId: prompt.categoryId ?? null,
    projectId: prompt.projectId ?? null,
    repositoryName: prompt.repositoryName ?? "",
    promptType: prompt.promptType ?? "",
    status: prompt.status,
    isFavorite: prompt.isFavorite,
    isPinned: prompt.isPinned,
    tagNames: prompt.tags?.map((t) => t.name) ?? [],
  };
}

export function PromptForm({
  value,
  onChange,
  folders,
  categories,
  projects,
  tagSuggestions,
  onAddTag,
  errors = {},
  disabled,
}: PromptFormProps) {
  const t = useTranslations("developerWorkspace.prompts");
  const [tagInput, setTagInput] = useState("");
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);

  const addTag = (name: string) => {
    const n = name.trim().toLowerCase();
    if (!n || value.tagNames.includes(n)) return;
    onChange({ ...value, tagNames: [...value.tagNames, n] });
    setTagInput("");
    setTagDropdownOpen(false);
    onAddTag(n);
  };

  const removeTag = (name: string) => {
    onChange({ ...value, tagNames: value.tagNames.filter((t) => t !== name) });
  };

  const filteredSuggestions = tagSuggestions.filter(
    (s) => s.toLowerCase().includes(tagInput.toLowerCase()) && !value.tagNames.includes(s.toLowerCase())
  ).slice(0, 8);

  const sectionLabel = "text-xs font-medium uppercase tracking-wide text-[var(--app-fg)]/60";

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4">
        <h3 className={sectionLabel}>{t("formSectionContent")}</h3>
      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--app-fg)]">
          {t("formTitle")}
        </label>
        <input
          type="text"
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          placeholder="Nombre del prompt"
          disabled={disabled}
          className={cn(
            "w-full rounded-lg border bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:border-[var(--app-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/20",
            errors.title ? "border-red-500" : "border-[var(--app-border)]"
          )}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-500">{errors.title}</p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--app-fg)]">
          {t("formDescription")}
        </label>
        <input
          type="text"
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
          placeholder="Breve descripción"
          disabled={disabled}
          className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:border-[var(--app-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/20"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--app-fg)]">
          {t("formContent")}
        </label>
        <textarea
          value={value.content}
          onChange={(e) => onChange({ ...value, content: e.target.value })}
          placeholder="Texto del prompt…"
          disabled={disabled}
          rows={8}
          className={cn(
            "w-full resize-y rounded-lg border bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:border-[var(--app-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/20",
            errors.content ? "border-red-500" : "border-[var(--app-border)]"
          )}
        />
        <p className="mt-1 text-xs text-[var(--app-fg)]/50">
          {value.content.length} caracteres
        </p>
        {errors.content && (
          <p className="mt-1 text-xs text-red-500">{errors.content}</p>
        )}
      </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className={sectionLabel}>{t("formSectionOrganization")}</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--app-fg)]">
            {t("formFolder")}
          </label>
          <Select
            value={value.folderId && value.folderId !== "" ? value.folderId : SELECT_NONE_VALUE}
            onValueChange={(v) =>
              onChange({ ...value, folderId: v === SELECT_NONE_VALUE ? null : v })
            }
            disabled={disabled}
          >
            <SelectTrigger className="w-full rounded-lg border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-navy)] focus:ring-2 focus:ring-[var(--app-navy)]/20">
              <SelectValue placeholder={t("formFolderNone")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SELECT_NONE_VALUE}>{t("formFolderNone")}</SelectItem>
              {folders.filter((f) => f.id != null && f.id !== "").map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-[var(--app-fg)]/50">{t("formFolderHint")}</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--app-fg)]">
            {t("formCategory")}
          </label>
          <Select
            value={value.categoryId && value.categoryId !== "" ? value.categoryId : SELECT_NONE_VALUE}
            onValueChange={(v) =>
              onChange({ ...value, categoryId: v === SELECT_NONE_VALUE ? null : v })
            }
            disabled={disabled}
          >
            <SelectTrigger className="w-full rounded-lg border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-navy)] focus:ring-2 focus:ring-[var(--app-navy)]/20">
              <SelectValue placeholder={t("formCategoryNone")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SELECT_NONE_VALUE}>{t("formCategoryNone")}</SelectItem>
              {categories.filter((c) => c.id != null && c.id !== "").map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name || c.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-[var(--app-fg)]/50">{t("formCategoryHint")}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--app-fg)]">
            {t("formProject")}
          </label>
          <Select
            value={value.projectId && value.projectId !== "" ? value.projectId : SELECT_NONE_VALUE}
            onValueChange={(v) =>
              onChange({ ...value, projectId: v === SELECT_NONE_VALUE ? null : v })
            }
            disabled={disabled}
          >
            <SelectTrigger className="w-full rounded-lg border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-navy)] focus:ring-2 focus:ring-[var(--app-navy)]/20">
              <SelectValue placeholder={t("formProjectNone")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SELECT_NONE_VALUE}>{t("formProjectNone")}</SelectItem>
              {projects.filter((p) => p.id != null && p.id !== "").map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--app-fg)]">
            {t("formRepositoryOptional")}
          </label>
          <input
            type="text"
            value={value.repositoryName}
            onChange={(e) =>
              onChange({ ...value, repositoryName: e.target.value })
            }
            placeholder="nombre-repo"
            disabled={disabled}
            className="w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:border-[var(--app-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/20"
          />
        </div>
      </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className={sectionLabel}>{t("formSectionTags")}</h3>
      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--app-fg)]">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-2">
          {value.tagNames.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 rounded bg-[var(--app-navy)]/10 px-2 py-0.5 text-sm text-[var(--app-navy)]"
            >
              {name}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeTag(name)}
                  className="rounded p-0.5 hover:bg-[var(--app-navy)]/20"
                >
                  ×
                </button>
              )}
            </span>
          ))}
          {!disabled && (
            <div className="relative inline-block">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value);
                  setTagDropdownOpen(true);
                }}
                onFocus={() => setTagDropdownOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(tagInput || tagInput);
                  }
                }}
                placeholder="Añadir tag…"
                className="min-w-[100px] border-0 bg-transparent px-1 py-0.5 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:outline-none"
              />
              {tagDropdownOpen && filteredSuggestions.length > 0 && (
                <div className="absolute left-0 top-full z-10 mt-1 max-h-40 w-48 overflow-auto rounded-lg border border-[var(--dev-border-subtle)] bg-[var(--dev-surface-elevated)] py-1 shadow-lg">
                  {filteredSuggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addTag(s)}
                      className="w-full px-3 py-1.5 text-left text-sm text-[var(--app-fg)] hover:bg-[var(--app-navy)]/10"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className={sectionLabel}>{t("formSectionOptions")}</h3>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={value.isFavorite}
            onChange={(e) =>
              onChange({ ...value, isFavorite: e.target.checked })
            }
            disabled={disabled}
            className="rounded border-[var(--app-border)]"
          />
          <span className="text-sm text-[var(--app-fg)]">{t("favorites")}</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={value.isPinned}
            onChange={(e) =>
              onChange({ ...value, isPinned: e.target.checked })
            }
            disabled={disabled}
            className="rounded border-[var(--app-border)]"
          />
          <span className="text-sm text-[var(--app-fg)]">{t("pin")}</span>
        </label>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-[var(--app-fg)]">
            {t("formStatus")}
          </span>
          <Select
            value={value.status}
            onValueChange={(v) =>
              onChange({ ...value, status: v as PromptFormValues["status"] })
            }
            disabled={disabled}
          >
            <SelectTrigger className="w-full min-w-[120px] rounded-lg border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-1.5 text-sm text-[var(--app-fg)] focus:border-[var(--app-navy)] focus:ring-2 focus:ring-[var(--app-navy)]/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{t("formStatusActive")}</SelectItem>
              <SelectItem value="draft">{t("formStatusDraft")}</SelectItem>
              <SelectItem value="archived">{t("formStatusArchived")}</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-[var(--app-fg)]/50 max-w-sm">
            {t("formStatusHelp")}
          </p>
        </div>
      </div>
      </section>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/providers/auth-provider";
import {
  listMyTemplates,
  listSavedTemplates,
  listTemplates,
} from "@/app/lib/community-templates-api";
import type {
  AcademicTemplateDto,
  CommunityFilters,
  CommunityTab,
} from "../../community-types";
import { TEMPLATE_CAREERS } from "../../community-constants";
import { TemplateCard } from "./TemplateCard";
import { TemplatesEmptyState } from "./TemplatesEmptyState";

interface TemplatesTabProps {
  activeTab: CommunityTab;
  filters: CommunityFilters;
  refreshKey: number;
  onOpenUpload: () => void;
  onBrowseTemplates: () => void;
}

export function TemplatesTab({
  activeTab,
  filters,
  refreshKey,
  onOpenUpload,
  onBrowseTemplates,
}: TemplatesTabProps) {
  const t = useTranslations("studentCommunity");
  const { token } = useAuth();
  const [templates, setTemplates] = useState<AcademicTemplateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const careerLabel =
    filters.career === "todas"
      ? t("careerAll")
      : t(
          TEMPLATE_CAREERS.find((c) => c.id === filters.career)?.labelKey ??
            "careerAll",
        );

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      let data: AcademicTemplateDto[];
      if (activeTab === "my-contributions") {
        data = await listMyTemplates(token);
      } else if (activeTab === "saved") {
        data = await listSavedTemplates(token);
      } else {
        data = await listTemplates(token, filters);
      }
      setTemplates(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("errorLoad"));
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [token, activeTab, filters, refreshKey, t]);

  useEffect(() => {
    void load();
  }, [load]);

  function handleTemplateUpdate(
    id: string,
    patch: Partial<AcademicTemplateDto>,
  ) {
    setTemplates((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="student-card h-64 animate-pulse bg-[var(--app-surface-soft)]"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-card p-6 text-center text-sm text-[var(--app-fg-muted)]">
        {error}
      </div>
    );
  }

  if (templates.length === 0) {
    const variant =
      activeTab === "my-contributions"
        ? "mine"
        : activeTab === "saved"
          ? "saved"
          : "filtered";
    return (
      <TemplatesEmptyState
        variant={variant}
        careerLabel={careerLabel}
        onAction={onOpenUpload}
        onBrowse={onBrowseTemplates}
      />
    );
  }

  return (
    <div>
      {activeTab === "templates" && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-[var(--app-fg)]">
            {t("tabs.templates")}
          </h2>
          <button
            type="button"
            onClick={onOpenUpload}
            className="rounded-[var(--radius-md)] bg-[var(--accent)] px-[18px] py-[10px] text-sm font-medium text-[var(--accent-fg)] transition-colors hover:bg-[var(--accent-hover)]"
          >
            + {t("uploadTemplate")}
          </button>
        </div>
      )}

      {activeTab !== "templates" && (
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={onOpenUpload}
            className="rounded-[var(--radius-md)] bg-[var(--accent)] px-[18px] py-[10px] text-sm font-medium text-[var(--accent-fg)] transition-colors hover:bg-[var(--accent-hover)]"
          >
            + {t("uploadTemplate")}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            showStatus={activeTab === "my-contributions"}
            onUpdate={(patch) => handleTemplateUpdate(template.id, patch)}
          />
        ))}
      </div>
    </div>
  );
}

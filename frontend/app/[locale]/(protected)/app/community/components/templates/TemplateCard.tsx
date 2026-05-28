"use client";

import { useState } from "react";
import { Download, Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/providers/auth-provider";
import {
  saveTemplate,
  unsaveTemplate,
  useTemplate,
} from "@/app/lib/community-templates-api";
import type { AcademicTemplateDto } from "../../community-types";
import {
  CAREER_LABEL_KEYS,
  TEMPLATE_TYPE_META,
} from "../../community-constants";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
  template: AcademicTemplateDto;
  showStatus?: boolean;
  onUpdate?: (patch: Partial<AcademicTemplateDto>) => void;
}

export function TemplateCard({
  template,
  showStatus = false,
  onUpdate,
}: TemplateCardProps) {
  const t = useTranslations("studentCommunity");
  const { token } = useAuth();
  const [saved, setSaved] = useState(template.savedByMe);
  const [saveCount, setSaveCount] = useState(template.saveCount);
  const [downloadCount, setDownloadCount] = useState(template.downloadCount);
  const [busy, setBusy] = useState(false);

  const typeMeta = TEMPLATE_TYPE_META[template.type];
  const careerKey = CAREER_LABEL_KEYS[template.career];

  async function handleToggleSave() {
    if (!token || busy) return;
    setBusy(true);
    try {
      const res = saved
        ? await unsaveTemplate(token, template.id)
        : await saveTemplate(token, template.id);
      setSaved(res.saved);
      setSaveCount(res.saveCount);
      onUpdate?.({ savedByMe: res.saved, saveCount: res.saveCount });
    } finally {
      setBusy(false);
    }
  }

  const hasAttachment = Boolean(template.attachmentUrl?.trim());

  async function handleUse() {
    if (!token || busy || !hasAttachment) return;
    setBusy(true);
    try {
      const res = await useTemplate(token, template.id);
      setDownloadCount(res.downloadCount);
      onUpdate?.({ downloadCount: res.downloadCount });
      window.open(res.downloadUrl, "_blank", "noopener,noreferrer");
    } catch {
      // El contador solo sube si el backend confirma la descarga
    } finally {
      setBusy(false);
    }
  }

  const statusLabel =
    template.status === "pending"
      ? t("statusPending")
      : template.status === "approved"
        ? t("statusApproved")
        : t("statusRejected");

  const statusClass =
    template.status === "pending"
      ? "bg-[var(--course-2-bg)] text-[var(--course-2-fg)]"
      : template.status === "approved"
        ? "bg-[var(--course-3-bg)] text-[var(--course-3-fg)]"
        : "bg-[var(--bg-input)] text-[var(--text-muted)]";

  return (
    <article className="student-card flex flex-col overflow-hidden transition hover:-translate-y-px hover:border-[var(--app-primary)]/40">
      <div className="flex items-start justify-between gap-2 border-b border-[var(--app-border)] bg-[var(--app-surface-soft)] px-4 py-3">
        <span className="text-2xl" aria-hidden>
          {typeMeta.icon}
        </span>
        <div className="flex flex-wrap justify-end gap-1">
          {showStatus && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-medium",
                statusClass,
              )}
            >
              {statusLabel}
            </span>
          )}
          {template.isFeatured && (
            <span className="rounded-full bg-[var(--xp)]/20 px-2 py-0.5 text-[10px] font-medium text-[var(--xp)]">
              {t("badgeFeatured")}
            </span>
          )}
          {template.isNewThisWeek && !showStatus && (
            <span className="rounded-full bg-[var(--app-primary-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--app-primary)]">
              {t("badgeNewWeek")}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--app-fg-muted)]">
          {t(typeMeta.labelKey)}
        </p>
        <h3 className="mt-1 font-semibold text-[var(--app-fg)]">{template.title}</h3>
        <p className="mt-1 text-xs text-[var(--app-fg-muted)]">
          {template.authorName}
          {template.university ? ` · ${template.university}` : ""}
          {` · ${t(careerKey)}`}
        </p>
        <p className="mt-2 line-clamp-2 text-sm text-[var(--app-fg-secondary)]">
          {template.description}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {template.subjectTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[var(--app-border)] px-2 py-0.5 text-[10px] text-[var(--app-fg-muted)]"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-[var(--app-fg-muted)]">
          <span className="flex items-center gap-1">
            <Download className="h-3.5 w-3.5" aria-hidden />
            {t("downloads", { count: downloadCount })}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" aria-hidden />
            {t("saves", { count: saveCount })}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            disabled={busy || template.status !== "approved" || !hasAttachment}
            onClick={handleUse}
            title={!hasAttachment ? t("noAttachment") : undefined}
            className="flex-1 rounded-[var(--radius-md)] bg-[var(--accent)] py-2 text-sm font-medium text-[var(--accent-fg)] transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            {t("useTemplate")}
          </button>
          {template.status === "approved" && (
            <button
              type="button"
              disabled={busy}
              onClick={handleToggleSave}
              aria-label={saved ? t("unsaveTemplate") : t("saveTemplate")}
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border transition-colors",
                saved
                  ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-fg)]"
                  : "border-[var(--app-border)] text-[var(--app-fg-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]",
              )}
            >
              <Heart className={cn("h-4 w-4", saved && "fill-current")} aria-hidden />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

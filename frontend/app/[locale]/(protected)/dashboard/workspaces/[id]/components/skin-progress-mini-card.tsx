"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Camera, FileText } from "lucide-react";
import { useAuth } from "../../../../../../providers/auth-provider";
import { getWorkspaceCheckins } from "../../../../../../lib/workspace-checkins-api";
import { getWorkspacePhotos } from "../../../../../../lib/workspace-photos-api";

interface SkinProgressMiniCardProps {
  workspaceId: string;
}

export function SkinProgressMiniCard({ workspaceId }: SkinProgressMiniCardProps) {
  const { token } = useAuth();
  const t = useTranslations("workspaceNav");
  const [photosCount, setPhotosCount] = useState(0);
  const [journalCount, setJournalCount] = useState(0);

  useEffect(() => {
    if (!token || !workspaceId) return;
    const today = new Date().toISOString().slice(0, 10);
    const from = new Date();
    from.setFullYear(from.getFullYear() - 1);
    const fromStr = from.toISOString().slice(0, 10);
    Promise.all([
      getWorkspacePhotos(token, workspaceId),
      getWorkspaceCheckins(token, workspaceId, { from: fromStr, to: today }),
    ])
      .then(([photos, checkins]) => {
        setPhotosCount(photos.length);
        setJournalCount(checkins.length);
      })
      .catch(() => {});
  }, [token, workspaceId]);

  const base = `/dashboard/workspaces/${workspaceId}`;

  return (
    <section
      className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 shadow-sm dark:border-zinc-700"
      aria-labelledby="skin-progress-mini-heading"
    >
      <h2
        id="skin-progress-mini-heading"
        className="mb-2 text-sm font-medium text-[var(--app-fg)] dark:text-zinc-200"
      >
        {t("skinProgress")}
      </h2>
      <div className="space-y-1.5 text-xs text-[var(--app-fg)]/90 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <Camera className="h-3.5 w-3.5 text-[var(--app-navy)] dark:text-sky-400" aria-hidden />
          <span>{t("photosRegistered", { count: photosCount })}</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-[var(--app-navy)] dark:text-sky-400" aria-hidden />
          <span>{t("journalEntriesCount", { count: journalCount })}</span>
        </div>
      </div>
      <Link
        href={`${base}/progress`}
        className="mt-2 inline-block text-xs font-medium text-[var(--app-navy)] hover:underline dark:text-sky-400"
      >
        {t("viewProgress")}
      </Link>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Camera, FileText, ChevronRight } from "lucide-react";
import { useAuth } from "../../../../../../providers/auth-provider";
import { getWorkspaceCheckins } from "../../../../../../lib/workspace-checkins-api";
import { getWorkspacePhotos } from "../../../../../../lib/workspace-photos-api";

interface SkinProgressCardProps {
  workspaceId: string;
}

function formatDaysAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return "0";
  return String(days);
}

export function SkinProgressCard({ workspaceId }: SkinProgressCardProps) {
  const { token } = useAuth();
  const t = useTranslations("workspaceNav");
  const [photosCount, setPhotosCount] = useState(0);
  const [journalCount, setJournalCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

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
        const dates = [
          ...photos.map((p) => p.updatedAt || p.createdAt),
          ...checkins.map((c) => c.updatedAt || c.createdAt),
        ].filter(Boolean);
        if (dates.length) {
          dates.sort();
          setLastUpdate(dates[dates.length - 1]);
        }
      })
      .catch(() => {});
  }, [token, workspaceId]);

  const base = `/dashboard/workspaces/${workspaceId}`;

  return (
    <section
      className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-sm transition-all hover:border-[var(--app-navy)]/30 hover:shadow-md dark:border-zinc-700"
      aria-labelledby="skin-progress-card-heading"
    >
      <h2
        id="skin-progress-card-heading"
        className="mb-4 text-base font-medium text-[var(--app-fg)] dark:text-zinc-200"
      >
        {t("skinProgress")}
      </h2>
      <div className="space-y-3 text-sm text-[var(--app-fg)]/90 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-[var(--app-navy)] dark:text-sky-400" aria-hidden />
          <span>{t("photosRegistered", { count: photosCount })}</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[var(--app-navy)] dark:text-sky-400" aria-hidden />
          <span>{t("journalEntriesCount", { count: journalCount })}</span>
        </div>
      </div>
      {lastUpdate && (
        <p className="mt-3 text-xs font-medium text-[var(--app-fg)]/70 dark:text-slate-400">
          {t("lastUpdate")}: {t("daysAgo", { days: formatDaysAgo(lastUpdate) })}
        </p>
      )}
      <Link
        href={`${base}/progress`}
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--app-navy)] transition hover:underline dark:text-sky-400"
      >
        {t("viewProgress")}
        <ChevronRight className="h-4 w-4" />
      </Link>
    </section>
  );
}

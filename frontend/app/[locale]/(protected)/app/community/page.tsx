"use client";

import { useTranslations } from "next-intl";
import { Users } from "lucide-react";
import { MOCK_COMMUNITY } from "../lib/mock-student-data";
import { ScreenPlaceholder } from "../components/ScreenPlaceholder";
import { StudentPageShell } from "../components/StudentPageShell";
import { Button } from "@/components/ui/button";

export default function StudentCommunityPage() {
  const t = useTranslations("studentCommunity");

  return (
    <StudentPageShell title={t("title")}>
      <ScreenPlaceholder
        icon={Users}
        title={t("heroTitle")}
        description={t("heroDesc")}
        badge={t("comingSoon")}
        className="mb-8"
      />
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-[var(--app-fg-secondary)]">{t("previewFeed")}</h2>
        {MOCK_COMMUNITY.map((note) => (
          <article key={note.id} className="student-card p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-[var(--app-primary)]">{note.course}</p>
                <p className="mt-1 font-medium text-[var(--app-fg)]">{note.author}</p>
              </div>
              <span className="text-xs text-[var(--app-fg-muted)]">{note.university}</span>
            </div>
            <p className="mt-3 text-sm text-[var(--app-fg-secondary)]">{note.preview}</p>
            <p className="mt-3 text-xs text-[var(--app-fg-muted)]">{t("likes", { count: note.likes })}</p>
          </article>
        ))}
      </div>
      <Button type="button" disabled className="mt-6 w-full rounded-xl opacity-60">
        {t("shareNotes")}
      </Button>
    </StudentPageShell>
  );
}

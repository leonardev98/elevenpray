"use client";

import { useTranslations } from "next-intl";
import { FileUp, MessageSquare, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentPageShell } from "../components/StudentPageShell";

export default function StudentStudyPage() {
  const t = useTranslations("studentStudy");

  return (
    <StudentPageShell title={t("title")} maxWidth="max-w-4xl">
      <div className="student-card mb-6 flex flex-col items-center justify-center border-dashed p-10 opacity-80">
        <FileUp className="mb-3 h-10 w-10 text-[var(--app-fg-muted)]" aria-hidden />
        <p className="font-medium text-[var(--app-fg)]">{t("uploadTitle")}</p>
        <p className="mt-1 text-sm text-[var(--app-fg-secondary)]">{t("uploadDesc")}</p>
        <span className="mt-4 rounded-full bg-[var(--app-surface-elevated)] px-3 py-1 text-xs text-[var(--app-fg-muted)]">
          {t("comingSoon")}
        </span>
      </div>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="mb-4 w-full justify-start rounded-xl bg-[var(--app-surface)] p-1">
          <TabsTrigger value="chat">{t("tabChat")}</TabsTrigger>
          <TabsTrigger value="quizzes">{t("tabQuizzes")}</TabsTrigger>
          <TabsTrigger value="flashcards">{t("tabFlashcards")}</TabsTrigger>
          <TabsTrigger value="summary">{t("tabSummary")}</TabsTrigger>
        </TabsList>
        <TabsContent value="chat">
          <div className="student-card space-y-4 p-4">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--app-primary-soft)]">
                <Sparkles className="h-4 w-4 text-[var(--app-primary)]" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-[var(--app-surface-soft)] px-4 py-3 text-sm text-[var(--app-fg)]">
                {t("mockAssistant")}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[var(--app-primary-soft)] px-4 py-3 text-sm text-[var(--app-fg)]">
                {t("mockUser")}
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--app-surface-elevated)] text-xs font-medium text-[var(--app-fg)]">
                Tú
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-4 py-3 opacity-60">
              <MessageSquare className="h-4 w-4 text-[var(--app-fg-muted)]" />
              <span className="text-sm text-[var(--app-fg-muted)]">{t("chatPlaceholder")}</span>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="quizzes">
          <p className="student-card p-8 text-center text-sm text-[var(--app-fg-secondary)]">{t("tabPlaceholder")}</p>
        </TabsContent>
        <TabsContent value="flashcards">
          <p className="student-card p-8 text-center text-sm text-[var(--app-fg-secondary)]">{t("tabPlaceholder")}</p>
        </TabsContent>
        <TabsContent value="summary">
          <p className="student-card p-8 text-center text-sm text-[var(--app-fg-secondary)]">{t("tabPlaceholder")}</p>
        </TabsContent>
      </Tabs>
    </StudentPageShell>
  );
}

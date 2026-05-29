"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { STUDY_PAGE_ENABLED } from "@/app/lib/feature-flags";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentPageShell } from "../components/StudentPageShell";
import { StudyChat } from "./components/StudyChat";
import { StudyFlashcardsTab } from "./components/StudyFlashcardsTab";
import { StudyQuizzesTab } from "./components/StudyQuizzesTab";
import { StudySummaryTab } from "./components/StudySummaryTab";
import { StudyUploadZone } from "./components/StudyUploadZone";
import { useStudySession } from "./hooks/use-study-session";

const STUDY_TABS = ["chat", "quizzes", "flashcards", "summary"] as const;

export default function StudentStudyPage() {
  const router = useRouter();
  const t = useTranslations("studentStudy");
  const searchParams = useSearchParams();
  const session = useStudySession();

  useEffect(() => {
    if (!STUDY_PAGE_ENABLED) {
      router.replace("/app");
    }
  }, [router]);

  if (!STUDY_PAGE_ENABLED) return null;
  const tabParam = searchParams.get("tab");
  const defaultTab =
    tabParam && STUDY_TABS.includes(tabParam as (typeof STUDY_TABS)[number])
      ? tabParam
      : "chat";

  const workspaceBusy = session.ensuringWorkspace && !session.workspaceId;
  const displayError = session.error ?? session.linkError;

  return (
    <StudentPageShell title={t("title")} maxWidth="max-w-4xl">
      {displayError && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {displayError}
        </div>
      )}

      <StudyUploadZone
        uploading={session.uploading || workspaceBusy}
        documentProcessing={session.documentProcessing}
        documents={session.documents}
        activeDocumentId={session.activeDocument?.id ?? null}
        onSelect={session.setActiveDocument}
        onUpload={(file) => void session.handleUpload(file)}
        disabled={!session.token || workspaceBusy}
      />

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="mb-4 w-full justify-start rounded-xl bg-[var(--app-surface)] p-1">
          <TabsTrigger value="chat">{t("tabChat")}</TabsTrigger>
          <TabsTrigger value="quizzes">{t("tabQuizzes")}</TabsTrigger>
          <TabsTrigger value="flashcards">{t("tabFlashcards")}</TabsTrigger>
          <TabsTrigger value="summary">{t("tabSummary")}</TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <StudyChat
            messages={session.messages}
            chatLoading={session.chatLoading}
            disabled={!session.documentReady}
            onSend={(text) => void session.sendMessage(text)}
          />
        </TabsContent>

        <TabsContent value="quizzes">
          <StudyQuizzesTab
            token={session.token}
            workspaceId={session.workspaceId}
            courseId={session.courseId}
            documentId={session.documentId}
            documentReady={session.documentReady}
          />
        </TabsContent>

        <TabsContent value="flashcards">
          <StudyFlashcardsTab
            token={session.token}
            workspaceId={session.workspaceId}
            courseId={session.courseId}
            documentId={session.documentId}
            documentReady={session.documentReady}
          />
        </TabsContent>

        <TabsContent value="summary">
          <StudySummaryTab
            token={session.token}
            workspaceId={session.workspaceId}
            documentId={session.documentId}
            documentReady={session.documentReady}
            activeDocument={session.activeDocument}
            onSummaryUpdated={() => void session.loadDocuments()}
          />
        </TabsContent>
      </Tabs>
    </StudentPageShell>
  );
}

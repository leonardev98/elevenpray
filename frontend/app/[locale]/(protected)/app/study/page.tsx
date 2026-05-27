"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentPageShell } from "../components/StudentPageShell";
import { StudyChat } from "./components/StudyChat";
import { StudyFlashcardsTab } from "./components/StudyFlashcardsTab";
import { StudyQuizzesTab } from "./components/StudyQuizzesTab";
import { StudySummaryTab } from "./components/StudySummaryTab";
import { StudyUploadZone } from "./components/StudyUploadZone";
import { useStudySession } from "./hooks/use-study-session";

export default function StudentStudyPage() {
  const t = useTranslations("studentStudy");
  const session = useStudySession();

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
        documents={session.documents}
        activeDocumentId={session.activeDocument?.id ?? null}
        onSelect={session.setActiveDocument}
        onUpload={(file) => void session.handleUpload(file)}
        disabled={!session.token || workspaceBusy}
      />

      <Tabs defaultValue="chat" className="w-full">
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

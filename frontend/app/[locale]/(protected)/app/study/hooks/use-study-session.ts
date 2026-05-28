"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/providers/auth-provider";
import {
  getStudyDocumentStatus,
  listStudyDocuments,
  streamStudyChat,
  uploadStudyPdf,
  type StudyChatMessage,
  type StudyPdfDocumentDto,
} from "@/app/lib/study-ai-api";
import { useStudyBackendLink } from "../../lib/study-backend-link";
import {
  defaultMimeForStudyFile,
  isStudyDocumentProcessing,
  isStudyUploadMime,
} from "../lib/study-document-types";

export type UiChatMessage = StudyChatMessage & { id: string };

const POLL_MS = 2500;

function mergeDocument(
  list: StudyPdfDocumentDto[],
  updated: StudyPdfDocumentDto,
): StudyPdfDocumentDto[] {
  return list.map((d) => (d.id === updated.id ? { ...d, ...updated } : d));
}

export function useStudySession() {
  const t = useTranslations("studentStudy");
  const { token } = useAuth();
  const { workspaceId, ensuringWorkspace, ensureWorkspace, error: linkError } =
    useStudyBackendLink(token);

  const [documents, setDocuments] = useState<StudyPdfDocumentDto[]>([]);
  const [activeDocument, setActiveDocumentState] = useState<StudyPdfDocumentDto | null>(
    null,
  );
  const [messages, setMessages] = useState<UiChatMessage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const welcomeMessage = useCallback(
    (doc: StudyPdfDocumentDto): UiChatMessage => ({
      id: "welcome",
      role: "assistant",
      content: t("chatReady", { filename: doc.filename }),
    }),
    [t],
  );

  const processingMessage = useCallback(
    (doc: StudyPdfDocumentDto): UiChatMessage => ({
      id: "processing",
      role: "assistant",
      content: t("chatProcessing", { filename: doc.filename }),
    }),
    [t],
  );

  const failedMessage = useCallback(
    (doc: StudyPdfDocumentDto): UiChatMessage => ({
      id: "failed",
      role: "assistant",
      content: t("chatFailed", {
        filename: doc.filename,
        error: doc.error ?? t("chatFailedUnknown"),
      }),
    }),
    [t],
  );

  const syncChatForDocument = useCallback(
    (doc: StudyPdfDocumentDto) => {
      if (doc.status === "ready") {
        setMessages([welcomeMessage(doc)]);
      } else if (isStudyDocumentProcessing(doc.status)) {
        setMessages([processingMessage(doc)]);
      } else if (doc.status === "failed") {
        setMessages([failedMessage(doc)]);
      } else {
        setMessages([]);
      }
    },
    [welcomeMessage, processingMessage, failedMessage],
  );

  const selectDocument = useCallback(
    (doc: StudyPdfDocumentDto) => {
      setActiveDocumentState(doc);
      syncChatForDocument(doc);
    },
    [syncChatForDocument],
  );

  const applyDocumentUpdate = useCallback(
    (updated: StudyPdfDocumentDto) => {
      setDocuments((prev) => mergeDocument(prev, updated));
      setActiveDocumentState((prev) => {
        if (!prev || prev.id !== updated.id) return prev;
        const merged = { ...prev, ...updated };
        if (prev.status !== "ready" && merged.status === "ready") {
          setMessages([welcomeMessage(merged)]);
        } else if (isStudyDocumentProcessing(merged.status)) {
          setMessages([processingMessage(merged)]);
        } else if (merged.status === "failed" && prev.status !== "failed") {
          setMessages([failedMessage(merged)]);
        }
        return merged;
      });
    },
    [welcomeMessage, processingMessage, failedMessage],
  );

  const loadDocuments = useCallback(async () => {
    if (!token || !workspaceId) return;
    try {
      const list = await listStudyDocuments(token, workspaceId);
      setDocuments(list);
      setActiveDocumentState((prev) => {
        if (!prev) return prev;
        const fresh = list.find((d) => d.id === prev.id);
        if (!fresh) return prev;
        if (fresh.status !== prev.status) {
          syncChatForDocument(fresh);
        }
        return fresh;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar documentos");
    }
  }, [token, workspaceId, syncChatForDocument]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const pollProcessingDocuments = useCallback(async () => {
    if (!token || !workspaceId) return;
    const pending = documents.filter((d) => isStudyDocumentProcessing(d.status));
    if (pending.length === 0) return;
    await Promise.all(
      pending.map(async (doc) => {
        try {
          const updated = await getStudyDocumentStatus(token, workspaceId, doc.id);
          applyDocumentUpdate(updated);
        } catch {
          /* ignore transient poll errors */
        }
      }),
    );
  }, [token, workspaceId, documents, applyDocumentUpdate]);

  useEffect(() => {
    const hasProcessing = documents.some((d) => isStudyDocumentProcessing(d.status));
    if (!hasProcessing || !token || !workspaceId) return;
    const id = window.setInterval(() => {
      void pollProcessingDocuments();
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [documents, token, workspaceId, pollProcessingDocuments]);

  const handleUpload = useCallback(
    async (file: File) => {
      if (!token || !workspaceId) {
        await ensureWorkspace();
        return;
      }
      const mime = defaultMimeForStudyFile(file);
      if (!isStudyUploadMime(mime, file.name)) {
        setError(t("uploadUnsupported"));
        return;
      }
      setUploading(true);
      setError(null);
      try {
        const doc = await uploadStudyPdf(token, workspaceId, file, mime);
        setDocuments((prev) => [doc, ...prev.filter((d) => d.id !== doc.id)]);
        selectDocument(doc);
      } catch (e) {
        setError(e instanceof Error ? e.message : t("uploadError"));
      } finally {
        setUploading(false);
      }
    },
    [token, workspaceId, ensureWorkspace, selectDocument, t],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!token || !workspaceId || !activeDocument || activeDocument.status !== "ready")
        return;
      const trimmed = text.trim();
      if (!trimmed) return;

      const userMsg: UiChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
      };
      const assistantId = `a-${Date.now()}`;
      const history = [
        ...messages.filter((m) => !["welcome", "processing", "failed"].includes(m.id)),
        userMsg,
      ];
      setMessages((prev) => [...prev, userMsg, { id: assistantId, role: "assistant", content: "" }]);
      setChatLoading(true);
      setError(null);

      try {
        await streamStudyChat(
          token,
          workspaceId,
          {
            documentId: activeDocument.id,
            messages: history.map(({ role, content }) => ({ role, content })),
            ragEnabled: true,
          },
          {
            onDelta: (chunk) => {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: m.content + chunk } : m,
                ),
              );
            },
            onError: (msg) => setError(msg),
          },
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error en el chat");
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      } finally {
        setChatLoading(false);
      }
    },
    [token, workspaceId, activeDocument, messages],
  );

  const documentProcessing =
    !!activeDocument && isStudyDocumentProcessing(activeDocument.status);

  return {
    token,
    workspaceId,
    ensuringWorkspace,
    linkError,
    documents,
    activeDocument,
    setActiveDocument: selectDocument,
    messages,
    uploading,
    documentProcessing,
    chatLoading,
    error,
    setError,
    handleUpload,
    sendMessage,
    loadDocuments,
    courseId: activeDocument?.courseId ?? null,
    documentId: activeDocument?.id ?? null,
    documentReady: activeDocument?.status === "ready",
  };
}

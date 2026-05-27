"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/app/providers/auth-provider";
import {
  listStudyDocuments,
  streamStudyChat,
  uploadStudyPdf,
  type StudyChatMessage,
  type StudyPdfDocumentDto,
} from "@/app/lib/study-ai-api";
import { useStudyBackendLink } from "../../lib/study-backend-link";

export type UiChatMessage = StudyChatMessage & { id: string };

export function useStudySession() {
  const { token } = useAuth();
  const { workspaceId, ensuringWorkspace, ensureWorkspace, error: linkError } =
    useStudyBackendLink(token);

  const [documents, setDocuments] = useState<StudyPdfDocumentDto[]>([]);
  const [activeDocument, setActiveDocument] = useState<StudyPdfDocumentDto | null>(null);
  const [messages, setMessages] = useState<UiChatMessage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    if (!token || !workspaceId) return;
    try {
      const list = await listStudyDocuments(token, workspaceId);
      setDocuments(list);
      setActiveDocument((prev) => {
        if (!prev) return prev;
        return list.find((d) => d.id === prev.id) ?? prev;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar documentos");
    }
  }, [token, workspaceId]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const selectDocument = useCallback((doc: StudyPdfDocumentDto) => {
    setActiveDocument(doc);
    setMessages([]);
    if (doc.status === "ready") {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Ya tengo cargado **${doc.filename}**. Puedes preguntarme sobre el contenido o pedirme flashcards y quizzes en las pestañas.`,
        },
      ]);
    }
  }, []);

  const handleUpload = useCallback(
    async (file: File) => {
      if (!token || !workspaceId) {
        await ensureWorkspace();
        return;
      }
      if (file.type !== "application/pdf") {
        setError("Solo se admiten archivos PDF.");
        return;
      }
      setUploading(true);
      setError(null);
      try {
        const doc = await uploadStudyPdf(token, workspaceId, file);
        setDocuments((prev) => [doc, ...prev.filter((d) => d.id !== doc.id)]);
        selectDocument(doc);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al subir el PDF");
      } finally {
        setUploading(false);
      }
    },
    [token, workspaceId, ensureWorkspace, selectDocument],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!token || !workspaceId || !activeDocument || activeDocument.status !== "ready") return;
      const trimmed = text.trim();
      if (!trimmed) return;

      const userMsg: UiChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
      };
      const assistantId = `a-${Date.now()}`;
      const history = [...messages.filter((m) => m.id !== "welcome"), userMsg];
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

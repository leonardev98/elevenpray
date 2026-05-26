"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FileDown,
  FileText,
  HelpCircle,
  LayoutTemplate,
  Paperclip,
  X,
} from "lucide-react";
import { modalBackdrop, modalPanel } from "@/lib/animations";
import { useAuth } from "@/app/providers/auth-provider";
import {
  createPost,
  createQuestion,
  presignAttachment,
  uploadToS3,
  type CommunityPostType,
} from "@/app/lib/community-api";
import type { PostType } from "../community-types";
import { MODAL_BORDER_BY_TYPE } from "../community-constants";

const CONTENT_TYPES: { id: PostType; label: string; icon: typeof FileText }[] = [
  { id: "apunte", label: "Apunte", icon: FileText },
  { id: "pregunta", label: "Pregunta", icon: HelpCircle },
  { id: "plantilla", label: "Plantilla", icon: LayoutTemplate },
  { id: "pdf", label: "Recurso PDF", icon: FileDown },
];

const ALLOWED_TEMPLATE_MIMES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const ALLOWED_PDF_MIMES = ["application/pdf"];

const MAX_BYTES = 20 * 1024 * 1024; // 20MB

interface NewPostModalProps {
  open: boolean;
  onClose: () => void;
  defaultType?: PostType;
  onCreated?: () => void;
}

export function NewPostModal({
  open,
  onClose,
  defaultType = "apunte",
  onCreated,
}: NewPostModalProps) {
  const { token } = useAuth();
  const [contentType, setContentType] = useState<PostType>(defaultType);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [course, setCourse] = useState("");
  const [university, setUniversity] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setContentType(defaultType);
      setTitle("");
      setBody("");
      setCourse("");
      setUniversity("");
      setFile(null);
      setError(null);
    }
  }, [open, defaultType]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const acceptFile =
    contentType === "pdf" ? ALLOWED_PDF_MIMES.join(",") :
    contentType === "plantilla" ? ALLOWED_TEMPLATE_MIMES.join(",") :
    "";

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.files?.[0] ?? null;
    if (next && next.size > MAX_BYTES) {
      setError("El archivo supera el límite de 20 MB.");
      return;
    }
    setError(null);
    setFile(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      if (contentType === "pregunta") {
        await createQuestion(token, {
          title: title.trim(),
          body: body.trim() || undefined,
          course: course.trim() || undefined,
          university: university.trim() || undefined,
        });
      } else {
        let attachmentUrl: string | undefined;
        let attachmentMime: string | undefined;
        let attachmentName: string | undefined;
        let attachmentSizeBytes: number | undefined;
        if ((contentType === "pdf" || contentType === "plantilla") && file) {
          const presign = await presignAttachment(token, file.type, file.name);
          await uploadToS3(presign.uploadUrl, file);
          attachmentUrl = presign.publicUrl;
          attachmentMime = file.type;
          attachmentName = file.name;
          attachmentSizeBytes = file.size;
        }
        if (contentType === "pdf" && !attachmentUrl) {
          throw new Error("Selecciona un archivo PDF para publicar.");
        }
        await createPost(token, {
          type: contentType as CommunityPostType,
          title: title.trim(),
          body: body.trim() || undefined,
          course: course.trim() || undefined,
          university: university.trim() || undefined,
          attachmentUrl,
          attachmentMime,
          attachmentName,
          attachmentSizeBytes,
        });
      }
      onCreated?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al publicar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          {...modalBackdrop}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Nueva publicación"
          onClick={onClose}
        >
          <motion.form
            {...modalPanel}
            onSubmit={handleSubmit}
            className={`relative w-full max-w-lg rounded-[var(--radius-xl)] border-[0.5px] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow-md)] ${MODAL_BORDER_BY_TYPE[contentType]}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--app-fg)]">Nueva publicación</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="rounded-lg p-1.5 text-[var(--app-fg-muted)] transition-colors hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-fg)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-2 text-xs font-medium text-[var(--app-fg-muted)]">Tipo de contenido</p>
            <div className="mb-4 flex flex-wrap gap-2">
              {CONTENT_TYPES.map(({ id, label, icon: Icon }) => {
                const active = contentType === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setContentType(id);
                      setFile(null);
                    }}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
                        : "border-[var(--app-border)] text-[var(--app-fg-muted)] hover:border-[var(--app-fg-muted)]"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--app-fg-muted)]">
                  Título
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={300}
                  placeholder={
                    contentType === "pregunta"
                      ? "¿Cuál es tu pregunta?"
                      : "Un título claro y descriptivo"
                  }
                  className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg-muted)] focus:border-[var(--app-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--app-fg-muted)]">
                  {contentType === "pregunta" ? "Detalles" : "Cuerpo"}
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={5}
                  placeholder={
                    contentType === "pregunta"
                      ? "Da contexto para que la comunidad pueda ayudarte mejor..."
                      : "¿Qué quieres compartir?"
                  }
                  className="w-full resize-none rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg-muted)] focus:border-[var(--app-primary)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--app-fg-muted)]">
                    Curso (opcional)
                  </label>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="Ej: Cálculo I"
                    maxLength={120}
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg-muted)] focus:border-[var(--app-primary)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--app-fg-muted)]">
                    Universidad (opcional)
                  </label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="Ej: UNI, UPC, PUCP..."
                    maxLength={60}
                    className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg-muted)] focus:border-[var(--app-primary)] focus:outline-none"
                  />
                </div>
              </div>

              {(contentType === "pdf" || contentType === "plantilla") && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--app-fg-muted)]">
                    {contentType === "pdf"
                      ? "Archivo PDF (requerido)"
                      : "Archivo de plantilla (PDF, JPG, PNG, WEBP, GIF)"}
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptFile}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center gap-2 rounded-xl border border-dashed border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-3 text-sm text-[var(--app-fg-muted)] hover:border-[var(--app-primary)]"
                  >
                    <Paperclip className="h-4 w-4" aria-hidden />
                    <span className="flex-1 truncate text-left">
                      {file ? file.name : "Seleccionar archivo (máx. 20 MB)"}
                    </span>
                    {file && (
                      <span className="text-xs text-[var(--app-fg-muted)]">
                        {(file.size / (1024 * 1024)).toFixed(1)} MB
                      </span>
                    )}
                  </button>
                </div>
              )}

              {error && (
                <p role="alert" className="text-sm text-[var(--error)]">
                  {error}
                </p>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-[var(--radius-md)] border border-[var(--app-border)] px-[18px] py-[10px] text-sm font-medium text-[var(--app-fg-secondary)] hover:bg-[var(--app-surface-soft)] disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting || !title.trim()}
                className="rounded-[var(--radius-md)] bg-[var(--accent)] px-[18px] py-[10px] text-sm font-medium text-[var(--accent-fg)] transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-60"
              >
                {submitting ? "Publicando..." : "Publicar"}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

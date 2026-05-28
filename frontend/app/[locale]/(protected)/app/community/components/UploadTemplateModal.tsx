"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { modalBackdrop, modalPanel } from "@/lib/animations";
import { useAuth } from "@/app/providers/auth-provider";
import {
  createTemplate,
  presignTemplateAttachment,
  uploadToS3,
} from "@/app/lib/community-templates-api";
import {
  ALLOWED_TEMPLATE_MIMES,
  MAX_TEMPLATE_DESCRIPTION,
  MAX_TEMPLATE_FILE_BYTES,
  TEMPLATE_CAREERS,
  TEMPLATE_TYPE_FILTERS,
} from "../community-constants";
import type { TemplateCareer, TemplateType } from "../community-types";
import { cn } from "@/lib/utils";

interface UploadTemplateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export function UploadTemplateModal({
  open,
  onClose,
  onSubmitted,
}: UploadTemplateModalProps) {
  const t = useTranslations("studentCommunity");
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<TemplateType>("apunte");
  const [career, setCareer] = useState<TemplateCareer>("medicina");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [authorship, setAuthorship] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  function validateFile(f: File): string | null {
    if (!ALLOWED_TEMPLATE_MIMES.includes(f.type as (typeof ALLOWED_TEMPLATE_MIMES)[number])) {
      return t("modal.fileHint");
    }
    if (f.size > MAX_TEMPLATE_FILE_BYTES) {
      return t("modal.fileHint");
    }
    return null;
  }

  function handleFiles(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    const err = validateFile(f);
    if (err) {
      setError(err);
      return;
    }
    setFile(f);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !file) {
      setError(t("modal.fileHint"));
      return;
    }
    if (!authorship) {
      setError(t("modal.authorship"));
      return;
    }
    if (!title.trim() || !subject.trim()) {
      setError("Completa todos los campos requeridos.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const { uploadUrl, publicUrl } = await presignTemplateAttachment(
        token,
        file.type,
      );
      await uploadToS3(uploadUrl, file);
      await createTemplate(token, {
        type,
        title: title.trim(),
        career,
        subject: subject.trim(),
        description: description.trim(),
        attachmentUrl: publicUrl,
        attachmentName: file.name,
        attachmentSizeBytes: file.size,
        attachmentMime: file.type,
        authorshipConfirmed: true,
      });
      setTitle("");
      setSubject("");
      setDescription("");
      setFile(null);
      setAuthorship(false);
      onSubmitted();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorLoad"));
    } finally {
      setSubmitting(false);
    }
  }

  const careerOptions = TEMPLATE_CAREERS.filter((c) => c.id !== "todas");

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.button
          type="button"
          aria-label={t("actions.cancel")}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
          {...modalBackdrop}
        />
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-template-title"
          className="relative z-10 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-elevated)] p-6 shadow-xl"
          {...modalPanel}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2
              id="upload-template-title"
              className="text-lg font-semibold text-[var(--app-fg)]"
            >
              {t("modal.title")}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-[var(--app-fg-muted)] hover:bg-[var(--bg-input)]"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--app-fg-muted)]">
                {t("modal.fieldTitle")} *
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
                className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-primary)] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--app-fg-muted)]">
                  {t("modal.fieldType")} *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as TemplateType)}
                  className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg)] focus:outline-none"
                >
                  {TEMPLATE_TYPE_FILTERS.map(({ id, labelKey }) => (
                    <option key={id} value={id}>
                      {t(labelKey)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--app-fg-muted)]">
                  {t("modal.fieldCareer")} *
                </label>
                <select
                  value={career}
                  onChange={(e) => setCareer(e.target.value as TemplateCareer)}
                  className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg)] focus:outline-none"
                >
                  {careerOptions.map(({ id, labelKey }) => (
                    <option key={id} value={id}>
                      {t(labelKey)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--app-fg-muted)]">
                {t("modal.fieldSubject")} *
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                maxLength={120}
                className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg)] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--app-fg-muted)]">
                {t("modal.fieldDescription")} *
              </label>
              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value.slice(0, MAX_TEMPLATE_DESCRIPTION))
                }
                required
                rows={3}
                className="w-full resize-none rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg)] focus:outline-none"
              />
              <p className="mt-1 text-right text-[10px] text-[var(--app-fg-muted)]">
                {t("modal.charCount", {
                  current: description.length,
                  max: MAX_TEMPLATE_DESCRIPTION,
                })}
              </p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--app-fg-muted)]">
                {t("modal.fieldFile")} *
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="sr-only"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFiles(e.dataTransfer.files);
                }}
                className={cn(
                  "flex w-full flex-col items-center justify-center rounded-xl border border-dashed px-4 py-8 text-center transition-colors",
                  dragOver
                    ? "border-[var(--accent)] bg-[var(--accent-subtle)]"
                    : "border-[var(--app-border)] hover:bg-[var(--app-surface-soft)]",
                )}
              >
                <Upload className="mb-2 h-5 w-5 text-[var(--app-fg-muted)]" aria-hidden />
                <p className="text-sm text-[var(--app-fg)]">{t("modal.fileDrop")}</p>
                <p className="mt-1 text-xs text-[var(--app-fg-muted)]">
                  {t("modal.fileHint")}
                </p>
                {file && (
                  <p className="mt-2 text-xs font-medium text-[var(--app-primary)]">
                    {file.name}
                  </p>
                )}
              </button>
            </div>

            <label className="flex cursor-pointer items-start gap-2 text-xs text-[var(--app-fg-secondary)]">
              <input
                type="checkbox"
                checked={authorship}
                onChange={(e) => setAuthorship(e.target.checked)}
                className="mt-0.5"
              />
              {t("modal.authorship")}
            </label>

            {error && (
              <p className="text-sm text-red-500" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-[var(--radius-md)] bg-[var(--accent)] py-2.5 text-sm font-medium text-[var(--accent-fg)] disabled:opacity-60"
            >
              {submitting ? t("modal.submitting") : t("modal.submit")}
            </button>
            <p className="text-center text-[10px] leading-relaxed text-[var(--app-fg-muted)]">
              {t("modal.footer")}
            </p>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

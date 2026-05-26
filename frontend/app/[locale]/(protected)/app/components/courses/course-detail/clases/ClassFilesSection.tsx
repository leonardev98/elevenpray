"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useCourseClassesStore,
  type ClassAttachment,
} from "../../../../lib/course-classes-store";

interface ClassFilesSectionProps {
  classId: string;
  attachments: ClassAttachment[];
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ClassFilesSection({ classId, attachments }: ClassFilesSectionProps) {
  const addAttachment = useCourseClassesStore((s) => s.addAttachment);
  const removeAttachment = useCourseClassesStore((s) => s.removeAttachment);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewing, setPreviewing] = useState<ClassAttachment | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith("image/");
      const isPdf = file.type === "application/pdf";
      const previewUrl = URL.createObjectURL(file);
      addAttachment(classId, {
        name: file.name,
        type: isImage ? "image" : isPdf ? "pdf" : "other",
        size: formatSize(file.size),
        previewUrl,
      });
    });
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-muted)]">
            <Paperclip className="h-3.5 w-3.5" aria-hidden />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Archivos adjuntos</h3>
            <p className="text-[11px] text-[var(--text-muted)]">
              {attachments.length === 0
                ? "Sube PDFs o imágenes vinculados a esta clase"
                : `${attachments.length} ${attachments.length === 1 ? "archivo" : "archivos"}`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border-[0.5px] border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
        >
          <Upload className="h-3.5 w-3.5" aria-hidden />
          Subir archivo
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
          className="hidden"
        />
      </div>

      {attachments.length === 0 ? (
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
            "flex w-full flex-col items-center justify-center rounded-[var(--radius-lg)] border-[0.5px] border-dashed border-[var(--border)] bg-[var(--bg-surface)] px-6 py-10 text-center transition-colors",
            dragOver
              ? "border-[var(--accent)] bg-[var(--accent-subtle)]"
              : "hover:bg-[var(--bg-elevated)]",
          )}
        >
          <Upload className="mb-2 h-5 w-5 text-[var(--text-muted)]" aria-hidden />
          <p className="text-xs text-[var(--text-primary)]">Arrastra y suelta archivos aquí</p>
          <p className="mt-1 text-[10px] text-[var(--text-muted)]">PDF o imágenes (máx. 10 MB c/u)</p>
        </button>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {attachments.map((att) => (
            <AttachmentCard
              key={att.id}
              attachment={att}
              onPreview={() => setPreviewing(att)}
              onRemove={() => removeAttachment(classId, att.id)}
            />
          ))}
        </ul>
      )}

      <AnimatePresence>
        {previewing ? (
          <PreviewModal attachment={previewing} onClose={() => setPreviewing(null)} />
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function AttachmentCard({
  attachment,
  onPreview,
  onRemove,
}: {
  attachment: ClassAttachment;
  onPreview: () => void;
  onRemove: () => void;
}) {
  const Icon = attachment.type === "image" ? ImageIcon : FileText;
  return (
    <li className="group relative overflow-hidden rounded-[var(--radius-md)] border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)]">
      <button
        type="button"
        onClick={onPreview}
        className="flex w-full flex-col items-stretch text-left"
      >
        <div className="flex h-24 items-center justify-center overflow-hidden bg-[var(--bg-input)]">
          {attachment.type === "image" && attachment.previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- preview de objeto local mock
            <img
              src={attachment.previewUrl}
              alt={attachment.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <Icon className="h-8 w-8 text-[var(--text-muted)]" aria-hidden />
          )}
        </div>
        <div className="px-3 py-2">
          <p className="truncate text-xs font-medium text-[var(--text-primary)]">{attachment.name}</p>
          <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">{attachment.size}</p>
        </div>
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Eliminar archivo"
        className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-md bg-[var(--bg-elevated)] text-[var(--text-muted)] opacity-0 transition-opacity hover:text-[var(--error)] group-hover:opacity-100"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </li>
  );
}

function PreviewModal({
  attachment,
  onClose,
}: {
  attachment: ClassAttachment;
  onClose: () => void;
}) {
  return (
    <>
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
        aria-label="Cerrar vista previa"
        className="fixed inset-0 z-[280] bg-black/60"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        role="dialog"
        aria-modal="true"
        aria-label={`Vista previa de ${attachment.name}`}
        className="fixed left-1/2 top-1/2 z-[290] flex max-h-[85vh] w-[min(640px,92vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[var(--radius-lg)] border-[0.5px] border-[var(--border)] bg-[var(--bg-elevated)] shadow-[var(--shadow-md)]"
      >
        <div className="flex items-center justify-between gap-2 border-b-[0.5px] border-[var(--border)] px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            {attachment.type === "image" ? (
              <ImageIcon className="h-4 w-4 text-[var(--text-muted)]" aria-hidden />
            ) : (
              <FileText className="h-4 w-4 text-[var(--text-muted)]" aria-hidden />
            )}
            <p className="truncate text-sm font-medium text-[var(--text-primary)]">{attachment.name}</p>
            <span className="shrink-0 rounded-full bg-[var(--bg-input)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
              {attachment.size}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {attachment.previewUrl ? (
              <a
                href={attachment.previewUrl}
                download={attachment.name}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]"
                aria-label="Descargar archivo"
              >
                <Download className="h-3.5 w-3.5" />
              </a>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-[var(--text-primary)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center overflow-hidden bg-[var(--bg-base)] p-6">
          {attachment.type === "image" && attachment.previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- preview local
            <img
              src={attachment.previewUrl}
              alt={attachment.name}
              className="max-h-[60vh] max-w-full rounded-md object-contain"
            />
          ) : attachment.type === "pdf" ? (
            <PdfPreviewBody attachment={attachment} />
          ) : (
            <div className="flex flex-col items-center gap-2 text-center">
              <FileText className="h-12 w-12 text-[var(--text-muted)]" aria-hidden />
              <p className="text-sm text-[var(--text-primary)]">{attachment.name}</p>
              <p className="text-xs text-[var(--text-muted)]">
                Vista previa no disponible para este tipo de archivo.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t-[0.5px] border-[var(--border)] px-4 py-2.5">
          <p className="text-[11px] text-[var(--text-muted)]">
            Archivo mock — solo persiste durante esta sesión.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-[var(--accent-fg)] hover:bg-[var(--accent-hover)]"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </>
  );
}

function PdfPreviewBody({ attachment }: { attachment: ClassAttachment }) {
  if (attachment.previewUrl) {
    return (
      <object
        data={attachment.previewUrl}
        type="application/pdf"
        className="h-[60vh] w-full rounded-md border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)]"
        aria-label={`Vista previa de ${attachment.name}`}
      >
        <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
          <FileText className="h-12 w-12 text-[var(--text-muted)]" aria-hidden />
          <p className="text-sm text-[var(--text-primary)]">{attachment.name}</p>
          <p className="text-xs text-[var(--text-muted)]">
            Tu navegador no puede mostrar el PDF inline. Descárgalo para abrirlo.
          </p>
        </div>
      </object>
    );
  }
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <FileText className="h-12 w-12 text-[var(--text-muted)]" aria-hidden />
      <p className="text-sm text-[var(--text-primary)]">{attachment.name}</p>
      <p className="max-w-[36ch] text-xs text-[var(--text-muted)]">
        Este archivo no tiene una vista previa disponible. Súbelo de nuevo para activar la vista
        rápida.
      </p>
      <Eye className="hidden" aria-hidden />
    </div>
  );
}

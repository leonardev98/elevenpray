"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flag, X } from "lucide-react";
import { modalBackdrop, modalPanel } from "@/lib/animations";
import { useAuth } from "@/app/providers/auth-provider";
import { createReport } from "@/app/lib/community-api";
import type { ReportTargetType } from "../community-types";

const REPORT_REASONS: { id: string; label: string }[] = [
  { id: "spam", label: "Spam o publicidad" },
  { id: "inapropiado", label: "Contenido inapropiado" },
  { id: "acoso", label: "Acoso o lenguaje ofensivo" },
  { id: "desinformacion", label: "Desinformación" },
  { id: "otro", label: "Otro motivo" },
];

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
  onReported?: () => void;
}

export function ReportModal({
  open,
  onClose,
  targetType,
  targetId,
  onReported,
}: ReportModalProps) {
  const { token } = useAuth();
  const [reason, setReason] = useState<string>(REPORT_REASONS[0].id);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setReason(REPORT_REASONS[0].id);
      setDetails("");
      setError(null);
      setSuccess(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createReport(token, {
        targetType,
        targetId,
        reason,
        details: details.trim() || undefined,
      });
      setSuccess(true);
      onReported?.();
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar el reporte");
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
          aria-label="Reportar contenido"
          onClick={onClose}
        >
          <motion.div
            {...modalPanel}
            className="relative w-full max-w-md rounded-[var(--radius-xl)] border-[0.5px] border-[var(--error)]/40 bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow-md)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-[var(--error)]" aria-hidden />
                <h2 className="text-lg font-semibold text-[var(--app-fg)]">Reportar</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="rounded-lg p-1.5 text-[var(--app-fg-muted)] transition-colors hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-fg)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {success ? (
              <p className="rounded-xl bg-[var(--success-subtle)] px-4 py-3 text-sm text-[var(--success)]">
                Reporte enviado. Gracias por ayudarnos a mantener una comunidad sana.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <fieldset className="space-y-2">
                  <legend className="text-xs font-medium text-[var(--app-fg-muted)]">
                    Motivo
                  </legend>
                  {REPORT_REASONS.map((r) => (
                    <label
                      key={r.id}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-[var(--app-fg)] hover:bg-[var(--app-surface-soft)]"
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={r.id}
                        checked={reason === r.id}
                        onChange={() => setReason(r.id)}
                        className="accent-[var(--accent)]"
                      />
                      {r.label}
                    </label>
                  ))}
                </fieldset>

                <div>
                  <label
                    htmlFor="report-details"
                    className="mb-1 block text-xs font-medium text-[var(--app-fg-muted)]"
                  >
                    Detalles (opcional)
                  </label>
                  <textarea
                    id="report-details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows={3}
                    maxLength={2000}
                    placeholder="Cuéntanos más para revisar el caso..."
                    className="w-full resize-none rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg-muted)] focus:border-[var(--app-primary)] focus:outline-none"
                  />
                </div>

                {error && (
                  <p className="text-sm text-[var(--error)]" role="alert">
                    {error}
                  </p>
                )}

                <div className="flex justify-end gap-2">
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
                    disabled={submitting}
                    className="rounded-[var(--radius-md)] bg-[var(--error)] px-[18px] py-[10px] text-sm font-medium text-white transition-colors hover:bg-[var(--error)]/90 disabled:opacity-60"
                  >
                    {submitting ? "Enviando..." : "Enviar reporte"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

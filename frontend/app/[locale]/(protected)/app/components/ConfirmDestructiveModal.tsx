"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDestructiveModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  /** Título del modal (ej. "Eliminar curso"). */
  title: string;
  /** Mensaje descriptivo. Puede contener el nombre de la entidad para reforzar la confirmación. */
  message: string;
  /** Label del botón destructivo cuando el contador llega a 0. Default: t("common.delete") o "Eliminar". */
  confirmLabel?: string;
  /** Segundos de espera obligatoria antes de habilitar el botón. Default: 3. */
  countdownSeconds?: number;
  /** Indica si el modal está procesando la confirmación (deshabilita el botón). */
  loading?: boolean;
}

/**
 * Modal de confirmación destructiva genérico con temporizador de seguridad.
 * El botón de confirmar permanece deshabilitado durante `countdownSeconds` segundos
 * tras abrir el modal, evitando clics accidentales.
 */
export function ConfirmDestructiveModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  countdownSeconds = 3,
  loading = false,
}: ConfirmDestructiveModalProps) {
  const tCommon = useTranslations("common");
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!open) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    setSecondsLeft(countdownSeconds);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [open, countdownSeconds]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const canConfirm = secondsLeft === 0 && !loading;
  const baseLabel = confirmLabel ?? tCommon("delete");
  const buttonLabel = canConfirm ? baseLabel : `${baseLabel} (${secondsLeft})`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-destructive-title"
          aria-describedby="confirm-destructive-message"
        >
          <button
            type="button"
            aria-label={tCommon("cancel")}
            className="absolute inset-0"
            onClick={() => {
              if (!loading) onClose();
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-[440px] overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-app-modal"
          >
            <div className="p-7">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--error)_15%,transparent)] text-[var(--error)]">
                  <AlertTriangle className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 id="confirm-destructive-title" className="text-lg font-semibold text-[var(--app-fg)]">
                    {title}
                  </h2>
                  <p
                    id="confirm-destructive-message"
                    className="mt-1.5 text-sm leading-snug text-[var(--app-fg-secondary)]"
                  >
                    {message}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!loading) onClose();
                  }}
                  className="shrink-0 rounded-lg p-1.5 text-[var(--app-fg-secondary)] transition hover:bg-[var(--app-surface-elevated)] hover:text-[var(--app-fg)] disabled:opacity-40"
                  aria-label={tCommon("cancel")}
                  disabled={loading}
                >
                  <X className="size-4" strokeWidth={2} />
                </button>
              </div>

              <div className="mt-7 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-3 py-2 text-sm font-medium text-[var(--app-fg-muted)] transition hover:text-[var(--app-fg)] disabled:opacity-40"
                >
                  {tCommon("cancel")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (canConfirm) onConfirm();
                  }}
                  disabled={!canConfirm}
                  aria-disabled={!canConfirm}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--error)] px-[18px] py-[10px] text-sm font-semibold text-white shadow-sm transition-opacity duration-200",
                    canConfirm ? "opacity-100 hover:opacity-90" : "cursor-not-allowed opacity-50",
                  )}
                >
                  <Trash2 className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
                  <span className="tabular-nums">{buttonLabel}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

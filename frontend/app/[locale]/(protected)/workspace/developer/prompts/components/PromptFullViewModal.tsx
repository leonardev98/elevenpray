"use client";

import { useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import Lenis from "lenis";
import { X, Copy, Pencil, CopyPlus, Star, Pin } from "lucide-react";
import { modalBackdrop, modalPanel } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { useScrollLock } from "@/app/[locale]/(protected)/scroll-lock-context";
import type { PromptApi } from "@/app/lib/developer-workspace";

interface PromptFullViewModalProps {
  prompt: PromptApi | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onCopy: () => void;
  onDuplicate: () => void;
  onToggleFavorite: () => void;
  onTogglePin: () => void;
  copied?: boolean;
}

export function PromptFullViewModal({
  prompt,
  open,
  onClose,
  onEdit,
  onCopy,
  onDuplicate,
  onToggleFavorite,
  onTogglePin,
  copied,
}: PromptFullViewModalProps) {
  const t = useTranslations("developerWorkspace.prompts");
  const tCommon = useTranslations("common");
  const setScrollLocked = useScrollLock();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);

  // Bloquear scroll de fondo: impedir que los eventos lleguen al Lenis del layout.
  // Siempre stopPropagation cuando el evento está sobre el modal; preventDefault solo fuera del área de scroll.
  const handleOverlayWheel = useCallback((e: React.WheelEvent) => {
    e.stopPropagation();
    if (!scrollWrapperRef.current?.contains(e.target as Node)) e.preventDefault();
  }, []);
  const handleOverlayTouchMove = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    if (!scrollWrapperRef.current?.contains(e.target as Node)) e.preventDefault();
  }, []);

  // Bloquear scroll del layout (Lenis) y del body cuando el modal está abierto
  useEffect(() => {
    if (!open) return;
    setScrollLocked(true);
    const root = document.body;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = "";
      setScrollLocked(false);
    };
  }, [open, setScrollLocked]);

  // Lenis: scroll suave dentro del modal. El wrapper debe ser scrollable por CSS (overflow-y-auto) para que Lenis funcione.
  // Inicializamos tras un frame para que el layout del modal (y la altura del wrapper) esté calculado.
  const lenisCleanupRef = useRef<{ lenis: InstanceType<typeof Lenis>; rafId: number } | null>(null);
  useEffect(() => {
    if (!open || !prompt) return;
    const frameId = requestAnimationFrame(() => {
      const wrapper = scrollWrapperRef.current;
      const content = scrollContentRef.current;
      if (!wrapper || !content) return;
      const lenis = new Lenis({
        wrapper,
        content,
        eventsTarget: wrapper,
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
        orientation: "vertical",
        smoothWheel: true,
        syncTouch: true,
      });
      let rafId: number;
      function raf(time: number) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);
      lenisCleanupRef.current = { lenis, rafId };
    });
    return () => {
      cancelAnimationFrame(frameId);
      const cleanup = lenisCleanupRef.current;
      if (cleanup) {
        cancelAnimationFrame(cleanup.rafId);
        cleanup.lenis.destroy();
        lenisCleanupRef.current = null;
      }
    };
  }, [open, prompt?.id]);

  if (!prompt) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="prompt-full-view-title"
          onClick={(e) => e.target === e.currentTarget && onClose()}
          onKeyDown={handleKeyDown}
          onWheel={handleOverlayWheel}
          onTouchMove={handleOverlayTouchMove}
          {...modalBackdrop}
        >
          <motion.div
            className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[var(--dev-border-subtle)] bg-[var(--dev-surface-elevated)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            {...modalPanel}
          >
            {/* Header */}
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--dev-border-subtle)] bg-[var(--app-bg)]/50 px-6 py-4">
              <div className="min-w-0 flex-1">
                <h2
                  id="prompt-full-view-title"
                  className="text-lg font-semibold text-[var(--app-fg)]"
                >
                  {prompt.title}
                </h2>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--app-fg)]/60">
                  {prompt.category && (
                    <span className="rounded-md bg-[var(--app-navy)]/10 px-2 py-0.5 text-[var(--app-navy)]">
                      {prompt.category.name || prompt.category.code}
                    </span>
                  )}
                  {prompt.folder && (
                    <span className="rounded-md bg-[var(--app-bg)] px-2 py-0.5">
                      {prompt.folder.name}
                    </span>
                  )}
                  {prompt.project && (
                    <span className="rounded-md bg-[var(--app-bg)] px-2 py-0.5">
                      {prompt.project.name}
                    </span>
                  )}
                  {prompt.tags?.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-md bg-[var(--app-bg)] px-2 py-0.5"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={onCopy}
                  className="rounded-lg p-2.5 text-[var(--app-fg)]/60 transition hover:bg-[var(--app-navy)]/10 hover:text-[var(--app-fg)]"
                  title={t("copy")}
                >
                  <Copy className="h-4 w-4" />
                </button>
                {copied && (
                  <span className="text-xs text-emerald-600">{t("copied")}</span>
                )}
                <button
                  type="button"
                  onClick={onDuplicate}
                  className="rounded-lg p-2.5 text-[var(--app-fg)]/60 transition hover:bg-[var(--app-navy)]/10 hover:text-[var(--app-fg)]"
                  title={t("duplicate")}
                >
                  <CopyPlus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={onEdit}
                  className="rounded-lg p-2.5 text-[var(--app-fg)]/60 transition hover:bg-[var(--app-navy)]/10 hover:text-[var(--app-fg)]"
                  title={t("edit")}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={onToggleFavorite}
                  className={cn(
                    "rounded-lg p-2.5 transition",
                    prompt.isFavorite
                      ? "text-amber-500"
                      : "text-[var(--app-fg)]/60 hover:bg-[var(--app-navy)]/10 hover:text-[var(--app-fg)]"
                  )}
                  title={t("favorites")}
                >
                  <Star
                    className={cn("h-4 w-4", prompt.isFavorite && "fill-current")}
                  />
                </button>
                <button
                  type="button"
                  onClick={onTogglePin}
                  className={cn(
                    "rounded-lg p-2.5 transition",
                    prompt.isPinned
                      ? "text-[var(--app-navy)]"
                      : "text-[var(--app-fg)]/60 hover:bg-[var(--app-navy)]/10 hover:text-[var(--app-fg)]"
                  )}
                  title={t("pin")}
                >
                  <Pin
                    className={cn("h-4 w-4", prompt.isPinned && "fill-current")}
                  />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="ml-1 rounded-lg p-2.5 text-[var(--app-fg)]/60 transition hover:bg-[var(--app-navy)]/10 hover:text-[var(--app-fg)]"
                  aria-label={tCommon("close")}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Área de scroll: debe ser scrollable por CSS (overflow-y-auto) para que Lenis pueda suavizarlo */}
            <div
              ref={scrollWrapperRef}
              className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
            >
              <div
                ref={scrollContentRef}
                className="p-6"
                data-lenis-prevent
              >
                {prompt.description && (
                  <p className="mb-4 text-sm leading-relaxed text-[var(--app-fg)]/80">
                    {prompt.description}
                  </p>
                )}
                <div className="rounded-xl border border-[var(--dev-border-subtle)] bg-[var(--app-bg)]/80 p-4">
                  <pre className="max-w-full whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-[var(--app-fg)]/90">
                    {prompt.content}
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

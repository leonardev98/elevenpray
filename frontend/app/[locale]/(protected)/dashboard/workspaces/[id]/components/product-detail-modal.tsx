"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { getCatalogProduct, type CatalogProductApi } from "../../../../../../lib/catalog-api";
import { checkIngredientConflicts, type ConflictResultApi } from "../../../../../../lib/ingredient-conflicts-api";
import { useLocale } from "next-intl";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Estrellas de valoración para el modal (0–5). */
function StarRatingDisplay({ rating }: { rating: number }) {
  const value = Math.min(5, Math.max(0, rating));
  const full = Math.floor(value);
  const half = value % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Valoración: ${value.toFixed(1)} de 5`}>
      {Array.from({ length: full }, (_, i) => (
        <span key={`f-${i}`} className="text-amber-500" aria-hidden>★</span>
      ))}
      {half > 0 && (
        <span className="text-amber-500" aria-hidden style={{ opacity: 0.6 }}>★</span>
      )}
      {Array.from({ length: empty }, (_, i) => (
        <span key={`e-${i}`} className="text-neutral-300 dark:text-neutral-600" aria-hidden>★</span>
      ))}
      <span className="ml-1.5 text-sm text-neutral-500">{value.toFixed(1)}</span>
    </span>
  );
}

const EXPERIENCE_LABELS: Record<string, string> = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

export function ProductDetailModal({
  productId,
  initialProduct,
  isOpen,
  onClose,
  isBookmarked,
  onToggleBookmark,
  onAddToRoutine,
  token,
  workspaceId,
}: {
  productId: string;
  initialProduct: CatalogProductApi | null;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onAddToRoutine: (product: CatalogProductApi) => void;
  token: string | null;
  workspaceId: string;
}) {
  const locale = useLocale() as "es" | "en";
  const [product, setProduct] = useState<CatalogProductApi | null>(initialProduct);
  const [conflicts, setConflicts] = useState<ConflictResultApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [conflictsLoading, setConflictsLoading] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (initialProduct?.id === productId) {
      setProduct(initialProduct);
    } else {
      setLoading(true);
      setProduct(null);
      if (!token || !workspaceId) return;
      getCatalogProduct(token, workspaceId, productId)
        .then(setProduct)
        .catch(() => setProduct(null))
        .finally(() => setLoading(false));
    }
  }, [isOpen, productId, initialProduct?.id, token, workspaceId]);

  useEffect(() => {
    if (!isOpen || !product?.ingredients?.length || !token) {
      setConflicts([]);
      return;
    }
    setConflictsLoading(true);
    checkIngredientConflicts(token, product.ingredients, locale)
      .then(setConflicts)
      .catch(() => setConflicts([]))
      .finally(() => setConflictsLoading(false));
  }, [isOpen, product?.ingredients, token, locale]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusable = panelRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable?.[0] as HTMLElement | undefined;
    first?.focus();
    return () => {
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const experienceLabel = product?.experienceLevel
    ? EXPERIENCE_LABELS[product.experienceLevel] ?? product.experienceLevel
    : null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4 bg-black/50"
      onKeyDown={handleKeyDown}
      onClick={handleOverlayClick}
    >
      <div
        ref={panelRef}
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 size-9 rounded-full text-[var(--app-fg)]/70 hover:bg-[var(--app-border)] hover:text-[var(--app-fg)]"
          aria-label="Cerrar"
        >
          <X className="size-5" />
        </Button>

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center p-8 text-[var(--app-fg)]/60">Cargando producto…</div>
        ) : !product ? (
          <div className="flex min-h-[320px] items-center justify-center p-8 text-[var(--app-fg)]/60">No se pudo cargar el producto.</div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
            {/* Columna izquierda: texto (sin scroll; contenido compacto) */}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto py-6 pl-6 pr-4 sm:max-w-[55%]">
              <div className="space-y-2">
                {product.brand && (
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                    {product.brand}
                  </p>
                )}
                <h1 id="product-detail-title" className="text-xl font-semibold leading-tight text-[var(--app-fg)]">
                  {product.name}
                </h1>
                {product.rating != null && (
                  <div className="pt-1">
                    <StarRatingDisplay rating={product.rating} />
                  </div>
                )}
              </div>

              {product.benefits?.length ? (
                <div className="mt-4">
                  <h2 className="mb-2 text-sm font-semibold text-[var(--app-fg)]">Para qué sirve</h2>
                  <ul className="list-inside list-disc space-y-1 text-sm text-[var(--app-fg)]/80">
                    {product.benefits.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {product.ingredients?.length ? (
                <div className="mt-4">
                  <h2 className="mb-2 text-sm font-semibold text-[var(--app-fg)]">Ingredientes clave</h2>
                  <p className="text-sm text-[var(--app-fg)]/80">
                    {product.ingredients.join(" · ")}
                  </p>
                </div>
              ) : null}

              {product.skinTypeCompatibility?.length ? (
                <div className="mt-4">
                  <h2 className="mb-2 text-sm font-semibold text-[var(--app-fg)]">Tipo de piel recomendado</h2>
                  <p className="text-sm text-[var(--app-fg)]/80">
                    {product.skinTypeCompatibility.join(", ")}
                  </p>
                </div>
              ) : null}

              {product.concernTags?.length ? (
                <div className="mt-4">
                  <h2 className="mb-2 text-sm font-semibold text-[var(--app-fg)]">Preocupaciones que trata</h2>
                  <p className="text-sm text-[var(--app-fg)]/80">
                    {product.concernTags.join(" · ")}
                  </p>
                </div>
              ) : null}

              {product.usageInstructions ? (
                <div className="mt-4">
                  <h2 className="mb-2 text-sm font-semibold text-[var(--app-fg)]">Cómo usar</h2>
                  <p className="whitespace-pre-line text-sm text-[var(--app-fg)]/80">
                    {product.usageInstructions}
                  </p>
                </div>
              ) : null}

              {experienceLabel && (
                <div className="mt-4">
                  <h2 className="mb-1 text-sm font-semibold text-[var(--app-fg)]">Nivel de uso</h2>
                  <p className="text-sm text-[var(--app-fg)]/80">{experienceLabel}</p>
                </div>
              )}

              {(conflictsLoading || conflicts.length > 0) && (
                <div className="mt-4">
                  <h2 className="mb-2 text-sm font-semibold text-[var(--app-fg)]">Compatibilidad con ingredientes</h2>
                  {conflictsLoading ? (
                    <p className="text-sm text-[var(--app-fg)]/60">Comprobando…</p>
                  ) : conflicts.length > 0 ? (
                    <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 space-y-2">
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Advertencia</p>
                      <p className="text-sm text-[var(--app-fg)]/80">No combinar con:</p>
                      <ul className="text-sm text-[var(--app-fg)]/80 list-disc list-inside space-y-0.5">
                        {conflicts.map((c, i) => (
                          <li key={i}>
                            {c.ingredientA} + {c.ingredientB}: {c.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--app-fg)]/60">No se detectaron conflictos.</p>
                  )}
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                {isBookmarked ? (
                  <Button
                    type="button"
                    variant="destructive"
                    size="default"
                    onClick={onToggleBookmark}
                    aria-pressed={true}
                  >
                    Quitar de guardados
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="default"
                    onClick={onToggleBookmark}
                    aria-pressed={false}
                  >
                    Guardar producto
                  </Button>
                )}
                <Button
                  type="button"
                  size="default"
                  onClick={() => onAddToRoutine(product)}
                >
                  Añadir a rutina
                </Button>
              </div>
            </div>

            {/* Columna derecha: foto */}
            <div
              className="flex shrink-0 items-center justify-center bg-[#F8F7F5] p-6 sm:w-[45%] sm:min-h-[400px]"
            >
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt=""
                  className="max-h-[320px] w-full object-contain sm:max-h-[min(70vh,420px)]"
                />
              ) : (
                <span className="text-6xl font-light text-[var(--app-fg)]/20">
                  {product.name.charAt(0)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

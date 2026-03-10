"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { getCatalogProduct, type CatalogProductApi } from "../../../../../../lib/catalog-api";
import { checkIngredientConflicts, type ConflictResultApi } from "../../../../../../lib/ingredient-conflicts-api";
import { useLocale } from "next-intl";

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onKeyDown={handleKeyDown}
      onClick={handleOverlayClick}
    >
      <div
        ref={panelRef}
        className="relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full p-2 text-[var(--app-fg)]/70 hover:bg-[var(--app-border)] hover:text-[var(--app-fg)]"
          aria-label="Cerrar"
        >
          <span className="text-xl leading-none">×</span>
        </button>

        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="p-8 text-center text-[var(--app-fg)]/60">Cargando producto…</div>
          ) : !product ? (
            <div className="p-8 text-center text-[var(--app-fg)]/60">No se pudo cargar el producto.</div>
          ) : (
            <>
              {/* Header: imagen grande, marca, nombre */}
              <div className="flex min-h-[280px] w-full max-h-96 shrink-0 items-center justify-center bg-[#F8F7F5] p-6">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt=""
                    className="max-h-64 w-full object-contain"
                  />
                ) : (
                  <span className="text-6xl font-light text-[var(--app-fg)]/20">
                    {product.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="space-y-2 p-6 pt-4">
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

              {/* 1. Para qué sirve */}
              {product.benefits?.length ? (
                <div className="px-6 pb-4">
                  <h2 className="mb-2 text-sm font-semibold text-[var(--app-fg)]">Para qué sirve</h2>
                  <ul className="list-inside list-disc space-y-1 text-sm text-[var(--app-fg)]/80">
                    {product.benefits.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {/* 2. Ingredientes clave */}
              {product.ingredients?.length ? (
                <div className="px-6 pb-4">
                  <h2 className="mb-2 text-sm font-semibold text-[var(--app-fg)]">Ingredientes clave</h2>
                  <p className="text-sm text-[var(--app-fg)]/80">
                    {product.ingredients.join(" · ")}
                  </p>
                </div>
              ) : null}

              {/* 3. Tipo de piel recomendado */}
              {product.skinTypeCompatibility?.length ? (
                <div className="px-6 pb-4">
                  <h2 className="mb-2 text-sm font-semibold text-[var(--app-fg)]">Tipo de piel recomendado</h2>
                  <p className="text-sm text-[var(--app-fg)]/80">
                    {product.skinTypeCompatibility.join(", ")}
                  </p>
                </div>
              ) : null}

              {/* 4. Preocupaciones que trata */}
              {product.concernTags?.length ? (
                <div className="px-6 pb-4">
                  <h2 className="mb-2 text-sm font-semibold text-[var(--app-fg)]">Preocupaciones que trata</h2>
                  <p className="text-sm text-[var(--app-fg)]/80">
                    {product.concernTags.join(" · ")}
                  </p>
                </div>
              ) : null}

              {/* 5. Cómo usar */}
              {product.usageInstructions ? (
                <div className="px-6 pb-4">
                  <h2 className="mb-2 text-sm font-semibold text-[var(--app-fg)]">Cómo usar</h2>
                  <p className="whitespace-pre-line text-sm text-[var(--app-fg)]/80">
                    {product.usageInstructions}
                  </p>
                </div>
              ) : null}

              {/* Nivel de uso (extra) */}
              {experienceLabel && (
                <div className="px-6 pb-4">
                  <h2 className="mb-1 text-sm font-semibold text-[var(--app-fg)]">Nivel de uso</h2>
                  <p className="text-sm text-[var(--app-fg)]/80">{experienceLabel}</p>
                </div>
              )}

              {/* Compatibilidad / conflictos */}
              {(conflictsLoading || conflicts.length > 0) && (
                <div className="px-6 pb-4">
                  <h2 className="text-sm font-semibold text-[var(--app-fg)] mb-2">Compatibilidad con ingredientes</h2>
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
                    <p className="text-sm text-[var(--app-fg)]/60">No se detectaron conflictos entre los ingredientes de este producto.</p>
                  )}
                </div>
              )}

              {/* Botones rectangulares, ancho completo */}
              <div className="flex flex-col gap-3 px-6 pb-6 pt-4 sm:flex-row">
                <button
                  type="button"
                  onClick={onToggleBookmark}
                  className="min-h-[48px] min-w-[140px] flex-1 rounded-xl border border-[var(--app-border)] px-6 py-3 text-sm font-medium text-[var(--app-fg)] transition-colors hover:border-[var(--app-gold)]/40 hover:bg-[var(--app-gold)]/10"
                  aria-pressed={isBookmarked}
                >
                  {isBookmarked ? "Guardado" : "Guardar producto"}
                </button>
                <button
                  type="button"
                  onClick={() => onAddToRoutine(product)}
                  className="min-h-[48px] min-w-[160px] flex-1 rounded-xl px-6 py-3 text-sm font-medium text-[var(--app-navy)] transition-colors hover:bg-[#B89657]"
                  style={{ backgroundColor: "#C8A76C" }}
                >
                  Añadir a rutina
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

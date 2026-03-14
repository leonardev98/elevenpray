"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { getCatalogProducts, type CatalogProductApi } from "../../../../lib/catalog-api";
import { modalBackdrop, modalPanel } from "@/lib/animations";

const CATEGORY_LABELS: Record<string, string> = {
  cleanser: "Limpiador",
  moisturizer: "Hidratante",
  sunscreen: "Protector solar",
  serum: "Sérum",
  retinoid: "Retinoide",
  exfoliant: "Exfoliante",
  toner: "Tónico",
  eye_care: "Contorno de ojos",
  mask: "Mascarilla",
  essence: "Esencia",
};

export function RoutineAddProductModal({
  workspaceId,
  token,
  onSelect,
  onClose,
}: {
  workspaceId: string;
  token: string | null;
  onSelect: (product: CatalogProductApi) => void;
  onClose: () => void;
}) {
  const locale = useLocale() as "es" | "en";
  const [products, setProducts] = useState<CatalogProductApi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !workspaceId) return;
    getCatalogProducts(token, workspaceId, { locale })
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [token, workspaceId, locale]);

  return (
    <AnimatePresence>
      <motion.div
        key="routine-add-product-modal"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="routine-add-product-title"
          onClick={(e) => e.target === e.currentTarget && onClose()}
          {...modalBackdrop}
        >
          <motion.div
            className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-xl"
            onClick={(e) => e.stopPropagation()}
            {...modalPanel}
          >
        <div className="border-b border-[var(--app-border)] px-4 py-3">
          <h2 id="routine-add-product-title" className="text-lg font-semibold text-[var(--app-fg)]">
            Añadir producto
          </h2>
          <p className="mt-0.5 text-sm text-[var(--app-fg)]/70">
            Elige un producto del catálogo para este bloque (mañana/noche).
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <p className="py-6 text-center text-sm text-[var(--app-fg)]/60">Cargando…</p>
          ) : products.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--app-fg)]/60">No hay productos en el catálogo.</p>
          ) : (
            <ul className="space-y-1">
              {products.map((product) => (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(product)}
                    className="flex w-full items-center gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)]/50 px-3 py-2.5 text-left transition hover:border-[var(--app-navy)]/40 hover:bg-[var(--app-navy)]/5"
                  >
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[var(--app-surface)]">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-lg text-[var(--app-fg)]/30">
                          {product.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[var(--app-fg)] truncate">{product.name}</p>
                      <p className="text-xs text-[var(--app-fg)]/60">
                        {product.brand && `${product.brand} · `}
                        {CATEGORY_LABELS[product.category] ?? product.category}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t border-[var(--app-border)] p-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-[var(--app-border)] py-2.5 text-sm font-medium text-[var(--app-fg)] hover:bg-[var(--app-bg)]"
          >
            Cancelar
          </button>
        </div>
          </motion.div>
        </motion.div>
    </AnimatePresence>
  );
}

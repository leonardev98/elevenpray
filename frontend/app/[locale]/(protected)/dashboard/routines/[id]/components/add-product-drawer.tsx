"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getCatalogProducts, type CatalogProductApi } from "@/app/lib/catalog-api";
import { recommendProductsForContext } from "@/app/lib/routine-builder";
import type { RoutineMetadata, RoutineSlot } from "@/app/lib/routines-api";

interface AddProductDrawerProps {
  isOpen: boolean;
  token: string;
  workspaceId: string;
  slot: RoutineSlot;
  metadata?: RoutineMetadata | null;
  onClose: () => void;
  onSelect: (product: CatalogProductApi) => Promise<void> | void;
}

export function AddProductDrawer({
  isOpen,
  token,
  workspaceId,
  slot,
  metadata,
  onClose,
  onSelect,
}: AddProductDrawerProps) {
  const recentStorageKey = `routine-recent-catalog-${workspaceId}`;
  const [products, setProducts] = useState<CatalogProductApi[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(recentStorageKey) : null;
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as string[];
      setRecentIds(Array.isArray(parsed) ? parsed.slice(0, 8) : []);
    } catch {
      setRecentIds([]);
    }
  }, [isOpen, recentStorageKey]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoading(true);
    getCatalogProducts(token, workspaceId, {
      category: category || undefined,
      search: search || undefined,
      concern: metadata?.goals?.[0],
    })
      .then((items) => {
        if (!cancelled) setProducts(items);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, token, workspaceId, category, search, metadata?.goals]);

  const recommended = useMemo(
    () => recommendProductsForContext(products, slot, metadata?.skinType).slice(0, 8),
    [products, slot, metadata?.skinType]
  );
  const recentProducts = useMemo(
    () => recentIds.map((id) => products.find((product) => product.id === id)).filter((value): value is CatalogProductApi => Boolean(value)),
    [products, recentIds]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="add-product-drawer"
          className="fixed inset-0 z-50 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            className="h-full w-full max-w-xl overflow-y-auto border-l border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
          >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--app-fg)]">Add product</h3>
            <p className="text-xs text-[var(--app-fg)]/60">
              Context-aware suggestions for your {slot === "am" ? "morning" : "night"} flow.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-sm text-[var(--app-fg)]/60 hover:bg-[var(--app-bg)]">
            Close
          </button>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search product or brand"
            className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-fg)]"
          />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-fg)]"
          >
            <option value="">All categories</option>
            <option value="cleanser">Cleanser</option>
            <option value="toner">Toner</option>
            <option value="serum">Serum</option>
            <option value="treatment">Treatment</option>
            <option value="retinoid">Retinoid</option>
            <option value="exfoliant">Exfoliant</option>
            <option value="moisturizer">Moisturizer</option>
            <option value="sunscreen">Sunscreen</option>
            <option value="mask">Mask</option>
          </select>
        </div>

        {loading ? (
          <p className="text-sm text-[var(--app-fg)]/60">Loading catalog...</p>
        ) : (
          <div className="space-y-2">
            {recommended.map(({ product, reason }) => (
              <button
                key={product.id}
                type="button"
                onClick={async () => {
                  const nextRecent = [product.id, ...recentIds.filter((id) => id !== product.id)].slice(0, 8);
                  setRecentIds(nextRecent);
                  if (typeof window !== "undefined") {
                    window.localStorage.setItem(recentStorageKey, JSON.stringify(nextRecent));
                  }
                  await onSelect(product);
                }}
                className="block w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-3 text-left transition hover:border-[var(--app-gold)]/50"
              >
                <p className="text-sm font-semibold text-[var(--app-fg)]">{product.name}</p>
                <p className="text-xs text-[var(--app-fg)]/60">
                  {product.brand ?? "No brand"} · {product.category}
                </p>
                <p className="mt-1 text-xs text-[var(--app-gold)]">{reason}</p>
              </button>
            ))}
            {recentProducts.length ? (
              <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-fg)]/55">Recently used</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {recentProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={async () => onSelect(product)}
                      className="rounded-full border border-[var(--app-border)] px-2.5 py-1 text-[11px] text-[var(--app-fg)]/75 hover:border-[var(--app-gold)]/50 hover:text-[var(--app-gold)]"
                    >
                      {product.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {!recommended.length ? (
              <div className="rounded-2xl border border-dashed border-[var(--app-border)] p-4 text-xs text-[var(--app-fg)]/60">
                No products found. Try adjusting search or category.
              </div>
            ) : null}
          </div>
        )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

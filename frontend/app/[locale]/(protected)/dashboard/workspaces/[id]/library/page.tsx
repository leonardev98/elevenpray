"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "../../../../../../providers/auth-provider";
import {
  getCatalogProducts,
  getCatalogBookmarks,
  addCatalogBookmark,
  removeCatalogBookmark,
  type CatalogProductApi,
} from "../../../../../../lib/catalog-api";
import { ProductDetailModal } from "../components/product-detail-modal";
import { AddToRoutineModal } from "../components/add-to-routine-modal";
import { CatalogProductCard } from "../components/catalog-product-card";

const CATEGORIES = [
  { value: "", label: "Todas" },
  { value: "cleanser", label: "Limpiador" },
  { value: "moisturizer", label: "Hidratante" },
  { value: "sunscreen", label: "Protector solar" },
  { value: "serum", label: "Sérum" },
  { value: "retinoid", label: "Retinoide" },
  { value: "toner", label: "Tónico" },
  { value: "eye_care", label: "Contorno de ojos" },
  { value: "mask", label: "Mascarilla" },
  { value: "oil", label: "Aceite" },
  { value: "essence", label: "Esencia" },
];

const CONCERNS = [
  { value: "", label: "Cualquier preocupación" },
  { value: "acne", label: "Acné" },
  { value: "wrinkles", label: "Arrugas" },
  { value: "dark_circles", label: "Ojeras" },
  { value: "hyperpigmentation", label: "Hiperpigmentación" },
  { value: "hydration", label: "Hidratación" },
  { value: "redness", label: "Rojeces" },
  { value: "sun_damage", label: "Daño solar" },
];

export default function WorkspaceLibraryPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const { token } = useAuth();
  const [products, setProducts] = useState<CatalogProductApi[]>([]);
  const [bookmarkIds, setBookmarkIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");
  const [concern, setConcern] = useState("");
  const [search, setSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [addToRoutineProduct, setAddToRoutineProduct] = useState<CatalogProductApi | null>(null);

  function loadCatalog() {
    if (!token || !workspaceId) return;
    setLoading(true);
    setError("");
    Promise.all([
      getCatalogProducts(token, workspaceId, {
        category: category || undefined,
        concern: concern || undefined,
        search: search.trim() || undefined,
      }),
      getCatalogBookmarks(token, workspaceId),
    ])
      .then(([list, ids]) => {
        setProducts(list);
        setBookmarkIds(new Set(ids));
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Error al cargar");
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCatalog();
  }, [token, workspaceId, category, concern, search]);

  async function toggleBookmark(productId: string) {
    if (!token || !workspaceId) return;
    const isBookmarked = bookmarkIds.has(productId);
    try {
      if (isBookmarked) {
        await removeCatalogBookmark(token, workspaceId, productId);
        setBookmarkIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      } else {
        await addCatalogBookmark(token, workspaceId, productId);
        setBookmarkIds((prev) => new Set(prev).add(productId));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al actualizar");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--app-fg)]">
        Catálogo
      </h1>
      <p className="text-[var(--app-fg)]/70">
        Productos curados por categoría y preocupación. Guarda los que te interesen y añádelos a tu rutina.
      </p>

      <div className="flex flex-wrap gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--app-gold)]/20"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value || "all"} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={concern}
          onChange={(e) => setConcern(e.target.value)}
          className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--app-gold)]/20"
        >
          {CONCERNS.map((c) => (
            <option key={c.value || "all"} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o marca"
          className="min-w-[200px] rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:border-[var(--app-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--app-gold)]/20"
        />
      </div>

      {error && (
        <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-[var(--app-fg)]/60">Cargando…</p>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--app-border)] bg-[var(--app-surface)] py-16 text-center">
          <p className="text-[var(--app-fg)]/60">
            No hay productos publicados en el catálogo aún. Pronto podrás ver recomendaciones aquí.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {products.map((product) => (
            <li key={product.id}>
              <CatalogProductCard
                product={product}
                isBookmarked={bookmarkIds.has(product.id)}
                onToggleBookmark={() => toggleBookmark(product.id)}
                onOpenDetail={() => setSelectedProductId(product.id)}
                onAddToRoutine={() => setAddToRoutineProduct(product)}
              />
            </li>
          ))}
        </ul>
      )}

      {selectedProductId && (
        <ProductDetailModal
          productId={selectedProductId}
          initialProduct={products.find((p) => p.id === selectedProductId) ?? null}
          isOpen={true}
          onClose={() => setSelectedProductId(null)}
          isBookmarked={bookmarkIds.has(selectedProductId)}
          onToggleBookmark={() => toggleBookmark(selectedProductId)}
          onAddToRoutine={(product) => {
            setSelectedProductId(null);
            setAddToRoutineProduct(product);
          }}
          token={token}
          workspaceId={workspaceId}
        />
      )}

      {addToRoutineProduct && token && (
        <AddToRoutineModal
          product={addToRoutineProduct}
          workspaceId={workspaceId}
          token={token}
          onClose={() => setAddToRoutineProduct(null)}
          onSuccess={() => setAddToRoutineProduct(null)}
        />
      )}

      <p className="pt-4">
        <Link
          href={`/dashboard/workspaces/${workspaceId}`}
          className="text-sm font-medium text-[var(--app-gold)] hover:underline"
        >
          Volver al overview
        </Link>
      </p>
    </div>
  );
}

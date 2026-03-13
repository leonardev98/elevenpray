"use client";

import { useEffect, useState, useMemo } from "react";
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
import { getWorkspacePreference } from "../../../../../../lib/workspace-preferences-api";
import { ProductDetailModal } from "../components/product-detail-modal";
import { AddToRoutineModal } from "../components/add-to-routine-modal";
import { CatalogProductCard } from "../components/catalog-product-card";
import { toast } from "../../../../../../lib/toast";

type SkinProfile = {
  skinType?: string;
  mainConcerns?: string[];
  sensitivityLevel?: string;
};

function recommendationScore(
  product: CatalogProductApi,
  profile: SkinProfile | null
): number {
  if (!profile?.skinType) return 0;
  let score = 0;
  if (
    product.skinTypeCompatibility?.length &&
    product.skinTypeCompatibility.includes(profile.skinType)
  ) {
    score += 3;
  }
  const concerns = profile.mainConcerns ?? [];
  const tags = product.concernTags ?? [];
  for (const c of concerns) {
    if (tags.includes(c)) score += 2;
  }
  if (profile.sensitivityLevel) score += 1;
  return score;
}

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

export default function WorkspaceProductsPage() {
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
  const [detailProductId, setDetailProductId] = useState<string | null>(null);
  const [addToRoutineProduct, setAddToRoutineProduct] = useState<CatalogProductApi | null>(null);
  const [skinProfile, setSkinProfile] = useState<SkinProfile | null>(null);

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

  useEffect(() => {
    if (!token || !workspaceId) return;
    getWorkspacePreference(token, workspaceId)
      .then((p) => {
        const answers = p?.onboardingAnswers as SkinProfile | undefined;
        if (answers && (answers.skinType || answers.mainConcerns?.length)) {
          setSkinProfile({
            skinType: answers.skinType,
            mainConcerns: answers.mainConcerns ?? [],
            sensitivityLevel: answers.sensitivityLevel,
          });
        } else {
          setSkinProfile(null);
        }
      })
      .catch(() => setSkinProfile(null));
  }, [token, workspaceId]);

  const recommendedProducts = useMemo(() => {
    if (!skinProfile?.skinType || products.length === 0) return [];
    const withScore = products.map((p) => ({
      product: p,
      score: recommendationScore(p, skinProfile),
    }));
    return withScore
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((x) => x.product);
  }, [products, skinProfile]);

  // Productos que NO están en "Recomendado para tu piel" para no duplicarlos en la lista principal
  const recommendedIds = useMemo(
    () => new Set(recommendedProducts.map((p) => p.id)),
    [recommendedProducts]
  );
  const otherProducts = useMemo(
    () => products.filter((p) => !recommendedIds.has(p.id)),
    [products, recommendedIds]
  );

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
        toast.success("Eliminado de guardados", "El producto se quitó de tu lista.");
      } else {
        await addCatalogBookmark(token, workspaceId, productId);
        setBookmarkIds((prev) => new Set(prev).add(productId));
        toast.success("Guardado", "Añadido a tu lista de productos.");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al actualizar";
      setError(msg);
      toast.error("Error", msg);
    }
  }

  return (
    <div className="w-full px-3 sm:px-4 lg:px-5">
      <header className="mb-8">
        <h2 className="text-2xl font-semibold tracking-normal text-[var(--app-fg)] sm:text-3xl">
          Productos
        </h2>
        <p className="mt-2 text-sm text-[var(--app-fg)]/70 sm:text-base">
          Listado del catálogo. Usa Info para ver detalle y Añadir a rutina para asignar días y horario (mañana/noche).
        </p>
      </header>

      <div className="mb-6 flex flex-wrap gap-3 sm:mb-8">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="min-h-[44px] flex-1 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-2.5 text-base text-[var(--app-fg)] focus:border-[var(--app-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/20 sm:min-w-[160px] sm:flex-none"
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
          className="min-h-[44px] flex-1 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-2.5 text-base text-[var(--app-fg)] focus:border-[var(--app-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/20 sm:min-w-[180px] sm:flex-none"
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
          className="min-h-[44px] w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-2.5 text-base text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:border-[var(--app-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--app-navy)]/20 sm:min-w-[220px]"
        />
      </div>

      {error && (
        <p className="mb-6 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <p className="py-8 text-sm text-[var(--app-fg)]/60">Cargando…</p>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--app-border)] bg-[var(--app-surface)] py-20 text-center">
          <p className="text-[var(--app-fg)]/60">
            No hay productos publicados en el catálogo. Pronto podrás ver recomendaciones aquí.
          </p>
        </div>
      ) : (
        <>
          {recommendedProducts.length > 0 && (
            <section className="mb-10">
              <h3 className="mb-4 text-lg font-semibold text-[var(--app-fg)]">
                Recomendado para tu piel
              </h3>
              <ul
                className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
                role="list"
              >
                {recommendedProducts.map((product) => (
                  <li key={product.id}>
                    <CatalogProductCard
                      product={product}
                      isBookmarked={bookmarkIds.has(product.id)}
                      onToggleBookmark={() => toggleBookmark(product.id)}
                      onOpenDetail={() => setDetailProductId(product.id)}
                      onAddToRoutine={() => setAddToRoutineProduct(product)}
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className={recommendedProducts.length > 0 ? "mt-10" : ""}>
            {recommendedProducts.length > 0 && (
              <h3 className="mb-4 text-lg font-semibold text-[var(--app-fg)]">
                Resto del catálogo
              </h3>
            )}
            <ul
              className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
              role="list"
            >
              {otherProducts.map((product) => (
                <li key={product.id}>
                  <CatalogProductCard
                    product={product}
                    isBookmarked={bookmarkIds.has(product.id)}
                    onToggleBookmark={() => toggleBookmark(product.id)}
                    onOpenDetail={() => setDetailProductId(product.id)}
                    onAddToRoutine={() => setAddToRoutineProduct(product)}
                  />
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-10">
        <Link
          href={`/dashboard/workspaces/${workspaceId}`}
          className="text-sm font-medium text-[var(--app-navy)] hover:underline"
        >
          Volver al overview
        </Link>
      </p>

      {detailProductId && (
        <ProductDetailModal
          productId={detailProductId}
          initialProduct={products.find((p) => p.id === detailProductId) ?? null}
          isOpen={true}
          onClose={() => setDetailProductId(null)}
          isBookmarked={bookmarkIds.has(detailProductId)}
          onToggleBookmark={() => toggleBookmark(detailProductId)}
          onAddToRoutine={(product) => {
            setDetailProductId(null);
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
    </div>
  );
}

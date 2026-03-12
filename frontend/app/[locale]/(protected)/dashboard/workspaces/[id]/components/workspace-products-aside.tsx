"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "../../../../../../providers/auth-provider";
import {
  getWorkspaceProducts,
  type WorkspaceProductApi,
  type ProductCategory,
} from "../../../../../../lib/workspace-products-api";

const PRODUCT_CATEGORY_IDS: ProductCategory[] = [
  "cleanser", "moisturizer", "sunscreen", "serum", "retinoid", "exfoliant",
  "toner", "eye_care", "spot_treatment", "mask", "oil", "essence", "balm",
];

export function WorkspaceProductsAside() {
  const params = useParams();
  const workspaceId = params?.id as string;
  const { token } = useAuth();
  const t = useTranslations("workspaceNav");
  const tCat = useTranslations("productCategories");
  const tCommon = useTranslations("common");
  const [products, setProducts] = useState<WorkspaceProductApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ProductCategory | "all">("all");

  useEffect(() => {
    if (!token || !workspaceId) return;
    getWorkspaceProducts(token, workspaceId)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [token, workspaceId]);

  const filtered =
    filter === "all" ? products : products.filter((p) => p.category === filter);

  return (
    <aside
      className="w-full flex-shrink-0 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm"
      aria-label={t("yourProducts")}
    >
      <div className="sticky top-0 flex h-full flex-col overflow-hidden rounded-2xl">
        <div className="border-b border-[var(--app-border)] bg-[var(--app-bg)]/50 px-4 py-4 rounded-t-2xl">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--app-fg)]/80">
            {t("yourProducts")}
          </h2>
          <p className="mt-0.5 text-xs text-[var(--app-fg)]/50">
            {t("fromThisSpaceAddToRoutine")}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 border-b border-[var(--app-border)] px-3 py-2 bg-[var(--app-surface)]">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              filter === "all"
                ? "bg-[var(--app-navy)] text-[var(--app-white)]"
                : "bg-[var(--app-bg)] text-[var(--app-fg)]/80 hover:bg-[var(--app-navy)]/10 hover:text-[var(--app-fg)]"
            }`}
          >
            {t("all")}
          </button>
          {PRODUCT_CATEGORY_IDS.slice(0, 6).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                filter === cat
                  ? "bg-[var(--app-navy)] text-[var(--app-white)]"
                  : "bg-[var(--app-bg)] text-[var(--app-fg)]/80 hover:bg-[var(--app-navy)]/10 hover:text-[var(--app-fg)]"
              }`}
            >
              {tCat(cat)}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {loading && (
            <p className="py-4 text-center text-xs text-[var(--app-fg)]/50">{tCommon("loading")}</p>
          )}
          {!loading && filtered.length === 0 && (
            <div className="rounded-xl border border-dashed border-[var(--app-border)] bg-[var(--app-bg)]/30 py-8 text-center">
              <p className="text-xs text-[var(--app-fg)]/50">
                {t("noProductsInSpace")}
              </p>
              <Link
                href={`/dashboard/workspaces/${workspaceId}/products`}
                className="mt-2 inline-block text-xs font-medium text-[var(--app-navy)] hover:underline"
              >
                {t("addProducts")}
              </Link>
            </div>
          )}
          {!loading && filtered.length > 0 && (
            <ul className="space-y-2">
              {filtered.slice(0, 12).map((p) => (
                <li key={p.id}>
                  <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)]/50 p-3 shadow-sm transition hover:border-[var(--app-navy)]/30 hover:shadow">
                    <div className="flex gap-3">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt=""
                          className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--app-navy)]/10 text-[var(--app-navy)] text-lg font-semibold">
                          {p.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[var(--app-fg)]">
                          {p.name}
                        </p>
                        {p.brand && (
                          <p className="truncate text-xs text-[var(--app-fg)]/60">{p.brand}</p>
                        )}
                        <Link
                          href={`/dashboard/workspaces/${workspaceId}/routine`}
                          className="mt-2 inline-block rounded-lg bg-[var(--app-navy)]/15 px-2.5 py-1.5 text-xs font-medium text-[var(--app-navy)] hover:bg-[var(--app-navy)]/25 transition"
                        >
                          {t("addToRoutine")}
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {!loading && filtered.length > 12 && (
            <Link
              href={`/dashboard/workspaces/${workspaceId}/products`}
              className="mt-3 block rounded-xl border border-[var(--app-border)] py-2.5 text-center text-sm font-medium text-[var(--app-navy)] hover:bg-[var(--app-navy)]/5 hover:border-[var(--app-navy)]/30 transition"
            >
              {t("viewAllProducts")}
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}

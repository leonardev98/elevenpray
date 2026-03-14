"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useAuth } from "../../../../../../providers/auth-provider";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { getRoutineTemplatesByWorkspace } from "../../../../../../lib/workspaces-api";
import { getProductIdsFromRoutine } from "../../../../../../lib/skincare-routine-progress";
import { getWorkspaceProducts } from "../../../../../../lib/workspace-products-api";
import type { WorkspaceProductApi } from "../../../../../../lib/workspace-products-api";
import type { Routine } from "../../../../../../lib/routines-api";
import { MyProductCard } from "../components/my-product-card";
import { WorkspaceProductInfoModal } from "../components/workspace-product-info-modal";
import { Plus } from "lucide-react";

export default function WorkspaceProductsPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const { token } = useAuth();
  const t = useTranslations("workspaceNav");
  const [products, setProducts] = useState<WorkspaceProductApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [infoProduct, setInfoProduct] = useState<WorkspaceProductApi | null>(null);

  function loadProducts() {
    if (!token || !workspaceId) return;
    setLoading(true);
    setError("");
    Promise.all([
      getRoutineTemplatesByWorkspace(token, workspaceId),
      getWorkspaceProducts(token, workspaceId),
    ])
      .then(([templates, allWorkspaceProducts]) => {
        const defaultTemplate = (templates as Routine[]).find(
          (r) => r.year === 0 && r.weekNumber === 0
        ) ?? null;
        const productIdsInRoutine = new Set(
          getProductIdsFromRoutine(defaultTemplate)
        );
        const inRoutine = allWorkspaceProducts.filter((p) =>
          productIdsInRoutine.has(p.id)
        );
        setProducts(inRoutine);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Error al cargar");
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadProducts();
  }, [token, workspaceId]);

  return (
    <div className="w-full px-3 sm:px-4 lg:px-5">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-[var(--app-fg)] sm:text-3xl">
            {t("myProductsTitle")}
          </h2>
          <p className="mt-2 text-sm text-[var(--app-fg)]/70 sm:text-base">
            {t("myProductsDescription")}
          </p>
        </div>
        <Link
          href={`/dashboard/workspaces/${workspaceId}/library`}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[var(--app-navy)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 sm:flex-shrink-0"
        >
          <Plus className="h-4 w-4" aria-hidden />
          {t("addProduct")}
        </Link>
      </header>

      {error && (
        <p className="mb-6 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <p className="py-8 text-sm text-[var(--app-fg)]/60">Cargando…</p>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--app-border)] bg-[var(--app-surface)] py-20 text-center">
          <p className="text-[var(--app-fg)]/70">
            {t("noProductsInMyRoutine")}
          </p>
          <Link
            href={`/dashboard/workspaces/${workspaceId}/library`}
            className="mt-4 inline-block rounded-xl bg-[var(--app-navy)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            {t("goToCatalogToAdd")}
          </Link>
        </div>
      ) : (
        <motion.ul
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {products.map((product) => (
            <motion.li key={product.id} variants={staggerItem}>
              <MyProductCard
                product={product}
                onOpenInfo={() => setInfoProduct(product)}
              />
            </motion.li>
          ))}
        </motion.ul>
      )}

      <p className="mt-10">
        <Link
          href={`/dashboard/workspaces/${workspaceId}`}
          className="text-sm font-medium text-[var(--app-navy)] hover:underline"
        >
          Volver al overview
        </Link>
      </p>

      <WorkspaceProductInfoModal
        product={infoProduct}
        isOpen={infoProduct !== null}
        onClose={() => setInfoProduct(null)}
      />
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import type { WorkspaceProductApi } from "../../../../../../lib/workspace-products-api";
import { PRODUCT_CATEGORY_LABELS } from "../../../../../../lib/workspace-products-api";
import { fadeInUp, hoverCard } from "@/lib/animations";

interface MyProductCardProps {
  product: WorkspaceProductApi;
  onOpenInfo: () => void;
}

export function MyProductCard({ product, onOpenInfo }: MyProductCardProps) {
  const t = useTranslations("workspaceNav");
  const categoryLabel =
    PRODUCT_CATEGORY_LABELS[product.category] ?? product.category;

  return (
    <motion.article
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm"
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      transition={fadeInUp.transition}
      whileHover={{
        ...hoverCard,
        boxShadow:
          "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      }}
    >
      <div
        className="flex h-[220px] shrink-0 items-center justify-center p-6"
        style={{ backgroundColor: "#F8F7F5" }}
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt=""
            className="max-h-[160px] w-full object-contain"
          />
        ) : (
          <span className="text-6xl font-extralight text-[var(--app-fg)]/15">
            {product.name.charAt(0)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-5 pt-4 pb-4">
        {product.brand && (
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            {product.brand}
          </p>
        )}
        <h3 className="mt-0.5 line-clamp-2 text-base font-semibold leading-tight text-[var(--app-fg)]">
          {product.name}
        </h3>
        <span className="mt-2 inline-block w-fit rounded-full bg-[#F8F7F5] px-2.5 py-1 text-xs font-medium capitalize text-neutral-600 dark:bg-neutral-700/50 dark:text-neutral-300">
          {categoryLabel}
        </span>
      </div>

      <div className="flex gap-3 px-5 pb-5" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onOpenInfo}
          className="min-h-[44px] flex-1 rounded-xl border border-[var(--app-border)] px-5 py-2.5 text-sm font-medium text-[var(--app-fg)] transition-colors hover:border-[var(--app-navy)]/50 hover:bg-[var(--app-navy)]/10"
        >
          {t("productInfo")}
        </button>
      </div>
    </motion.article>
  );
}

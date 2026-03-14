"use client";

import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { modalBackdrop, modalPanel } from "@/lib/animations";
import { motion, AnimatePresence } from "framer-motion";
import type { WorkspaceProductApi } from "../../../../../../lib/workspace-products-api";
import {
  PRODUCT_CATEGORY_LABELS,
  PRODUCT_STATUS_LABELS,
  USAGE_TIME_LABELS,
} from "../../../../../../lib/workspace-products-api";

interface WorkspaceProductInfoModalProps {
  product: WorkspaceProductApi | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WorkspaceProductInfoModal({
  product,
  isOpen,
  onClose,
}: WorkspaceProductInfoModalProps) {
  const t = useTranslations("workspaceNav");
  const tCommon = useTranslations("common");

  if (!product) return null;

  const categoryLabel =
    PRODUCT_CATEGORY_LABELS[product.category] ?? product.category;
  const statusLabel = product.status
    ? PRODUCT_STATUS_LABELS[product.status]
    : null;
  const usageLabel = product.usageTime
    ? USAGE_TIME_LABELS[product.usageTime]
    : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="workspace-product-info-title"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/50 p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
          {...modalBackdrop}
        >
          <motion.div
            className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-xl"
            onClick={(e) => e.stopPropagation()}
            {...modalPanel}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute right-3 top-3 z-10 size-9 rounded-full text-[var(--app-fg)]/70 hover:bg-[var(--app-border)] hover:text-[var(--app-fg)]"
              aria-label={tCommon("close")}
            >
              <X className="size-5" />
            </Button>

            <div className="overflow-y-auto p-6">
              {product.imageUrl && (
                <div className="mb-4 flex justify-center rounded-xl bg-[#F8F7F5] p-4">
                  <img
                    src={product.imageUrl}
                    alt=""
                    className="max-h-40 object-contain"
                  />
                </div>
              )}
              {product.brand && (
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  {product.brand}
                </p>
              )}
              <h2
                id="workspace-product-info-title"
                className="text-xl font-semibold leading-tight text-[var(--app-fg)]"
              >
                {product.name}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-[var(--app-bg)] px-2.5 py-1 text-xs font-medium text-[var(--app-fg)]">
                  {categoryLabel}
                </span>
                {statusLabel && (
                  <span className="rounded-full bg-[var(--app-navy)]/10 px-2.5 py-1 text-xs font-medium text-[var(--app-navy)]">
                    {statusLabel}
                  </span>
                )}
                {usageLabel && (
                  <span className="rounded-full bg-[var(--app-border)]/50 px-2.5 py-1 text-xs text-[var(--app-fg)]/80">
                    {usageLabel}
                  </span>
                )}
              </div>
              {product.notes && (
                <div className="mt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--app-fg)]/70">
                    {t("notesLabel")}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--app-fg)]/90">
                    {product.notes}
                  </p>
                </div>
              )}
              {product.mainIngredients && product.mainIngredients.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--app-fg)]/70">
                    {t("ingredientsLabel")}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--app-fg)]/80">
                    {product.mainIngredients.join(", ")}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

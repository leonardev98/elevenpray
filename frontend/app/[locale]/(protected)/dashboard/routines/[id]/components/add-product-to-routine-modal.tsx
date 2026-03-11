"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { AlertTriangle, X } from "lucide-react";
import { getCatalogProducts, type CatalogProductApi } from "@/app/lib/catalog-api";
import { checkIngredientConflicts, type ConflictResultApi } from "@/app/lib/ingredient-conflicts-api";
import { createWorkspaceProduct } from "@/app/lib/workspace-products-api";
import type { Routine } from "@/app/lib/routine-templates-api";
import type { RoutineMetadata } from "@/app/lib/routines-api";
import { DAY_KEYS, ensureAMPMGroups, isProductInDaySlot, upsertCatalogProductInRoutine } from "@/app/lib/routine-builder";
import type { DayKey } from "@/app/lib/routine-builder";
import type { RoutineSlot } from "@/app/lib/routines-api";
import type { WorkspaceProductApi } from "@/app/lib/workspace-products-api";

const CATEGORY_KEYS = [
  "cleanser",
  "serum",
  "moisturizer",
  "sunscreen",
  "retinoid",
  "exfoliant",
  "toner",
  "eye_care",
  "spot_treatment",
  "mask",
  "oil",
  "essence",
  "balm",
] as const;

interface AddProductToRoutineModalProps {
  isOpen: boolean;
  token: string;
  workspaceId: string;
  routine: Routine;
  metadata: RoutineMetadata | null;
  workspaceProducts: WorkspaceProductApi[];
  onClose: () => void;
  onSuccess: (nextRoutine: Routine) => void;
}

export function AddProductToRoutineModal({
  isOpen,
  token,
  workspaceId,
  routine,
  metadata,
  workspaceProducts,
  onClose,
  onSuccess,
}: AddProductToRoutineModalProps) {
  const locale = useLocale() as "es" | "en";
  const tBuilder = useTranslations("routineBuilder");
  const tDays = useTranslations("days");
  const tCatalog = useTranslations("catalog");
  const tCommon = useTranslations("common");

  const [step, setStep] = useState<"select" | "config">("select");
  const [products, setProducts] = useState<CatalogProductApi[]>([]);
  const [category, setCategory] = useState<string>("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProductApi | null>(null);
  const [moment, setMoment] = useState<"am" | "pm" | "both">("am");
  const [selectedDays, setSelectedDays] = useState<Set<DayKey>>(new Set());
  const [conflicts, setConflicts] = useState<ConflictResultApi[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setStep("select");
    setSelectedProduct(null);
    setSelectedDays(new Set());
    setConflicts([]);
    setError("");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoading(true);
    getCatalogProducts(token, workspaceId, {
      category: category || undefined,
      search: search || undefined,
    })
      .then((list) => {
        if (!cancelled) setProducts(list);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, token, workspaceId, category, search]);

  const ingredientsInRoutine = useMemo(() => {
    const ids = new Set<string>();
    for (const dayKey of DAY_KEYS) {
      const day = routine.days[dayKey];
      if (!day?.groups) continue;
      for (const group of day.groups) {
        for (const item of group.items ?? []) {
          if (item.productId) ids.add(item.productId);
        }
      }
    }
    const ing: string[] = [];
    for (const wp of workspaceProducts) {
      if (ids.has(wp.id) && wp.mainIngredients) {
        ing.push(...wp.mainIngredients);
      }
    }
    return [...new Set(ing)];
  }, [routine.days, workspaceProducts]);

  useEffect(() => {
    if (step !== "config" || !selectedProduct?.ingredients?.length) {
      setConflicts([]);
      return;
    }
    const combined = [...new Set([...selectedProduct.ingredients, ...ingredientsInRoutine])];
    if (combined.length === 0) return;
    let cancelled = false;
    checkIngredientConflicts(token, combined, locale)
      .then((result) => {
        if (!cancelled) setConflicts(result);
      })
      .catch(() => {
        if (!cancelled) setConflicts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [step, selectedProduct, ingredientsInRoutine, token, locale]);

  const handleSelectProduct = (product: CatalogProductApi) => {
    setSelectedProduct(product);
    setStep("config");
  };

  const toggleDay = (dayKey: DayKey) => {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayKey)) next.delete(dayKey);
      else next.add(dayKey);
      return next;
    });
  };

  const handleConfirm = async () => {
    if (!selectedProduct || selectedDays.size === 0) return;
    const slots: RoutineSlot[] = moment === "both" ? ["am", "pm"] : [moment];
    for (const dayKey of selectedDays) {
      for (const slot of slots) {
        if (isProductInDaySlot(routine, dayKey, slot, selectedProduct.name)) {
          setError(tBuilder("productAlreadyInDaySlot"));
          return;
        }
      }
    }
    setSaving(true);
    setError("");
    try {
      const created = await createWorkspaceProduct(token, workspaceId, {
        name: selectedProduct.name,
        brand: selectedProduct.brand ?? undefined,
        category: selectedProduct.category as never,
        status: "active",
        mainIngredients: selectedProduct.ingredients ?? undefined,
        imageUrl: selectedProduct.imageUrl ?? undefined,
      });
      const productForRoutine: CatalogProductApi = {
        ...selectedProduct,
        id: created.id,
      };
      const slotsToAdd: RoutineSlot[] = moment === "both" ? ["am", "pm"] : [moment];
      const daysWithSlots = ensureAMPMGroups(routine.days);
      let nextRoutine: Routine = { ...routine, metadata, days: daysWithSlots };
      for (const dayKey of selectedDays) {
        for (const slot of slotsToAdd) {
          const dayContent = nextRoutine.days[dayKey];
          const groups = dayContent?.groups ?? [];
          const group = groups.find((g) => g.slot === slot);
          const groupId = group?.id ?? `${dayKey}-${slot}`;
          nextRoutine = upsertCatalogProductInRoutine(nextRoutine, {
            dayKey,
            groupId,
            slot,
            product: productForRoutine,
          });
        }
      }
      onSuccess(nextRoutine);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : tBuilder("errorAddingProduct"));
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    setStep("select");
    setSelectedProduct(null);
    setSelectedDays(new Set());
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-product-to-routine-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-[var(--app-border)] dark:bg-[var(--app-surface)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-neutral-200 p-6 dark:border-[var(--app-border)]">
          <div>
            <h2 id="add-product-to-routine-title" className="text-lg font-semibold text-[var(--app-fg)]">
              {tBuilder("addProductToRoutineTitle")}
            </h2>
            <p className="mt-0.5 text-sm text-[var(--app-fg)]/70">{tBuilder("addProductToRoutineSubtitle")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--app-fg)]/60 transition hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
            aria-label={tCommon("close")}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === "select" ? (
            <>
              <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={tCatalog("searchPlaceholder")}
                  className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-fg)]"
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-fg)]"
                >
                  <option value="">{tCatalog("all")}</option>
                  {CATEGORY_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {tCatalog(`categories.${key}`)}
                    </option>
                  ))}
                </select>
              </div>
              {loading ? (
                <p className="text-sm text-[var(--app-fg)]/60">{tCommon("loading")}</p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-[var(--app-border)] dark:bg-[var(--app-surface)]"
                    >
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-[var(--app-bg)]">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[var(--app-fg)]/40 text-xs">
                            —
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[var(--app-fg)]">{product.name}</p>
                        <p className="text-xs text-[var(--app-fg)]/60">
                          {CATEGORY_KEYS.includes(product.category as (typeof CATEGORY_KEYS)[number])
                            ? tCatalog(`categories.${product.category}`)
                            : product.category}
                        </p>
                        {product.description ? (
                          <p className="mt-1 line-clamp-2 text-xs text-[var(--app-fg)]/70">
                            {product.description}
                          </p>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => handleSelectProduct(product)}
                          className="mt-2 rounded-lg border border-[var(--app-navy)]/40 bg-[var(--app-navy)]/10 px-3 py-1.5 text-sm font-medium text-[var(--app-navy)] transition hover:bg-[var(--app-navy)]/20"
                        >
                          {tBuilder("addToRoutine")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!loading && products.length === 0 ? (
                <p className="rounded-lg border border-dashed border-[var(--app-border)] py-6 text-center text-sm text-[var(--app-fg)]/60">
                  {tCatalog("noProducts")}
                </p>
              ) : null}
            </>
          ) : (
            <>
              {selectedProduct ? (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-[var(--app-fg)]">{selectedProduct.name}</p>
                  <div>
                    <p className="mb-2 text-sm font-medium text-[var(--app-fg)]">{tBuilder("whenToUse")}</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setMoment("am")}
                        className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition ${
                          moment === "am"
                            ? "border-[var(--app-navy)] bg-[var(--app-navy)]/15 text-[var(--app-navy)]"
                            : "border-[var(--app-border)] text-[var(--app-fg)]/80 hover:border-[var(--app-navy)]/40"
                        }`}
                      >
                        {tBuilder("morning")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMoment("pm")}
                        className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition ${
                          moment === "pm"
                            ? "border-[var(--app-navy)] bg-[var(--app-navy)]/15 text-[var(--app-navy)]"
                            : "border-[var(--app-border)] text-[var(--app-fg)]/80 hover:border-[var(--app-navy)]/40"
                        }`}
                      >
                        {tBuilder("night")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMoment("both")}
                        className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition ${
                          moment === "both"
                            ? "border-[var(--app-navy)] bg-[var(--app-navy)]/15 text-[var(--app-navy)]"
                            : "border-[var(--app-border)] text-[var(--app-fg)]/80 hover:border-[var(--app-navy)]/40"
                        }`}
                      >
                        {tBuilder("both")}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium text-[var(--app-fg)]">{tBuilder("selectDays")}</p>
                    <div className="flex flex-wrap gap-2">
                      {DAY_KEYS.map((dayKey) => (
                        <button
                          key={dayKey}
                          type="button"
                          onClick={() => toggleDay(dayKey)}
                          className={`min-w-[2.5rem] rounded-lg border px-3 py-2 text-sm font-medium transition ${
                            selectedDays.has(dayKey)
                              ? "border-[var(--app-navy)] bg-[var(--app-navy)]/15 text-[var(--app-navy)]"
                              : "border-[var(--app-border)] text-[var(--app-fg)]/80 hover:border-[var(--app-navy)]/40"
                          }`}
                        >
                          {tDays(dayKey)}
                        </button>
                      ))}
                    </div>
                  </div>
                  {conflicts.length > 0 ? (
                    <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800/50 dark:bg-amber-950/20">
                      <AlertTriangle className="size-5 shrink-0 text-amber-600 dark:text-amber-500" aria-hidden />
                      <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                          {tBuilder("possibleIngredientConflict")}
                        </p>
                        <ul className="mt-1 list-inside list-disc text-xs text-amber-700 dark:text-amber-300">
                          {conflicts.map((c, i) => (
                            <li key={i}>{c.message}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : null}
                  {error ? (
                    <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>
                  ) : null}
                </div>
              ) : null}
            </>
          )}
        </div>

        {step === "config" ? (
          <div className="flex gap-2 border-t border-[var(--app-border)] p-4">
            <button
              type="button"
              onClick={handleBack}
              className="rounded-xl border border-[var(--app-border)] px-4 py-2.5 text-sm font-medium text-[var(--app-fg)] hover:bg-[var(--app-bg)]"
            >
              {tBuilder("back")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[var(--app-border)] py-2.5 text-sm font-medium text-[var(--app-fg)] hover:bg-[var(--app-bg)]"
            >
              {tCommon("cancel")}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={saving || selectedDays.size === 0}
              className="flex-1 rounded-xl bg-[var(--app-navy)] py-2.5 text-sm font-medium text-[var(--app-white)] hover:opacity-90 disabled:opacity-50"
            >
              {saving ? tBuilder("adding") : tBuilder("confirmAdd")}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X, Replace, CalendarClock } from "lucide-react";
import { modalBackdrop, modalPanel } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { getCatalogProducts, type CatalogProductApi } from "@/app/lib/catalog-api";
import { checkIngredientConflicts, type ConflictResultApi } from "@/app/lib/ingredient-conflicts-api";
import { createWorkspaceProduct } from "@/app/lib/workspace-products-api";
import type { Routine } from "@/app/lib/routine-templates-api";
import type { RoutineMetadata } from "@/app/lib/routines-api";
import {
  DAY_KEYS,
  ensureAMPMGroups,
  getItemInRoutine,
  getProductOccurrencesInRoutine,
  applyProductFrequency,
  isProductInDaySlot,
  replaceItemInRoutine,
  upsertCatalogProductInRoutine,
} from "@/app/lib/routine-builder";
import { toast } from "@/app/lib/toast";
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

export interface ReplaceStepTarget {
  dayKey: DayKey;
  slot: "am" | "pm";
  itemId: string;
}

interface AddProductToRoutineModalProps {
  isOpen: boolean;
  token: string;
  workspaceId: string;
  routine: Routine;
  metadata: RoutineMetadata | null;
  workspaceProducts: WorkspaceProductApi[];
  onClose: () => void;
  onSuccess: (nextRoutine: Routine) => void;
  /** Si se define, el modal reemplaza ese paso por el producto elegido en lugar de añadir. */
  replaceTarget?: ReplaceStepTarget | null;
  /** Estado inicial al abrir desde una sugerencia de inteligencia. */
  initialMoment?: "am" | "pm";
  initialCategory?: string;
  initialDayKeys?: DayKey[];
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
  replaceTarget = null,
  initialMoment,
  initialCategory,
  initialDayKeys,
}: AddProductToRoutineModalProps) {
  const locale = useLocale() as "es" | "en";
  const tBuilder = useTranslations("routineBuilder");
  const tDays = useTranslations("days");
  const tCatalog = useTranslations("catalog");
  const tCommon = useTranslations("common");

  const [step, setStep] = useState<"select" | "config" | "frequency">("select");
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

  const currentEditingItem = useMemo(() => {
    if (!replaceTarget || !routine?.days) return null;
    return getItemInRoutine(routine, replaceTarget.dayKey, replaceTarget.slot, replaceTarget.itemId);
  }, [routine, replaceTarget]);

  const currentProductImageUrl = useMemo(() => {
    if (!currentEditingItem?.productId) return undefined;
    const wp = workspaceProducts.find((p) => p.id === currentEditingItem.productId);
    return wp?.imageUrl;
  }, [currentEditingItem?.productId, workspaceProducts]);

  useEffect(() => {
    if (!isOpen) return;
    setStep("select");
    setSelectedProduct(null);
    setSelectedDays(initialDayKeys?.length ? new Set(initialDayKeys) : new Set());
    setConflicts([]);
    setError("");
    if (initialMoment) setMoment(initialMoment);
    if (initialCategory !== undefined) setCategory(initialCategory);
  }, [isOpen, initialMoment, initialCategory, initialDayKeys]);

  const effectiveCategory =
    isOpen && initialCategory != null && initialCategory !== "" ? initialCategory : category;

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoading(true);
    getCatalogProducts(token, workspaceId, {
      category: effectiveCategory || undefined,
      search: search || undefined,
      locale,
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
  }, [isOpen, token, workspaceId, effectiveCategory, search, locale]);

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
    if (!selectedProduct) return;
    if (!replaceTarget && selectedDays.size === 0) return;
    if (!replaceTarget) {
      const slots: RoutineSlot[] = moment === "both" ? ["am", "pm"] : [moment];
      for (const dayKey of selectedDays) {
        for (const slot of slots) {
          if (isProductInDaySlot(routine, dayKey, slot, selectedProduct.name)) {
            setError(tBuilder("productAlreadyInDaySlot"));
            return;
          }
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
      const daysWithSlots = ensureAMPMGroups(routine.days);
      let nextRoutine: Routine = { ...routine, metadata, days: daysWithSlots };
      if (replaceTarget) {
        nextRoutine = replaceItemInRoutine(
          nextRoutine,
          replaceTarget.dayKey,
          replaceTarget.slot,
          replaceTarget.itemId,
          productForRoutine
        );
        toast.success(tBuilder("replaceSuccessTitle"), tBuilder("replaceSuccessMessage"));
      } else {
        const slotsToAdd: RoutineSlot[] = moment === "both" ? ["am", "pm"] : [moment];
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

  const handleOpenFrequency = () => {
    if (!currentEditingItem || !replaceTarget) return;
    const productIdOrName = currentEditingItem.productId ?? currentEditingItem.content ?? "";
    const occurrences = getProductOccurrencesInRoutine(routine, productIdOrName);
    const days = new Set(occurrences.map((o) => o.dayKey));
    const hasAm = occurrences.some((o) => o.slot === "am");
    const hasPm = occurrences.some((o) => o.slot === "pm");
    const momentValue: "am" | "pm" | "both" = hasAm && hasPm ? "both" : hasPm ? "pm" : "am";
    setSelectedDays(days);
    setMoment(momentValue);
    setStep("frequency");
  };

  const handleConfirmFrequency = () => {
    if (!currentEditingItem || !replaceTarget) return;
    const productId = currentEditingItem.productId ?? "";
    const productName = currentEditingItem.content ?? "";
    const stepType = (currentEditingItem.stepType as string) ?? "treatment";
    if (!productId && !productName) return;
    const slotsToApply: { dayKey: DayKey; slot: RoutineSlot }[] = [];
    const slotList: RoutineSlot[] = moment === "both" ? ["am", "pm"] : [moment];
    for (const dayKey of selectedDays) {
      for (const slot of slotList) {
        slotsToApply.push({ dayKey, slot });
      }
    }
    if (slotsToApply.length === 0) return;
    setSaving(true);
    setError("");
    try {
      const daysWithSlots = ensureAMPMGroups(routine.days);
      const nextRoutine = applyProductFrequency(
        { ...routine, metadata, days: daysWithSlots },
        productId,
        productName,
        stepType,
        slotsToApply
      );
      onSuccess(nextRoutine);
      toast.success(tBuilder("frequencyUpdated"), tBuilder("frequencyUpdatedMessage"));
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : tBuilder("errorAddingProduct"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          data-lenis-prevent
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-product-to-routine-title"
          onClick={(e) => e.target === e.currentTarget && onClose()}
          {...modalBackdrop}
        >
          <motion.div
            className="flex h-[90vh] max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-[var(--app-border)] dark:bg-[var(--app-surface)]"
            onClick={(e) => e.stopPropagation()}
            {...modalPanel}
          >
        <div className="flex items-start justify-between border-b border-neutral-200 p-6 dark:border-[var(--app-border)]">
          <div>
            <h2 id="add-product-to-routine-title" className="text-lg font-semibold text-[var(--app-fg)]">
              {replaceTarget ? tBuilder("replaceProductTitle") : tBuilder("addProductToRoutineTitle")}
            </h2>
            <p className="mt-0.5 text-sm text-[var(--app-fg)]/70">
              {replaceTarget ? tBuilder("replaceProductSubtitle") : tBuilder("addProductToRoutineSubtitle")}
            </p>
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

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {replaceTarget && currentEditingItem ? (
            <div className="mb-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-elevated)] px-4 py-3 dark:bg-[var(--app-primary-soft)]/20">
              <p className="text-sm text-[var(--app-fg)]/80">
                {tBuilder("editingProductContext", {
                  name: currentEditingItem.content || "",
                  day: tDays(replaceTarget.dayKey),
                  moment: replaceTarget.slot === "am" ? tBuilder("morning") : tBuilder("night"),
                })}
              </p>
            </div>
          ) : null}
          {step === "select" ? (
            <>
              {replaceTarget && currentEditingItem ? (
                <div
                  className={`mb-4 flex flex-col gap-3 rounded-2xl border-2 p-4 shadow-sm ${
                    replaceTarget.slot === "am"
                      ? "border-[var(--app-primary)]/60 bg-[var(--app-slot-am)]/50 dark:bg-[var(--app-slot-am)]/30"
                      : "border-[var(--app-primary)]/60 bg-[var(--app-slot-pm)]/50 dark:bg-[var(--app-slot-pm)]/30"
                  }`}
                >
                  <div className="flex gap-3 min-w-0 flex-1">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[var(--app-bg)] dark:bg-[var(--app-surface)]">
                      {currentProductImageUrl ? (
                        <img
                          src={currentProductImageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[var(--app-fg)]/40 text-xs">
                          —
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col">
                      <p className="font-medium text-[var(--app-fg)]">{currentEditingItem.content}</p>
                      <p className="text-xs text-[var(--app-fg)]/60">
                        {currentEditingItem.stepType
                          ? tBuilder(`stepTypes.${currentEditingItem.stepType}` as Parameters<typeof tBuilder>[0])
                          : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleOpenFrequency}
                      className="border-[var(--app-primary)] text-[var(--app-primary)] hover:bg-[var(--app-primary-soft)]"
                    >
                      <CalendarClock className="size-4 shrink-0" aria-hidden />
                      {tBuilder("changeFrequency")}
                    </Button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-lg border border-[var(--app-border)] px-3 py-1.5 text-sm text-[var(--app-fg)]/80 hover:bg-[var(--app-bg)]"
                    >
                      {tBuilder("leaveAsIs")}
                    </button>
                  </div>
                </div>
              ) : null}
              {replaceTarget && currentEditingItem ? (
                <p className="mb-3 text-sm font-medium text-[var(--app-fg)]/80">
                  {tBuilder("replaceWithAnother")}
                </p>
              ) : null}
              <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={tCatalog("searchPlaceholder")}
                  className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-fg)]"
                />
                <select
                  value={category || (isOpen ? initialCategory ?? "" : "")}
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
                      className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-[var(--app-border)] dark:bg-[var(--app-surface)]"
                    >
                      <div className="flex gap-3 min-w-0 flex-1">
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
                        <div className="min-w-0 flex-1 flex flex-col">
                          <p className="font-medium text-[var(--app-fg)]">{product.name}</p>
                          <p className="text-xs text-[var(--app-fg)]/60">
                            {CATEGORY_KEYS.includes(product.category as (typeof CATEGORY_KEYS)[number])
                              ? tCatalog(`categories.${product.category}`)
                              : product.category}
                          </p>
                          <div className="mt-1 min-h-[2.5rem]">
                            {product.description ? (
                              <p className="line-clamp-2 text-xs text-[var(--app-fg)]/70">
                                {product.description}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectProduct(product)}
                        className="w-full shrink-0"
                      >
                        {replaceTarget ? (
                          <>
                            <Replace className="size-4 shrink-0" aria-hidden />
                            {tBuilder("selectToReplace")}
                          </>
                        ) : (
                          tBuilder("addToRoutine")
                        )}
                      </Button>
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
          ) : step === "frequency" && currentEditingItem ? (
            <div className="space-y-4">
              <p className="text-sm font-medium text-[var(--app-fg)]">{currentEditingItem.content}</p>
              <p className="text-sm text-[var(--app-fg)]/70">{tBuilder("changeFrequencyDescription")}</p>
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
              {error ? (
                <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>
              ) : null}
            </div>
          ) : (
            <>
              {selectedProduct ? (
                <div className="space-y-4">
                  {replaceTarget ? (
                    <div className="flex flex-col items-center gap-4 text-center">
                      <div className="mx-auto aspect-square w-full max-w-[240px] overflow-hidden rounded-xl bg-[var(--app-bg)] dark:bg-[var(--app-bg)]">
                        {selectedProduct.imageUrl ? (
                          <img
                            src={selectedProduct.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[var(--app-fg)]/40 text-4xl">
                            —
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-[var(--app-fg)]">{selectedProduct.name}</h3>
                      {selectedProduct.description ? (
                        <p className="max-w-lg text-sm text-[var(--app-fg)]/80 leading-relaxed">
                          {selectedProduct.description}
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
                  {conflicts.length > 0 ? (
                    <div className="flex gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-elevated)] p-3 dark:bg-[var(--app-bg)]">
                      <AlertTriangle className="size-5 shrink-0 text-[var(--app-fg)]/70" aria-hidden />
                      <div>
                        <p className="text-sm font-medium text-[var(--app-fg)]">
                          {tBuilder("possibleIngredientConflict")}
                        </p>
                        <ul className="mt-1 list-inside list-disc text-xs text-[var(--app-fg)]/80">
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

        {step === "frequency" ? (
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
              onClick={handleConfirmFrequency}
              disabled={saving || selectedDays.size === 0}
              className="flex-1 rounded-xl bg-[var(--app-navy)] py-2.5 text-sm font-medium text-[var(--app-white)] hover:opacity-90 disabled:opacity-50"
            >
              {saving ? tCommon("loading") : tBuilder("changeFrequency")}
            </button>
          </div>
        ) : step === "config" ? (
          <div className="flex gap-2 border-t border-[var(--app-border)] p-4">
            {!replaceTarget ? (
              <button
                type="button"
                onClick={handleBack}
                className="rounded-xl border border-[var(--app-border)] px-4 py-2.5 text-sm font-medium text-[var(--app-fg)] hover:bg-[var(--app-bg)]"
              >
                {tBuilder("back")}
              </button>
            ) : null}
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
              disabled={saving || (!replaceTarget && selectedDays.size === 0)}
              className="flex-1 rounded-xl bg-[var(--app-navy)] py-2.5 text-sm font-medium text-[var(--app-white)] hover:opacity-90 disabled:opacity-50"
            >
              {saving ? tBuilder("adding") : replaceTarget ? tBuilder("confirmReplace") : tBuilder("confirmAdd")}
            </button>
          </div>
        ) : null}
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  );
}

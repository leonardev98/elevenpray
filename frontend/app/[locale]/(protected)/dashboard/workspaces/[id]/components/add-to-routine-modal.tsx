"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { modalBackdrop, modalPanel } from "@/lib/animations";
import type { CatalogProductApi } from "../../../../../../lib/catalog-api";
import type { DayContent, DayGroup, DayItem, RoutineSlot } from "../../../../../../lib/routines-api";
import {
  getRoutineTemplatesByWorkspace,
  getRoutineTemplate,
  updateRoutineTemplate,
} from "../../../../../../lib/routine-templates-api";
import { createWorkspaceProduct } from "../../../../../../lib/workspace-products-api";
import type { ProductCategory } from "../../../../../../lib/workspace-products-api";
import { DAY_KEYS } from "../../../../../../lib/routine-builder";
import { toast } from "../../../../../../lib/toast";

export function AddToRoutineModal({
  product,
  workspaceId,
  token,
  onClose,
  onSuccess,
}: {
  product: CatalogProductApi;
  workspaceId: string;
  token: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const tDays = useTranslations("days");
  const tBuilder = useTranslations("routineBuilder");
  const tCommon = useTranslations("common");
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [slot, setSlot] = useState<RoutineSlot>("am");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toggleDay(dayKey: string) {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayKey)) next.delete(dayKey);
      else next.add(dayKey);
      return next;
    });
  }

  async function handleConfirm() {
    if (!token || selectedDays.size === 0) return;
    setSaving(true);
    setError("");
    try {
      const templates = await getRoutineTemplatesByWorkspace(token, workspaceId);
      const template = templates.find((t: { year: number; weekNumber: number }) => t.year === 0 && t.weekNumber === 0);
      if (!template) {
        setError("No hay plantilla de rutina. Crea una rutina primero.");
        setSaving(false);
        return;
      }
      const full = await getRoutineTemplate(token, template.id);
      const wp = await createWorkspaceProduct(token, workspaceId, {
        name: product.name,
        brand: product.brand ?? undefined,
        category: product.category as ProductCategory,
        status: "active",
        mainIngredients: product.ingredients ?? undefined,
        imageUrl: product.imageUrl ?? undefined,
      });
      function cloneDays(src: Record<string, DayContent>): Record<string, DayContent> {
        const out: Record<string, DayContent> = {};
        for (const k of DAY_KEYS) {
          const d = src[k];
          if (!d?.groups?.length) {
            out[k] = { groups: [] };
            continue;
          }
          out[k] = {
            groups: d.groups.map((g) => ({
              ...g,
              items: g.items ? g.items.map((i) => ({ ...i })) : [],
            })),
          };
        }
        return out;
      }

      const days = cloneDays(full.days);
      const newItemBase: Omit<DayItem, "id"> = {
        type: "text",
        content: product.name,
        productId: wp.id,
        stepType: product.category,
      };

      for (const dayKey of selectedDays) {
        const day = days[dayKey];
        if (!day) continue;
        const groups = day.groups ?? [];
        let group = groups.find((g) => g.slot === slot);
        if (!group) {
          group = {
            id: crypto.randomUUID(),
            title: slot === "am" ? "Mañana" : "Noche",
            slot,
            items: [],
          };
          groups.push(group);
        }
        group.items.push({
          ...newItemBase,
          id: crypto.randomUUID(),
        });
      }
      await updateRoutineTemplate(token, full.id, {
        weekLabel: full.weekLabel,
        year: full.year,
        weekNumber: full.weekNumber,
        days,
      });
      toast.success("Añadido a la rutina", `${product.name} se ha añadido a los días seleccionados.`);
      onSuccess?.();
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al añadir a rutina";
      setError(msg);
      toast.error("Error", msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-to-routine-title"
          onClick={(e) => e.target === e.currentTarget && onClose()}
          {...modalBackdrop}
        >
          <motion.div
            className="w-full max-w-md rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-xl"
            onClick={(e) => e.stopPropagation()}
            {...modalPanel}
          >
            <div className="border-b border-[var(--app-border)] px-4 py-3">
          <h2 id="add-to-routine-title" className="text-lg font-semibold text-[var(--app-fg)]">
            Añadir a rutina
          </h2>
          <p className="mt-0.5 text-sm text-[var(--app-fg)]/70">{product.name}</p>
        </div>
        <div className="space-y-4 p-4">
          <div>
            <p className="mb-2 text-sm font-medium text-[var(--app-fg)]">Horario</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSlot("am")}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition ${
                  slot === "am"
                    ? "border-[var(--app-navy)] bg-[var(--app-navy)]/15 text-[var(--app-navy)]"
                    : "border-[var(--app-border)] text-[var(--app-fg)]/80 hover:border-[var(--app-navy)]/40"
                }`}
              >
                {tBuilder("morning")}
              </button>
              <button
                type="button"
                onClick={() => setSlot("pm")}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition ${
                  slot === "pm"
                    ? "border-[var(--app-navy)] bg-[var(--app-navy)]/15 text-[var(--app-navy)]"
                    : "border-[var(--app-border)] text-[var(--app-fg)]/80 hover:border-[var(--app-navy)]/40"
                }`}
              >
                {tBuilder("night")}
              </button>
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-[var(--app-fg)]">Días</p>
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
          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
        <div className="flex gap-2 border-t border-[var(--app-border)] p-4">
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
            {saving ? "Añadiendo…" : "Añadir"}
          </button>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

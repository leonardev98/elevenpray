"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "../../../../../providers/auth-provider";
import { getRoutineTemplate, updateRoutineTemplate, type Routine } from "../../../../../lib/routine-templates-api";
import type { DayContent, RoutineMetadata } from "../../../../../lib/routines-api";
import { getWorkspaceProducts } from "../../../../../lib/workspace-products-api";
import { getWorkspacePreference, updateWorkspacePreference } from "../../../../../lib/workspace-preferences-api";
import { checkIngredientConflicts, type ConflictResultApi } from "../../../../../lib/ingredient-conflicts-api";
import {
  analyzeRoutine,
  applySuggestionToRoutine,
  buildStarterRoutine,
  DAY_KEYS,
  ensureAMPMGroups,
  getWeeklyIntentSummary,
  rebuildRoutineForBuilder,
  stepTypeToCategory,
  type DayKey,
} from "../../../../../lib/routine-builder";
import { getCatalogProducts } from "../../../../../lib/catalog-api";
import { RoutineIntelligencePanel } from "@/components/routines/routine-intelligence-panel";
import { RoutineHeader } from "./components/routine-header";
import { WeeklyRoutineGrid } from "./components/weekly-routine-grid";
import { AddProductToRoutineModal } from "./components/add-product-to-routine-modal";
import { AutoBuildRoutineDialog } from "./components/auto-build-routine-dialog";
import { RoutinePreviewPanel } from "./components/routine-preview-panel";
import { ClearRoutineConfirmModal } from "./components/clear-routine-confirm-modal";

export default function RoutineEditorPage() {
  const params = useParams();
  const id = params.id as string;
  const locale = useLocale() as "es" | "en";
  const { token } = useAuth();
  const tDays = useTranslations("days");
  const tBuilder = useTranslations("routineBuilder");

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [metadata, setMetadata] = useState<RoutineMetadata | null>(null);
  const [workspaceProducts, setWorkspaceProducts] = useState<Awaited<ReturnType<typeof getWorkspaceProducts>>>([]);
  const [ingredientConflicts, setIngredientConflicts] = useState<ConflictResultApi[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAutoBuildOpen, setIsAutoBuildOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isClearRoutineModalOpen, setIsClearRoutineModalOpen] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    setLoading(true);
    getRoutineTemplate(token, id)
      .then(async (response) => {
        const hydrated = rebuildRoutineForBuilder(response);
        setRoutine(hydrated);
        setMetadata(hydrated.metadata ?? null);
        if (!hydrated.workspaceId) return;

        const [workspacePreference, products] = await Promise.all([
          getWorkspacePreference(token, hydrated.workspaceId),
          getWorkspaceProducts(token, hydrated.workspaceId, { status: "active" }),
        ]);

        setWorkspaceProducts(products);
        const profile = (workspacePreference?.skincareProfile ?? null) as RoutineMetadata | null;
        if (profile && !hydrated.metadata) setMetadata(profile);

        const ingredients = [...new Set(products.flatMap((product) => product.mainIngredients ?? []))];
        if (ingredients.length > 0) {
          const conflicts = await checkIngredientConflicts(token, ingredients, locale);
          setIngredientConflicts(conflicts);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, id, locale]);

  const routineAnalysis = useMemo(
    () =>
      routine
        ? analyzeRoutine({ ...routine, metadata }, ingredientConflicts, metadata)
        : null,
    [routine, metadata, ingredientConflicts]
  );
  const intentLabelMap = useMemo(() => {
    const entries = getWeeklyIntentSummary(metadata);
    return Object.fromEntries(entries.map((entry) => [entry.dayKey, entry.label])) as Partial<Record<DayKey, string>>;
  }, [metadata]);

  const isEmptyRoutine = useMemo(() => {
    if (!routine?.days) return true;
    for (const dayKey of DAY_KEYS) {
      const day = routine.days[dayKey];
      const groups = day?.groups ?? [];
      for (const group of groups) {
        if (group.items?.length) return false;
      }
    }
    return true;
  }, [routine?.days]);

  const updateDay = (dayKey: DayKey, nextDay: DayContent) => {
    if (!routine) return;
    const withSlots = ensureAMPMGroups({ [dayKey]: nextDay })[dayKey];
    setRoutine({
      ...routine,
      days: {
        ...routine.days,
        [dayKey]: withSlots,
      },
    });
    setSaveStatus("idle");
  };

  const handleSave = async () => {
    if (!token || !routine) return;
    setSaveStatus("saving");
    setError("");
    try {
      await updateRoutineTemplate(token, routine.id, {
        weekLabel: routine.weekLabel,
        year: routine.year,
        weekNumber: routine.weekNumber,
        days: routine.days,
        metadata,
      });
      if (routine.workspaceId && metadata) {
        await updateWorkspacePreference(token, routine.workspaceId, {
          skincareProfile: metadata as Record<string, unknown>,
        });
      }
      setSaveStatus("saved");
    } catch (e) {
      setSaveStatus("error");
      setError(e instanceof Error ? e.message : "Error while saving");
    }
  };

  useEffect(() => {
    if (!routine) return;
    const timer = setTimeout(() => {
      if (saveStatus === "idle") {
        void handleSave();
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [routine, metadata]);

  const handleAutoBuild = async (mode: "scratch" | "smart-starter" | "skin-cycling" | "product-first") => {
    if (!routine) return;
    const built = buildStarterRoutine({
      mode,
      skinType: metadata?.skinType,
      goals: metadata?.goals ?? [],
      complexity: metadata?.complexity,
      preferredProducts: workspaceProducts,
    });
    let daysToSet = built.days;
    if (mode === "smart-starter" && token && routine.workspaceId) {
      const stepTypesNeeded = new Set<string>();
      for (const dayKey of DAY_KEYS) {
        const day = built.days[dayKey];
        for (const group of day?.groups ?? []) {
          for (const item of group.items ?? []) {
            if (!item.productId && item.stepType) stepTypesNeeded.add(item.stepType as string);
          }
        }
      }
      const categoryToProduct: Record<string, { id: string; name: string }> = {};
      for (const stepType of stepTypesNeeded) {
        try {
          const list = await getCatalogProducts(token, routine.workspaceId, {
            category: stepTypeToCategory(stepType as "cleanser" | "toner" | "serum" | "treatment" | "eye" | "moisturizer" | "sunscreen" | "mask" | "exfoliant" | "retinoid"),
          });
          if (list.length) categoryToProduct[stepType] = { id: list[0].id, name: list[0].name };
        } catch {
          // keep placeholder if catalog fails
        }
      }
      const nextDays: Record<string, DayContent> = {};
      for (const dayKey of DAY_KEYS) {
        const day = built.days[dayKey];
        if (!day?.groups) {
          nextDays[dayKey] = day ?? { groups: [] };
          continue;
        }
        nextDays[dayKey] = {
          groups: day.groups.map((group) => ({
            ...group,
            items: (group.items ?? []).map((item) => {
              if (item.productId) return item;
              const product = item.stepType ? categoryToProduct[item.stepType as string] : null;
              if (product) return { ...item, productId: product.id, content: product.name };
              return item;
            }),
          })),
        };
      }
      daysToSet = nextDays;
    }
    setRoutine({
      ...routine,
      days: daysToSet,
    });
    setMetadata((prev) => ({ ...(prev ?? {}), ...built.metadata }));
    setIsAutoBuildOpen(false);
    setSaveStatus("idle");
  };

  const handleAddProductSuccess = (nextRoutine: Routine) => {
    setRoutine(nextRoutine);
    setSaveStatus("idle");
  };

  const openClearRoutineModal = () => setIsClearRoutineModalOpen(true);

  const doClearRoutine = () => {
    if (!routine) return;
    const emptyDays: Record<string, DayContent> = {};
    for (const dayKey of DAY_KEYS) {
      const day = routine.days[dayKey];
      const groups = (day?.groups ?? []).map((group) => ({
        ...group,
        items: [] as typeof group.items,
      }));
      emptyDays[dayKey] = { groups };
    }
    setRoutine({ ...routine, days: emptyDays });
    setSaveStatus("idle");
  };

  if (loading || !routine) {
    return (
      <div className="flex justify-center py-8">
        <p className="text-[var(--app-fg)]/60">{loading ? tBuilder("loadingRoutine") : tBuilder("routineNotFound")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <RoutineHeader
        title={tBuilder("title")}
        subtitle={tBuilder("subtitle")}
        saveStatus={saveStatus}
        onSave={handleSave}
        onOpenPreview={() => setIsPreviewOpen(true)}
        onOpenAutoBuild={() => setIsAutoBuildOpen(true)}
        onClearRoutine={isEmptyRoutine ? undefined : openClearRoutineModal}
        backHref={routine?.workspaceId ? `/dashboard/workspaces/${routine.workspaceId}` : undefined}
        backLabel={routine?.workspaceId ? tBuilder("backToDashboard") : undefined}
      />

      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => setIsAddProductModalOpen(true)}
          className="w-fit rounded-[10px] border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-4 py-2.5 text-sm font-medium text-[var(--app-primary)] transition hover:bg-[var(--app-primary-soft)]/80"
        >
          {tBuilder("addProductToRoutine")}
        </button>
        <WeeklyRoutineGrid
          days={routine.days}
          intentLabels={intentLabelMap}
          dayNameByKey={(day) => tDays(day)}
          onUpdateDay={updateDay}
        />
      </div>

      {routineAnalysis && (
        <RoutineIntelligencePanel
          analysis={routineAnalysis}
          onApplySuggestion={(suggestion) => {
            if (!routine) return;
            const updated = applySuggestionToRoutine(routine, suggestion);
            if (updated) {
              setRoutine(updated);
              setSaveStatus("idle");
            }
          }}
        />
      )}

      {error ? (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      {routine.workspaceId && token ? (
        <AddProductToRoutineModal
          isOpen={isAddProductModalOpen}
          token={token}
          workspaceId={routine.workspaceId}
          routine={{ ...routine, metadata }}
          metadata={metadata}
          workspaceProducts={workspaceProducts}
          onClose={() => setIsAddProductModalOpen(false)}
          onSuccess={handleAddProductSuccess}
        />
      ) : null}

      <AutoBuildRoutineDialog
        isOpen={isAutoBuildOpen}
        onClose={() => setIsAutoBuildOpen(false)}
        onSelectMode={handleAutoBuild}
      />

      <RoutinePreviewPanel
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        days={routine.days}
        dayNameByKey={(day) => tDays(day)}
      />

      <ClearRoutineConfirmModal
        isOpen={isClearRoutineModalOpen}
        onClose={() => setIsClearRoutineModalOpen(false)}
        onConfirm={doClearRoutine}
      />
    </div>
  );
}

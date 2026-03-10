"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "../../../../../providers/auth-provider";
import { getRoutineTemplate, updateRoutineTemplate, type Routine } from "../../../../../lib/routine-templates-api";
import type { DayContent, RoutineMetadata } from "../../../../../lib/routines-api";
import { createWorkspaceProduct, getWorkspaceProducts } from "../../../../../lib/workspace-products-api";
import { getWorkspacePreference, updateWorkspacePreference } from "../../../../../lib/workspace-preferences-api";
import { checkIngredientConflicts, type ConflictResultApi } from "../../../../../lib/ingredient-conflicts-api";
import {
  buildStarterRoutine,
  detectRoutineConflicts,
  deriveRoutineInsights,
  ensureAMPMGroups,
  getWeeklyIntentSummary,
  rebuildRoutineForBuilder,
  upsertCatalogProductInRoutine,
  type DayKey,
} from "../../../../../lib/routine-builder";
import { RoutineHeader } from "./components/routine-header";
import { RoutineContextPanel } from "./components/routine-context-panel";
import { WeeklyRoutineGrid } from "./components/weekly-routine-grid";
import { AddProductDrawer } from "./components/add-product-drawer";
import { AutoBuildRoutineDialog } from "./components/auto-build-routine-dialog";
import { RoutinePreviewPanel } from "./components/routine-preview-panel";
import { ConflictWarnings } from "./components/conflict-warnings";
import { ClinicalInsights } from "./components/clinical-insights";

export default function RoutineEditorPage() {
  const params = useParams();
  const id = params.id as string;
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
  const [drawerState, setDrawerState] = useState<{ dayKey: DayKey; groupId: string; slot: "am" | "pm" } | null>(null);

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
          const conflicts = await checkIngredientConflicts(token, ingredients, "en");
          setIngredientConflicts(conflicts);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, id]);

  const insights = useMemo(() => (routine ? deriveRoutineInsights({ ...routine, metadata }) : []), [routine, metadata]);
  const conflictReport = useMemo(
    () =>
      routine
        ? detectRoutineConflicts({ ...routine, metadata }, ingredientConflicts)
        : { warnings: [], ingredientConflicts: [] },
    [routine, metadata, ingredientConflicts]
  );
  const intentLabelMap = useMemo(() => {
    const entries = getWeeklyIntentSummary(metadata);
    return Object.fromEntries(entries.map((entry) => [entry.dayKey, entry.label])) as Partial<Record<DayKey, string>>;
  }, [metadata]);

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
          skincareProfile: metadata,
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

  const handleAutoBuild = (mode: "scratch" | "smart-starter" | "skin-cycling" | "product-first") => {
    if (!routine) return;
    const built = buildStarterRoutine({
      mode,
      skinType: metadata?.skinType,
      goals: metadata?.goals ?? [],
      complexity: metadata?.complexity,
      preferredProducts: workspaceProducts,
    });
    setRoutine({
      ...routine,
      days: built.days,
    });
    setMetadata((prev) => ({ ...(prev ?? {}), ...built.metadata }));
    setIsAutoBuildOpen(false);
    setSaveStatus("idle");
  };

  const handleSelectCatalogProduct = async (product: {
    id: string;
    name: string;
    brand: string | null;
    category: string;
    ingredients?: string[] | null;
    imageUrl?: string | null;
  }) => {
    if (!token || !routine || !routine.workspaceId || !drawerState) return;
    const created = await createWorkspaceProduct(token, routine.workspaceId, {
      name: product.name,
      brand: product.brand ?? undefined,
      category: product.category as never,
      status: "active",
      mainIngredients: product.ingredients ?? undefined,
      imageUrl: product.imageUrl ?? undefined,
    });
    const nextRoutine = upsertCatalogProductInRoutine({ ...routine, metadata }, {
      dayKey: drawerState.dayKey,
      groupId: drawerState.groupId,
      slot: drawerState.slot,
      product: { ...product, id: created.id },
    });
    setRoutine(nextRoutine);
    setSaveStatus("idle");
    setDrawerState(null);
  };

  if (loading || !routine) {
    return (
      <div className="flex justify-center py-8">
        <p className="text-[var(--app-fg)]/60">{loading ? "Loading routine..." : "Routine not found"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RoutineHeader
        title={tBuilder("title")}
        subtitle={tBuilder("subtitle")}
        saveStatus={saveStatus}
        onSave={handleSave}
        onOpenPreview={() => setIsPreviewOpen(true)}
        onOpenAutoBuild={() => setIsAutoBuildOpen(true)}
      />

      <WeeklyRoutineGrid
        days={routine.days}
        intentLabels={intentLabelMap}
        dayNameByKey={(day) => tDays(day)}
        onUpdateDay={updateDay}
        onOpenAddProduct={(dayKey, groupId, slot) => setDrawerState({ dayKey, groupId, slot })}
      />

      <RoutineContextPanel
        metadata={metadata}
        onMetadataChange={(next) => {
          setMetadata(next);
          setSaveStatus("idle");
        }}
      />

      <ClinicalInsights insights={insights} />
      <ConflictWarnings report={conflictReport} />

      {error ? (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      {routine.workspaceId ? (
        <AddProductDrawer
          isOpen={!!drawerState}
          token={token ?? ""}
          workspaceId={routine.workspaceId}
          slot={drawerState?.slot ?? "am"}
          metadata={metadata}
          onClose={() => setDrawerState(null)}
          onSelect={handleSelectCatalogProduct}
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
    </div>
  );
}

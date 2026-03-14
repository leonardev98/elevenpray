"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { modalBackdrop, modalPanel } from "@/lib/animations";
import { useAuth } from "../../../../../providers/auth-provider";
import { getWorkspace } from "../../../../../lib/workspaces-api";
import {
  getWorkspacePreference,
  getPreferences,
  updateWorkspacePreference,
} from "../../../../../lib/workspace-preferences-api";
import {
  hasRoutineCapability,
  hasProductVaultCapability,
  hasCheckinsCapability,
  hasProgressPhotosCapability,
  hasInsightsCapability,
  hasExpertConsultationCapability,
  hasKnowledgeHubCapability,
  hasVideoGuidesCapability,
} from "../../../../../lib/workspace-type-registry";
import { getWorkspaceNavSections, getActiveSection } from "../../../../../lib/workspace-navigation";
import type { WorkspaceApi } from "../../../../../lib/workspaces-api";
import type { WorkspacePreferenceApi } from "../../../../../lib/workspace-preferences-api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkspaceNav } from "./components/workspace-nav";
import { WorkspaceSubNav } from "./components/workspace-sub-nav";
import { WorkspaceSkincareAside } from "./components/workspace-skincare-aside";
import {
  SkinProfileOnboarding,
  parseSkinProfileFromPreference,
} from "./components/skin-profile-onboarding";

function GenericOnboardingModal({
  workspaceId,
  onComplete,
}: {
  workspaceId: string;
  onComplete: () => void;
}) {
  const { token } = useAuth();
  const t = useTranslations("workspace");
  const [level, setLevel] = useState<string>("beginner");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      await updateWorkspacePreference(token, workspaceId, {
        completeOnboarding: true,
        onboardingAnswers: { level },
      });
      onComplete();
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        key="generic-onboarding-modal"
        role="presentation"
        className="fixed inset-0 z-50 bg-black/50"
        aria-hidden
        {...modalBackdrop}
      />
      <motion.div
        key="generic-onboarding-panel"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-xl"
        role="dialog"
        aria-labelledby="onboarding-title"
        {...modalPanel}
      >
        <h2 id="onboarding-title" className="mb-2 text-lg font-semibold text-[var(--app-fg)]">
          {t("onboardingTitle")}
        </h2>
        <p className="mb-4 text-sm text-[var(--app-fg)]/70">
          {t("onboardingDescription")}
        </p>
        <form onSubmit={handleSubmit}>
          <label className="mb-1 block text-xs font-medium text-[var(--app-fg)]/70">
            {t("level")}
          </label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="mb-4 w-full">
              <SelectValue placeholder={t("selectLevel")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">{t("experienceBeginner")}</SelectItem>
              <SelectItem value="intermediate">{t("experienceIntermediate")}</SelectItem>
              <SelectItem value="advanced">{t("experienceAdvanced")}</SelectItem>
            </SelectContent>
          </Select>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-[var(--app-navy)] py-2 text-sm font-medium text-[var(--app-white)] hover:opacity-90 disabled:opacity-50"
          >
            {saving ? t("saving") : t("start")}
          </button>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}

/** Normaliza preferencia por si el backend devuelve snake_case */
function normalizePreference(p: WorkspacePreferenceApi | Record<string, unknown>): WorkspacePreferenceApi {
  const raw = p as Record<string, unknown>;
  return {
    ...(p as WorkspacePreferenceApi),
    onboardingCompletedAt:
      (p as WorkspacePreferenceApi).onboardingCompletedAt ?? (raw.onboarding_completed_at as string) ?? null,
    onboardingAnswers:
      (p as WorkspacePreferenceApi).onboardingAnswers ?? (raw.onboarding_answers as Record<string, unknown>) ?? null,
    skincareProfile:
      (p as WorkspacePreferenceApi).skincareProfile ?? (raw.skincare_profile as Record<string, unknown>) ?? null,
  };
}

const SKIN_ONBOARDING_STORAGE_KEY = (workspaceId: string) =>
  `elevenpray_skin_onboarding_done_${workspaceId}`;

function hasExistingSkinProfile(pref: WorkspacePreferenceApi | null): boolean {
  if (!pref) return false;
  const answers = pref.onboardingAnswers;
  if (answers && typeof answers === "object") {
    if (answers.skinType || (answers as Record<string, unknown>).skin_type) return true;
    if (answers.sensitivityLevel || (answers as Record<string, unknown>).sensitivity_level) return true;
  }
  const skin = pref.skincareProfile;
  if (skin && typeof skin === "object" && Object.keys(skin).length > 0) return true;
  return false;
}

export default function WorkspaceIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const workspaceId = params.id as string;
  const { token } = useAuth();
  const [workspace, setWorkspace] = useState<WorkspaceApi | null>(null);
  const [preference, setPreference] = useState<WorkspacePreferenceApi | null>(null);
  const [preferenceLoaded, setPreferenceLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [onboardingClosed, setOnboardingClosed] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [localStorageSaysOnboardingDone, setLocalStorageSaysOnboardingDone] = useState(false);
  const tWorkspaceNav = useTranslations("workspaceNav");

  useEffect(() => {
    if (!workspaceId || typeof window === "undefined") return;
    setLocalStorageSaysOnboardingDone(
      localStorage.getItem(SKIN_ONBOARDING_STORAGE_KEY(workspaceId)) === "1"
    );
  }, [workspaceId]);

  useEffect(() => {
    if (!token || !workspaceId) return;
    getWorkspace(token, workspaceId)
      .then(setWorkspace)
      .catch(() => setWorkspace(null))
      .finally(() => setLoading(false));
  }, [token, workspaceId]);

  // Developer OS: redirect workspace "programador" to the premium developer dashboard
  useEffect(() => {
    if (!workspace || loading) return;
    const subtype = workspace.workspaceSubtype ?? (workspace as { workspace_subtype?: { code?: string } }).workspace_subtype;
    const code = subtype?.code?.toLowerCase();
    if (code === "programador" || code === "programmer") {
      router.replace("/workspace/developer");
    }
  }, [workspace, loading, router]);

  useEffect(() => {
    if (!token || !workspaceId || !workspace) return;
    const hasSectionNav =
      hasProductVaultCapability(workspace.workspaceType) ||
      hasCheckinsCapability(workspace.workspaceType) ||
      hasProgressPhotosCapability(workspace.workspaceType) ||
      hasInsightsCapability(workspace.workspaceType) ||
      hasExpertConsultationCapability(workspace.workspaceType) ||
      hasKnowledgeHubCapability(workspace.workspaceType) ||
      hasVideoGuidesCapability(workspace.workspaceType);
    if (!hasSectionNav) {
      setPreferenceLoaded(true);
      return;
    }
    function setPreferenceFromList(list: WorkspacePreferenceApi[]) {
      const found = list.find((pr) => pr.workspaceId === workspaceId);
      setPreference(found ? normalizePreference(found) : null);
    }

    getWorkspacePreference(token, workspaceId)
      .then((p) => {
        if (p) {
          setPreference(normalizePreference(p));
          setPreferenceLoaded(true);
        } else {
          getPreferences(token)
            .then(setPreferenceFromList)
            .catch(() => setPreference(null))
            .finally(() => setPreferenceLoaded(true));
        }
      })
      .catch(() => {
        getPreferences(token)
          .then(setPreferenceFromList)
          .catch(() => setPreference(null))
          .finally(() => setPreferenceLoaded(true));
      });
  }, [token, workspaceId, workspace]);

  const hasSectionNav =
    workspace &&
    (hasRoutineCapability(workspace.workspaceType) ||
      hasProductVaultCapability(workspace.workspaceType) ||
      hasCheckinsCapability(workspace.workspaceType) ||
      hasProgressPhotosCapability(workspace.workspaceType) ||
      hasInsightsCapability(workspace.workspaceType) ||
      hasExpertConsultationCapability(workspace.workspaceType) ||
      hasKnowledgeHubCapability(workspace.workspaceType) ||
      hasVideoGuidesCapability(workspace.workspaceType));
  const hasCompletedOrExistingProfile =
    preference?.onboardingCompletedAt || hasExistingSkinProfile(preference);
  const showOnboarding =
    hasSectionNav &&
    preferenceLoaded &&
    !onboardingClosed &&
    !hasCompletedOrExistingProfile &&
    !localStorageSaysOnboardingDone;
  const isSkincareWorkspace = workspace?.workspaceType === "skincare";

  useEffect(() => {
    if (
      isSkincareWorkspace &&
      workspaceId &&
      hasCompletedOrExistingProfile &&
      typeof window !== "undefined"
    ) {
      localStorage.setItem(SKIN_ONBOARDING_STORAGE_KEY(workspaceId), "1");
      setLocalStorageSaysOnboardingDone(true);
    }
  }, [isSkincareWorkspace, workspaceId, hasCompletedOrExistingProfile]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <p className="text-[var(--app-fg)]/60">Cargando…</p>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex justify-center py-8">
        <p className="text-[var(--app-fg)]/60">Workspace no encontrado</p>
      </div>
    );
  }

  const pathSegments = pathname.replace(/\/$/, "").split("/").filter(Boolean);
  const lastSegment = pathSegments[pathSegments.length - 1];
  const isLearningPage = lastSegment === "knowledge" || lastSegment === "videos";
  const isSkincareWorkspaceOverview =
    isSkincareWorkspace && pathSegments[pathSegments.length - 1] === workspaceId;

  const base = `/dashboard/workspaces/${workspaceId}`;
  const sections = getWorkspaceNavSections(workspace.workspaceType);
  const activeSection = getActiveSection(sections, pathname, base);
  const isCatalogPage = pathname.endsWith("/products") || pathname.endsWith("/library");

  return (
    <div className="flex flex-col lg:flex-row lg:gap-5">
      {showOnboarding &&
        (isSkincareWorkspace ? (
          <SkinProfileOnboarding
            workspaceId={workspaceId}
            onComplete={async () => {
              setOnboardingClosed(true);
              if (workspaceId && typeof window !== "undefined") {
                localStorage.setItem(SKIN_ONBOARDING_STORAGE_KEY(workspaceId), "1");
                setLocalStorageSaysOnboardingDone(true);
              }
              if (token) {
                const updated = await getWorkspacePreference(token, workspaceId);
                if (updated) setPreference(normalizePreference(updated));
              }
            }}
            onAlreadyDone={() => {
              setOnboardingClosed(true);
              if (workspaceId && typeof window !== "undefined") {
                localStorage.setItem(SKIN_ONBOARDING_STORAGE_KEY(workspaceId), "1");
                setLocalStorageSaysOnboardingDone(true);
              }
            }}
          />
        ) : (
          <GenericOnboardingModal
            workspaceId={workspaceId}
            onComplete={async () => {
              setOnboardingClosed(true);
              if (token) {
                const updated = await getWorkspacePreference(token, workspaceId);
                if (updated) setPreference(updated);
              }
            }}
          />
        ))}
      {editProfileOpen && isSkincareWorkspace && (
        <SkinProfileOnboarding
          workspaceId={workspaceId}
          mode="edit"
          initialData={parseSkinProfileFromPreference(
            (preference?.onboardingAnswers ?? preference?.skincareProfile) as
              | Record<string, unknown>
              | null
              | undefined
          )}
          onComplete={async () => {
            setEditProfileOpen(false);
            if (token) {
              const updated = await getWorkspacePreference(token, workspaceId);
              if (updated) setPreference(updated);
            }
          }}
          onClose={() => setEditProfileOpen(false)}
        />
      )}
      {/* Contenedor principal: pestañas + contenido */}
      <div className="min-w-0 flex-1 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm overflow-hidden flex flex-col">
        {/* Pestañas principales (siempre visibles) */}
        <div className="flex-shrink-0 border-b border-[var(--app-border)] bg-[var(--app-bg)]/80">
          <div className="p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <WorkspaceNav workspaceId={workspaceId} workspace={workspace} />
                {activeSection?.children?.length ? (
                  <WorkspaceSubNav workspaceId={workspaceId} section={activeSection} />
                ) : null}
              </div>
              {isSkincareWorkspace ? (
                <button
                  type="button"
                  onClick={() => setEditProfileOpen(true)}
                  className="shrink-0 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-xs font-medium text-[var(--app-fg)]/80 transition hover:border-[var(--app-navy)]/50 hover:text-[var(--app-navy)]"
                >
                  {tWorkspaceNav("editSkinProfile")}
                </button>
              ) : null}
            </div>
          </div>
        </div>
        {/* Contenido de la sección (scroll independiente) */}
        <div
          className={`flex-1 min-h-0 overflow-auto ${
            isCatalogPage ? "px-3 py-5 sm:px-4 lg:px-5 lg:py-6" : "p-5 lg:p-6"
          }`}
        >
          {children}
        </div>
      </div>
      {isSkincareWorkspaceOverview && (
        <WorkspaceSkincareAside workspaceId={workspaceId} preference={preference} />
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useAuth } from "../../../../../providers/auth-provider";
import { getWorkspace } from "../../../../../lib/workspaces-api";
import { getWorkspacePreference, updateWorkspacePreference } from "../../../../../lib/workspace-preferences-api";
import {
  hasRoutineCapability,
  hasProductVaultCapability,
  hasCheckinsCapability,
  hasProgressPhotosCapability,
  hasInsightsCapability,
  hasExpertConsultationCapability,
} from "../../../../../lib/workspace-type-registry";
import type { WorkspaceApi } from "../../../../../lib/workspaces-api";

function WorkspaceNav({
  workspaceId,
  workspace,
}: {
  workspaceId: string;
  workspace: WorkspaceApi;
}) {
  const pathname = usePathname();
  const base = `/dashboard/workspaces/${workspaceId}`;
  const hasRoutine = hasRoutineCapability(workspace.workspaceType);
  const hasProductVault = hasProductVaultCapability(workspace.workspaceType);
  const hasCheckins = hasCheckinsCapability(workspace.workspaceType);
  const hasProgressPhotos = hasProgressPhotosCapability(workspace.workspaceType);
  const hasInsights = hasInsightsCapability(workspace.workspaceType);
  const hasExpertConsultation = hasExpertConsultationCapability(workspace.workspaceType);
  const hasSectionNav =
    hasRoutine || hasProductVault || hasCheckins || hasProgressPhotos || hasInsights || hasExpertConsultation;

  if (!hasSectionNav) return null;

  const navItems: { href: string; label: string }[] = [{ href: base, label: "Overview" }];
  if (hasRoutine) navItems.push({ href: `${base}/routine`, label: "Rutina" });
  if (hasProductVault) navItems.push({ href: `${base}/products`, label: "Productos" });
  if (hasCheckins) navItems.push({ href: `${base}/journal`, label: "Journal" });
  if (hasProgressPhotos) navItems.push({ href: `${base}/photos`, label: "Fotos" });
  navItems.push({ href: `${base}/library`, label: "Library" });
  if (hasInsights) navItems.push({ href: `${base}/insights`, label: "Insights" });
  if (hasExpertConsultation) navItems.push({ href: `${base}/experts`, label: "Expertos" });

  return (
    <nav
      className="mb-6 flex flex-wrap gap-1 border-b border-[var(--app-border)] pb-4"
      aria-label="Workspace sections"
    >
      {navItems.map(({ href, label }) => {
        const isActive =
          href === base ? pathname === base : pathname.startsWith(href + "/") || pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-[var(--app-navy)] text-white"
                : "text-[var(--app-fg)] hover:bg-[var(--app-surface)] hover:text-[var(--app-gold)]"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function OnboardingModal({
  workspaceId,
  onComplete,
}: {
  workspaceId: string;
  onComplete: () => void;
}) {
  const { token } = useAuth();
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
    <>
      <div role="presentation" className="fixed inset-0 z-50 bg-black/50" aria-hidden />
      <div
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-xl"
        role="dialog"
        aria-labelledby="onboarding-title"
      >
        <h2 id="onboarding-title" className="mb-2 text-lg font-semibold text-[var(--app-fg)]">
          Configura tu espacio
        </h2>
        <p className="mb-4 text-sm text-[var(--app-fg)]/70">
          Introduce un producto nuevo a la vez y haz patch test cuando sea posible.
        </p>
        <form onSubmit={handleSubmit}>
          <label className="mb-1 block text-xs font-medium text-[var(--app-fg)]/70">
            Nivel
          </label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="mb-4 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-fg)] focus:border-[var(--app-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--app-gold)]"
          >
            <option value="beginner">Principiante</option>
            <option value="intermediate">Intermedio</option>
            <option value="advanced">Avanzado</option>
          </select>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-[var(--app-gold)] py-2 text-sm font-medium text-[var(--app-black)] hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Empezar"}
          </button>
        </form>
      </div>
    </>
  );
}

export default function WorkspaceIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const workspaceId = params.id as string;
  const { token } = useAuth();
  const [workspace, setWorkspace] = useState<WorkspaceApi | null>(null);
  const [preference, setPreference] = useState<{ onboardingCompletedAt: string | null } | null>(
    null
  );
  const [preferenceLoaded, setPreferenceLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [onboardingClosed, setOnboardingClosed] = useState(false);

  useEffect(() => {
    if (!token || !workspaceId) return;
    getWorkspace(token, workspaceId)
      .then(setWorkspace)
      .catch(() => setWorkspace(null))
      .finally(() => setLoading(false));
  }, [token, workspaceId]);

  useEffect(() => {
    if (!token || !workspaceId || !workspace) return;
    const hasSectionNav =
      hasProductVaultCapability(workspace.workspaceType) ||
      hasCheckinsCapability(workspace.workspaceType) ||
      hasProgressPhotosCapability(workspace.workspaceType) ||
      hasInsightsCapability(workspace.workspaceType) ||
      hasExpertConsultationCapability(workspace.workspaceType);
    if (!hasSectionNav) {
      setPreferenceLoaded(true);
      return;
    }
    getWorkspacePreference(token, workspaceId)
      .then((p) => {
        setPreference(p);
        setPreferenceLoaded(true);
      })
      .catch(() => {
        setPreference(null);
        setPreferenceLoaded(true);
      });
  }, [token, workspaceId, workspace]);

  const hasSectionNav =
    workspace &&
    (hasRoutineCapability(workspace.workspaceType) ||
      hasProductVaultCapability(workspace.workspaceType) ||
      hasCheckinsCapability(workspace.workspaceType) ||
      hasProgressPhotosCapability(workspace.workspaceType) ||
      hasInsightsCapability(workspace.workspaceType) ||
      hasExpertConsultationCapability(workspace.workspaceType));
  const showOnboarding =
    hasSectionNav &&
    preferenceLoaded &&
    !onboardingClosed &&
    (preference === null || !preference.onboardingCompletedAt);

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

  return (
    <div>
      {showOnboarding && (
        <OnboardingModal
          workspaceId={workspaceId}
          onComplete={() => {
            setPreference({ onboardingCompletedAt: new Date().toISOString() });
            setOnboardingClosed(true);
          }}
        />
      )}
      <WorkspaceNav workspaceId={workspaceId} workspace={workspace} />
      {children}
    </div>
  );
}

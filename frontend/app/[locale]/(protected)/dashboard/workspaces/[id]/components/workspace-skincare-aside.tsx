"use client";

import {
  parseSkinProfileFromPreference,
  type SkinProfileAnswers,
} from "./skin-profile-onboarding";
import { RoutineStreakCard } from "./routine-streak-card";
import { SkinStatusCard } from "./skin-status-card";
import { QuickActionsCard } from "./quick-actions-card";
import { SkinProgressMiniCard } from "./skin-progress-mini-card";

interface WorkspaceSkincareAsideProps {
  workspaceId: string;
  /** Workspace preference for skin profile and last updated */
  preference: { skincareProfile?: Record<string, unknown> | null; onboardingAnswers?: Record<string, unknown> | null; updatedAt?: string | null } | null;
}

export function WorkspaceSkincareAside({ workspaceId, preference }: WorkspaceSkincareAsideProps) {
  const profile = parseSkinProfileFromPreference(
    (preference?.skincareProfile ?? preference?.onboardingAnswers) as Record<string, unknown> | null
  );
  const lastUpdated = preference?.updatedAt ?? null;

  return (
    <aside
      className="hidden w-full flex-shrink-0 flex-col gap-4 lg:flex lg:w-72 xl:w-80"
      aria-label="Contexto de rutina y piel"
    >
      <RoutineStreakCard workspaceId={workspaceId} />
      <SkinStatusCard profile={profile} lastUpdated={lastUpdated} />
      <QuickActionsCard workspaceId={workspaceId} />
      <SkinProgressMiniCard workspaceId={workspaceId} />
    </aside>
  );
}

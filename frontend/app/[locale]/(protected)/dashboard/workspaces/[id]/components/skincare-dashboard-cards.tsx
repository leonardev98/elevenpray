"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../../../../providers/auth-provider";
import { getWorkspacePhotos } from "../../../../../../lib/workspace-photos-api";
import { TodayRoutineHeroCard } from "./today-routine-hero-card";
import { SkinProgressCard } from "./skin-progress-card";
import { SkinInsightsCard } from "./skin-insights-card";
import { CompletionCelebration } from "./completion-celebration";

interface SkincareDashboardCardsProps {
  workspaceId: string;
}

export function SkincareDashboardCards({ workspaceId }: SkincareDashboardCardsProps) {
  const { token } = useAuth();
  const [photosCount, setPhotosCount] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (!token || !workspaceId) return;
    getWorkspacePhotos(token, workspaceId)
      .then((list) => setPhotosCount(list.length))
      .catch(() => {});
  }, [token, workspaceId]);

  const handleRoutineComplete = useCallback(() => {
    setShowCelebration(true);
  }, []);

  return (
    <div className="space-y-6">
      <CompletionCelebration
        show={showCelebration}
        onClose={() => setShowCelebration(false)}
      />

      {/* 1. TodayRoutineHeroCard — primary focus, most prominent */}
      <TodayRoutineHeroCard workspaceId={workspaceId} onRoutineComplete={handleRoutineComplete} />

      {/* 2. SkinProgressCard — journal + photo progress */}
      <SkinProgressCard workspaceId={workspaceId} />

      {/* 3. SkinInsightsCard — AI insights from routine and journal */}
      <SkinInsightsCard workspaceId={workspaceId} photosCount={photosCount} />
    </div>
  );
}

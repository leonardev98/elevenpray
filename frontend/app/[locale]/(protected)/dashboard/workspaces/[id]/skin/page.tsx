"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "../../../../../../providers/auth-provider";
import { getWorkspaceCheckins } from "../../../../../../lib/workspace-checkins-api";
import { getWorkspacePhotos } from "../../../../../../lib/workspace-photos-api";
import { SkinCheckinCard } from "../components/skin-checkin-card";
import { SkinHealthScore } from "../components/skin-health-score";
import { SkinInsights } from "../components/skin-insights";
import { SkinProgressChart } from "../components/skin-progress-chart";
import { SkinTimeline } from "../components/skin-timeline";
import { UnderConstructionOverlay } from "../components/under-construction-overlay";
import type { WorkspaceCheckinApi } from "../../../../../../lib/workspace-checkins-api";
import type { WorkspacePhotoApi } from "../../../../../../lib/workspace-photos-api";
import type { FaceMapZoneValue } from "../components/face-map-editor";

const FaceMapEditor = dynamic(
  () =>
    import("../components/face-map-editor").then((m) => ({ default: m.FaceMapEditor })),
  { ssr: false }
);

export default function SkinPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const { token } = useAuth();
  const t = useTranslations("workspaceNav");
  const tPage = useTranslations("skinPage");

  const [checkins, setCheckins] = useState<WorkspaceCheckinApi[]>([]);
  const [photos, setPhotos] = useState<WorkspacePhotoApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [faceMapZones, setFaceMapZones] = useState<FaceMapZoneValue[]>([]);

  function loadData() {
    if (!token || !workspaceId) return;
    const to = new Date().toISOString().slice(0, 10);
    const from = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    setLoading(true);
    Promise.all([
      getWorkspaceCheckins(token, workspaceId, { from, to }),
      getWorkspacePhotos(token, workspaceId, { from, to }),
    ])
      .then(([cList, pList]) => {
        setCheckins(cList);
        setPhotos(pList);
      })
      .catch(() => {
        setCheckins([]);
        setPhotos([]);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, [token, workspaceId]);

  const today = new Date().toISOString().slice(0, 10);
  const todayCheckin = checkins.find((c) => c.checkinDate === today);

  // Sincronizar mapa facial con el check-in de hoy si existe
  useEffect(() => {
    const todayEntry = checkins.find((c) => c.checkinDate === today);
    const zones = (todayEntry?.data?.faceMapZones as FaceMapZoneValue[] | undefined) ?? [];
    if (zones.length > 0 && faceMapZones.length === 0) {
      setFaceMapZones(
        zones.map((z) => ({
          zone: z.zone as FaceMapZoneValue["zone"],
          type: z.type as FaceMapZoneValue["type"],
          severity: z.severity,
        }))
      );
    }
  }, [checkins, today]);

  return (
    <UnderConstructionOverlay>
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-[var(--app-fg)]">
          {tPage("title")}
        </h1>
        <p className="mt-0.5 text-sm text-[var(--app-fg)]/70">
          {tPage("subtitle")}
        </p>
      </header>

      {loading ? (
        <div className="py-12 text-center text-sm text-[var(--app-fg)]/60">
          {t("loadingInsights")}
        </div>
      ) : (
        <>
          {/* Grid 2 columnas */}
          <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
            {/* Columna izquierda */}
            <div className="space-y-6">
              <SkinCheckinCard
                workspaceId={workspaceId}
                onSaved={loadData}
                initialData={todayCheckin?.data ?? undefined}
                faceMapZones={faceMapZones.map((z) => ({
                  zone: z.zone,
                  type: z.type,
                  severity: z.severity,
                }))}
              />
              <FaceMapEditor
                zones={faceMapZones}
                onChange={setFaceMapZones}
                showWhenEmpty
              />
            </div>

            {/* Columna derecha */}
            <div className="space-y-6">
              <SkinHealthScore
                checkinData={todayCheckin?.data ?? null}
                dateLabel={todayCheckin ? tPage("todayScore") : undefined}
              />
              <SkinInsights checkins={checkins} />
              <SkinProgressChart checkins={checkins} />
            </div>
          </div>

          {/* Timeline debajo */}
          <SkinTimeline checkins={checkins} photos={photos} />
        </>
      )}
    </div>
    </UnderConstructionOverlay>
  );
}

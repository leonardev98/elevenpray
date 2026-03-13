"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  getFaceMarkers,
  createFaceMarker,
  updateFaceMarker,
  deleteFaceMarker,
} from "@/app/lib/skincare/face-map-api";
import type {
  FaceMarkerApi,
  CreateMarkerDto,
  UpdateMarkerDto,
} from "@/app/lib/skincare/face-map/face-map.types";
import { FaceMapCanvas } from "./FaceMapCanvas";
import { FaceMapToolbar } from "./FaceMapToolbar";
import { FaceMapInspector } from "./FaceMapInspector";
import { FaceMapIssueForm, type FaceMapIssueFormMode } from "./FaceMapIssueForm";
import { FaceMapEmptyState } from "./FaceMapEmptyState";
import {
  FaceMapTimeline,
  getDateRangeFromTimeline,
  type TimelineRange,
} from "./FaceMapTimeline";
import { FaceMapPhotoImport } from "./FaceMapPhotoImport";

interface FaceMapProps {
  workspaceId: string;
  token: string | null;
}

export function FaceMap({ workspaceId, token }: FaceMapProps) {
  const t = useTranslations("workspaceNav");
  const [markers, setMarkers] = useState<FaceMarkerApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [faceModelType, setFaceModelType] = useState<"female" | "male">("female");
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FaceMapIssueFormMode | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [timelineRange, setTimelineRange] = useState<TimelineRange>("all");
  const [photoImportOpen, setPhotoImportOpen] = useState(false);

  const dateRange = getDateRangeFromTimeline(timelineRange);

  const loadMarkers = useCallback(() => {
    if (!token || !workspaceId) return;
    setLoading(true);
    setError("");
    getFaceMarkers(token, workspaceId, {
      faceModelType,
      ...dateRange,
    })
      .then(setMarkers)
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar"))
      .finally(() => setLoading(false));
  }, [token, workspaceId, faceModelType, dateRange.from, dateRange.to]);

  useEffect(() => {
    loadMarkers();
  }, [loadMarkers]);

  const handleAddMarkerClick = useCallback(() => {
    setFormMode({
      type: "create",
      xPercent: 50,
      yPercent: 50,
    });
    setSelectedMarkerId(null);
  }, []);

  const handleMarkerClick = useCallback((id: string) => {
    setSelectedMarkerId(id);
    setFormMode(null);
  }, []);

  const handlePhotoImportSelect = useCallback(
    (payload: { xPercent: number; yPercent: number; photoUrl: string }) => {
      setPhotoImportOpen(false);
      setFormMode({
        type: "create",
        xPercent: payload.xPercent,
        yPercent: payload.yPercent,
        photoUrl: payload.photoUrl,
      });
      setSelectedMarkerId(null);
    },
    []
  );

  const handleCreateMarker = useCallback(
    async (dto: CreateMarkerDto) => {
      if (!token || !workspaceId) return;
      setSaving(true);
      try {
        const created = await createFaceMarker(token, workspaceId, dto);
        setMarkers((prev) => [created, ...prev]);
        setFormMode(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al crear");
      } finally {
        setSaving(false);
      }
    },
    [token, workspaceId]
  );

  const handleUpdateMarker = useCallback(
    async (
      markerId: string,
      dto: {
        issueType?: CreateMarkerDto["issueType"];
        severity?: CreateMarkerDto["severity"];
        notes?: string | null;
        photoUrl?: string | null;
      }
    ) => {
      if (!token || !workspaceId) return;
      setSaving(true);
      try {
        const updated = await updateFaceMarker(token, workspaceId, markerId, dto as UpdateMarkerDto);
        setMarkers((prev) => prev.map((m) => (m.id === markerId ? updated : m)));
        setFormMode(null);
        setSelectedMarkerId(markerId);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al actualizar");
      } finally {
        setSaving(false);
      }
    },
    [token, workspaceId]
  );

  const handleDeleteMarker = useCallback(
    async (markerId: string) => {
      if (!token || !workspaceId) return;
      setDeletingId(markerId);
      try {
        await deleteFaceMarker(token, workspaceId, markerId);
        setMarkers((prev) => prev.filter((m) => m.id !== markerId));
        if (selectedMarkerId === markerId) setSelectedMarkerId(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al eliminar");
      } finally {
        setDeletingId(null);
      }
    },
    [token, workspaceId, selectedMarkerId]
  );

  if (!token) {
    return (
      <div className="py-8 text-center text-sm text-[var(--app-fg)]/60">
        Inicia sesión para usar el mapa facial.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-normal text-[var(--app-fg)]">
          {t("faceMapping")}
        </h1>
        <FaceMapTimeline range={timelineRange} onRangeChange={setTimelineRange} />
      </div>

      {error && (
        <div className="rounded-xl border border-[var(--destructive)]/30 bg-[var(--destructive)]/10 px-4 py-3 text-sm text-[var(--destructive)]">
          {error}
        </div>
      )}

      <FaceMapToolbar
        onAddMarker={handleAddMarkerClick}
        onImportFromPhoto={() => setPhotoImportOpen(true)}
      />

      <div className="grid min-h-[400px] grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)]">
              <div className="app-loading-spinner" aria-hidden />
              <span className="sr-only">Cargando mapa facial…</span>
            </div>
          ) : (
            <FaceMapCanvas
              faceModelType={faceModelType}
              markers={markers}
              selectedMarkerId={selectedMarkerId}
              onMarkerClick={handleMarkerClick}
            />
          )}
          {!loading && markers.length === 0 && !formMode && (
            <FaceMapEmptyState onAddMarker={handleAddMarkerClick} />
          )}
        </div>
        <div className="min-h-[200px] lg:min-h-0">
          <FaceMapInspector
            markers={markers}
            faceModelType={faceModelType}
            selectedMarkerId={selectedMarkerId}
            onSelectMarker={setSelectedMarkerId}
            onEditMarker={(m) => setFormMode({ type: "edit", marker: m })}
            onDeleteMarker={handleDeleteMarker}
            deletingId={deletingId}
          />
        </div>
      </div>

      {formMode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="face-map-form-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-xl animate-in zoom-in-95 fade-in duration-200">
            <h2 id="face-map-form-title" className="mb-4 text-lg font-semibold text-[var(--app-fg)]">
              {formMode.type === "create" ? "Nuevo marcador" : "Editar marcador"}
            </h2>
            <FaceMapIssueForm
              mode={formMode}
              faceModelType={faceModelType}
              onSubmit={handleCreateMarker}
              onUpdate={handleUpdateMarker}
              onCancel={() => setFormMode(null)}
              saving={saving}
            />
          </div>
        </div>
      )}

      {photoImportOpen && token && (
        <FaceMapPhotoImport
          workspaceId={workspaceId}
          token={token}
          onSelectPoint={handlePhotoImportSelect}
          onClose={() => setPhotoImportOpen(false)}
        />
      )}
    </div>
  );
}

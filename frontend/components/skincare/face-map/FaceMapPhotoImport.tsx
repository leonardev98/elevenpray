"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getWorkspacePhotos } from "@/app/lib/workspace-photos-api";
import type { WorkspacePhotoApi } from "@/app/lib/workspace-photos-api";
import { imageClickToFacePercent } from "@/app/lib/skincare/face-map/face-map.utils";

interface FaceMapPhotoImportProps {
  workspaceId: string;
  token: string | null;
  onSelectPoint: (payload: { xPercent: number; yPercent: number; photoUrl: string }) => void;
  onClose: () => void;
}

export function FaceMapPhotoImport({
  workspaceId,
  token,
  onSelectPoint,
  onClose,
}: FaceMapPhotoImportProps) {
  const [photos, setPhotos] = useState<WorkspacePhotoApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<WorkspacePhotoApi | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!token || !workspaceId) return;
    setLoading(true);
    getWorkspacePhotos(token, workspaceId)
      .then((list) => setPhotos(list.filter((p) => p.angle === "front")))
      .catch(() => setPhotos([]))
      .finally(() => setLoading(false));
  }, [token, workspaceId]);

  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLImageElement>, photo: WorkspacePhotoApi) => {
      const img = imgRef.current;
      if (!img || !img.naturalWidth) return;
      const rect = img.getBoundingClientRect();
      const { x, y } = imageClickToFacePercent(
        rect,
        img.naturalWidth,
        img.naturalHeight,
        e.clientX,
        e.clientY
      );
      onSelectPoint({ xPercent: x, yPercent: y, photoUrl: photo.imageUrl });
      onClose();
    },
    [onSelectPoint, onClose]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="photo-import-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-xl animate-in zoom-in-95 fade-in duration-200">
        <div className="flex items-center justify-between border-b border-[var(--app-border)] p-4">
          <h2 id="photo-import-title" className="text-lg font-semibold text-[var(--app-fg)]">
            Añadir marcador desde foto
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--app-fg)]/70 hover:bg-[var(--app-bg)] hover:text-[var(--app-fg)]"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="app-loading-spinner" aria-hidden />
            </div>
          ) : !selected ? (
            <>
              <p className="mb-3 text-sm text-[var(--app-fg)]/70">
                Elige una foto frontal. Luego haz click en la foto donde quieras colocar el marcador.
              </p>
              {photos.length === 0 ? (
                <p className="py-8 text-center text-sm text-[var(--app-fg)]/60">
                  No hay fotos frontales. Sube una en la sección Fotos del workspace.
                </p>
              ) : (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {photos.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(p)}
                        className="w-full overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] transition hover:border-[var(--app-navy)]/40"
                      >
                        <img
                          src={p.imageUrl}
                          alt=""
                          className="h-32 w-full object-cover object-top"
                        />
                        <span className="block truncate px-2 py-1.5 text-left text-xs text-[var(--app-fg)]/70">
                          {new Date(p.photoDate).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-[var(--app-fg)]/70">
                Haz click en el rostro donde quieras añadir el marcador (grano, mancha, etc.).
              </p>
              <div className="relative flex justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)]">
                <img
                  ref={imgRef}
                  src={selected.imageUrl}
                  alt="Foto frontal"
                  className="max-h-[50vh] w-full cursor-crosshair object-contain"
                  onClick={(e) => handleImageClick(e, selected)}
                />
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-sm text-[var(--app-navy)] hover:underline"
              >
                ← Otra foto
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

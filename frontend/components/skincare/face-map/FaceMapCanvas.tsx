"use client";

import { useRef } from "react";
import { FaceMapSvg, type FaceClickPayload } from "./FaceMapSvg";
import { FaceMapMarker } from "./FaceMapMarker";
import type { FaceMarkerApi, FaceModelType } from "@/app/lib/skincare/face-map/face-map.types";

interface FaceMapCanvasProps {
  faceModelType: FaceModelType;
  markers: FaceMarkerApi[];
  selectedMarkerId: string | null;
  onFaceClick?: (payload: FaceClickPayload) => void;
  onMarkerClick?: (markerId: string) => void;
}

export function FaceMapCanvas({
  faceModelType,
  markers,
  selectedMarkerId,
  onFaceClick,
  onMarkerClick,
}: FaceMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const filtered = markers.filter((m) => m.faceModelType === faceModelType);

  return (
    <div
      ref={containerRef}
      className="relative min-h-[320px] w-full overflow-hidden rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm"
    >
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <FaceMapSvg faceModelType={faceModelType} onFaceClick={onFaceClick} />
      </div>
      {/* Marker overlay — same coordinate space as face (percent). Container passes clicks to SVG; only markers capture. */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="relative h-full w-full">
          {filtered.map((m) => (
            <FaceMapMarker
              key={m.id}
              marker={m}
              selected={selectedMarkerId === m.id}
              onClick={onMarkerClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

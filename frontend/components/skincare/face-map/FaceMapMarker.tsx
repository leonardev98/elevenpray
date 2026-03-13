"use client";

import type { FaceMarkerApi, IssueType } from "@/app/lib/skincare/face-map/face-map.types";
import { ISSUE_TYPE_COLORS, SELECTED_MARKER_COLOR } from "@/app/lib/skincare/face-map/face-map.constants";

interface FaceMapMarkerProps {
  marker: FaceMarkerApi;
  selected?: boolean;
  onClick?: (id: string) => void;
}

export function FaceMapMarker({ marker, selected, onClick }: FaceMapMarkerProps) {
  const color = ISSUE_TYPE_COLORS[marker.issueType as IssueType] ?? ISSUE_TYPE_COLORS.custom;

  return (
    <button
      type="button"
      className="absolute z-10 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 outline-none transition-transform duration-150 hover:scale-125 focus:ring-2 focus:ring-[var(--app-highlight)] focus:ring-offset-2 pointer-events-auto"
      style={{
        left: `${marker.x}%`,
        top: `${marker.y}%`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(marker.id);
      }}
      aria-label={`Marcador: ${marker.issueType}`}
    >
      <span
        className="h-2.5 w-2.5 rounded-full shadow-sm"
        style={{
          backgroundColor: color,
          boxShadow: selected ? `0 0 0 3px ${SELECTED_MARKER_COLOR}` : undefined,
        }}
      />
      {selected && (
        <span
          className="absolute inset-0 -z-10 rounded-full opacity-40"
          style={{
            boxShadow: `0 0 0 4px var(--app-highlight)`,
          }}
          aria-hidden
        />
      )}
    </button>
  );
}

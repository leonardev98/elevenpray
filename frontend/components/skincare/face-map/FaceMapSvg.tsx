"use client";

import { useCallback } from "react";
import { clientToFacePercent } from "@/app/lib/skincare/face-map/face-map.utils";
import { getRegionAt, getRegionLabel } from "@/app/lib/skincare/face-map/face-map.regions";
import type { FaceModelType } from "@/app/lib/skincare/face-map/face-map.types";

const VIEWBOX_WIDTH = 200;
const VIEWBOX_HEIGHT = 260;

export interface FaceClickPayload {
  xPercent: number;
  yPercent: number;
  regionLabel: string | null;
}

interface FaceMapSvgProps {
  faceModelType: FaceModelType;
  onFaceClick?: (payload: FaceClickPayload) => void;
}

export function FaceMapSvg({ faceModelType, onFaceClick }: FaceMapSvgProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!onFaceClick) return;
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const { x: xPercent, y: yPercent } = clientToFacePercent(rect, e.clientX, e.clientY);
      const regionId = getRegionAt(xPercent, yPercent);
      const regionLabel = getRegionLabel(regionId);
      onFaceClick({ xPercent, yPercent, regionLabel });
    },
    [onFaceClick]
  );

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      className="h-full w-full select-none object-contain"
      role="img"
      aria-label="Mapa facial frontal para marcar zonas de la piel"
      onClick={onFaceClick ? handleClick : undefined}
      style={{ cursor: onFaceClick ? "pointer" : "default" }}
    >
      <defs>
        <linearGradient id="face-fill" x1="18%" y1="8%" x2="82%" y2="100%">
          <stop offset="0%" stopColor="var(--app-surface-soft)" />
          <stop offset="55%" stopColor="var(--app-surface)" />
          <stop offset="100%" stopColor="var(--app-surface-soft)" />
        </linearGradient>

        <radialGradient id="face-highlight" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="white" stopOpacity="0.22" />
          <stop offset="60%" stopColor="white" stopOpacity="0.06" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>

        <filter id="face-shadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.08" />
        </filter>
      </defs>

      <g>
        {/* Rostro neutro: silueta con frente, sienes, mejillas, mandíbula, mentón */}
        <path
          d="M 100 18 C 76 18 57 28 44 48 C 33 66 31 90 34 116 C 37 145 45 171 58 186 C 70 206 84 217 100 224 C 116 217 130 206 142 186 C 155 171 163 145 166 116 C 169 90 167 66 156 48 C 143 28 124 18 100 18 Z"
          fill="url(#face-fill)"
          stroke="var(--app-border)"
          strokeWidth="1.25"
          filter="url(#face-shadow)"
        />

        {/* Highlight suave */}
        <path
          d="M 100 26 C 79 26 62 34 49 51 C 39 66 37 88 39 112 C 42 138 50 166 61 187 C 73 208 86 216 100 223 C 114 216 127 208 139 187 C 150 166 158 138 161 112 C 163 88 161 66 151 51 C 138 34 121 26 100 26 Z"
          fill="url(#face-highlight)"
          opacity="0.9"
          pointerEvents="none"
        />

        {/* Cejas */}
        <g fill="none" stroke="var(--app-border)" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 61 76 C 70 72 81 71 91 75" strokeWidth="0.9" opacity="0.3" />
          <path d="M 109 75 C 119 71 130 72 139 76" strokeWidth="0.9" opacity="0.3" />
        </g>

        {/* Eyes */}
        <g fill="none" stroke="var(--app-border)" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M 65 92 C 72 87, 82 86, 89 92 C 82 97, 72 97, 65 92"
            strokeWidth="0.95"
            opacity="0.48"
          />
          <path
            d="M 111 92 C 118 86, 128 87, 135 92 C 128 97, 118 97, 111 92"
            strokeWidth="0.95"
            opacity="0.48"
          />

          <path
            d="M 73 92 C 77 90, 81 90, 85 92"
            strokeWidth="0.55"
            opacity="0.18"
          />
          <path
            d="M 119 92 C 123 90, 127 90, 131 92"
            strokeWidth="0.55"
            opacity="0.18"
          />
        </g>

        {/* Nose */}
        <g fill="none" stroke="var(--app-border)" strokeLinecap="round" strokeLinejoin="round">
          <path
            d={`
              M 100 68
              C 99 84, 98 99, 98 114
              C 98 129, 96 142, 94 151
            `}
            strokeWidth="0.95"
            opacity="0.4"
          />
          <path
            d={`
              M 100 68
              C 101 84, 102 99, 102 114
              C 102 129, 104 142, 106 151
            `}
            strokeWidth="0.55"
            opacity="0.18"
          />
          <path
            d="M 92 155 C 96 160, 104 160, 108 155"
            strokeWidth="0.85"
            opacity="0.38"
          />
        </g>

        {/* Cheek / mid-face guides */}
        <g fill="none" stroke="var(--app-border)" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M 51 118 C 63 112, 76 111, 88 116"
            strokeWidth="0.75"
            opacity="0.18"
          />
          <path
            d="M 112 116 C 124 111, 137 112, 149 118"
            strokeWidth="0.75"
            opacity="0.18"
          />
        </g>

        {/* Mouth */}
        <g fill="none" stroke="var(--app-border)" strokeLinecap="round" strokeLinejoin="round">
          <path
            d={`
              M 82 186
              C 89 190, 95 191, 100 191
              C 105 191, 111 190, 118 186
            `}
            strokeWidth="0.82"
            opacity="0.28"
          />
          <path
            d="M 89 188 C 96 191, 104 191, 111 188"
            strokeWidth="0.5"
            opacity="0.12"
          />
        </g>
      </g>
    </svg>
  );
}

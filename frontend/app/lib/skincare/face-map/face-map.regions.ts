/**
 * Logical face regions for the frontal face map. Used to infer region from click (xPercent, yPercent).
 * Coordinates are in percent (0–100) of the face bbox. Each region is a simple axis-aligned box.
 */

export const FACE_REGION_IDS = [
  "forehead",
  "between_eyebrows",
  "nose",
  "left_cheek",
  "right_cheek",
  "chin",
  "left_jaw",
  "right_jaw",
  "lower_contour",
  "left_temple",
  "right_temple",
] as const;

export type FaceRegionId = (typeof FACE_REGION_IDS)[number];

/** Human-readable label for backend region_label */
export const FACE_REGION_LABELS: Record<FaceRegionId, string> = {
  forehead: "Frente",
  between_eyebrows: "Entrecejo",
  nose: "Nariz",
  left_cheek: "Mejilla izquierda",
  right_cheek: "Mejilla derecha",
  chin: "Mentón",
  left_jaw: "Mandíbula izquierda",
  right_jaw: "Mandíbula derecha",
  lower_contour: "Contorno inferior",
  left_temple: "Sien izquierda",
  right_temple: "Sien derecha",
};

interface Box {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

/** Approximate boxes in percent (0–100). Face is roughly oval; these overlap at edges. */
const REGIONS: Record<FaceRegionId, Box> = {
  forehead: { xMin: 25, xMax: 75, yMin: 0, yMax: 22 },
  left_temple: { xMin: 0, xMax: 28, yMin: 8, yMax: 35 },
  right_temple: { xMin: 72, xMax: 100, yMin: 8, yMax: 35 },
  between_eyebrows: { xMin: 38, xMax: 62, yMin: 20, yMax: 32 },
  nose: { xMin: 42, xMax: 58, yMin: 30, yMax: 55 },
  left_cheek: { xMin: 18, xMax: 42, yMin: 38, yMax: 65 },
  right_cheek: { xMin: 58, xMax: 82, yMin: 38, yMax: 65 },
  chin: { xMin: 35, xMax: 65, yMin: 58, yMax: 78 },
  left_jaw: { xMin: 15, xMax: 38, yMin: 62, yMax: 92 },
  right_jaw: { xMin: 62, xMax: 85, yMin: 62, yMax: 92 },
  lower_contour: { xMin: 30, xMax: 70, yMin: 75, yMax: 100 },
};

/**
 * Return the best-matching region for a point (xPercent, yPercent). Uses first matching box.
 * Order of check: more specific areas first, then broader.
 */
export function getRegionAt(xPercent: number, yPercent: number): FaceRegionId | null {
  const point = { x: xPercent, y: yPercent };
  const order: FaceRegionId[] = [
    "between_eyebrows",
    "nose",
    "chin",
    "forehead",
    "left_cheek",
    "right_cheek",
    "left_temple",
    "right_temple",
    "left_jaw",
    "right_jaw",
    "lower_contour",
  ];
  for (const id of order) {
    const box = REGIONS[id];
    if (
      point.x >= box.xMin &&
      point.x <= box.xMax &&
      point.y >= box.yMin &&
      point.y <= box.yMax
    ) {
      return id;
    }
  }
  return null;
}

/** Get backend-friendly region label from region id */
export function getRegionLabel(regionId: FaceRegionId | null): string | null {
  return regionId ? FACE_REGION_LABELS[regionId] : null;
}

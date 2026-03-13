/**
 * Constants for Skin Face Mapping.
 * Add new issue types and colors here; use existing CSS vars from globals.css.
 */

import type { IssueType, Severity } from "./face-mapping.types";

export const ISSUE_TYPES: readonly IssueType[] = [
  "acne",
  "blackheads",
  "redness",
  "pigmentation",
  "dryness",
  "irritation",
  "scar",
  "sensitivity",
  "pore-congestion",
  "custom",
] as const;

export const SEVERITIES: readonly Severity[] = ["mild", "moderate", "severe"] as const;

export const FACE_MODEL_TYPES = ["female", "male"] as const;

export const NOTES_MAX_LENGTH = 500;

/**
 * Semantic colors per issue type. Use CSS variables from project palette.
 * Extend this object when adding new issue types.
 */
export const ISSUE_TYPE_COLORS: Record<IssueType, string> = {
  acne: "var(--destructive)", // alert, softened by theme
  blackheads: "var(--app-navy)",
  redness: "var(--chart-4)", // rosado controlado
  pigmentation: "var(--chart-3)", // ámbar elegante
  dryness: "var(--app-slot-pm)", // cálido suave
  irritation: "var(--chart-2)",
  scar: "var(--muted-foreground)",
  sensitivity: "var(--chart-1)",
  "pore-congestion": "var(--app-slot-am)",
  custom: "var(--app-accent)",
};

/** Selected marker halo / highlight */
export const SELECTED_MARKER_COLOR = "var(--app-highlight)";

/** Hex colors for 3D markers (Three.js cannot use CSS vars; keep in sync with ISSUE_TYPE_COLORS) */
export const ISSUE_TYPE_HEX: Record<IssueType, string> = {
  acne: "#c94f4f",
  blackheads: "#0f1e33",
  redness: "#b87ab8",
  pigmentation: "#8b7aa8",
  dryness: "#c9b8d4",
  irritation: "#7a8bc9",
  scar: "#6b7280",
  sensitivity: "#6b9bc9",
  "pore-congestion": "#7aa8d4",
  custom: "#0f1e33",
};

export const SELECTED_MARKER_HEX = "#2a3f5f";

export const FACE_MODEL_PATHS = {
  female: "/models/skincare/face-female.glb",
  male: "/models/skincare/face-male.glb",
} as const;

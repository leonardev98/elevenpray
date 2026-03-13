/**
 * Constants for Skin Face Map (frontal SVG). Uses existing CSS vars from globals.css.
 */

import type { IssueType, Severity } from "./face-map.types";

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

/** Colores por tipo de problema. Solo paleta del proyecto: app-navy, destructive, muted, slot. */
export const ISSUE_TYPE_COLORS: Record<IssueType, string> = {
  acne: "var(--destructive)",
  blackheads: "var(--app-navy)",
  redness: "var(--app-navy-muted)",
  pigmentation: "var(--muted-foreground)",
  dryness: "var(--app-slot-pm)",
  irritation: "var(--app-slot-am)",
  scar: "var(--muted-foreground)",
  sensitivity: "var(--app-navy-muted)",
  "pore-congestion": "var(--app-slot-am)",
  custom: "var(--app-navy)",
};

/** Selected marker halo / highlight */
export const SELECTED_MARKER_COLOR = "var(--app-highlight)";

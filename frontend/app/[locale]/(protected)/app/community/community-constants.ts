import type { PostType, UniversityId } from "./community-types";

export const POST_TYPE_LABELS: Record<PostType, string> = {
  apunte: "Apunte",
  pregunta: "Pregunta",
  plantilla: "Plantilla",
  pdf: "PDF",
};

export const POST_TYPE_BADGE: Record<PostType, string> = {
  apunte: "bg-blue-950/80 text-blue-300",
  pregunta: "bg-yellow-950/80 text-yellow-300",
  plantilla: "bg-purple-950/80 text-purple-300",
  pdf: "bg-red-950/80 text-red-300",
};

export const MODAL_BORDER_BY_TYPE: Record<PostType, string> = {
  apunte: "border-blue-500/50",
  pregunta: "border-amber-500/50",
  plantilla: "border-purple-500/50",
  pdf: "border-red-500/50",
};

export const UNIVERSITY_TAG: Record<UniversityId, string> = {
  UNI: "bg-blue-950/60 text-blue-300",
  UPC: "bg-green-950/60 text-green-300",
  PUCP: "bg-red-950/60 text-red-300",
  UNMSM: "bg-orange-950/60 text-orange-300",
  General: "bg-[var(--app-surface-soft)] text-[var(--app-fg-secondary)]",
  Todas: "bg-[var(--app-primary-soft)] text-[var(--app-primary)]",
};

export const AUTHOR_COLORS: Record<string, string> = {
  "Ana R.": "bg-blue-600",
  "Luis M.": "bg-emerald-600",
  "Carla S.": "bg-purple-600",
  "Diego F.": "bg-orange-600",
  "Valeria T.": "bg-pink-600",
  "Marco P.": "bg-cyan-600",
  "Sofía L.": "bg-amber-600",
  "Pedro G.": "bg-indigo-600",
};

export function getAuthorColor(author: string): string {
  return AUTHOR_COLORS[author] ?? "bg-[var(--app-primary)]";
}

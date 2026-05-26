import type { PostType, UniversityId } from "./community-types";

export const POST_TYPE_LABELS: Record<PostType, string> = {
  apunte: "Apunte",
  pregunta: "Pregunta",
  plantilla: "Plantilla",
  pdf: "PDF",
};

export const POST_TYPE_BADGE: Record<PostType, string> = {
  apunte: "bg-[var(--course-3-bg)] text-[var(--course-3-fg)]",
  pregunta: "bg-[var(--course-2-bg)] text-[var(--course-2-fg)]",
  plantilla: "bg-[var(--course-4-bg)] text-[var(--course-4-fg)]",
  pdf: "bg-[var(--course-6-bg)] text-[var(--course-6-fg)]",
};

export const MODAL_BORDER_BY_TYPE: Record<PostType, string> = {
  apunte: "border-[var(--course-3-fg)]/50",
  pregunta: "border-[var(--course-2-fg)]/50",
  plantilla: "border-[var(--course-4-fg)]/50",
  pdf: "border-[var(--course-6-fg)]/50",
};

export const UNIVERSITY_TAG: Record<UniversityId, string> = {
  UNI: "bg-[var(--course-4-bg)] text-[var(--course-4-fg)]",
  UPC: "bg-[var(--course-1-bg)] text-[var(--course-1-fg)]",
  PUCP: "bg-[var(--course-6-bg)] text-[var(--course-6-fg)]",
  UNMSM: "bg-[var(--course-5-bg)] text-[var(--course-5-fg)]",
  General: "bg-[var(--bg-surface)] text-[var(--text-muted)]",
  Todas: "bg-[var(--accent-subtle)] text-[var(--accent)]",
};

export const AUTHOR_COLORS: Record<string, string> = {
  "Ana R.": "bg-[var(--course-4-fg)] text-[var(--accent-fg)]",
  "Luis M.": "bg-[var(--course-1-fg)] text-[var(--accent-fg)]",
  "Carla S.": "bg-[var(--course-3-fg)] text-[var(--accent-fg)]",
  "Diego F.": "bg-[var(--course-5-fg)] text-[var(--accent-fg)]",
  "Valeria T.": "bg-[var(--course-6-fg)] text-[var(--accent-fg)]",
  "Marco P.": "bg-[var(--course-3-fg)] text-[var(--accent-fg)]",
  "Sofía L.": "bg-[var(--course-2-fg)] text-[var(--accent-fg)]",
  "Pedro G.": "bg-[var(--course-4-fg)] text-[var(--accent-fg)]",
};

export function getAuthorColor(author: string): string {
  return AUTHOR_COLORS[author] ?? "bg-[var(--accent)] text-[var(--accent-fg)]";
}
